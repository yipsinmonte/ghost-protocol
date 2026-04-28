# Ghost Protocol — Frontier Submission Deck

> 12-slide outline optimized for Colosseum Frontier 2026 judges (founders + ecosystem leaders).
> Pairs with the 60-second emotional-lifecycle video.
> Tone: dark, serif, minimal. Match the website aesthetic. Black background, bone-white text, muted accent (cold cyan or pale purple).

---

## Deck principles

- **One idea per slide.** Judges scroll fast.
- **Lead with the problem, not the tech.** Every Colosseum winner deck does this.
- **Show the mainnet program ID on screen somewhere.** Proof that this isn't vapor.
- **Video goes on slide 3 or 4.** After the problem lands, before the architecture explanation.
- **No Lorem Ipsum, no placeholders.** If a data point isn't ready, cut the slide.

---

## Slide 1 — Title

**Visual:** Black background. Single word, massive serif: **GHOST**. Below, small: *Your digital afterlife on Solana.* Beneath that, smaller italic: *A smart vault that doesn't forget your family or friends.*

**Speaker note (10s):** "Every year, billions in crypto becomes permanently unreachable because self-custody has no estate mechanism. We built the one that does."

---

## Slide 2 — The problem, told as a story

**Visual:** Single X post screenshot, centered. A real "my dad died and we can't access his SOL" thread. (Find one — they're recurring on crypto Twitter and r/CryptoCurrency.) Date visible.

**Caption beneath:** *This thread appears every month. There is no process that can help them.*

**Speaker note (20s):** "Centralized exchanges have 'contact support.' Banks have probate. Self-custody has neither. A seed phrase in a safe is a fragile, manual, deeply human workaround for something a smart contract solves in twenty lines of Rust."

---

## Slide 3 — The stat

**Visual:** One number, huge. *~20% of all bitcoin is estimated permanently lost to death, forgotten keys, and hardware failure.* Source citation small underneath (Chainalysis estimates, 2020; updated studies).

**Caption:** *This is the problem you cannot solve with better UX. You solve it with a program.*

**Speaker note (10s):** "This isn't a onboarding problem. It's a continuity problem."

---

## Slide 4 — Show, don't tell (the video)

**Visual:** Embed the 60-second emotional lifecycle video full-bleed.

**Speaker note (60s):** *the video speaks for itself.*

---

## Slide 5 — What Ghost Protocol is

**Visual:** Clean 4-step diagram. Left to right. Each step has an icon.

```
  REGISTER        FUND          STAY ALIVE       EXECUTE
  ───────        ────         ────────────     ─────────
  Ghost PDA      SOL & SPL    Ping before     Anyone can
  + Vault PDA    deposits     interval        trigger after
                              expires         grace period
```

**Caption beneath:** *A trustless, on-chain dead-man's switch for any SPL token.*

**Secondary line (smaller, below caption):** *Digital legacy first. Also works for travel, hospitalization, seed-phrase loss, detention, or any contingency slice for your family. Usage cycle is months and years, not decades — most Ghosts are pinged, cancelled, or executed long before their owner actually dies.*

**Speaker note (15s):** "Four actions. Register, fund, heartbeat, execute. The program enforces every rule. Nobody — not us, not a bot, not an exchange — holds your keys or your funds. And this isn't only for inheritance — it's a programmable escape-valve for any form of self-custody disappearance."

---

## Slide 6 — Why Solana (not ethical decoration, real reason)

**Visual:** 3 bullets, each with an icon:

- **PDA-owned vaults** — program-derived addresses whose private keys do not exist. On EVM this is multisig + external signer infrastructure. On Solana it's native primitive.
- **Permissionless execution** — `check_silence` and `execute_legacy` can be called by anyone. Cheap enough that anyone will.
- **Sub-cent heartbeats** — weekly pings cost less than a cent. Ethereum gas makes this a whales-only product.

**Speaker note (15s):** "This product only works on a chain where PDAs exist, gas is a rounding error, and execution is permissionless. That's Solana."

---

## Slide 7 — Trust model (the crucial slide)

**Visual:** Two columns, side by side.

| What nobody can do                              | What the user can do                          |
|-------------------------------------------------|-----------------------------------------------|
| Move funds out of your vault                    | Ping, deposit, withdraw, configure, pause    |
| Awaken you while you're still pinging          | Designate up to 3 recovery wallets as emergency trustees |
| Redirect your beneficiaries                     | Cancel awakening during grace period          |
| Prevent your beneficiaries from receiving funds | Transfer Ghost ownership to a new wallet     |

**Caption beneath:** *The vault PDA's private key does not exist. The only way to move funds is through program logic you configured.*

**Speaker note (20s):** "Every crypto custody product has a trust model slide. Most of them have a centralized operator hiding behind a DAO. Ours is: the program, the user, the user's designated recovery wallets. That's the full list of parties with authority. Nothing else."

---

## Slide 8 — Architecture diagram

**Visual:** The ASCII diagram from the README, rendered cleanly in the deck's type system. Two PDAs, flows, CPIs.

**Caption:** *Owner → Ghost PDA (state) → Vault PDA (assets) → Beneficiaries. Every asset move is a CPI signed by the vault PDA.*

**Speaker note (20s):** "State and assets are separated. The Ghost PDA stores your configuration and heartbeat. The Vault PDA holds your funds. The program signs for the vault using seed-derived authority — no keystore, no key rotation, no operator."

---

## Slide 9 — Live on mainnet

**Visual:** Screenshot of the program on Solana Explorer. Program ID `3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`. Instructions listed. Deploy date visible.

**Caption:** *Program deployed March 2026. 1,030 lines of Anchor. Migration path from v1.7 → v1.9 already shipped. Public registration opens during this hackathon.*

**Additional line:** *Upgrade authority currently held by the founder's deployer wallet — standard for pre-audit Solana programs. Post-launch roadmap migrates to a Squads multisig or 7-day timelock controller after the first third-party audit, so any future upgrade is either multi-signer or user-reactable.*

**Speaker note (15s):** "This is not a hackathon prototype — it's been on mainnet for over a month and public registration opens during this hackathon. We're being honest about the upgrade authority: it's a single key today because revoking or locking it before an audit would be reckless, not trustworthy. Prize and grant capital funds the audit, then authority migrates to a multisig or timelock."

---

## Slide 10 — $GHOST token & incentive loop

**Visual:** Circular flow diagram.

```
           ┌─────────────────────────────┐
           │   Register → Stake $GHOST   │
           └─────────────┬───────────────┘
                         ▼
           ┌─────────────────────────────┐
           │   Ping = Heartbeat          │
           │   Silence = Eligible        │
           └─────────────┬───────────────┘
                         ▼
           ┌─────────────────────────────┐
           │  Anyone calls check_silence │
           │  → 5% stake → caller        │
           └─────────────┬───────────────┘
                         ▼
           ┌─────────────────────────────┐
           │  Grace period → Execute     │
           │  Beneficiaries receive      │
           └─────────────────────────────┘
```

**Caption:** *1 billion fixed supply. Fair launch. No presale, no team cliff. The token exists to fund the watcher economy, not to extract rent.*

**Speaker note (20s):** "The bounty is what makes this trustless. If our reference bot disappears, anyone can run one and collect the 5% bounty. The economic loop is: stake is skin in the game, bounty incentivizes watchers, supply is capped forever."

---

## Slide 11 — Roadmap

**Visual:** 4-phase timeline, each named after the project's myth:

| Phase | When | Highlights |
|---|---|---|
| **Summon** | Q1 2026 ✓ | Mainnet deploy, dashboard, SOL+SPL, recovery wallets |
| **Awaken** | Q2 2026 | NFT (Metaplex) vaults, time-locked transfers, Jupiter auto-swap, off-chain executors (X post, email, TG) |
| **Possess** | Q3 2026 | DeFi position closing (Jupiter, Marginfi, Drift), cross-chain bridges |
| **Eternal** | Q4 2026 | Memorial layer, AI-self integration, 100k registered souls target |

**Speaker note (15s):** "We don't need to win all four to be a real business. We just need Summon to ship and Awaken to close the DeFi gap. Phases three and four are optional extensions."

---

## Slide 12 — The ask

**Visual:** Three bullets.

- **Prize** — to fund the audit (OtterSec / Neodyme, target Q2) and the first 90 days of marketing to crypto-OPSEC communities.
- **Accelerator** — if the panel sees a founder worth backing, we are open. Solo founder, shipping since Q4 2025, two products live on mainnet.
- **Try it** — every judge gets a free registered Ghost during the hackathon. Program ID [`3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`](https://explorer.solana.com/address/3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3). Website [ghost-protocol.rip](https://ghost-protocol.rip). X [@onchainlegacy](https://x.com/onchainlegacy).

**Final line, serif, centered:** *Are you still alive?*

---

## Speaker notes for the full pitch (if given live, 3 minutes)

1. **(0:00)** Hook: "Every year billions in crypto becomes permanently lost because self-custody has no estate mechanism." Show the X thread.
2. **(0:30)** Play the 60-second video without narration.
3. **(1:30)** "This is Ghost Protocol. Four actions — register, fund, heartbeat, execute. Show the 4-step diagram.
4. **(1:50)** "Why it only works on Solana." Three bullets, 20 seconds.
5. **(2:10)** "The trust model." The two-column slide. "Nobody — including us — can move a cent out of your vault. The vault PDA's key does not exist."
6. **(2:35)** "This is already live on Solana mainnet. One thousand lines of Anchor. Program ID is on your screen. Judges are our first public users."
7. **(2:55)** "We're raising our first capital to fund the audit and ninety days of marketing to crypto OPSEC communities. Thank you. Try it."

---

## Design spec for the real deck

- **Tool:** Figma, Keynote, or Pitch. Not Google Slides (typography can't carry it).
- **Font:** Serif for headlines (match website — Syne, Fraunces, or EB Garamond). Sans-serif for body (Inter, General Sans).
- **Colors:** Black background (#0A0A0C), bone-white text (#F0F0F8), one accent (cold cyan #7FE5E5 or pale violet #B8A0FF). No gradients, no drop shadows.
- **Imagery:** No stock photography. Use your existing whitepaper/site assets. Grain textures and fog are on-brand.
- **Slide ratio:** 16:9.
- **Export:** PDF + Loom walkthrough for async submission.

---

## Things to have ready before you submit

- [ ] Program ID verified on mainnet Explorer, deploy date visible.
- [ ] 60-second lifecycle video hosted (YouTube unlisted / Loom / direct MP4).
- [ ] `README.md` in the submitted repo (done).
- [ ] At least one "try it" path that doesn't require cloning the repo (hosted dApp URL).
- [ ] Founder's X handle + 2-minute Loom of you personally explaining why this matters to you.
- [ ] One testimonial or quote from a real user — even an informal DM screenshot. Judges notice.
- [ ] $GHOST live on pump.fun with mint & freeze authority revoked; mint address in the submission description and README.
- [ ] **Upgrade authority copy is honest, not revoked.** Do *not* run `solana program set-upgrade-authority --final` before a third-party audit — premature immutability locks in any undiscovered bug forever. Instead, ensure the README and Slide 9 frame the EOA upgrade authority as a pre-audit norm with a credible post-audit migration plan (Squads multisig or 7-day timelock). This is the answer technical judges actually want.
- [ ] Immunefi bug bounty page live (free to post; pay-on-finding).
- [ ] One respected Solana dev has glanced at the program and is willing to be credited with "reviewed by @handle" — 30-minute favor, not a formal audit.
- [ ] Update any copy that says "No trust required" to "No custodial party required" to match what the code actually does. Tiny change, big trust signal to technical judges.
- [ ] Secondary use-case tagline — *"A smart vault that doesn't forget your family or friends"* — on the landing page and first slide. Broadens the narrative beyond death without diluting the primary "digital legacy" positioning.
