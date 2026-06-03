# Tarot Practice

![Tests](https://github.com/w8s/obsidian-tarot-practice/actions/workflows/test.yml/badge.svg) ![](https://img.shields.io/badge/Shuffle_Variance-Excessively_Engineered-purple)


*Bringing necessary imprecision to digital mystical arts since 2025*

A feature-rich Obsidian plugin for daily tarot practice. Draw cards with intention using true randomness seeded by your words and the exact moment of the draw.

## Documentation

- 📚 [Template Variables](docs/TEMPLATE-VARIABLES.md) - Complete variable reference
- 📝 [Template Examples](docs/TEMPLATE-EXAMPLES.md) - Common template patterns  
- 🃏 [Spread Templates](docs/spread-templates/README.md) - Spread-specific examples
- 🧭 [Usage Guide](docs/USAGE.md) - Detailed usage instructions
- ⚙️ [Settings Reference](docs/SETTINGS.md) - Complete settings documentation
- 📋 [Changelog](CHANGELOG.md) - Version history and release notes
- 🗺️ [Roadmap](docs/ROADMAP.md) - Planned features

**For Developers:**
- 🔨 [Development Workflow](docs/DEVELOPMENT-WORKFLOW.md) - Bug fixes, releases, and branching
- 🧪 [Testing](docs/TESTING-SETUP.md) - Test suite documentation
- 🔧 [Development Notes](docs/AGENTS.md) - Architecture and context

## Philosophy

Digital tarot tools often feel hollow because they lack the intentionality present in physical practice. This plugin bridges that gap by using your intention and the precise moment of drawing to seed the randomness - making each draw feel participatory rather than mechanical.

## Quick Start

1. Install plugin (Settings → Community Plugins → Browse)
2. Run command: **"Draw daily tarot"** (⌘P or Ctrl+P)
3. Enter your intention when prompted
4. Card appears in today's note

That's it! Customize settings later in Settings → Tarot Practice.

## Features

- 🎴 **Multi-deck support** - Tarot, runes, Lenormand, I Ching, playing cards, or custom decks
- 🖼️ **Card images** - Display images in readings using vault-based storage
- 🎯 **Daily & inline draws** - Single or multiple cards with intention-based randomness
- 🔀 **Built-in spreads** - Five traditional layouts plus custom spread creation
- 🃏 **Physical draw mode** - Enter cards from a real deck; uses spread system for layout, templates, and history
- 📤 **Spread sharing** - Import/export custom spreads as JSON or ZIP with templates
- 📊 **Draw history** - Track all readings with statistics and export to JSON/CSV
- 🎲 **Deck preparation** - Traditional shuffle (1-7x) with intention-influenced cut
- 📝 **Handlebars templates** - Fully customizable output formatting
- 🔄 **Reversal support** - Optional reversed cards with configurable probability
- 📦 **ZIP deck import** - Install complete decks with images in one click
- 📱 **Cross-platform** - Works on desktop, iOS, and Android

**Additional decks:** Download from [obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks) repository

## Installation

**Requires Obsidian 1.4.10 or later.**

### From Community Plugins (Recommended)

1. Open Settings → Community Plugins → Browse
2. Search for "Tarot Practice"
3. Install and enable

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

**Physical draw mode:** Toggle "Physical draw" in the spread modal to enter cards from a real deck instead of using RNG. For each position, select the card you drew via dropdowns (suit → card for tarot decks; single dropdown for oracle/rune decks). Output — templates, history, note insertion — is identical to a digital draw.

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

### Deck Management
- **Default deck** - Choose which deck to use for all spreads
- **Remember per spread** - Remember deck choice for each spread type
- **Install deck** - Add custom decks from JSON files
- **View deck details** - See card list and metadata
- **Remove deck** - Delete custom decks
- **Export example** - Download template deck for creating your own

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
- Import/export spreads as JSON or ZIP files
- Bundle custom templates with spread exports
- Customize shuffle/cut settings per spread
- Override templates for specific spreads

See [Settings Reference](docs/SETTINGS.md) for complete options and defaults.

## Custom Decks

The plugin supports any divination system! Create JSON decks for:
- Oracle cards
- Runes (Elder Futhark, Anglo-Saxon, etc.)
- Lenormand or Kipper cards
- Playing cards
- I Ching hexagrams
- Ogham staves
- Any custom system

### Additional Decks

Download free public domain decks from the **[obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks)** repository:

- **Elder Futhark Runes** (24) - Norse divination, 2nd-8th century CE
- **Petit Lenormand** (36) - French cartomancy, early 1800s  
- **Playing Cards** (52) - Standard deck divination, medieval Europe
- **I Ching** (64) - Ancient Chinese oracle, 3000+ years old

**Installation:** Download the ZIP file and import via Settings → Deck Management → "Add deck". ZIP packages include card images for enhanced readings.

### Creating Your Own Deck

**Two formats supported:**

1. **ZIP package** (recommended) - Includes deck definition + images
   - Automatic image extraction to your vault
   - Card images display in readings using `![[image]]` syntax
   - Optional source URL for re-downloading if images are deleted

2. **JSON file** - Deck definition only (no images)
   - Lightweight option for text-only readings
   - Can add image paths to external files later

**Getting started:**
1. Settings → Deck Management → "Export example deck"
2. Edit the JSON file with your cards and metadata
3. For ZIP format: Create `cards/` folder with images, add deck.json in root
4. Install via Settings → Deck Management → "Add deck"

**Complete deck creation guide:** See [Creating Decks](https://github.com/w8s/obsidian-tarot-decks/blob/master/CREATING-DECKS.md) for JSON structure, ZIP packaging, validation rules, and best practices.

## Templates

Templates use **Handlebars** syntax with 20+ variables for customizing draw output.

### Quick Reference

**Deck info:** `{{deck_name}}`, `{{deck_id}}`, `{{deck_type}}`, `{{deck_card_count}}`, `{{deck_supports_reversals}}`  
**Images:** `{{card.image}}`, `{{card.imageUrl}}`, `{{deck_back_image}}`, `{{deck_back_image_url}}`  
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

## Privacy & Network Use

This plugin operates entirely offline. The only network access occurs when you explicitly click **"Restore images"** in the deck details modal, which downloads a ZIP file from the URL stored in that deck's `sourceUrl` field. No network requests are made automatically or in the background.

Deck images can always be installed manually by downloading the ZIP file yourself and using Settings → Deck Management → "Add deck".

## License

MIT

## Credits

Built with:
- **[rng-with-intention](https://github.com/w8s/rng-with-intention)** - Intention-seeded randomness library
- **[Obsidian API](https://github.com/obsidianmd/obsidian-api)** - Plugin development framework
- **[Handlebars](https://handlebarsjs.com/)** - Templating engine
- **[fflate](https://github.com/101arrowz/fflate)** - Fast, lightweight ZIP handling
- **[Chart.js](https://www.chartjs.org/)** - Draw history statistics charts

Special thanks to the Obsidian community for feedback and inspiration.

---

*May your draws be insightful and your intentions clear.* ✨
