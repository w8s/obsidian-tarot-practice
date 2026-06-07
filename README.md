# Tarot Practice

![Tests](https://github.com/w8s/obsidian-tarot-practice/actions/workflows/test.yml/badge.svg) ![](https://img.shields.io/badge/Shuffle_Variance-Excessively_Engineered-purple)

*Bringing necessary imprecision to digital mystical arts since 2025*

An Obsidian plugin for daily tarot practice. Draw cards with intention using true randomness seeded by your words and the exact moment of the draw.

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

Digital tarot tools often feel hollow because they lack the intentionality present in physical practice. This plugin bridges that gap by using your intention and the precise moment of drawing to seed the randomness — making each draw feel participatory rather than mechanical.

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

## Privacy

This plugin reads file paths in your vault to populate template and image folder selectors. No data leaves your device.

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
4. Reload Obsidian and enable in Settings → Community Plugins

### Development Installation

```bash
git clone https://github.com/w8s/obsidian-tarot-practice.git
cd obsidian-tarot-practice
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` to `YourVault/.obsidian/plugins/tarot-practice/`.

## Usage

Run **"Draw daily tarot"** or **"Draw tarot spread"** from the command palette (⌘P / Ctrl+P), or click the ✨ ribbon icon. Assign hotkeys in Settings → Hotkeys for faster access.

- **Daily draws** — single or multiple cards inserted into today's note
- **Spread draws** — choose a built-in or custom spread, enter your intention
- **Physical draw mode** — toggle in the spread modal to enter cards from a real deck; output is identical to a digital draw

See the [Usage Guide](docs/USAGE.md) for workflows, spread details, and advanced options.

## Settings

Configure deck management, shuffle behavior, templates, reversals, and spread options in Settings → Tarot Practice. See the [Settings Reference](docs/SETTINGS.md) for all options and defaults.

## Custom Decks

The plugin supports any divination system — oracle cards, runes, Lenormand, I Ching, playing cards, or anything you define. Free public domain decks (Elder Futhark Runes, Petit Lenormand, Playing Cards, I Ching) are available at **[obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks)**. Install any deck via Settings → Deck Management → "Add deck".

For creating your own deck, see [Creating Decks](https://github.com/w8s/obsidian-tarot-decks/blob/main/CREATING-DECKS.md).

## Templates

Output is fully customizable using **Handlebars** syntax with 20+ variables for card data, deck info, spread positions, dates, and shuffle metadata. See [Template Variables](docs/TEMPLATE-VARIABLES.md) and [Template Examples](docs/TEMPLATE-EXAMPLES.md).

## Privacy & Network Use

This plugin operates entirely offline. The only network access occurs when you explicitly click **"Restore images"** in the deck details modal, which downloads a ZIP from the URL stored in that deck's `sourceUrl` field. No requests are made automatically or in the background.

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
