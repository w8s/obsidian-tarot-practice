# Roadmap

## v1.9.0 — Physical Draw Mode (Planned)

Allow users to manually enter cards drawn from a physical deck, using the existing spread system for layout, templates, and history tracking.

### Problem
Users who prefer physical card handling currently have no way to use the plugin's spread layouts, Handlebars templates, or draw history for readings done with real cards.

### User flow
1. Open spread draw modal (existing entry point)
2. Toggle **"Physical draw"** — swaps RNG card selection for manual entry
3. For each spread position, select the card drawn:
   - **Suit dropdown** — derived from the selected deck's card data
   - **Value dropdown** — populated based on suit selection
   - **Orientation** — upright/reversed (if deck supports reversals)
4. Submit → identical output to a digital draw (template, history, note insertion)

### Card entry UI

**Structured decks (tarot)** — two dropdowns per position:
- Suit options built by scanning `card.suit` across the deck:
  - "Major Arcana" (where `suit === null`, `category === "Major"`)
  - Minor suits ("Wands", "Cups", "Swords", "Pentacles", etc.)
- Value dropdown populated after suit selection:
  - Major Arcana → list all matching cards by name
  - Minor suit → list ranks ("Ace", "Two"... "King")
  - If `rank === null` on a card with a suit → fall back to card name (edge case for custom decks)
- Value dropdown disabled/grayed out until suit is selected

**Flat decks (oracle, runes)** — single dropdown of all card names; suit dropdown hidden

**Detection:** a deck is "structured" if any card has a non-null `suit`. Otherwise treat as flat. This is DRY — same deck objects, no new metadata field needed.

### Implementation notes
- Add `isPhysicalDraw: boolean` toggle to `SpreadDrawModal`
- Physical path resolves `cardIndex` from user selection; everything downstream (SpreadFormatter, DrawHistory, note insertion) is unchanged
- Tag physical draws in history (`source: 'physical' | 'digital'`) for future filtering
- Suit/value extraction logic lives in a shared utility (reusable for any future card-picker UI)
- Follow DRY: reuse existing deck registry, card definitions, spread execution path

### Out of scope for 1.9.0
- Searching/filtering cards by name (type-ahead)
- Linking cards to vault notes
- Any changes to digital draw behavior

---

## v1.10.0 — Shuffle Styles (Planned)

Different shuffling algorithms or flavors (overhand, riffle, Hindu) affecting how the deck is prepared for digital draws.

---

## Future

- Date range statistics — draws per day view in history modal
- Streak tracking — consecutive days of practice
- Card notes integration — surface vault notes for drawn cards inline
- `getSettingDefinitions()` migration — adopt new Obsidian 1.13.0 settings API once it ships publicly

---

## Recently Completed

See [CHANGELOG.md](../CHANGELOG.md) for full version history.

**v1.8.8** — Obsidian Community Plugins submission prep
- Plugin guidelines compliance (setHeading, CSS classes, activeDocument)
- Removed AlaSQL dependency
- Security fixes, minAppVersion correction, artifact attestations

**v1.8.7**
- Visual statistics charts (horizontal bar + pie) with Chart.js
- Replaced AlaSQL with native JS aggregation for reliable statistics

**v1.8.2**
- Draw history tracking with statistics and export (JSON/CSV)

**v1.8.1**
- Spread import/export as JSON or ZIP with bundled templates

**v1.8.0**
- ZIP deck installation with card images
- Vault-based image storage with wikilink support
- sourceUrl for deck image restoration
