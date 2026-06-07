# Development Notes for AI Agents

This document provides context for AI agents working on the Tarot Practice plugin.

## Project Context

**Purpose**: Obsidian plugin for tarot (and other divination) practice with intention-seeded randomness  
**Current Version**: 1.9.0  
**Tech Stack**: TypeScript, Obsidian API, rng-with-intention library, Handlebars, Chart.js, JSZip

## Key Design Principles

1. **Intention-Driven Randomness**: Uses user intention + timestamp to seed RNG
2. **Traditional Deck Preparation**: Configurable shuffles (1-7) and optional cutting
3. **Mobile Compatibility**: All async RNG operations for cross-platform crypto support
4. **Template Flexibility**: Handlebars templates with 20+ variables, file-based, per-spread
5. **Backward Compatibility**: Keep deprecated fields for smooth migrations
6. **Multi-Deck / Multi-System**: Supports tarot, runes, Lenormand, I Ching, playing cards, and any custom JSON deck

## Architecture Overview

### Data Flow

```
User Intention → SpreadDrawModal (setup phase)
    ↓ digital path                    ↓ physical path
    Deck Preparation (shuffle/cut)    Per-position card selectors
    RNG Draw                          User selections → cardIndex resolution
    ↓                                 ↓
    SpreadFormatter (Handlebars) → Note Insertion
    DrawHistory (persisted to data.json)
```

### Directory Structure

```
src/
├── main.ts                          # Plugin lifecycle, command registration, ribbon
├── settings.ts                      # Settings interface and DEFAULT_SETTINGS
│
├── core/                            # Domain logic
│   ├── CardDatabase.ts              # RWS deck: RWS_DECK constant, getCard(), getDeck()
│   ├── Deck.ts                      # Deck interfaces and DeckType
│   ├── DeckLoader.ts                # Loads decks from plugin directory (JSON + ZIP)
│   ├── DeckPreparation.ts           # Fisher-Yates shuffle + intention-based cut
│   ├── DeckRegistry.ts              # Manages built-in and custom decks
│   ├── DeckValidator.ts             # Validates deck structure before install
│   ├── DrawHistory.ts               # Draw history CRUD, statistics queries, export
│   ├── SpreadLoader.ts              # Spread import/export (JSON and ZIP)
│   ├── SpreadValidator.ts           # Validates spread structure before install
│   └── spreads.ts                   # Spread interfaces and types
│
├── modals/                          # UI dialogs
│   ├── ConfirmModal.ts              # Reusable confirmation dialog
│   ├── DeckDetailsModal.ts          # View deck info, card list, restore images
│   ├── DeckInstallModal.ts          # Install wizard (JSON or ZIP)
│   ├── DeckRemoveConfirmModal.ts    # Safe deck removal with confirmation
│   ├── DrawHistoryModal.ts          # Browse history (Recent tab) + Stats tab with charts
│   ├── SpreadCreateModal.ts         # Create custom spreads
│   ├── SpreadDrawModal.ts           # Two-phase modal: setup → card selectors (physical) or direct callback (digital)
│   ├── SpreadEditModal.ts           # Edit existing custom spreads
│   ├── SpreadExportFormatModal.ts   # Choose JSON or ZIP export format
│   ├── SpreadViewModal.ts           # Preview spread definition and template
│   ├── TemplateEditModal.ts         # Select custom template file
│   ├── TemplateMigrationModal.ts    # One-time migration from inline to file templates
│   └── TemplateViewModal.ts         # Preview template content
│
├── spreads/
│   ├── BuiltInSpreads.ts            # 5 built-in spread definitions
│   └── SpreadResolver.ts            # Load spreads and templates; resolves built-in vs custom
│
├── templates/
│   ├── BuiltInSpreadTemplates.ts    # Default Handlebars templates for built-in spreads
│   ├── BuiltInTemplates.ts          # Default templates for daily/inline/multiple draws
│   ├── SpreadFormatter.ts           # Renders draw results via Handlebars
│   ├── TemplateExporter.ts          # Copies example templates to vault
│   ├── TemplateFolderDetector.ts    # Auto-detects Templater/Core Templates folders
│   ├── TemplateMigrator.ts          # Migrates v1.2 inline templates to files
│   ├── TemplatePaths.ts             # Standardized folder structure helpers
│   └── TemplateResolver.ts          # Loads templates from files or falls back to built-ins
│
├── types/
│   ├── deck.ts                      # DeckDefinition, CardDefinition types
│   ├── history.ts                   # DrawHistoryEntry, DrawStatistics types
│   └── rng-with-intention.d.ts      # Type declarations for RNG library
│
└── ui/
│   ├── FileSuggest.ts               # Autocomplete component for vault file paths
│   └── TarotPracticeSettingTab.ts   # Full settings UI
│
└── utils/
    ├── cardPicker.ts                # Card selection helpers for physical draw mode
    └── charts.ts                    # Chart.js helpers: tarot color palette, chart creation
```

### Important Patterns

**Async RNG** — always await:
```typescript
import RngWithIntention from 'rng-with-intention';
const rngi = new RngWithIntention(seed);
const index = await rngi.draw(maxValue);
const indices = await rngi.drawMultiple(count, maxValue);
```

**Template Resolution**:
```typescript
const resolver = new TemplateResolver(this.app, this.settings);
const template = await resolver.getDailyTemplate();  // Falls back to built-in
```

**Settings with Fallbacks**:
```typescript
this.settings.shuffleCount ?? 3  // Use ?? for optional fields
```

**File Operations** — always use TFile abstraction:
```typescript
const file = this.app.vault.getAbstractFileByPath(path);
if (file instanceof TFile) {
    const content = await this.app.vault.read(file);
    await this.app.vault.modify(file, newContent);
}
```

**User-Facing Errors**:
```typescript
try {
    await somethingRisky();
} catch (error) {
    new Notice('Failed to do the thing: ' + error.message);
    console.error('Detailed error:', error);
}
```

**Handlebars Escaping** — use triple braces for user input:
```handlebars
{{{intention}}}   ← triple braces: prevents HTML entity encoding of quotes/apostrophes
{{name}}          ← double braces: fine for controlled card data
```

**Two-Phase Modal (SpreadDrawModal)** — setup then card selection:
```typescript
// Phase 1: renderSetupPhase() — collects spread/deck/intention/physical toggle
// Phase 2: renderCardSelectionPhase(deck) — per-position card selectors (physical only)
// On submit, physicalSelections are passed to the callback; main.ts routes to
// executeDigitalSpread() or executePhysicalSpread() accordingly.
// Physical draws set source: 'physical' and shuffleCount: 0 / wasCut: false.
```

**Card picker utility** (`src/utils/cardPicker.ts`) — use for any future card selection UI:
```typescript
import { isStructuredDeck, getSuitLabels, getCardsForSuit, findCard } from 'utils/cardPicker';
// isStructuredDeck: true if any card has non-null suit (tarot) vs flat (oracle/runes)
// getSuitLabels: ['Major Arcana', 'Wands', 'Cups', ...] — Major always first
// getCardsForSuit: handles MAJOR_ARCANA_SUIT_LABEL sentinel
// findCard: resolves (suitLabel, valueLabel) → CardDefinition
```


**Statistics Aggregation** — use native JS Map-based counting, NOT AlaSQL:
```typescript
// AlaSQL is unreliable for complex queries (COUNT(*) parsing fails)
// Use Map-based aggregation for all statistics
const counts = new Map<string, number>();
for (const entry of history) {
    counts.set(entry.deckId, (counts.get(entry.deckId) ?? 0) + 1);
}
```

## Common Development Tasks

### Adding a New Template Variable

1. Add to `SpreadDrawResult` interface (in `core/spreads.ts` or `types/history.ts`)
2. Populate in draw method in `SpreadDrawModal.ts`
3. Add to template data preparation in `SpreadFormatter.ts`
4. Update built-in templates in `BuiltInTemplates.ts` or `BuiltInSpreadTemplates.ts`
5. Document in `docs/TEMPLATE-VARIABLES.md` and update examples in `docs/TEMPLATE-EXAMPLES.md`

### Modifying Settings

1. Update interface in `settings.ts`
2. Add default in `DEFAULT_SETTINGS`
3. Add UI in `ui/TarotPracticeSettingTab.ts`
4. Use in relevant code with null-safety (`??` operator)
5. Consider migration if changing existing fields

### Adding a New Modal

Follow the standard pattern:
```typescript
export class MyModal extends Modal {
    constructor(app: App, private callback: (result: MyResult) => void) {
        super(app);
    }
    onOpen() {
        // Build UI with this.contentEl
    }
    onClose() {
        this.contentEl.empty();
    }
}
```

### Testing Checklist

- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Deploy works (`npm run deploy`)
- [ ] Plugin reloads without errors
- [ ] Desktop functionality works
- [ ] Mobile functionality works (if applicable)
- [ ] Settings save/load correctly
- [ ] All template variables render
- [ ] Migration works for existing users (if settings changed)

## Known Gotchas

1. **Mobile Crypto**: All RNG must be async — mobile uses a different crypto API
2. **Template Files**: Always check file exists and provide fallback to built-in
3. **Settings Migration**: Compare against OLD defaults, not new built-ins
4. **AlaSQL**: Unreliable for complex SQL (avoid for new statistics work; use Map-based aggregation)
5. **Chart.js font weight**: Must be a number (`400`, not `"normal"`); arrays require explicit typing
6. **Deprecated Fields**: Keep for 2-3 versions, use optional (`?`) type
7. **ZIP extraction**: Uses `requestUrl()` from Obsidian API, not native `fetch()` (mobile compatibility)
8. **Physical draw `source` field**: defaults to `'digital'` via `?? 'digital'` in `DrawHistory.addDraw` — existing history entries without the field are safely backward-compatible

## Build & Release Process

**Quick Commands**:
```bash
npm run build      # Production build
npm run deploy     # Build + copy to Obsidian vault
npm run dev        # Watch mode
npm test           # Run test suite
npm run test:coverage  # With coverage report
```

**Release Checklist**:
1. Test on desktop (and mobile if applicable)
2. Update `CHANGELOG.md`
3. Bump versions in `manifest.json`, `package.json`, `versions.json`
4. Commit: `git commit -m "Bump version to X.Y.Z"`
5. Tag (no `v` prefix): `git tag X.Y.Z`
6. Push: `git push origin main && git push origin X.Y.Z`
7. CI automatically builds and creates GitHub release with artifacts

See [Development Workflow](DEVELOPMENT-WORKFLOW.md) for full branching and release procedures.

## External Dependencies

- **rng-with-intention**: `^0.3.2` — intention-seeded RNG, cross-platform crypto (our own library)
- **chart.js**: `^4.4.7` — statistics visualization in DrawHistoryModal
- **jszip**: ZIP deck import/export and spread packaging
- **obsidian**: Obsidian API types
- **moment**: Available via Obsidian API for date formatting

## Useful Resources

- [Obsidian API Docs](https://docs.obsidian.md/)
- [rng-with-intention](https://github.com/w8s/rng-with-intention)
- [obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks) — public domain deck repository
- [Template Variables](TEMPLATE-VARIABLES.md)
- [Template Examples](TEMPLATE-EXAMPLES.md)
- [Settings Reference](SETTINGS.md)
- [Main README](../README.md)
