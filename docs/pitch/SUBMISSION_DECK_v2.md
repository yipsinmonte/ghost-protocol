# Ghost Protocol — Frontier Submission Deck v2

> 16-slide outline optimized for **Colosseum Frontier 2026** judges (founders + ecosystem leaders + accelerator partners).
> Pairs with the 60-second emotional-lifecycle video.
> Tone: dark, serif, minimal. Match the website aesthetic. Black background, bone-white text, muted accent (cold cyan or pale violet).

> **v2 changes (vs v1):** Added why-now, competitor landscape, business model, founder slide. Reordered "Why Solana" so PDAs lead. Removed the v1 contradiction where Slide 10 said *"not to extract rent"* while the program ships a 0.5% protocol fee. Reframed for **accelerator stage** — Colosseum's accelerator backs *seed-stage* founders, so we are honest about pre-traction, lean on mainnet-shipped + audited-architecture as the credibility anchor, and treat the hackathon registration window as Day 0 of public traction (not a thing to apologise for).

---

## Deck principles

- **One idea per slide.** Judges scroll fast.
- **Lead with the problem, not the tech.** Every Colosseum winner deck does this.
- **Mainnet program ID visible from Slide 1.** Most submissions are prototypes; we are not. This is our single biggest credibility lever.
- **Video on Slide 5.** After the problem lands and why-now is established.
- **No Lorem Ipsum, no placeholders, no faked traction.** Colosseum accelerator backs founders at seed — we don't need a TVL chart, but the deck must never *imply* one we don't have.
- **Where v1 hedged, v2 commits.** Business model is in the code, so it's on the slide.

---

## Slide 1 — Title

**Visual:** Black background. Single word, massive serif: **GHOST**. Below, small serif: *Your digital afterlife on Solana.* Beneath that, smaller italic: *A smart vault that doesn't forget your family or friends.*

**Bottom-of-slide chip (small, monospace):** `Live on mainnet · 3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`

**Speaker note (10s):** "Every year, billions in crypto becomes permanently unreachable because self-custody has no estate mechanism. We built the one that does — and it's been on mainnet for over a month."

---

## Slide 2 — The problem, told as a story

**Visual:** Single X post screenshot, centered. A real "my dad died and we can't access his SOL" thread. Date visible (must be 2024 or later — judges will check).

**Caption beneath:** *This thread appears every month. There is no process that can help them.*

**Speaker note (20s):** "Centralized exchanges have 'contact support.' Banks have probate. Self-custody has neither. A seed phrase in a safe is a fragile, manual, deeply human workaround for something a smart contract solves in twenty lines of Rust."

---

## Slide 3 — The stat

**Visual:** One number, huge.

> **9 in 10** crypto holders have **no plan** for what happens if they die.

**Caption:** *$200B+ already permanently lost. Ghost is the program that wasn't there.*

**Sources line:** *Cremation Institute · Chainalysis · BitGo · 2024–2025*

**Speaker note (10s):** "Nine in ten crypto holders have no plan. Two hundred billion is already gone."

---

## Slide 4 — Why now (NEW)

**Visual:** Three catalyst icons, one line each.

- **Solana Mobile / Seeker shipping at scale.** A heartbeat from your phone is now a thumbprint, not a desktop ritual. Estate primitives need a mobile substrate to work.
- **Crypto's first generational handoff is happening right now.** Early adopters from 2013–2017 are aging into estate planning. There is currently no native answer.
- **On-chain estate case law is forming.** US probate courts and EU MiCA rules are starting to acknowledge wallet contents as estate assets. Builders set the standard, or regulators do.

**Caption:** *We are 18 months ahead of the regulatory question and 18 months behind the demand.*

**Speaker note (15s):** "Three forces converge in 2026: phones can heartbeat, the first crypto generation is dying, and case law is forming. Whoever builds the primitive now defines the category."

---

## Slide 5 — Show, don't tell (the video)

**Visual:** Embed the 60-second emotional lifecycle video full-bleed.

**Speaker note (60s):** *the video speaks for itself.*

---

## Slide 6 — What Ghost Protocol is

**Visual:** Clean 4-step diagram. Left to right. Each step has an icon.

```
  REGISTER        FUND          STAY ALIVE       EXECUTE
  ───────        ────         ────────────     ─────────
  Ghost PDA      SOL & SPL    Ping before     Anyone can
  + Vault PDA    deposits     interval        trigger after
                              expires         grace period
```

**Caption beneath:** *A trustless, on-chain dead-man's switch for **every asset on Solana**.*

**Asset rail (small monospace line beneath the caption):** `SOL · USDC · wBTC · jitoSOL · BUIDL · xStocks · every SPL & Token-2022`

**Secondary line (smaller, below caption):** *Digital legacy first. Also works for travel, hospitalization, seed-phrase loss, detention, or any contingency slice for your family. Heartbeat interval ranges from **1 hour to 10 years** — most Ghosts are pinged, cancelled, or executed long before their owner actually dies.*

**Speaker note (15s):** "Four actions. Register, fund, heartbeat, execute. The program enforces every rule. Nobody — not us, not a bot, not an exchange — holds your keys or your funds. And this isn't only inheritance — it's a programmable escape-valve for any form of self-custody disappearance."

---

## Slide 7 — Why Solana (PDA leads)

**Visual:** 3 bullets, lead with the strongest. Below the bullets, an "Asset rail" strip.

- **PDAs whose private keys do not exist.** The vault is owned by a program-derived address. There is no key to steal, lose, or be coerced into signing. On EVM this requires multisig + external signer infrastructure. On Solana it is a native primitive.
- **Permissionless execution.** `check_silence` and `execute_legacy` are callable by anyone. Cheap enough that someone always will.
- **Sub-cent heartbeats.** Pings cost less than a cent. Ethereum gas makes this a whales-only product.

**Asset rail strip (below the bullets):**
> **Coverage:** SOL · USDC · wBTC · tBTC · wETH · jitoSOL · mSOL · BUIDL · xStocks · USDY · every SPL & Token-2022
>
> *Solana hosts the largest stablecoin float outside Ethereum, BlackRock's BUIDL tokenized treasury, Backed Finance's tokenized stocks, and the major LSTs ($10B+ TVL). Ghost's protected TAM expands automatically as Solana attracts more tokenized assets — we don't ship a line of new code for each.*

**Speaker note (15s):** "This product only works on a chain where PDAs exist, gas is a rounding error, and execution is permissionless. That is Solana — and as Solana eats the tokenized-asset world, we protect every new asset class by default. We don't have to choose between being a SOL-inheritance product and a tokenized-stock-inheritance product. We're both."

---

## Slide 8 — Trust model (the moat slide)

**Visual:** Two columns, side by side.

| What nobody can do                              | What the user can do                          |
|-------------------------------------------------|-----------------------------------------------|
| Move funds out of your vault                    | Ping, deposit, withdraw, configure, pause     |
| Awaken you while you're still pinging           | Designate up to 3 recovery wallets as emergency trustees |
| Redirect your beneficiaries                     | Cancel awakening during grace period          |
| Prevent your beneficiaries from receiving funds | Transfer Ghost ownership to a new wallet      |

**Caption beneath:** *The vault PDA's private key does not exist. The only way to move funds is through program logic you configured.*

**Speaker note (20s):** "Every crypto custody product has a trust model slide. Most of them have a centralized operator hiding behind a DAO. Ours is: the program, the user, the user's designated recovery wallets. That's the full list of parties with authority. Nothing else."

---

## Slide 9 — Landscape (NEW — where Ghost sits)

**Visual:** 2×2 matrix. Y-axis: *Custodial → Non-custodial.* X-axis: *EVM-only → Solana-native / chain-agnostic.*

- **Top-left (custodial, EVM):** Casa, Ledger Recover, Vault12 — require trusting an operator with key material.
- **Top-right (custodial, chain-agnostic):** Coinbase / Binance estate paths — require KYC + probate, off-chain only.
- **Bottom-left (non-custodial, EVM):** Sarcophagus DAO, Safe Recovery modules — non-custodial but Ethereum-priced. **Sarcophagus is a ~$1M-market-cap project with ~1,118 token holders** (CoinMarketCap / Etherscan, 2026). The "category incumbent" is a microcap.
- **Bottom-right (non-custodial, Solana-native):** **Ghost Protocol.** Empty quadrant before us.

**Caption:** *We are the only smart-contract-native, non-custodial, sub-cent-heartbeat option. The closest analogue (Sarcophagus) ships on Arweave and assumes Ethereum gas pricing.*

**Speaker note (15s):** "Estate exists in crypto today as one of three things: a help-desk ticket, a self-managed seed phrase in a safe, or a $200-per-trigger Ethereum contract. None of those scale. The bottom-right quadrant has been empty. We're filling it."

---

## Slide 10 — Live on mainnet (the credibility slide)

**Visual:** Solana Explorer screenshot. Program ID `3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`. Instructions listed. Deploy date visible.

**Three numbers strip beneath the screenshot — use real numbers, even if small. Update before submission:**

| Mainnet since | Program LOC | Migration shipped |
|---|---|---|
| March 2026 | 1,030 lines Anchor | v1.7 → v1.9 |

**Caption:** *This is not a hackathon prototype. It's been on mainnet for over a month. Public registration opens during this hackathon — every judge gets a free registered Ghost.*

**Honesty bullet:** *Upgrade authority is currently held by the founder's deployer wallet — standard for pre-audit Solana programs. Post-audit (OtterSec or Neodyme, Q2 2026) authority migrates to a Squads multisig or 7-day timelock controller.*

**Speaker note (20s):** "We're being honest: this is pre-audit and pre-public-registration. But the architecture is shipped, migrations work, and the upgrade-authority answer is the one technical judges actually want — not premature immutability, but a credible migration plan funded by this prize."

---

## Slide 11 — Business model (NEW — replaces v1's contradiction)

**Visual:** Two-line, monospace, pulled straight from `lib.rs`.

```rust
pub const REGISTRATION_FEE_LAMPORTS: u64 = 20_000_000;   // 0.02 SOL per Ghost
pub const EXECUTION_FEE_BPS: u64 = 50;                   // 0.5% on executed transfers
```

**Three bullets beneath:**

- **Registration fee** funds protocol development and the watcher economy from Day 1. Paid once, on-chain, no subscription.
- **Execution fee** is taken only when a Ghost actually triggers — i.e. when the protocol delivered value. Rent-extraction-resistant by design: idle Ghosts pay nothing.
- **Path to revenue clarity:** at 10,000 registered Ghosts and 1% annual execution rate, fee revenue covers ongoing audit + dev. The protocol funds itself before token economics are needed.

**Caption:** *On-chain, immutable, and aligned: we earn when the protocol works.*

**Speaker note (20s):** "We are not pretending we don't make money. The fee is in the code, on Slide 11, and on Solana Explorer. Registration funds development now; execution fees fund it forever. We earn when a Ghost actually delivers — not before."

---

## Slide 12 — Market & Money (combined — Colosseum-grade)

> **Backing documents (in repo, not in deck):** [`MARKET_SIZING_VC.md`](./MARKET_SIZING_VC.md) — full VC-grade audit trail · [`RESEARCH_FINDINGS.md`](./RESEARCH_FINDINGS.md) — sourced numbers. The slide is the headline; the docs are receipts if any judge asks.

**Visual:** Hero headline → AUM stacked bar → 3-cell stat strip → 3 revenue stream cells → single ask line. One slide, no tables, lots of negative space.

**Headline:** *"A $60B universe. 30,000 Ghosts at Year 3 = 1.6% of the protectable cohort."*

**Sub:** *In Solana self-custody · today.*

---

**1. Stacked AUM bar (visual — segments scaled to dollar value):**

| Segment | $ |
|---|---:|
| Native SOL | $42B |
| Stablecoins (USDC + USDT + PYUSD) | $15.7B |
| LSTs (jitoSOL + mSOL + bSOL) | $7.1B |
| Memecoins & long-tail SPL | $2.0B |
| RWAs (BUIDL + Ondo + xStocks) | $1.5B |
| DePIN (HNT + RENDER + HONEY) | $1.1B |
| Wrapped BTC + ETH | $0.6B |

---

**2. Three-number stat strip:**

| **9.2M** | **1.85M** | **30,000** |
|---|---|---|
| Wallets holding SOL | Wallets >$1k · core market | Year-3 Ghost target |

---

**3. Three revenue streams (one line each, big numbers):**

| Stream | Number | Status |
|---|---|---|
| Registration · in code | **0.02 SOL** | Per Ghost. Hardcoded. Day-1 revenue, no execution risk. |
| Execution · in code | **0.5%** | Of inherited TVL when a Ghost triggers. Hardcoded. |
| Premium features · year 2 | **$99/yr** | Optional upgrade tier paid in SOL. Anchored to LegalZoom $199 with crypto discount. |

---

**4. The ask (single line, highlighted):**

> **THE ASK** · **$250k pre-seed** → $120k audit + 12 months solo runway + community distribution. **Cash-flow positive at base case Year 3.** Burn · $10k/mo.

---

**Sources line (small footer):** *DefiLlama · rwa.xyz · CoinGecko · Phantom $25B at 39.4% share ⇒ $63B implied (cross-check ✅) · Apr 2026*

**Speaker note (30s):** "Sixty billion dollars sit in Solana wallets right now — across SOL, stablecoins, LSTs, RWAs like BlackRock BUIDL, wrapped BTC, memecoins. Ghost protects every SPL and Token-2022 by default. The core market is the 1.85 million wallets with more than a thousand dollars. We target thirty thousand Ghosts at Year 3, which is one and a half percent of that. Two fees are already hardcoded — registration at 0.02 SOL and execution at half a percent. A premium tier comes Year 2. The ask is two hundred fifty thousand: that's the audit, twelve months of runway, and community distribution. Cash-flow positive Year 3."

**If a judge asks "how much money is this really?":** Refer them to [`MARKET_SIZING_VC.md`](./MARKET_SIZING_VC.md) — full Year-3 forecast: bear $18k / **base $142k** / bull $700k. Year-10 base trajectory ~$5M ARR with one wallet partnership, ~$120M equity outcome at 17× crypto-infra median. Don't put any of this on the slide.

---

## Slide 13 — $GHOST token (utility only — rewritten)

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
           │  → 5% bounty → caller       │
           └─────────────┬───────────────┘
                         ▼
           ┌─────────────────────────────┐
           │  Grace period → Execute     │
           │  Beneficiaries receive      │
           └─────────────────────────────┘
```

**Caption:** *1B fixed supply. Fair launch on pump.fun. No presale, no team cliff. $GHOST is utility — stake + watcher bounty + governance — separate from the protocol fee on Slide 11.*

**Speaker note (15s):** "Two distinct economic primitives. The protocol fee is how we fund ourselves. $GHOST is how we make execution permissionless: anyone can run a watcher bot, claim the bounty, and the network never depends on our infrastructure being online."

---

## Slide 14 — Roadmap

**Visual:** 4-phase timeline, each named after the project's myth.

| Phase | When | Highlights |
|---|---|---|
| **Summon** | Q1 2026 ✓ | Mainnet deploy, dashboard, SOL+SPL+Token-2022, recovery wallets |
| **Awaken** | Q2 2026 | Metaplex NFT vaults, time-locked transfers, Jupiter auto-swap, off-chain executors (X post, email, TG notification to beneficiaries) |
| **Possess** | Q3 2026 | DeFi position closing (Jupiter, Marginfi, Drift), cross-chain bridges via Wormhole |
| **Eternal** | Q4 2026+ | Memorial layer, programmable post-mortem messages, integrations with Phantom / Backpack / Solana Mobile |

**Speaker note (15s):** "We don't need to win all four. Summon ships the primitive. Awaken closes the off-chain notification gap and unlocks DeFi. Possess and Eternal are optional extensions that compound the moat."

---

## Slide 15 — Founder (NEW)

**Visual:** Founder photo (or illustrated avatar matching site aesthetic). Name. X handle.

**Three bullets:**

- **Solo founder, shipping since Q4 2025.** Two products live on Solana mainnet: Ghost Protocol (estate) and stairz.fun (memecoin launchpad with platform-operated defender bot).
- **Why this:** [one personal sentence — keep it human, not corporate. The moment that triggered the build.]
- **Bus factor:** I dogfood the protocol. My own Ghost is registered with three recovery wallets. If I disappear, the protocol I built keeps running and my keys go to the people I designated. That's the credibility test.

**Speaker note (20s):** "Solo founder is a feature, not a bug — the entire product philosophy is that one person, even a missing one, shouldn't be the chokepoint. The protocol applies to me. If you're backing me through the accelerator, you're backing someone who has shipped two mainnet programs in six months and lives by his own trust model."

---

## Slide 16 — The ask

**Visual:** One ask, one CTA.

**Ask:** *Frontier accelerator seat.* The prize funds the audit and the first 90 days of distribution to crypto-OPSEC and estate-planning communities. Accelerator backing extends that runway to a year and unlocks integrations with Phantom, Backpack, and Solana Mobile.

**CTA:** Try a 1-hour Ghost during the hackathon. QR code on screen → [`ghost-protocol.rip`](https://ghost-protocol.rip).

**Footer line:** *Program ID `3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3` · X [@onchainlegacy](https://x.com/onchainlegacy)*

**Final line, serif, centered:** *Are you still alive?*

---

## Speaker notes for the full pitch (3 minutes live)

1. **(0:00)** Hook: "Every year billions in crypto becomes permanently lost because self-custody has no estate mechanism." Show the X thread (S2). Show the stat (S3).
2. **(0:25)** Why now (S4). Three catalysts in 15 seconds.
3. **(0:40)** Play the 60-second video without narration (S5).
4. **(1:40)** "This is Ghost Protocol. Four actions — register, fund, heartbeat, execute." 4-step diagram (S6).
5. **(2:00)** "Why it only works on Solana." PDA-without-keys leads (S7). 15s.
6. **(2:15)** "The trust model." Two-column slide (S8). "Nobody — including us — can move a cent out of your vault. The vault PDA's key does not exist." 15s.
7. **(2:30)** "We're alone in this quadrant." Landscape 2×2 (S9). 10s.
8. **(2:40)** "Already live on mainnet." Explorer screenshot, traction strip, honest upgrade-auth answer (S10). 10s.
9. **(2:50)** "And we already make money." Business model slide (S11). 5s — let the constants speak.
10. **(2:55)** "I'm the founder. I dogfood the protocol. Backing me is backing someone who has shipped two mainnet programs in six months." (S14 + S15 ask). 5s.

---

## Design spec for the real deck

- **Tool:** Figma, Keynote, or Pitch. Not Google Slides.
- **Font:** Serif for headlines (Syne, Fraunces, or EB Garamond — match website). Sans-serif for body (Inter, General Sans). Monospace for program ID and `lib.rs` excerpts (JetBrains Mono).
- **Colors:** Black background (#0A0A0C), bone-white text (#F0F0F8), one accent (cold cyan #7FE5E5 or pale violet #B8A0FF). No gradients, no drop shadows.
- **Imagery:** No stock photography. Use whitepaper/site assets. Grain textures and fog are on-brand.
- **Slide ratio:** 16:9.
- **Export:** PDF + Loom walkthrough for async submission.

---

## Things to have ready before you submit

- [ ] Program ID verified on mainnet Explorer, deploy date visible.
- [ ] 60-second lifecycle video hosted on **both** YouTube unlisted *and* Loom (judges have one open, not always both).
- [ ] `README.md` in the submitted repo (done).
- [ ] At least one "try it" path that doesn't require cloning — hosted dApp URL (`ghost-protocol.rip`).
- [ ] Founder's X handle + 2-minute Loom of you personally explaining why this matters.
- [ ] One real-user testimonial or DM screenshot — even informal. Not required, but moves the needle.
- [ ] $GHOST live on pump.fun with mint & freeze authority revoked; mint address in submission description and README.
- [ ] **Upgrade authority copy is honest, not revoked.** Do *not* run `solana program set-upgrade-authority --final` before audit.
- [ ] Immunefi bug-bounty page live (free to post, pay-on-finding).
- [ ] One respected Solana dev has glanced at the program — credit "reviewed by @handle". 30-minute favor, big trust signal.
- [ ] Replace any remaining "No trust required" copy with "No custodial party required" — match what the code does.
- [ ] Secondary tagline — *"A smart vault that doesn't forget your family or friends"* — on landing page and S1.
- [ ] **NEW v2 checks:**
  - [ ] Slide 9 landscape 2×2 reviewed against current state of Sarcophagus / Casa / Ledger Recover (some may have shifted).
  - [ ] Slide 10 traction strip uses *real* on-chain numbers — even if "0 public registrations, 1 founder dogfood Ghost". Honesty > inflation.
  - [ ] Slide 11 fee constants match `lib.rs` exactly. If you change the program before submission, change this slide.
  - [ ] Slide 14 founder bullet "Why this" written in *one personal sentence* — judges remember the human moment, not the resume line.
  - [ ] Stat on Slide 3 cites a 2024 or later source. The 2020 Chainalysis number alone is stale.

---

## Why this works for the accelerator track specifically

Colosseum's accelerator backs founders at **seed stage**. They are not looking for revenue, users, or product-market fit — they are looking for:

1. **A founder who ships.** S10 (mainnet, migrations) + S14 (two products in six months) cover this.
2. **A category that matters.** S2 + S3 + S4 (problem, stat, why-now) cover this.
3. **A defensible primitive.** S7 + S8 + S9 (PDA-as-moat, trust model, empty quadrant) cover this.
4. **A realistic path to revenue.** S11 (fees in code, not slideware) covers this.
5. **A team worth betting on.** S14 covers this — and the dogfood line is the close.

We are not competing with Series A pitches. We are competing with other Frontier finalists. The bar is *credible founder + interesting primitive + realistic 12-month plan*. v2 is built to clear that bar without faking the parts we haven't earned yet.
