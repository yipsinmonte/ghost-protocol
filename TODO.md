# Ghost Protocol — TODO (post-Frontier)

Captured 2026-04-28. Things to action after the Colosseum submission.

---

## 🔥 Roast follow-ups (priority queue 2026-04-29+)

Post-roast work. Most of these don't need to ship before submission — but they
ARE the difference between "won the hackathon" and "still here in 6 months."

### TIER A — Existential. Without these the product loses post-Frontier.

1. **Build a real retention loop** — Telegram heartbeat bot pulled from Phase II
   to Phase I. ~200 lines of Python. Every Friday: "still alive? click ✓ to ping."
   Without this, DAU collapses to ~0 after onboarding. THE single biggest fix.
2. **Beneficiary-side dashboard** — "you are named as a beneficiary in N Ghosts."
   Turns beneficiaries into evangelists + creates the multi-side network effect
   you currently don't have. Same urgency as #1 — they reinforce each other.
3. **Decide $GHOST honestly** — either ship it with real liquidity + governance
   OR drop the stake requirement from `initialize_ghost` (replace with SOL-only
   fee). Right now it sins #2 (token-first thinking) and creates an onboarding
   wall of "where do I get $GHOST?" Investors WILL ask about this.

### TIER B — Hygiene. Pre-submission grep + edits (~30 min total).

4. **Strip "5 ghosts on chain" claims** from deck, security report, marketing
   site. Replace with verifiable framing ("solo founder dogfooding · 5 lifecycle
   test states on mainnet · v1.10 audit shipped"). README already updated.
   Check: `deck_v2.html` slide 14 (Live, shipped), `ghost-security-report.html`,
   any landing-page hero stats.
5. **Soften the disclaimer pile** in footer + README — necessary but currently
   reads paranoid. Single-paragraph version + linked-out long form.
6. **First-abandon grace** — don't burn 50% of stake if user abandons within
   7 days of registration. Brutal UX for trial users. Program v1.11 change.

### TIER C — Strategic. Real moat work (post-Frontier, post-audit).

7. **Lock distribution before someone else does** — Phantom embed proposal,
   Backpack plugin scoping, Solflare partnership convo. Wallet integration is
   the only durable moat for a single-user-state product.
8. **Add a yield-while-alive option** (Marfi/Drift) — gives users a reason to
   keep funds in the vault that doesn't depend on death. Phase II already has
   this; pull forward if possible.
9. **Public streak counter / leaderboard** — gamify pings. "Top 12% longest
   streak · 247 days." Gives the protocol a social spine + creates
   rubbernecking traffic when a top-ranked Ghost awakens.
10. **Real third-party audit** — OtterSec or Neodyme, ~$15k-30k. Audit reports
    take months; they're a real moat competitors can't snap-fork. This is the
    entire point of the $250k accelerator ask.
11. **Death-theme accessibility** — `.rip` domain + Ghost branding is great for
    crypto-natives but might block 50yo spouses/parents. Consider a
    second-face site (e.g. `legacy.solana.com`-style brand) for beneficiary
    touchpoints, leave Ghost branding for owners.

### Things NOT to revisit

- ❌ Don't remove MIT license — hygiene, not strategic exposure. Bytecode is
  already public; license just makes it legitimate.
- ❌ Don't remove IDL from chain — same logic. Anyone can decompile in 10 min.
  IDL helps legitimate users + AI agents claim, doesn't help attackers.
- ❌ Don't reframe to B2B/infrastructure — user already pushed back, B2C
  emotional positioning IS the differentiator, crypto businesses can build
  this themselves anyway.
- ❌ Don't worry about Phantom cloning. They could clone every Solana
  protocol. They don't, because being the wallet > being the protocol.

---

## Resume here next session (2026-04-29+)

Picking up from where we paused on 2026-04-28:

1. **Render the Beneficiary NFT mockup** (per #6.5 below). The user wants to see what the soulbound card actually looks like — SVG/HTML rendered in Ghost's existing aesthetic (Fraunces serif, violet/heartbeat-pink palette, memento mori card layout with QR code in the bottom corner). Generate as a 1024×1024 image so it can be viewed at thumbnail-size to verify wallet rendering.
2. **After mockup approval, sketch the registration-flow guardrail UI** (#1 + #2 below) — wireframe / HTML-of how the dApp will require ≥1 recovery wallet and prompt for beneficiaries on first deposit.
3. **Verify whether `anchor idl init` was run for v1.9** (#4) — quick CLI check.

The deck (`deck_v2.html`) is in good shape and Colosseum-ready as-is — don't re-bloat it. Detailed financial backing lives in `MARKET_SIZING_VC.md` for if a judge asks.

---

## P0 — frontend guardrails (no program change needed)

These prevent stuck-asset edge cases without redeploying the program.

### 1. Require at least one recovery wallet at registration
Block the "Save Ghost" button in the dApp until the user sets ≥1 recovery wallet (or accepts an explicit warning).

**Why:** if a Ghost has zero beneficiaries AND zero `whole_vault_recipient` AND zero recovery wallets, and the owner loses access, **assets are permanently locked in the vault PDA** — no instruction in `lib v1.9.rs` can move them out. Recovery wallets are the rescue path: `guardian_set_whole_vault_recipient`, `guardian_clear_beneficiaries`, etc. let a recovery wallet salvage assets after-the-fact.

**Implementation:** UI-only change in the registration flow. Show a warning panel: *"You must set at least one recovery wallet, or your assets will be permanently locked if you lose access to this wallet."* Make it dismissible with a typed confirmation if the user really wants to proceed without one.

### 2. Encouragement message on first deposit
When a user deposits assets into a Ghost vault and `beneficiary_count == 0` AND `whole_vault_recipient == None`, surface a banner / modal:

> *"Your vault now holds assets but has no beneficiaries. Add at least one beneficiary or set a whole-vault recipient — otherwise the program won't have anywhere to send your assets if it triggers."*

**Implementation:** Detect post-deposit state, show a non-blocking banner with a CTA *"Add beneficiary"* that scrolls to the configuration panel. Persist dismissal so it's not nagging on every deposit.

### 3. Audit the registration flow for hidden footguns
Walk through the full onboarding once a quarter looking for new states where a user could end up with assets-but-no-instructions. Add UI guardrails as the program grows.

---

## P0 — beneficiary fallback documentation (the "what if your website is down" problem)

The owner-pinging path is permissionless via the program directly — but **a beneficiary trying to claim** when the website is down is a much harder UX problem. They need: program ID, instruction structure, their own Ghost PDA / beneficiary index, signer wallet. Right now that knowledge lives only in the dApp.

### 4. Publish the IDL on-chain via `anchor idl init`
Verify this was done at deploy time. If not, run it now. Once on-chain, any RPC can serve the IDL by program ID alone — Solscan, Anchor Explorer, and AI agents can render it without any frontend.

### 5. Open-source the frontend on GitHub
Make `ghost-protocol/dapp` public. Anyone — beneficiary, journalist, AI agent — can fork and self-host. This is the single biggest defense against "website down" scenarios.

### 6. Mirror the dApp on IPFS + Arweave
Pin a static build to IPFS and Arweave (~$30/yr). Link both gateways from `ghost-protocol.rip` and the README. If the primary domain ever goes down, IPFS-via-public-gateway still works. Backpack, Jupiter, and Drift all do this.

### 6.5 (CRITICAL) — Mint a "Beneficiary NFT" at registration
**The fundamental fix for the website-obliterated scenario.** Online docs don't help if the beneficiary has no artifact pointing them to the docs in the first place.

When `add_beneficiary` succeeds, the dApp mints a Metaplex soulbound (non-transferable) NFT to the beneficiary's wallet. Metadata is pinned to Arweave (permanent) and contains everything needed to claim:

- Owner's pubkey + optional display name (e.g. *"Mom"*)
- Ghost PDA address
- Program ID — `3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`
- Their beneficiary index N
- The AI fallback prompt (pre-written, copy-pasteable)
- Mirror URLs (IPFS gateway, Arweave, GitHub Pages)
- Manual Solana CLI command to call `execute_legacy` + `execute_transfer`
- Registration date

**Why this works under "everything is gone":** the beneficiary opens their wallet, sees a token called *"Ghost Beneficiary — set by Mom"*, clicks it, reads the metadata, copies the prompt into any AI. **No website lookup needed. No prior knowledge required.** The wallet itself is the recovery sheet.

**Implementation:** frontend + Metaplex client-side mint at registration. No program change. The mint signer can be the owner's wallet (cost is theirs). Compressed NFTs keep cost negligible. Ship alongside registration guardrails.

### 7. Write `BENEFICIARY_GUIDE.md`
Stand-alone document (NOT inside the dApp) with:
- The program ID (immutable, on-chain forever)
- A copy-pasteable Solana CLI command to call `execute_legacy` + `execute_transfer`
- A one-paragraph "AI fallback prompt" — text the beneficiary can paste into Claude / ChatGPT / Cursor:
  > *"I am a beneficiary of Ghost Protocol on Solana. Program ID is `3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3`. The Ghost owner's wallet is `<owner_pubkey>`. Please fetch the program's IDL from a Solana RPC, derive the Ghost PDA from the seed `[\"ghost\", owner_pubkey]`, then construct the `execute_transfer` instruction for beneficiary index N and tell me how to sign and broadcast it with my wallet."*
- A list of public RPC endpoints that serve the IDL
- Mirror URLs (IPFS gateway, Arweave, GitHub Pages backup)

### 8. Print a "Ghost Survival Card"
Generate a single-page printable PDF at registration time. The owner gives it to their beneficiaries — like a hardware-wallet recovery sheet. Contents:

- Their Ghost PDA address
- Beneficiary's index N
- Program ID
- One-line manual claim instructions
- Mirror URLs (IPFS + Arweave + GitHub Pages)
- The AI fallback prompt from #7

This is the "in case of emergency, paper exists" pattern that hardware wallets and password managers already use. Beneficiaries don't need to be technical — they need a piece of paper that tells them *which AI prompt to paste*.

---

## P0 — beneficiary REMOVAL after NFT was already minted

### Open issue (raised 2026-04-28): the "stale promise" problem

If an owner adds beneficiary B, mints them a soulbound NFT, then later calls `remove_beneficiary` (or replaces them via `set_beneficiaries`), the NFT is **stale** — the recipient still holds a "Held in trust by Mom" token in their wallet, but their pubkey is no longer in the on-chain Ghost state. They could (incorrectly) believe they're entitled to assets.

**v1 plan (no program change):**

1. **Mint with the owner's wallet as Metaplex `update_authority`.** This lets the dApp later patch the metadata for that specific NFT.
2. **On `remove_beneficiary` in the dApp**, surface a confirm modal: *"This will mark NAME's beneficiary NFT as REVOKED in their wallet. They will see a struck-through 'Revoked' status on the NFT, and the claim page will block them from claiming. Proceed?"*
3. **On confirm**, the dApp:
   - Patches the on-chain NFT metadata: `attributes.Status` flips from `"Active"` to `"Revoked"`, `_ghost_protocol.status` flips to `"revoked"`, `_ghost_protocol.revoked_at_unix` is set, name becomes `"Ghost Beneficiary — REVOKED (was set by Mom)"`, and `image` repoints to a Revoked-stamped variant of the original card.
   - Triggers an Arweave re-pin of the new metadata + revoked image.
4. **Claim page (`/claim?ghost=<PDA>&i=N`) ALWAYS queries on-chain first.** Even if the NFT metadata wasn't updated for any reason, the on-chain Ghost state is the source of truth. If the holder's pubkey is not in the current beneficiaries array, show: *"This Ghost Beneficiary key has been revoked by NAME. The assets are no longer set aside for this wallet. Reach out to NAME for context."*
5. **AI fallback prompt in metadata description already includes this check.** The prompt asks the AI to *"verify (a) my pubkey is still in the beneficiaries array, AND (b) either the check-in deadline has passed OR a recovery action was triggered. If both are true..."* — so even an AI-driven claim attempt will surface a revocation correctly.

**v2 ideas (post-audit, program-level):**

- **`revoke_beneficiary_nft` instruction** that, if the Ghost program is the cNFT update authority, atomically updates the NFT metadata when a beneficiary is removed. Removes the dependency on the owner being online to revoke.
- **Burn the cNFT entirely on removal.** Cleanest UX (the NFT just disappears from the holder's wallet) but technically harder for soulbound cNFTs and arguably worse from a transparency standpoint — better to leave a tombstone than vanish.
- **Front-running protection.** If a beneficiary tries to claim in the same block as a removal, ensure the on-chain state check is the ordering authority (program already enforces this — claim instruction reads beneficiary_count and the array, so a removed beneficiary cannot claim regardless of NFT state).

### Implementation notes
- A "REVOKED" variant of `beneficiary_nft_template.html` should exist alongside the active template — same layout, struck-through name, gray palette, "REVOKED ON {{REVOKED_DATE}}" stamp.
- The dApp removal UI must explain the on-chain finality: even after revocation, the holder's wallet will keep showing the (revoked) NFT until they manually hide or burn it. That's a wallet-UX limitation, not a protocol bug.

---

## P1 — program changes (require v2.0 deploy + migration)

Hold these until post-audit. Each requires a new program version, migration logic, and a re-audit pass.

### 9. Default fallback recipient at registration
A user-set "if everything else fails" pubkey baked into the Ghost account. If `execute_legacy` runs and `beneficiary_count == 0` AND `whole_vault_recipient == None` AND no recovery wallets are set, the entire vault sweeps to the fallback. Solves the stuck-asset problem at the program level instead of relying on UI guardrails.

### 10. Time-locked recovery escalation
Currently recovery wallets can act immediately. Consider a 30-day timelock on guardian actions for ghosts above $X TVL — gives the owner a window to dispute if a recovery wallet is compromised.

### 11. Public discovery instruction
A read-only instruction or off-chain index that lets beneficiaries query "am I a beneficiary on any active Ghost?" without owning the owner's pubkey. Useful for the Survival Card workflow.

---

## How the "website down" beneficiary flow actually works (reference)

Plain answer for future-you: the program is on Solana mainnet permanently. The vault PDA is derived from the owner's pubkey. The instructions are public. **The website is convenience; the protocol is the ground truth.**

For a non-technical beneficiary, the realistic 2026+ flow is:
1. They get a tip-off (the owner died, or a Survival Card was passed on).
2. They open Claude / ChatGPT / Cursor with the AI prompt from #7.
3. The AI fetches the IDL from any Solana RPC (`getIdl(programId)`).
4. The AI derives the Ghost PDA from the owner's pubkey.
5. The AI constructs `execute_legacy` + `execute_transfer`.
6. The beneficiary signs with their wallet (Phantom, Backpack, etc.) and broadcasts.

That whole flow works today **if and only if** the IDL is on-chain (#4) and the beneficiary knows the program ID + owner pubkey (#8). Both are one-time setup tasks.
