# Beneficiary NFT — template + metadata

Two artifacts the dApp consumes at `add_beneficiary` time to mint a soulbound cNFT to the beneficiary's wallet.

## Files

- **`beneficiary_nft_template.html`** — the visual card. Render headlessly (Puppeteer / Playwright / Browserless / `html-to-image`) and export the `.nft` element as a 1024×1024 PNG. Pin to Arweave.
- **`beneficiary_nft_metadata_template.json`** — Metaplex-compatible JSON metadata. Substitute placeholders, pin to Arweave, point the cNFT mint at the resulting URI.
- **`logo.png`** — referenced by the HTML template. Inline as data-URI before headless render OR serve from the same dir.

## Placeholders (replace everywhere)

| Placeholder | Source | Example |
|---|---|---|
| `{{RELATION}}` | User input at `add_beneficiary` (display name field) | `Mom`, `Dad`, `Sarah`, `Grandpa` |
| `{{OWNER_PUBKEY}}` | Connected wallet address (the Ghost owner) | `8x...K1` |
| `{{BENEFICIARY_PUBKEY}}` | The beneficiary's wallet address (mint recipient) | `9z...M2` |
| `{{GHOST_PDA}}` | Derived from seed `["ghost", owner_pubkey]` | `5q...N3` |
| `{{BENEFICIARY_INDEX}}` | Their N-th index in the Ghost's beneficiary array | `2` |
| `{{PROGRAM_ID}}` | Constant for v1.9 | `3Es13GXc4qwttE6uSgAAfi1zvBD3qzLkZpY21KfT3sZ3` |
| `{{ISSUED_DATE}}` | Today, ISO 8601 | `2026-04-28` |
| `{{ISSUED_UNIX}}` | Current unix timestamp | `1779580800` |
| `{{IMAGE_URL}}` | The Arweave URL of the rendered PNG (set after image upload) | `https://arweave.net/abc...` |
| `{{CLAIM_URL}}` | `https://ghost-protocol.rip/claim?ghost={{GHOST_PDA}}&i={{BENEFICIARY_INDEX}}` | — |
| `{{IPFS_MIRROR_URL}}` | IPFS gateway URL of the dApp build | `https://gateway.ipfs.io/ipfs/Qm...` |
| `{{ARWEAVE_MIRROR_URL}}` | Arweave gateway URL of the dApp build | `https://arweave.net/...` |
| `{{GITHUB_PAGES_URL}}` | Open-source frontend mirror | `https://onchainlegacy.github.io/ghost-protocol-dapp/` |

## Mint flow (client-side)

1. User completes `add_beneficiary` instruction.
2. dApp computes all placeholder values from the tx and form input.
3. dApp clones `beneficiary_nft_template.html`, substitutes `{{RELATION}}`, inlines `logo.png` as data-URI.
4. dApp renders to PNG (`html-to-image` library, or server-side Puppeteer endpoint).
5. dApp uploads PNG to Arweave → gets `IMAGE_URL`.
6. dApp clones `beneficiary_nft_metadata_template.json`, substitutes ALL placeholders.
7. dApp uploads JSON to Arweave → gets `metadataUri`.
8. dApp mints a Metaplex compressed NFT (cNFT) with `metadataUri`, recipient = beneficiary's wallet, soulbound (transferable=false in tree config or use the bubblegum freeze).
9. Owner pays SOL fees (~$0.001 for cNFT mint).

## Why image-only animations were stripped

NFT image fields render as static PNG/JPG in every wallet (Phantom, Backpack, Solflare). Any `@keyframes` or CSS animation in the source HTML is invisible to recipients. The card uses static glow shadows instead of pulse animations.

## Copy is "claim ticket," not "you got it now"

Important: the NFT is a **promise of future eligibility**, not an instant payout. The recipient cannot claim assets just because they hold the NFT. They can claim only if (a) the owner stops checking in (their dead-man's-switch timer expires), or (b) the owner explicitly names them as a recovery wallet and triggers payout.

Reflected in copy:
- Pulse pill: **"Held in trust"** (not "You inherited this")
- Pre-line: **"Set aside for you by"** (not "A gift from")
- Body: *"Keep this token safe. It's the **key** to assets {{RELATION}} set aside for you. You can claim them only if {{RELATION}} stops checking in, or names you as a recovery wallet."*
- Button: **"How it works →"** (not "Open to claim →")
- Description in metadata begins: *"THIS IS NOT AN INSTANT PAYOUT."*

## Revocation flow (when owner removes a beneficiary after NFT was minted)

When the owner calls `remove_beneficiary` or `set_beneficiaries` and a previously-minted NFT becomes stale:

1. dApp prompts for confirmation: *"This will mark {{RELATION}}'s NFT as REVOKED in their wallet. Proceed?"*
2. dApp patches the on-chain NFT metadata (owner is the Metaplex `update_authority`):
   - `name` → `"Ghost Beneficiary — REVOKED (was set by {{RELATION}})"`
   - `attributes.Status` → `"Revoked"`
   - `_ghost_protocol.status` → `"revoked"`
   - `_ghost_protocol.revoked_at_unix` → current unix timestamp
   - `image` → repointed to a struck-through "REVOKED" variant of the card (same template, gray palette, REVOKED stamp)
3. The claim page **always** verifies on-chain state first. If the holder's pubkey is not in the current beneficiaries array, the page blocks claiming and shows: *"This Ghost Beneficiary key has been revoked by {{RELATION}}."*
4. The on-chain program enforces this regardless of NFT state — `execute_transfer` reads the live beneficiaries array, so a revoked holder cannot claim even if their NFT metadata was somehow not updated.

See `TODO.md` for the v2 program-level ideas (atomic revocation via program-as-update-authority, optional cNFT burn on removal).

## What Phantom shows when the beneficiary opens the NFT

- **Image** — the rendered card (this template's output)
- **Name** — `Ghost Beneficiary — set by {{RELATION}}`
- **Description** — full text from JSON, including claim URL + AI fallback prompt
- **Attributes grid** — auto-rendered from `attributes` array
- **"View on website" button** — auto-rendered from `external_url` → opens claim page

The "OPEN TO CLAIM →" pill on the image is a *visual cue*. The actual click target Phantom renders is `external_url` shown as a button below the description.
