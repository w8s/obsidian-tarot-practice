# 1.6.1: Deck Definition Infrastructure

*Setting the foundation for multi-deck support*

This is an **internal infrastructure release** with no user-facing changes. All existing functionality works exactly as before. This release prepares the codebase for v1.7.0's multi-deck support feature.

---

## 🎴 What's New

### DeckDefinition Interface
Added a complete type definition for decks that will enable future multi-deck support:

```typescript
interface DeckDefinition {
  id: string;              // "rider-waite-smith"
  name: string;            // "Rider-Waite-Smith"
  description?: string;    // Deck description
  cards: CardDefinition[]; // All cards with metadata
  cardCount: number;       // 78
  supportsReversals: boolean;
  isBuiltIn: boolean;
  metadata?: {
    author?: string;       // "Pamela Colman Smith"
    year?: number;         // 1909
    publisher?: string;    // "Rider & Company"
    tradition?: string;    // "tarot"
  }
}
```

### Structured Card Metadata
All 78 Rider-Waite-Smith cards now use structured `CardDefinition` objects instead of simple strings:

```typescript
// Major Arcana example
{
  index: 0,
  name: "The Fool",
  category: "Major",
  suit: null,
  rank: null,
  value: 0
}

// Minor Arcana example
{
  index: 22,
  name: "Ace of Wands",
  category: "Minor",
  suit: "Wands",
  rank: "Ace",
  value: 1
}
```

### New Utility Functions
```typescript
getCard(index)  // Returns full CardDefinition with metadata
getDeck()       // Returns complete DeckDefinition
```

---

## ✅ Backward Compatibility

**100% backward compatible** - all existing code works without modification:
- `RWS_CARDS` array still exported (now points to `RWS_DECK.cards`)
- `getCardName(index)` function unchanged
- All spreads work exactly as before
- All templates work exactly as before
- No settings changes
- No user action required

---

## 🔧 Technical Details

### What Changed Internally

**Files Modified:**
1. `src/types/deck.ts` - Added DeckDefinition interface
2. `src/core/CardDatabase.ts` - Converted from string array to structured deck
   - Helper functions: `createMajorCard()`, `createMinorCard()`, `createSuit()`
   - Major Arcana: 22 cards with `category="Major"`, `value=0-21`
   - Minor Arcana: 56 cards with `category="Minor"`, suit, rank, value
   - Programmatic suit generation for consistency

**Code Quality:**
- Zero ESLint errors
- Zero breaking changes
- Zero TypeScript errors (ignoring pre-existing Handlebars type conflicts)

---

## 📦 Installation

### Community Plugins (Pending Review)
1. Settings → Community Plugins → Browse
2. Search "Tarot Practice"
3. Install & Enable

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from this release
2. Copy to `YourVault/.obsidian/plugins/tarot-practice/`
3. Reload Obsidian
4. Enable in Settings → Community Plugins

---

## 📚 Documentation

- [v1.6.1 Planning Doc](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/v1.6.1-PLANNING.md) - Implementation details
- [Template Variables Reference](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/TEMPLATE-VARIABLES.md)
- [Usage Guide](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/USAGE.md)
- [Settings Reference](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/SETTINGS.md)
- [Changelog](https://github.com/w8s/obsidian-tarot-practice/blob/master/CHANGELOG.md)

---

## 🔮 What's Next (v1.7.0)

This infrastructure enables multi-deck support coming in v1.7.0:

- **Custom Deck Loading** - Load Oracle, Lenormand, or custom decks from JSON files
- **Deck Selector UI** - Choose which deck to use in settings
- **Per-Spread Deck Selection** - Use different decks for different spreads
- **Deck Management** - Add, edit, and remove custom decks

**Example v1.7.0 deck JSON:**
```json
{
  "id": "my-oracle-deck",
  "name": "Sacred Rebels Oracle",
  "cards": [
    {
      "index": 0,
      "name": "New Beginnings",
      "category": "Oracle",
      "suit": null,
      "rank": null,
      "value": null
    }
  ],
  "cardCount": 44,
  "supportsReversals": false
}
```

---

## 📊 Stats

- 8 files changed
- 489 additions, 91 deletions
- 2 new files created (`src/types/deck.ts`, `docs/v1.6.1-PLANNING.md`)
- 100% backward compatibility maintained

---

**Full Changelog:** https://github.com/w8s/obsidian-tarot-practice/compare/1.6.0...1.6.1
