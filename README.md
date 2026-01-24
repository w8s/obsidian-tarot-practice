# Tarot Practice

![](https://img.shields.io/badge/Obidian_Plugin_Submission-Pending-orange) ![](https://img.shields.io/badge/Shuffle_Variance-Excessively_Engineered-purple)


*Bringing necessary imprecision to digital mystical arts since 2025*

A feature-rich Obsidian plugin for daily tarot practice. Draw cards with intention using true randomness seeded by your words and the exact moment of the draw.

## Documentation

- 📖 [Template Variables](docs/TEMPLATE-VARIABLES.md) - Complete variable reference
- 📖 [Template Examples](docs/TEMPLATE-EXAMPLES.md) - Common template patterns  
- 📖 [Spread Templates](docs/spread-templates/README.md) - Spread-specific examples
- 📋 [Usage Guide](docs/USAGE.md) - Detailed usage instructions
- ⚙️ [Settings Reference](docs/SETTINGS.md) - Complete settings documentation
- 📋 [Changelog](CHANGELOG.md) - Version history and release notes
- 🔧 [Development Notes](docs/AGENTS.md) - For contributors

## Philosophy

Digital tarot tools often feel hollow because they lack the intentionality present in physical practice. This plugin bridges that gap by using your intention and the precise moment of drawing to seed the randomness - making each draw feel participatory rather than mechanical.

## Quick Start

1. Install plugin (Settings → Community Plugins → Browse)
2. Run command: **"Draw daily tarot"** (⌘P or Ctrl+P)
3. Enter your intention when prompted
4. Card appears in today's note

That's it! Customize settings later in Settings → Tarot Practice.

## Features

- 🎴 **Daily & inline draws** - Single or multiple cards (1-78) with intention-based randomness
- 🔀 **Built-in spreads** - Five traditional layouts (Single, Three Card variants, Five Card Week, Celtic Cross)
- ✨ **Custom spreads** - Create your own position layouts with custom meanings
- 🎯 **Deck preparation** - Traditional shuffle (1-7x) and intention-influenced cut with ±10% variance
- 📝 **Handlebars templates** - Fully customizable output with 15+ variables and advanced formatting
- 🔄 **Reversal support** - Optional reversed cards with configurable probability
- 📱 **Cross-platform** - Works on desktop, iOS, and Android
- 🔍 **Full transparency** - Complete metadata for every draw (shuffle count, cut position, variance)

## Installation

> **Status:** Currently pending review for Obsidian Community Plugins directory ([PR-9473](https://github.com/obsidianmd/obsidian-releases/pull/9473/)). Use manual installation for now.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/w8s/obsidian-tarot-practice/releases)
2. Create folder `YourVault/.obsidian/plugins/tarot-practice/`
3. Copy files into that folder
4. Reload Obsidian (or restart)
5. Enable "Tarot Practice" in Settings → Community Plugins

### Development Installation

```bash
git clone https://github.com/w8s/obsidian-tarot-practice.git
cd obsidian-tarot-practice
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` to your vault's plugin folder: `YourVault/.obsidian/plugins/tarot-practice/`

## Usage

### Daily Practice

Run **"Draw daily tarot"** (click sparkles icon ✨ or use command palette)
- Enter your intention
- Card appears in today's note
- Location controlled by Settings → Daily Practice

**Quick settings:** Number of cards (default: 1), daily note path, insert location

### Spread Draws

Run **"Draw tarot spread"** → Select spread → Enter intention

**Pro tip:** Assign a hotkey in Settings → Hotkeys for instant access!

**Built-in spreads:**
- Single Card
- Three Card - Past/Present/Future
- Three Card - Situation/Action/Outcome  
- Five Card - Week Ahead (Mon-Fri)
- Celtic Cross (10 cards)

**Custom spreads:** Click "Create Custom Spread" to define your own positions and meanings.

See [Usage Guide](docs/USAGE.md) for detailed examples and workflows.

## Settings

Configure in Settings → Tarot Practice:

### Deck Preparation
- **Shuffle count** (1-7, default: 3) - How many times to shuffle
- **Cut deck** (On/Off, default: On) - Intention-based cutting after shuffle

### Daily Practice  
- **Number of cards** (1-78, default: 1) - Cards to draw for daily practice
- **Daily note settings** - Auto-create, path pattern, insert location
- **Heading name** - Insert under specific heading (auto-created if missing)

### Templates
- **Daily/Inline/Multiple templates** - Choose built-in or custom file
- **Template base folder** - Where custom templates are stored
- Actions: View, Edit, Reset to default

### Reversals
- **Enable reversals** (On/Off) - Allow reversed cards
- **Reversal chance** (0-100%, default: 50%) - Probability of reversal
- **Indicators** - Custom text for upright/reversed

### Spreads
- Manage built-in and custom spreads
- Customize shuffle/cut settings per spread
- Override templates for specific spreads

See [Settings Reference](docs/SETTINGS.md) for complete options and defaults.

## Templates

Templates use **Handlebars** syntax with 15+ variables for customizing draw output.

### Quick Reference

**Spread info:** `{{spread_name}}`, `{{spread_description}}`, `{{intention}}`  
**Cards:** `{{card_count}}`, `{{cards}}` (array for loops)  
**Date/time:** `{{date}}`, `{{time}}`, `{{datetime}}` (supports Moment.js formats)  
**Metadata:** `{{shuffle_count}}`, `{{was_cut}}`, `{{cut_position}}`, `{{cut_variance}}`  
**Optional:** `{{querent.name}}`, `{{querent.notePath}}` (when reading for someone else)

### Spread Example (with loop)

```markdown
## {{spread_name}} - {{date}}

**Intention:** {{intention}}
{{#if querent}}**Querent:** {{querent.name}}{{/if}}

{{#each cards}}
**{{this.position.label}}:** {{this.name}} {{this.orientation}}
{{#if this.position.description}}_{{this.position.description}}_{{/if}}
{{/each}}

*Deck: {{shuffle_count}} shuffles{{#if was_cut}}, cut at {{cut_position}}{{/if}}*
```

See complete documentation:
- [Template Variables](docs/TEMPLATE-VARIABLES.md) - All available variables with examples
- [Template Examples](docs/TEMPLATE-EXAMPLES.md) - Copy-paste ready templates
- [Spread Templates](docs/spread-templates/README.md) - Spread-specific formatting

## Roadmap

**Current (v1.6.1):**
- ✅ 5 built-in spreads with Handlebars templates
- ✅ Custom spread creation with position definitions
- ✅ Per-spread deck preparation settings
- ✅ File-based template system with "Create from Example"
- ✅ Card metadata infrastructure (category, suit, rank, value)
- ✅ Querent tracking for readings done for others
- ✅ Deck definition infrastructure

**v1.7.0 - Multi-Deck Support:**
- 🔄 Custom deck loading from JSON files
- 🔄 Deck selector UI in settings
- 🔄 Per-spread deck selection
- 🔄 Oracle, Lenormand, and playing card deck support

**Future:**
- Spread import/export for sharing
- Card interpretation database
- Reading history and analytics
- Different shuffle styles (overhand, riffle, Hindu)

For detailed feature plans, see [GitHub Issues](https://github.com/w8s/obsidian-tarot-practice/issues) and [Discussions](https://github.com/w8s/obsidian-tarot-practice/discussions).

## License

MIT

## Credits

Built with:
- **[rng-with-intention](https://github.com/w8s/rng-with-intention)** - Intention-seeded randomness library
- **[Obsidian API](https://github.com/obsidianmd/obsidian-api)** - Plugin development framework
- **[Handlebars](https://handlebarsjs.com/)** - Templating engine

Special thanks to the Obsidian community for feedback and inspiration.

---

*May your draws be insightful and your intentions clear.* ✨
