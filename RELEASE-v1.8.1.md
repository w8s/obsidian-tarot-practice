# Tarot Practice v1.8.1 - Spread Sharing

Share your custom spreads with the community! This release adds import/export functionality for spreads, making it easy to distribute and install custom spread layouts.

## ✨ New Features

### Spread Import/Export

**Import spreads from the community:**
- Install spreads from JSON or ZIP files
- ZIP files include custom templates
- Settings UI matches deck management pattern
- Three action buttons: Create | Import | Export Example

**Export your custom spreads:**
- Export as JSON (definition only) or ZIP (with template)
- Export button on each custom spread (download icon)
- Share via GitHub, Discord, forums
- Export example spread to learn format

**Format options:**
- **JSON only** - Lightweight spread definition
- **ZIP with template** - Complete package with custom formatting

### Validation System

**SpreadValidator** ensures quality imports:
- Required fields: id, name, positions
- Position validation: labels required
- ID format checking (lowercase, hyphens only)
- Clear error messages for troubleshooting

**SpreadLoader** handles all I/O:
- `installFromJSON()` - Import spread definition
- `installFromZIP()` - Import spread with template
- `exportSpread()` - Export as JSON or ZIP
- Template extraction to vault folders
- Automatic path resolution

## 🎯 What This Enables

### For Spread Creators
- Share your spread designs with the community
- Bundle custom templates for complete packages
- Export examples for others to learn from
- Build personal spread libraries

### For Spread Users
- One-click installation from community
- Import traditional spreads adapted for digital use
- Try spreads from experienced readers
- Build collection of specialized spreads

## 📦 Technical Details

- Zero ESLint errors
- Clean separation: SpreadValidator (validation), SpreadLoader (I/O)
- Spreads remain in settings.customSpreads (no migration needed)
- File-based system is additive, not replacing settings storage
- Template bundling works with existing vault-based templates

## 🔄 Migration

**No migration needed!** Since v1.8.1 has zero users:
- No backward compatibility concerns
- Settings-based spreads continue working
- File-based import/export is purely additive
- Can deprecate settings storage in v2.0 if needed

## 📚 Documentation

Updated for v1.8.1:
- **USAGE.md** - New "Sharing Spreads" section with workflows
- **SETTINGS.md** - Import/Export documentation
- **README.md** - Spread sharing feature listed
- **CHANGELOG.md** - Complete v1.8.1 entry

## 🚀 What's Next

**Community Spread Repositories** (coming soon):
- Shared collections of popular spreads
- Download complete spread packs
- Rate and review spreads
- Contribute your own designs

**For now, share spreads via:**
- GitHub Gists
- Obsidian Discord #plugins channel
- Tarot practice forums
- Personal repositories

## 📖 Example Spread Format

```json
{
  "id": "example-three-card",
  "name": "Example Three Card Spread",
  "description": "A simple three card spread",
  "isBuiltIn": false,
  "positions": [
    {
      "label": "Past",
      "description": "Influences from the past"
    },
    {
      "label": "Present",
      "description": "Current situation"
    },
    {
      "label": "Future",
      "description": "Potential outcome"
    }
  ],
  "shuffleCount": 3,
  "cutDeck": true,
  "templatePath": "",
  "insertMode": "inline"
}
```

## 💡 Tips for Creating Shareable Spreads

**Good spread design:**
- Clear position labels ("Challenge" not "Card 4")
- Helpful descriptions (explain each position's meaning)
- Appropriate card count (match complexity to purpose)
- Meaningful name ("Career Crossroads" not "My Spread")
- Include description (what questions does this spread answer?)

**Best practices:**
- Keep templates simple and readable
- Use position descriptions in output
- Include spread name and date
- Add intention field for context
- Consider adding metadata (author, tradition, year)

---

## 🔗 Links

- **Installation**: [Manual Installation Instructions](https://github.com/w8s/obsidian-tarot-practice#installation)
- **Documentation**: [docs/USAGE.md](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/USAGE.md)
- **Settings Reference**: [docs/SETTINGS.md](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/SETTINGS.md)
- **Template Guide**: [docs/TEMPLATE-VARIABLES.md](https://github.com/w8s/obsidian-tarot-practice/blob/master/docs/TEMPLATE-VARIABLES.md)
- **Changelog**: [CHANGELOG.md](https://github.com/w8s/obsidian-tarot-practice/blob/master/CHANGELOG.md)

---

**Full Changelog**: https://github.com/w8s/obsidian-tarot-practice/compare/1.8.0...1.8.1
