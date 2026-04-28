# 👻 Ghost Protocol

> **Your digital afterlife on Solana.**
> A trustless, on-chain dead-man's switch for crypto assets. Miss your heartbeat — your ghost awakens. Stay silent — your legacy executes, permissionlessly, exactly as you wrote it.
>
> *A smart vault that doesn't forget your family or friends.*

**Program ID (Solana mainnet):** [`3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`](https://explorer.solana.com/address/3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3)
**Status:** Live on mainnet. Opening for public registration during the Solana Frontier Hackathon.

---

## The problem

Self-custody is the price of sovereignty. It's also how families lose everything.

There is no "contact support" when a holder dies. No password reset. No estate lawyer who can access a Ledger. Every hour, more Solana accumulates in wallets whose owners are one accident, one stroke, one forgotten seed phrase away from making those assets permanently unreachable.

Centralized exchanges solve this with custody — which is the opposite of why we're here.

Ghost Protocol solves it with code.

---

## What it is

Ghost Protocol is a Solana program that implements a **configurable, trustless dead-man's switch** for any SPL token (and SOL).

You:

1. **Register** a Ghost — a PDA-owned vault tied to your wallet.
2. **Fund** it — deposit SOL and any SPL tokens you want to pass on.
3. **Configure** who receives what, and on what action: direct transfer, token burn, or whole-vault sweep to a single recipient.
4. **Stay alive** — send a `ping` transaction before your configured interval expires. Costs sub-cent SOL.
5. **Forget to ping** — after your inactivity window, anyone can call `check_silence` to start a configurable grace period. You (or a recovery wallet) can still cancel during grace.
6. **Grace expires** — anyone can call `execute_legacy`. The program, signing as the vault PDA, distributes assets to each beneficiary exactly as you configured them. You never transfer custody. You only ever transfer *conditional release authority* to your own contract.

Beneficiaries never need to "claim" or fight a lawyer. Assets arrive in their wallet. The chain is the executor.

---

## Not just for death — for any form of disappearance

Ghost Protocol is a digital legacy product *first*, but the underlying mechanic — *"if I don't ping for N days, route my assets as configured"* — applies to a much broader set of real scenarios than the word "inheritance" suggests:

- **Extended travel, hospitalization, or any period where you genuinely can't reach your wallet.**
- **Seed-phrase loss** — if you lose your keys, a pre-configured recovery path is better than the asset being lost forever.
- **Detention or legal incapacitation** — if you can't physically access your wallet for weeks or months, your family still can.
- **A contingency slice for your family** — designate 5-10% of your stack that routes to a spouse / child / co-founder if you go quiet, without touching the rest.

The usage cycle is months to years, not decades. Most Ghosts will be pinged regularly, cancelled, reconfigured, or executed long before their owner actually dies. Think of it as a programmable escape-valve for self-custody, not only an estate plan.

---

## Why Solana

Ghost Protocol is the rare product that is *not* easier on another chain.

- **PDA-authored vaults**: the vault is owned by a program-derived address whose private key cannot exist. No single person — not the user, not the operator, not an attacker — can move funds. Only the program logic can.
- **Permissionless execution**: `check_silence` and `execute_legacy` can be called by anyone. There is no trusted operator gating the afterlife.
- **Cheap enough for ambient use**: a weekly heartbeat costs less than a cent. On a chain with $5 gas this becomes a product for whales only. On Solana it's a product for anyone with a wallet.
- **Composable**: vaults can eventually close DeFi positions, auto-swap to stables via Jupiter, mint memorial cNFTs — all native primitives on Solana.

---

## Architecture at a glance

```
 ┌─────────────────────────┐      ping / configure      ┌──────────────────────────┐
 │        Owner Wallet     │ ─────────────────────────▶ │     Ghost PDA (state)    │
 └─────────────────────────┘                            │  - last_heartbeat        │
            │                                           │  - interval, grace       │
            │   deposit SOL / SPL                       │  - beneficiaries[10]     │
            ▼                                           │  - recovery_wallets[3]   │
 ┌─────────────────────────┐                            │  - whole_vault_recipient │
 │   Vault PDA (assets)    │ ◀──── CPIs, vault-signed ──│  - awakened, executed    │
 │   SOL + any SPL tokens  │                            └──────────────────────────┘
 └─────────────────────────┘                                       ▲
            │                                                      │
            │  on execute:                   check_silence   ┌─────┴───────────┐
            │  transfer / burn /        ◀──── (permissionless)─│  Anyone  /      │
            ▼  whole-vault sweep                                │  Reference bot  │
 ┌─────────────────────────┐                                    └─────────────────┘
 │   Beneficiary Wallets   │
 └─────────────────────────┘
```

Two PDAs per user:
- **Ghost PDA** — stores state (heartbeat, config, beneficiaries, flags).
- **Vault PDA** — holds assets; only the program can sign for it.

---

## Trust model

Ghost Protocol is trustless in the meaningful sense: **no party — including us — can move user funds outside the rules the user configured.**

What the program guarantees:
- Only the **owner** can deposit, ping, configure beneficiaries, pause, or transfer ownership.
- **Anyone** can call `check_silence` and `execute_legacy`. The program enforces `silence > interval` and `now > awakened_at + grace_period` on-chain; no caller can bypass these checks.
- The **vault PDA** signs every asset transfer via seeds derived from `[VAULT_SEED, owner]`. The private key does not exist — not on any server, not in any keystore.
- **Recovery wallets** are *user-designated* emergency keys (max 3). They can cancel an awakening, clear or re-target beneficiaries before execution, or perform an emergency withdrawal. They exist because the user chose them. They are not a backdoor — they are a user-configured trust delegation, like a multisig co-signer on a traditional trust.

What the reference bot does:
- Watches for Ghosts past their inactivity window and calls `check_silence`.
- Collects a 5% bounty (paid from the Ghost's stake) as fuel for ops costs.
- That's it. The bot is a **convenience**, not a dependency. If our bot disappears tomorrow, any beneficiary (or any bounty hunter) can call `check_silence` and `execute_legacy` themselves.

---

## Beneficiary model

Each Ghost supports up to **10 beneficiaries** plus one optional **whole-vault recipient**.

Each beneficiary has:
- `recipient` — destination wallet
- `amount` — exact amount to send
- `token_mint` — `None` for SOL, `Some(mint)` for any SPL token
- `action` — `0 = transfer`, `1 = burn`

The whole-vault recipient catches anything left in the vault after individual beneficiaries are paid — useful for "distribute these 5 allocations, then send the rest to my spouse."

During execution, beneficiaries can be processed individually (one transaction per payout). The grace period and awakened-by-anyone design mean distribution doesn't block on any single actor.

---

## Instruction surface

| Instruction | Who can call | What it does |
|---|---|---|
| `initialize_ghost` | Owner | Register, stake $GHOST, pay 0.02 SOL registration fee |
| `deposit` / `withdraw` | Owner | Move SOL/SPL in/out of the vault |
| `ping` | Owner | Record a heartbeat; also auto-cancels an active awakening |
| `add_beneficiary` / `remove` / `update` | Owner | Manage the beneficiary list (only when not awakened) |
| `set_whole_vault_recipient` | Owner | Designate the catch-all recipient |
| `update_interval` / `update_grace_period` / `update_interval_and_grace` | Owner | Adjust timing |
| `update_recovery_wallet` | Owner | Add / remove / replace one of 3 recovery slots |
| `pause_ghost` / `resume_ghost` | Owner | Emergency pause (prevents awakening during travel, illness, etc.) |
| `transfer_ownership` / `accept_ownership` | Owner + new owner | Two-step migration to a new wallet |
| `check_silence` | **Anyone** | Flip a silent Ghost to awakened; pays 5% bounty to caller |
| `cancel_awakening` | Owner or recovery | Cancel during grace window |
| `guardian_remove_beneficiary` / `guardian_clear_beneficiaries` / `guardian_set_whole_vault_recipient` | Recovery wallet only | Emergency edits after awakening, before execution |
| `execute_legacy` | **Anyone** | After grace, flip executed flag; enables per-beneficiary distribution |
| `execute_transfer` / `execute_burn` / `execute_whole_vault_transfer` / `execute_whole_vault_burn` | Anyone | Actually move / burn the assets |
| `recovery_withdraw` | Recovery wallet | Emergency drain (pre-execution) to a recovery-designated wallet |
| `abandon_ghost` | Owner | Voluntarily close; burns 50% of staked $GHOST as anti-spam penalty |
| `migrate_ghost` | Owner | One-time schema realloc for pre-v1.8 accounts |

---

## $GHOST token

Ghost Protocol is powered by **$GHOST**, a fixed-supply SPL token (1,000,000,000 total, no more ever).

**Purpose:**
- **Skin-in-the-game stake** — each Ghost requires a minimum $GHOST stake at registration. This aligns the user with the protocol and funds the permissionless-bounty economy.
- **Bounty reserve** — 5% of a Ghost's stake is released as a bounty when `check_silence` succeeds, paying the caller. This is what incentivizes anyone to be a watcher.
- **Future governance** — parameter updates (minimum stake, fee BPS, grace minimums) will move to $GHOST holder vote post-launch.

**Distribution:** fair launch, no presale, no team unlock, no private round. The supply is minted once at genesis and distributed publicly. Early registrants receive a retroactive allocation.

---

## Quickstart — try it in 60 seconds

> Live on mainnet. Public registration opens at launch.

```bash
# Clone the interface
git clone https://github.com/<your-handle>/ghost-protocol.git
cd ghost-protocol/website
npx serve .
# Open http://localhost:3000, connect Phantom, register your Ghost.
```

Or, for judges/reviewers during the hackathon: visit **[ghost-protocol.rip](https://ghost-protocol.rip)**, connect Phantom on mainnet, and register a test Ghost with a 1-hour interval to see the full lifecycle compressed.

---

## Security

- **PDA-signed CPIs** — all vault movement uses program-derived signer seeds; no off-chain key ever authorizes a transfer.
- **Permissionless awakening & execution** — no single operator can gate or censor the afterlife flow.
- **Two-step ownership transfer** — prevents accidental wallet migration to a typo.
- **Emergency pause** — the owner can freeze their own Ghost during known-absent periods (long travel, hospitalization, etc.).
- **Staking anti-spam** — registration costs 0.02 SOL + minimum $GHOST stake. Abandoning a Ghost burns 50% of staked $GHOST, preventing drive-by registration spam.
- **Conservative math** — fee and bounty computations use `checked_mul` / `saturating_sub`; vault drains guarded by per-beneficiary `executed` flags (no double-pay).
- **Migration path** — `migrate_ghost` lets v1.7 accounts realloc to v1.8+ schema without reinitialization.
- **Upgrade authority** — currently held by the founder's deployer wallet. This is standard for pre-audit Solana programs; revoking or locking authority before a third-party review would be reckless, not trustworthy. The post-launch roadmap migrates upgrade authority to either a **Squads multisig** or a **timelock controller** (7-day delay) after the first independent audit, funded by prize and grant capital. Users will always have a public, pre-announced window to react before any upgrade activates.

**Planned:** full third-party audit during Phase I (targeting OtterSec or Neodyme, prize- and grant-funded), active bug bounty program on Immunefi.

---

## Roadmap

| Phase | When | What |
|---|---|---|
| **Summon** | March 2026 | Fair $GHOST launch, mainnet program live, dashboard, SOL + SPL support, recovery wallets, audit |
| **Awaken** | Q2 2026 | NFT (Metaplex) vault support, time-locked transfers, Jupiter auto-swap-to-SOL, off-chain executor (post-mortem X post, email triggers), Telegram heartbeat reminders |
| **Possess** | Q3 2026 | DeFi position closing (Jupiter / Marginfi / Drift), cross-chain bridges (Ethereum, Base) |
| **Eternal** | Q4 2026 | Optional off-chain memorial integration (Pika Labs AI selves), 100k souls registered |

---

## Technical stack

- **Program**: Anchor (Rust) — `program/lib.rs`, 1030 lines, deployed at `3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`.
- **Reference watcher bot**: Node.js — `watcherBot/bot.js`. Uses Helius RPC + Jupiter for fee routing.
- **Interface**: single-page HTML/JS with `@solana/wallet-adapter`.
- **Token standard**: Token-2022 compatible (`token_interface`) — supports current and future SPL extensions.

---

## Repository structure

```
ghost-protocol/
├── program/              # Anchor program (on-chain)
│   └── lib.rs
├── watcherBot/           # Reference executor bot (off-chain, convenience only)
│   └── bot.js
├── website/              # Marketing + dApp interface
│   └── index.html
├── whitepaper/           # Full technical and narrative whitepaper
│   └── whitepaper.html
└── README.md             # You are here
```

---

## A note for Colosseum Frontier judges

Ghost Protocol is submitted to Solana Frontier Hackathon (Spring 2026).

- **90-second demo video**: [link to the emotional lifecycle video].
- **Live on mainnet** since March 2026. Public open for the first time during this hackathon window — judges are among the first real users.
- **What to test**: register a Ghost with a 1-hour interval and 0-second grace, let it lapse, watch `check_silence` execute and funds route to your beneficiary. The full lifecycle runs in ~1 hour.
- **Ask us**: the protocol is built by a single founder. Feedback on trust-model clarity and onboarding friction is the most valuable thing you can give us.

---

## Disclaimers

Ghost Protocol is software that enables conditional, self-sovereign asset transfer. It is not a legal estate instrument. Users in jurisdictions with mandatory inheritance provisions (most of the EU, for example) should combine Ghost with traditional estate planning. We provide the programmable rails; you remain responsible for how they interact with your real-world legal situation.

Self-custody is hard. Ghost Protocol is a tool for people who have already accepted that responsibility.

---

## Contact

- **X**: [@onchainlegacy](https://x.com/onchainlegacy)
- **Website**: [ghost-protocol.rip](https://ghost-protocol.rip)

---

*Are you still alive?*
