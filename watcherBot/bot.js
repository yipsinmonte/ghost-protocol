/**
 * GHOST Protocol — Executor Bot
 * 
 * Watches all ghost accounts on-chain. When a grace period has expired
 * and execution hasn't happened yet, this bot submits the execute_transfer
 * transaction automatically.
 * 
 * Deploy on Railway: push to GitHub → connect repo → set env vars → done.
 */

require('dotenv').config();
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} = require('@solana/web3.js');
const bs58 = require('bs58');

// ─── Config ──────────────────────────────────────────────────────────────────

const RPC_URL         = process.env.RPC_URL     || 'https://api.mainnet-beta.solana.com';
const GPA_RPC_URL     = process.env.GPA_RPC_URL || 'https://rpc.ankr.com/solana'; // separate key — Helius free blocks gPA from server IPs
const PROGRAM_ID      = process.env.PROGRAM_ID  || '3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3';
const BOT_KEYPAIR_B58 = process.env.BOT_KEYPAIR; // base58 private key set in Railway env vars

// How often to scan all ghost accounts (ms). 5 minutes is plenty.
const POLL_INTERVAL_MS = 5 * 60 * 1000;

// How long after grace period expiry to wait before executing (buffer for clock drift)
const EXECUTION_BUFFER_SECONDS = 60;

// Anchor instruction discriminators (sha256("global:<name>")[0:8])
const DISC = {
  awaken_ghost:     Buffer.from([184,  91,  42, 182, 145,  78, 199,  65]),
  execute_transfer: Buffer.from([233, 126, 160, 184, 235, 206,  31, 119]),
};

// SPL token program
const TOKEN_PROGRAM_ID       = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOC_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bso');
const GHOST_MINT             = new PublicKey('3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3');

// ─── Setup ───────────────────────────────────────────────────────────────────

if (!BOT_KEYPAIR_B58) {
  console.error('❌ BOT_KEYPAIR env var not set. Add your bot wallet private key (base58) in Railway.');
  process.exit(1);
}

const botKeypair    = Keypair.fromSecretKey(bs58.decode(BOT_KEYPAIR_B58));
const connection    = new Connection(RPC_URL,     'confirmed'); // tx sending, balance checks
const gpaConnection = new Connection(GPA_RPC_URL, 'confirmed'); // getProgramAccounts only
const programIdPk   = new PublicKey(PROGRAM_ID);

console.log('👻 GHOST Executor Bot starting...');
console.log('   Program:', PROGRAM_ID);
console.log('   Bot wallet:', botKeypair.publicKey.toBase58());
console.log('   RPC (tx):', RPC_URL);
console.log('   RPC (gPA):', GPA_RPC_URL);
console.log('   Polling every', POLL_INTERVAL_MS / 1000 / 60, 'minutes\n');

// ─── Account Layout Parser ────────────────────────────────────────────────────
// Matches GhostAccount struct in lib.rs exactly:
// discriminator(8) + owner(32) + recovery_wallet(Option<Pubkey>=33) +
// last_heartbeat(i64=8) + interval_seconds(i64=8) + grace_period_seconds(i64=8) +
// awakened(bool=1) + awakened_at(Option<i64>=9) + executed(bool=1) +
// executed_at(Option<i64>=9) + staked_ghost(u64=8) + bump(u8=1) + vault_bump(u8=1) +
// registered_at(i64=8) + ping_count(u64=8) + beneficiary_count(u8=1)

function parseGhostAccount(pubkey, data) {
  try {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 8; // skip 8-byte Anchor discriminator

    // owner: Pubkey (32)
    const ownerBytes = data.slice(offset, offset + 32);
    const owner = new PublicKey(ownerBytes).toBase58();
    offset += 32;

    // recovery_wallet: Option<Pubkey> (1 tag + 32 bytes)
    const hasRecovery = data[offset] === 1;
    offset += 1;
    const recoveryWallet = hasRecovery ? new PublicKey(data.slice(offset, offset + 32)).toBase58() : null;
    offset += 32;

    // last_heartbeat: i64
    const lastHeartbeat = Number(view.getBigInt64(offset, true));
    offset += 8;

    // interval_seconds: i64
    const intervalSeconds = Number(view.getBigInt64(offset, true));
    offset += 8;

    // grace_period_seconds: i64
    const gracePeriodSeconds = Number(view.getBigInt64(offset, true));
    offset += 8;

    // awakened: bool
    const awakened = data[offset] === 1;
    offset += 1;

    // awakened_at: Option<i64> (1 tag + 8)
    const hasAwakenedAt = data[offset] === 1;
    offset += 1;
    const awakenedAt = hasAwakenedAt ? Number(view.getBigInt64(offset, true)) : null;
    offset += 8;

    // executed: bool
    const executed = data[offset] === 1;
    offset += 1;

    // executed_at: Option<i64> (skip 9)
    offset += 9;

    // staked_ghost: u64
    const stakedGhost = Number(view.getBigUint64(offset, true));
    offset += 8;

    // bump: u8, vault_bump: u8
    const bump      = data[offset]; offset += 1;
    const vaultBump = data[offset]; offset += 1;

    // registered_at: i64 (skip)
    offset += 8;

    // ping_count: u64
    const pingCount = Number(view.getBigUint64(offset, true));
    offset += 8;

    // beneficiary_count: u8
    const beneficiaryCount = data[offset];

    return {
      pubkey: pubkey.toBase58(),
      owner,
      recoveryWallet,
      lastHeartbeat,
      intervalSeconds,
      gracePeriodSeconds,
      awakened,
      awakenedAt,
      executed,
      stakedGhost,
      bump,
      vaultBump,
      pingCount,
      beneficiaryCount,
    };
  } catch (err) {
    console.warn('  ⚠️  Failed to parse account', pubkey.toBase58(), err.message);
    return null;
  }
}

// ─── PDA Derivation ───────────────────────────────────────────────────────────

function deriveGhostPda(ownerPubkey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('ghost'), ownerPubkey.toBytes()],
    programIdPk
  );
}

function deriveVaultPda(ghostPda) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), ghostPda.toBytes()],
    programIdPk
  );
}

async function deriveATA(owner, mint) {
  const [ata] = await PublicKey.findProgramAddress(
    [owner.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
    ASSOC_TOKEN_PROGRAM_ID
  );
  return ata;
}

// ─── Awaken Ghost ─────────────────────────────────────────────────────────────
// Call this when: !awakened AND lastHeartbeat + intervalSeconds < now
// This sets ghost.awakened = true and records awakened_at on-chain.
// The grace period clock then starts from awakened_at.

async function awakenGhost(ghost) {
  console.log(`  ⚡ Awakening ghost for ${ghost.owner}...`);
  const ownerPk   = new PublicKey(ghost.owner);
  const [ghostPda] = deriveGhostPda(ownerPk);

  const ix = new TransactionInstruction({
    programId: programIdPk,
    keys: [
      { pubkey: ghostPda,             isSigner: false, isWritable: true  },
      { pubkey: botKeypair.publicKey, isSigner: true,  isWritable: true  }, // caller (pays fee)
    ],
    data: DISC.awaken_ghost,
  });

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: botKeypair.publicKey });
  tx.add(ix);
  tx.sign(botKeypair);

  const sig = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(sig, 'confirmed');
  console.log(`  ✅ Ghost awakened. Tx: ${sig}`);
  return sig;
}

// ─── Execute Transfer ─────────────────────────────────────────────────────────
// Call this when: awakened AND awakenedAt + gracePeriodSeconds < now AND !executed
// Iterates through each beneficiary stored on-chain and executes the transfer.
// 
// NOTE: execute_transfer is called once per beneficiary. The bot loops through
// beneficiary_count and calls it for each index.

async function executeTransfer(ghost, beneficiaryIndex) {
  const ownerPk   = new PublicKey(ghost.owner);
  const [ghostPda] = deriveGhostPda(ownerPk);
  const [vaultPda] = deriveVaultPda(ghostPda);

  // The execute_transfer instruction needs:
  // ghost(mut), vault(mut), beneficiary_token_account(mut),
  // vault_token_account(mut), token_program, caller(signer)
  // 
  // We pass beneficiary_index as instruction data after the discriminator.
  const data = Buffer.alloc(8 + 1); // discriminator + u8 index
  DISC.execute_transfer.copy(data, 0);
  data.writeUInt8(beneficiaryIndex, 8);

  // The contract resolves the beneficiary's token account from stored state.
  // We need to pass the vault's token accounts for each mint.
  // For simplicity, we pass the ghost and vault PDAs and let the program resolve.
  const ix = new TransactionInstruction({
    programId: programIdPk,
    keys: [
      { pubkey: ghostPda,             isSigner: false, isWritable: true  },
      { pubkey: vaultPda,             isSigner: false, isWritable: true  },
      { pubkey: TOKEN_PROGRAM_ID,     isSigner: false, isWritable: false },
      { pubkey: botKeypair.publicKey, isSigner: true,  isWritable: true  }, // caller pays fee
    ],
    data,
  });

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: botKeypair.publicKey });
  tx.add(ix);
  tx.sign(botKeypair);

  const sig = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(sig, 'confirmed');
  return sig;
}

// ─── Main Scan Loop ───────────────────────────────────────────────────────────

async function scanAndExecute() {
  const nowSeconds = Math.floor(Date.now() / 1000);
  console.log(`\n🔍 Scanning ghost accounts... [${new Date().toISOString()}]`);

  let accounts;
  try {
    // Fetch v1.7 (1220 bytes) and v1.8 (1221 bytes) accounts using gpaConnection
    // (separate from main RPC — Helius free tier blocks gPA from server-side IPs)
    const ACCOUNT_SIZE_V17 = 1228;
    const ACCOUNT_SIZE_V18 = 1229;
    const [v17, v18] = await Promise.all([
      gpaConnection.getProgramAccounts(programIdPk, {
        commitment: 'confirmed',
        filters: [{ dataSize: ACCOUNT_SIZE_V17 }],
      }),
      gpaConnection.getProgramAccounts(programIdPk, {
        commitment: 'confirmed',
        filters: [{ dataSize: ACCOUNT_SIZE_V18 }],
      }),
    ]);
    // Deduplicate by pubkey
    const seen = new Set();
    accounts = [];
    for (const a of [...v17, ...v18]) {
      const key = a.pubkey.toBase58();
      if (!seen.has(key)) { seen.add(key); accounts.push(a); }
    }
    console.log(`  Found ${v17.length} v1.7 + ${v18.length} v1.8 = ${accounts.length} total account(s)`);
  } catch (err) {
    console.error('  ❌ RPC error fetching accounts:', err.message);
    return;
  }

  for (const { pubkey, account } of accounts) {
    const data  = new Uint8Array(account.data);
    const ghost = parseGhostAccount(pubkey, data);
    if (!ghost) continue;

    const heartbeatExpiry = ghost.lastHeartbeat + ghost.intervalSeconds;
    const graceExpiry     = ghost.awakenedAt ? ghost.awakenedAt + ghost.gracePeriodSeconds : null;

    // ── Case 1: Heartbeat expired, not yet awakened → awaken it ──────────────
    if (!ghost.awakened && !ghost.executed && nowSeconds > heartbeatExpiry + EXECUTION_BUFFER_SECONDS) {
      const overdueHours = Math.round((nowSeconds - heartbeatExpiry) / 3600);
      console.log(`  ⚠️  Ghost ${ghost.owner.slice(0,8)}... overdue by ${overdueHours}h — awakening`);
      try {
        await awakenGhost(ghost);
      } catch (err) {
        console.error(`  ❌ Awaken failed: ${err.message}`);
      }
      continue;
    }

    // ── Case 2: Awakened, grace period expired, not executed → execute ────────
    if (ghost.awakened && !ghost.executed && graceExpiry && nowSeconds > graceExpiry + EXECUTION_BUFFER_SECONDS) {
      const overdueMinutes = Math.round((nowSeconds - graceExpiry) / 60);
      console.log(`  💀 Ghost ${ghost.owner.slice(0,8)}... grace expired ${overdueMinutes}m ago — executing ${ghost.beneficiaryCount} transfer(s)`);

      for (let i = 0; i < ghost.beneficiaryCount; i++) {
        try {
          const sig = await executeTransfer(ghost, i);
          console.log(`  ✅ Beneficiary ${i + 1}/${ghost.beneficiaryCount} — Tx: ${sig}`);
          // Small delay between calls to avoid rate limiting
          await sleep(1500);
        } catch (err) {
          console.error(`  ❌ Execute failed for beneficiary ${i}: ${err.message}`);
        }
      }
      continue;
    }

    // ── Healthy ghost — log briefly ───────────────────────────────────────────
    const nextPingIn = heartbeatExpiry - nowSeconds;
    if (nextPingIn > 0) {
      const days = Math.round(nextPingIn / 86400);
      console.log(`  ✓  ${ghost.owner.slice(0,8)}... healthy — next ping due in ~${days} day(s)`);
    }
  }

  console.log('  Scan complete.\n');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
  // Check bot wallet balance
  try {
    const balance = await connection.getBalance(botKeypair.publicKey);
    console.log(`💰 Bot wallet balance: ${(balance / 1e9).toFixed(4)} SOL`);
    if (balance < 0.01 * 1e9) {
      console.warn('⚠️  Low balance — top up the bot wallet or it will fail to submit transactions');
    }
  } catch (err) {
    console.error('Could not fetch bot balance:', err.message);
  }

  // Run immediately on start, then on interval
  await scanAndExecute();
  setInterval(scanAndExecute, POLL_INTERVAL_MS);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});