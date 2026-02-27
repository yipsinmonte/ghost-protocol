# GHOST Executor Bot

Watches all GHOST protocol accounts on Solana. When a user's heartbeat interval expires and their grace period passes without intervention, this bot automatically submits the `execute_transfer` transaction to distribute vault assets to beneficiaries.

## How it works

Every 5 minutes the bot:

1. Fetches all GhostAccount PDAs from the GHOST program
2. For each account, checks two conditions:
   - **Heartbeat expired, not awakened yet** → calls `awaken_ghost` to start the grace period clock
   - **Awakened + grace period expired + not executed** → calls `execute_transfer` for each beneficiary
3. Logs everything cleanly, skips healthy accounts

## Cost

| Item | Cost |
|------|------|
| Railway hosting | ~$5/month |
| Each transaction | ~0.000005 SOL |
| Bot wallet to fund | 0.05–0.1 SOL (lasts years) |
| Helius RPC (free tier) | $0 |

**Total: ~$5/month**

## Deploy to Railway in 5 steps

### 1. Create a bot wallet

Generate a fresh dedicated wallet — do not use your main wallet:

```bash
node -e "
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const k = Keypair.generate();
console.log('Public key:', k.publicKey.toBase58());
console.log('Private key (base58):', bs58.encode(k.secretKey));
"
```

Fund it with 0.05 SOL from your main wallet. That's it — Solana fees are tiny.

### 2. Get a free Helius RPC key

Sign up at [helius.dev](https://helius.dev) → create a project → copy your API key.

Free tier gives you 100k requests/day which is vastly more than you need.

### 3. Push to GitHub

```bash
git init
git add .
git commit -m "ghost executor bot"
git remote add origin https://github.com/YOUR_USERNAME/ghost-bot.git
git push -u origin main
```

### 4. Deploy on Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select your `ghost-bot` repo
3. Go to **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `RPC_URL` | `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY` |
| `PROGRAM_ID` | `69CthivgcVfvMbEJLtUcpbnztNzJ26VCfjAwMj5jdMnZ` |
| `BOT_KEYPAIR` | Your base58 private key from step 1 |

4. Railway auto-deploys. Check the **Logs** tab — you should see the bot start scanning.

### 5. Verify it's running

Logs should look like:
```
👻 GHOST Executor Bot starting...
   Program: 69CthivgcVfvMbEJLtUcpbnztNzJ26VCfjAwMj5jdMnZ
   Bot wallet: <your bot wallet>
   Polling every 5 minutes

💰 Bot wallet balance: 0.0500 SOL

🔍 Scanning ghost accounts... [2026-03-01T12:00:00.000Z]
  Found 3 ghost account(s)
  ✓  a1b2c3d4... healthy — next ping due in ~180 day(s)
  ✓  e5f6g7h8... healthy — next ping due in ~45 day(s)
  ✓  i9j0k1l2... healthy — next ping due in ~12 day(s)
  Scan complete.
```

## Security notes

- The bot wallet has **no access to any vault funds** — it can only call program instructions
- Even if the bot wallet is compromised, an attacker can only trigger executions that were already configured by vault owners
- The bot private key lives in Railway's encrypted environment variables — never commit it to git
- Add `.env` to your `.gitignore`

## Monitoring

Railway shows logs in real-time in the dashboard. For alerts, you can add a simple health check — Railway can notify you if the process crashes.

To check bot wallet balance periodically, add this to your monitoring:

```bash
curl https://api.mainnet-beta.solana.com -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["YOUR_BOT_WALLET_PUBKEY"]}'
```

## Local development

```bash
npm install
cp .env.example .env
# Fill in .env with your values
npm run dev
```
