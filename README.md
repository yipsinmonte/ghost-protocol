# Ghost Protocol

> **Trustless on-chain succession for digital assets on Solana.**
> Configure how your assets are distributed if you ever stop signing transactions. The chain is the executor.

[![Mainnet](https://img.shields.io/badge/Solana-Mainnet-7c3aed?style=flat-square)](https://explorer.solana.com/address/3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3)
[![Version](https://img.shields.io/badge/program-v1.10-9ca3af?style=flat-square)](program/lib.rs)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

| | |
|---|---|
| **Program ID** | [`3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`](https://explorer.solana.com/address/3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3) |
| **IDL (on-chain)** | [`Hcb9cF8RPDELJmi4hBDKkxXZoDat3pcNivryx6P4pNUy`](https://explorer.solana.com/address/Hcb9cF8RPDELJmi4hBDKkxXZoDat3pcNivryx6P4pNUy) |
| **Website** | [ghost-protocol.rip](https://ghost-protocol.rip) |
| **Demo (no wallet needed)** | [demo.ghost-protocol.rip](https://demo.ghost-protocol.rip) |

---

## What it is

Ghost Protocol is a Solana program that implements a configurable, trustless dead-man's switch for SOL and any SPL token.

You register a **Ghost** — a vault tied to your wallet, owned by a Program-Derived Address (PDA) whose private key cannot exist. You fund it. You configure who receives what. You send a `ping` transaction periodically to confirm you're alive.

If you stop pinging for longer than your configured interval, anyone can call `check_silence` to wake your Ghost. After your grace period expires, anyone can call `execute_legacy`, and the program — signing as the vault PDA — distributes assets to each beneficiary exactly as you wrote them.

You never transfer custody. You only ever transfer **conditional release authority** to your own contract.

## Why this is non-trivial

Self-custody is the price of sovereignty. It is also how families lose everything.

There is no "contact support" when a holder dies. No password reset. No estate lawyer who can reach a Ledger. Centralized exchanges solve this with custody, which is the opposite of why most people are here. The remaining option — handing a copy of your seed phrase to a relative — leaks your full balance to that person every day you are still alive.

Ghost Protocol gives you a **third option**: a programmable, time-gated release authored by a contract you control while you live, that runs on its own when you stop responding.

## Not just for end-of-life

The mechanism — *if I do not ping for N days, route my assets as configured* — applies to far more than estate planning:

- **Extended travel, hospitalization, or any period without wallet access**
- **Seed phrase loss** — pre-configured recovery path beats permanent loss
- **Detention or legal incapacitation** — your family can still reach the assets
- **Contingency carve-outs** — designate, say, 10% of your stack to route to a spouse if you go quiet, without touching the rest

Most Ghosts are pinged regularly, cancelled, reconfigured, or executed long before the owner actually dies. Treat it as a programmable escape valve for self-custody, not only an estate plan.

## Why Solana

This product is genuinely easier on Solana than anywhere else.

- **Cheap enough for ambient use** — a weekly heartbeat costs sub-cent SOL. On a chain with $5 gas, this is a product for whales only.
- **PDA-authored vaults** — the vault is owned by an address whose private key cannot exist. Not the user, not the operator, not an attacker can move funds. Only the program logic.
- **Permissionless execution** — `check_silence` and `execute_legacy` are anyone-callable. There is no operator gating distribution.
- **Composable** — vaults can eventually close DeFi positions, auto-swap to stables via Jupiter, mint memorial cNFTs — all native Solana primitives.

## Architecture

```
 ┌──────────────────────┐    ping / configure    ┌────────────────────────────┐
 │     Owner Wallet     │ ─────────────────────▶ │     Ghost PDA (state)      │
 └──────────────────────┘                        │  - last_heartbeat          │
            │                                    │  - interval, grace_period  │
            │   deposit                          │  - beneficiaries[10]       │
            ▼                                    │  - recovery_wallets[3]     │
 ┌──────────────────────┐                        │  - whole_vault_recipient   │
 │   Vault PDA (assets) │ ◀── CPI, vault-signed ─│  - awakened, executed      │
 │   SOL + SPL tokens   │                        └────────────────────────────┘
 └──────────────────────┘                                    ▲
            │                                                │
            │  on execute:               check_silence  ┌────┴───────────────┐
            │  transfer / burn /    ◀── (permissionless)─│  Anyone /          │
            ▼  whole-vault sweep                         │  Reference watcher │
 ┌──────────────────────┐                                └────────────────────┘
 │ Beneficiary wallets  │
 └──────────────────────┘
```

Two PDAs per user:
- **Ghost PDA** at `["ghost", owner_pubkey]` — stores all state.
- **Vault PDA** at `["vault", owner_pubkey]` — holds assets; only the program can sign for it.

Plus a third **stake vault** at `["stake_vault", owner_pubkey]` holding the user's $GHOST stake.

## Trust model

Ghost Protocol is trustless in the meaningful sense: **no party — including the protocol authors — can move user funds outside the rules the user configured.**

What the program guarantees:
- Only the **owner** can deposit, ping, configure beneficiaries, or pause.
- **Anyone** can call `check_silence` and `execute_legacy`. The program enforces `silence > interval_seconds` and `now > awakened_at + grace_period_seconds` on-chain. No caller can bypass these checks.
- The **vault PDA** signs every asset transfer via seeds derived from `["vault", owner_pubkey]`. The private key does not exist on any server, in any keystore, anywhere.
- **Recovery wallets** (max 3) are user-designated emergency keys. They can cancel an awakening, clear or re-target beneficiaries before execution, or perform an emergency withdrawal. They are *user-configured trust delegations*, not a backdoor.

The reference watcher bot is a **convenience, not a dependency**. If it disappears, any beneficiary or any bounty hunter can call the lifecycle instructions themselves.

## Beneficiary model

Each Ghost supports up to **10 beneficiaries** plus one optional **whole-vault recipient**.

Each beneficiary entry:
- `recipient` — destination wallet (Pubkey, must equal the actual ATA authority at execution time)
- `amount` — exact amount to send
- `token_mint` — required, identifies the SPL mint
- `action` — `0 = transfer`, `1 = burn`

The whole-vault recipient catches anything left in the vault after individual beneficiaries are paid — useful for "distribute these N allocations, then send the rest to my spouse."

During execution, beneficiaries are processed individually (one transaction per payout). The grace period and the anyone-can-execute design mean distribution does not block on any single actor.

## Instruction surface

| Instruction | Caller | Purpose |
|---|---|---|
| `initialize_ghost` | Owner | Register, stake $GHOST, pay 0.02 SOL registration fee |
| `deposit_to_vault` / `withdraw_from_vault` | Owner | Move SOL/SPL in/out of the vault |
| `ping` | Owner | Record a heartbeat; auto-cancels an active awakening |
| `add_beneficiary` / `remove_beneficiary` / `update_beneficiary` | Owner | Manage the beneficiary list (only when not awakened) |
| `set_whole_vault_recipient` | Owner | Designate the catch-all recipient |
| `update_interval` / `update_grace_period` / `update_interval_and_grace` | Owner | Adjust timing |
| `update_recovery_wallet` | Owner | Add / remove / replace one of 3 recovery slots (blocked when awakened) |
| `set_ghost_profile` | Owner | Set display name + image URI |
| `pause_ghost` / `resume_ghost` | Owner | Emergency pause for known-absent periods |
| `check_silence` | **Anyone** | Flip a silent Ghost to awakened; pays 5% bounty to caller |
| `cancel_awakening` | Owner or recovery wallet | Cancel during grace window |
| `guardian_remove_beneficiary` / `guardian_clear_beneficiaries` / `guardian_set_whole_vault_recipient` | Recovery wallet only | Emergency edits after awakening, before execution |
| `execute_legacy` | **Anyone** | After grace, mark executed; enables per-beneficiary distribution |
| `execute_transfer` / `execute_burn` / `execute_whole_vault_transfer` / `execute_whole_vault_burn` | Anyone | Move / burn the assets |
| `recovery_withdraw` | Recovery wallet | Emergency drain (pre-execution) to a recovery-designated wallet |
| `abandon_ghost` | Owner | Voluntarily close; burns 50% of staked $GHOST as anti-spam penalty |
| `migrate_ghost` | Owner | One-time schema realloc for pre-v1.8 accounts |

Ghosts are **soulbound** — there is no `transfer_ownership` instruction. The PDA address is permanently tied to the original creator's pubkey. To move to a new wallet, abandon and re-register.

## $GHOST token

Ghost Protocol is powered by **$GHOST**, a fixed-supply SPL token (1,000,000,000 total, no further mints).

- **Skin-in-the-game stake** — each Ghost requires a minimum 10,000 $GHOST stake at registration. Aligns the user with the protocol and funds the permissionless-bounty economy.
- **Bounty reserve** — 5% of a Ghost's stake is paid to whoever calls `check_silence` first. This is what incentivizes anyone to be a watcher.
- **Future governance** — parameter updates (minimum stake, fee BPS, grace minimums) move to $GHOST holder vote post-launch.

Distribution is fair-launch: no presale, no team unlock, no private round.

## Security

- **PDA-signed CPIs** — all vault movement uses program-derived signer seeds; no off-chain key authorizes a transfer.
- **Permissionless awakening and execution** — no operator can gate or censor distribution.
- **Recipient ATA authority enforced** — `execute_transfer` and `execute_whole_vault_transfer` constrain `recipient_token_account` by `token::authority = recipient`. A caller cannot pass a substitute ATA.
- **Vault ATA authority enforced** — every vault token account is constrained by `token::authority = vault` (or `= ghost` for the stake vault).
- **Soulbound by construction** — no ownership transfer instruction; state corruption from PDA-vs-stored-owner mismatch is unreachable.
- **Conservative arithmetic** — `checked_mul` / `saturating_sub` everywhere; per-beneficiary `executed` flags prevent double-pay.
- **Migration** — `migrate_ghost` reallocs pre-v1.8 accounts safely.

The full [security report](website/ghost-security-report.html) walks through the program's posture against the Helius-published Solana attack-vector checklist. v1.10 ([`program/lib.rs`](program/lib.rs)) closed four findings discovered through internal review and devnet reproduction; the audit story is in the v1.10 header at the top of `lib.rs`.

A formal third-party audit (target: OtterSec or Neodyme) is planned post-launch alongside an Immunefi bounty program.

The upgrade authority currently belongs to the founder. Migration to a Squads multisig or a 7-day timelock controller is on the roadmap once an external audit funds the operational overhead.

## Roadmap

| Phase | When | What |
|---|---|---|
| **Summon** | Q1 2026 | Fair $GHOST launch · mainnet program live · dashboard · SOL + SPL support · recovery wallets · v1.10 hardening |
| **Awaken** | Q2 2026 | Soulbound beneficiary cNFT mint · NFT vault support · time-locked transfers · Jupiter auto-swap · Telegram heartbeat reminders |
| **Possess** | Q3 2026 | DeFi position closing (Jupiter / Marginfi / Drift) · cross-chain bridges (Ethereum, Base) |
| **Eternal** | Q4 2026 | Optional off-chain memorial integrations · 100k souls registered |

## Quickstart

### Try it without a wallet

Visit **[demo.ghost-protocol.rip](https://demo.ghost-protocol.rip)** — a sandboxed mode that walks the full lifecycle UI without on-chain transactions.

### Register a real Ghost

Visit **[ghost-protocol.rip](https://ghost-protocol.rip)**, connect Phantom/Solflare/Backpack, and register. Configure a short interval (1 hour) and grace period (5 min) on first run to see the full lifecycle compressed.

### Build from source

```bash
git clone https://github.com/yipsinmonte/ghost-protocol.git
cd ghost-protocol/website
npx serve .
# open http://localhost:3000
```

### Interact via Solana CLI

The IDL is published on-chain; any Anchor client can fetch it directly:

```bash
anchor idl fetch -p 3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3
```

### Recovery without our infrastructure

If `ghost-protocol.rip` and the watcher bot both disappear tomorrow, a beneficiary can still claim. The IDL is on-chain, the program is permanent, and the AI-fallback prompt embedded in the soulbound NFT description tells any LLM exactly what to do:

> *"I am a beneficiary of Ghost Protocol on Solana. Program ID is `3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`. Please fetch the IDL from a Solana RPC, derive the Ghost PDA from seed `["ghost", owner_pubkey]`, and construct `execute_transfer` for my beneficiary index N. Tell me how to sign and broadcast."*

This is the protocol's design: **the wallet is the recovery sheet.**

## Repository layout

```
ghost-protocol/
├── program/              # Anchor program (on-chain)
│   └── lib.rs            # Single-file program; v1.10 changelog at the top
├── watcherBot/           # Reference executor bot (off-chain convenience)
│   └── bot.js
├── website/              # dApp + supporting docs
│   ├── index.html              # main interface
│   ├── deck.html / deck_v2.html # pitch deck
│   ├── ghost-whitepaper.html
│   ├── ghost-security-report.html
│   ├── beneficiary_nft_template.html
│   └── beneficiary_nft_metadata_template.json
├── docs/
│   └── pitch/            # narrative artifacts (market sizing, research, decks)
├── LICENSE               # MIT
└── README.md
```

## Disclaimers

Ghost Protocol is software that enables conditional, self-sovereign asset transfer. **It is not a legal estate instrument.** Users in jurisdictions with mandatory inheritance provisions (most of the EU, for example) should pair Ghost with traditional estate planning. We provide the programmable rails; you remain responsible for how they interact with your real-world legal situation.

Self-custody is hard. Ghost Protocol is a tool for people who have already accepted that responsibility.

## Contact

- **X** — [@onchainlegacy](https://x.com/onchainlegacy)
- **Web** — [ghost-protocol.rip](https://ghost-protocol.rip)

---

*Are you still alive?*
