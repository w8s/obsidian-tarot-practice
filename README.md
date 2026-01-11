# Tarot Practice

A minimal Obsidian plugin for daily tarot practice. Draw cards with intention using true randomness seeded by your words and the exact moment of the draw.

## Philosophy

Digital tarot tools often feel hollow because they lack the intentionality present in physical practice. This plugin bridges that gap by using your intention and the precise moment of drawing to seed the randomness - making each draw feel participatory rather than mechanical.

## Features

- 🎴 Single card daily draw with intention input
- ✨ Uses [rng-with-intention](https://github.com/w8s/rng-with-intention) for meaningful randomness
- 📝 Inserts formatted draw results directly into your notes
- 🃏 Standard Rider-Waite-Smith (RWS) card ordering
- ⏱️ Captures exact timestamp (to the millisecond) of each draw

## Usage

### Drawing a Card

1. **Click the sparkles icon** in the left ribbon, or
2. **Run the command** "Draw daily tarot card" (Cmd/Ctrl+P)

3. **Enter your intention** in the modal (required)
4. **Click "Draw Card"**

The result is inserted at your cursor position:

\`\`\`markdown
## Tarot Draw - 1/10/2025, 6:45:23 PM

**Intention:** What do I need to know today?
**Card:** The Hermit (Index: 9)
**Drawn at:** 2026-01-11T00:45:23.847Z

---
\`\`\`

### Notes

- **Must be in edit mode** - The plugin inserts text, so you need to be editing a note (not reading mode)
- **Cursor position** - Output appears where your cursor is
- **RWS ordering** - Uses standard 0-77 indexing (Major Arcana 0-21, then Wands/Cups/Swords/Pentacles)

## Installation

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/w8s/obsidian-tarot-practice/releases)
2. Create folder `VaultFolder/.obsidian/plugins/tarot-practice/`
3. Copy the three files into that folder
4. Reload Obsidian
5. Enable "Tarot Practice" in Settings → Community Plugins

### Development Installation

\`\`\`bash
git clone https://github.com/w8s/obsidian-tarot-practice.git
cd obsidian-tarot-practice
npm install
npm run build
\`\`\`

Copy `main.js`, `manifest.json`, and `styles.css` to your vault's plugin folder.

## Development

\`\`\`bash
npm install          # Install dependencies
npm run dev          # Build and watch for changes
npm run build        # Production build
\`\`\`

## How It Works

1. You provide an intention (any text)
2. The exact timestamp is captured (milliseconds)
3. System entropy is added (cryptographic randomness)
4. These combine via the `rng-with-intention` library to generate a card index
5. The intention is discarded (never stored)
6. The card name and metadata are inserted into your note

## Roadmap

Current version is MVP focused on single-card daily practice. Potential future additions:

- Multiple spread types (3-card, Celtic Cross, etc.)
- Card interpretation database
- Reversal support
- Reading history tracking
- Custom card databases

## License

MIT

## Credits

Built with [rng-with-intention](https://github.com/w8s/rng-with-intention) - a library for generating random numbers seeded by human intention.
