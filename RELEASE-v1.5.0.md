# 1.5.0: Deck Metadata & HTML Escaping Fixes

*Bringing necessary imprecision to digital mystical arts since 2025*

This release adds deck metadata support (foundation for Oracle decks and other divination systems) and fixes a pesky HTML escaping bug that affected intentions with apostrophes.

---

## 🎴 What's New

### Deck Metadata System
The plugin now tracks which deck is being used for every draw. While we currently only support Rider-Waite-Smith, this lays the groundwork for:
- Oracle decks (Sacred Rebels, Wild Unknown, etc.)
- Lenormand cards
- Playing cards
- Custom tarot decks with different art

**New template variables:**
- `{{deck_name}}` - e.g., "Rider-Waite-Smith"
- `{{deck_type}}` - e.g., "tarot", "oracle", "lenormand"

```handlebars
## {{deck_name}} - {{datetime}}
**Type:** {{deck_type}}
**Intention:** {{{intention}}}
**Card:** {{name}} {{orientation}}
```

### Fixed HTML Escaping Bug
Intentions with apostrophes and quotes now render correctly in your notes.

**Before:** "What's today's message?" → "What&#x27;s today&#x27;s message?"  
**After:** "What's today's message?" → "What's today's message?"

The fix uses Handlebars triple braces `{{{intention}}}` to prevent HTML entity escaping.

---

## ⚠️ Breaking Changes

### Template Variable Renamed
`{{card}}` has been renamed to `{{name}}` for consistency across all draw types.

**Migration:** If you have custom templates, update them:
```diff
- **Card:** {{card}} {{orientation}}
+ **Card:** {{name}} {{orientation}}
```

All built-in templates have been updated automatically.

---

## 📝 Improvements

### Better Template Documentation
- Added HTML escaping section explaining when to use `{{}}` vs `{{{}}}`
- Updated all examples to use correct variable names
- Fixed spread template documentation (uses `{{positions}}` not `{{cards}}`)
- Clarified that `{{cards}}` is an array for loops, not a pre-formatted string

### Template Best Practices
```handlebars
<!-- User input: Use triple braces to preserve quotes/apostrophes -->
**Intention:** {{{intention}}}

<!-- Controlled data: Use double braces -->
**Card:** {{name}} {{orientation}}
**Deck:** {{deck_name}} ({{deck_type}})
```

---

## 🔧 Technical Details

### What Changed Internally
- All draw results (`DrawResult`, `MultipleDrawResult`, `SpreadDrawResult`) now include `deck: Deck` field
- New `Deck.ts` file defines deck metadata structure
- `SpreadFormatter` includes deck info in template data
- All built-in templates use triple braces for user input

### New Deck Interface
```typescript
interface Deck {
  id: string;              // "rws", "sacred-rebels-oracle"
  name: string;            // "Rider-Waite-Smith"
  type: DeckType;          // 'tarot' | 'oracle' | 'lenormand' | ...
  cardCount: number;       // 78
  supportsReversals: boolean;
  isBuiltIn: boolean;
}
```

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

- [Template Variables Reference](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/TEMPLATE-VARIABLES.md) - Complete variable list with examples
- [Usage Guide](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/USAGE.md) - Detailed instructions
- [Settings Reference](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/SETTINGS.md) - All configuration options
- [Changelog](https://github.com/w8s/obsidian-tarot-practice/blob/master/CHANGELOG.md) - Full version history

---

## 🔮 What's Next

This release is primarily infrastructure work. Future releases will build on this foundation:

- **Custom Deck Loading** - Load your own Oracle decks from JSON
- **Deck Selector** - Choose which deck to use per draw
- **Multi-Deck Management** - Track different decks separately
- **Oracle Deck Templates** - Pre-built templates for popular Oracle decks

---

## 🙏 Acknowledgments

Thanks to everyone testing and providing feedback! Special thanks to anyone who reported the HTML escaping issue.

---

## 📊 Stats

- 17 files changed
- 442 additions, 227 deletions
- 2 new files created
- Full backward compatibility (except `{{card}}` → `{{name}}`)

---

**Full Changelog:** https://github.com/w8s/obsidian-tarot-practice/compare/1.4.0...1.5.0
