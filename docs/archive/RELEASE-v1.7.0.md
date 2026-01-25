# 1.7.0: Multi-Deck Support + Image Paths

*Use ANY divination deck in Obsidian - not just tarot! Plus add images to your readings.*

This is a **major feature release** that transforms Tarot Practice into a universal divination tool. Load custom decks from JSON files, manage them through a comprehensive UI, and display card images in your readings. Includes five public domain example decks to get you started!

---

## 🎴 What's New

### Multi-Deck Support
**Use any divination system** - not limited to 78-card tarot decks!

- **Custom deck installation** - Load decks from JSON files via Settings
- **Deck validation** - Comprehensive error checking with helpful messages
- **Deck registry** - Manages built-in and custom decks
- **Per-spread persistence** - Remembers your deck choice for each spread type
- **Deck selection dropdown** - Choose deck when drawing spreads
- **Flexible card counts** - Works with 3 to 100+ cards

### Deck Management UI
**Complete deck management** in Settings → Deck Management:

- View all installed decks with card counts and reversal support
- Install decks from JSON files (file picker)
- View detailed deck information (metadata, complete card list)
- Remove custom decks (built-in decks are protected)
- Export example deck as template for creating your own
- Set default deck for all spreads
- Toggle "Remember deck per spread" setting

### Five Public Domain Example Decks
**Ready to use** in `/example-decks/`:

1. **Elder Futhark Runes** (24 runes) - Norse divination, 2nd-8th century CE
2. **Petit Lenormand** (36 cards) - French cartomancy, early 1800s
3. **Playing Cards** (52 cards) - Standard deck divination, medieval Europe
4. **I Ching** (64 hexagrams) - Ancient Chinese oracle, 3000+ years old
5. **Example Oracle** (3 cards) - Simple template (via Export button)

All decks are **public domain** and freely usable!

### Image Path Support
**Display card and deck images** in your readings:

- `{{card.image}}` - Auto-formatted Obsidian wikilink `![[path]]`
- `{{card.imageUrl}}` - Raw image path for custom formatting
- `{{deck_back_image}}` - Deck back as wikilink
- `{{deck_back_image_url}}` - Raw deck back path
- Works with relative paths (deck directory) or vault paths
- Empty string when images not defined (template-safe)

### New Template Variables

**Deck metadata:**
```handlebars
{{deck_name}}              // "Elder Futhark Runes"
{{deck_id}}                // "elder-futhark"
{{deck_type}}              // "runes"
{{deck_card_count}}        // 24
{{deck_supports_reversals}} // false
```

**Image variables:**
```handlebars
{{card.image}}             // ![[cards/fehu.png]]
{{card.imageUrl}}          // cards/fehu.png
{{deck_back_image}}        // ![[back.png]]
{{deck_back_image_url}}    // back.png
```

---

## 📚 Creating Custom Decks

### Quick Start
1. Export example deck (Settings → Deck Management → "Export example deck")
2. Edit JSON with your cards
3. Optionally add image paths (`imageUrl` for cards, `backImageUrl` for deck)
4. Install via Settings → Deck Management → "Add deck"

### Example Deck JSON
```json
{
  "id": "my-oracle-deck",
  "name": "Sacred Rebels Oracle",
  "description": "44-card oracle deck for creative rebels",
  "cards": [
    {
      "index": 0,
      "name": "New Beginnings",
      "category": "Oracle",
      "imageUrl": "cards/00-new-beginnings.png"
    },
    {
      "index": 1,
      "name": "Sacred Rebel",
      "category": "Oracle",
      "imageUrl": "cards/01-sacred-rebel.png"
    }
  ],
  "cardCount": 44,
  "supportsReversals": false,
  "isBuiltIn": false,
  "backImageUrl": "back.png",
  "metadata": {
    "author": "Your Name",
    "year": 2025,
    "tradition": "oracle"
  }
}
```

### Image Support
Images are **optional** but add visual richness to readings:

- **Card images:** Add `"imageUrl": "cards/card-name.png"` to each card
- **Deck back:** Add `"backImageUrl": "back.png"` to deck definition
- **Paths:** Relative to deck directory or vault paths
- **Formats:** Any image format Obsidian supports (PNG, JPG, WebP, etc.)

See `/example-decks/README.md` for complete documentation.

---

## 🏗️ New Core Components

**7 new components** for deck management:

1. **DeckValidator** - Validates deck structure, card indices, duplicates
2. **DeckLoader** - Loads decks from plugin directory
3. **DeckRegistry** - Manages all available decks
4. **DeckInstallModal** - Install wizard for new decks
5. **DeckDetailsModal** - View deck information
6. **DeckRemoveConfirmModal** - Safe deck removal with warnings
7. **SpreadFormatter** - Enhanced with image path support

---

## ✅ Backward Compatibility

**100% backward compatible** - zero breaking changes:

- RWS deck remains default (works exactly as before)
- All existing spreads work unchanged
- All existing templates work unchanged
- No settings changes required
- No user action required

Existing users will see:
- Same default behavior (RWS deck)
- New "Deck Management" section in settings (optional)
- New deck selector in spread draw modal (defaults to RWS)

---

## 🔧 Technical Details

### Files Changed
- **29 files changed** (+1,629 insertions, -178 deletions)
- **6 files for image support** (+135, -16)
- **Zero ESLint errors** across all code
- **TypeScript strict mode** compliance
- **Cross-platform compatible** (desktop + mobile)

### Code Quality
- Comprehensive deck validation with helpful error messages
- Duplicate card name warnings (with ignore option)
- Backward compatible with all existing functionality
- Example decks included in repository

### Validation Features
- Card count validation (matches `cardCount` field)
- Index validation (0-based, sequential, no gaps)
- Duplicate index detection
- Duplicate name detection (warns but allows)
- JSON parsing error handling

---

## 📦 Installation

### Community Plugins (Pending Review)
*Currently in review queue - [PR #9473](https://github.com/obsidianmd/obsidian-releases/pull/9473)*

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

- [Complete Deck Creation Guide](https://github.com/w8s/obsidian-tarot-practice/blob/master/example-decks/README.md) - JSON format, image support, examples
- [Template Variables Reference](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/TEMPLATE-VARIABLES.md) - All 30+ variables
- [v1.7.0 Planning Doc](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/v1.7.0-PLANNING.md) - Implementation details
- [Usage Guide](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/USAGE.md) - Workflows
- [Settings Reference](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/SETTINGS.md) - All options
- [Changelog](https://github.com/w8s/obsidian-tarot-practice/blob/master/CHANGELOG.md) - Full version history

---

## 🎯 Use Cases

### Tarot Practitioners
- Switch between Marseille, RWS, and Thoth decks
- Use themed decks for different purposes
- Compare interpretations across traditions

### Oracle Card Users
- Sacred Rebels Oracle
- Wild Unknown Oracle
- Moonology Oracle
- Any custom oracle deck

### Other Divination Systems
- **Runes** - Elder Futhark, Anglo-Saxon, Younger Futhark
- **Lenormand** - Petit (36) or Grand (52 + 4 jokers)
- **Playing Cards** - Cartomancy with standard deck
- **I Ching** - 64 hexagrams
- **Ogham** - Celtic tree oracle
- **Custom systems** - Create your own!

---

## 🔮 What's Next (v1.8.0+)

**Planned enhancements:**

- **ZIP deck installation** - Import complete decks with images in one file
- **Deck marketplace** - Browse and install community-created decks
- **Card interpretations** - Built-in meanings database
- **Reading history** - Track and analyze your draws over time
- **Advanced shuffle styles** - Overhand, riffle, Hindu shuffles

---

## 📊 Stats

- **Files changed:** 29 (+1,629, -178)
- **Image support:** 6 files (+135, -16)
- **New components:** 7 core classes
- **Example decks:** 5 public domain systems
- **Template variables:** 10 new (30+ total)
- **Zero breaking changes**
- **100% backward compatible**

---

## 🎉 Highlights

### From the Planning Doc
**All success criteria achieved:**
- ✅ Users can load custom decks from JSON files
- ✅ Deck selector UI shows all available decks
- ✅ Users can set default deck in settings
- ✅ Users can choose deck per spread draw
- ✅ Deck validation provides clear error messages
- ✅ Example deck files can be exported
- ✅ All existing functionality works unchanged
- ✅ Zero breaking changes
- ✅ Documentation includes deck creation guide

**Bonus achievements:**
- ✅ Five public domain example decks included
- ✅ Image path support (planned for v2.0.0!)
- ✅ Auto-formatted Obsidian wikilinks
- ✅ Comprehensive documentation

---

## 💡 Example Template with Images

```handlebars
## {{spread_name}} - {{date}}

**Deck:** {{deck_name}} ({{deck_card_count}} cards)
**Intention:** {{intention}}

{{#each cards}}
### {{position.label}}
**{{name}}** {{orientation}}

{{#if image}}
{{image}}
{{/if}}

{{#if position.description}}
_{{position.description}}_
{{/if}}

{{/each}}

{{#if deck_back_image}}
---
**Deck Back:**
{{deck_back_image}}
{{/if}}

*Shuffled {{shuffle_count}} times{{#if was_cut}}, cut at position {{cut_position}}{{/if}}*
```

---

**Multi-deck support + image paths = visual divination! 🎴✨🖼️**

---

**Full Changelog:** https://github.com/w8s/obsidian-tarot-practice/compare/1.6.1...1.7.0
