# Tarot Practice

A feature-rich Obsidian plugin for daily tarot practice. Draw cards with intention using true randomness seeded by your words and the exact moment of the draw.

## Philosophy

Digital tarot tools often feel hollow because they lack the intentionality present in physical practice. This plugin bridges that gap by using your intention and the precise moment of drawing to seed the randomness - making each draw feel participatory rather than mechanical.

## Features

### Core Functionality
- 🎴 Single card draw with intention input
- ✨ Uses [rng-with-intention](https://github.com/w8s/rng-with-intention) for meaningful randomness
- 📝 Highly customizable output format with template variables
- 🃏 Standard Rider-Waite-Smith (RWS) card ordering (0-77)
- ⏱️ Captures exact timestamp (to the millisecond) of each draw
- 🔔 Notification showing which card was drawn

### Configuration Options

**Daily Note Integration**
- Toggle daily note auto-creation
- Customizable daily note path pattern (e.g., `YYYY-MM-DD.md`, `Daily/YYYY-MM-DD.md`)

**Insert Location**
- Choose where draws appear: append to end, prepend to beginning, or under a specific heading
- Heading auto-creation if it doesn't exist

**Output Templates**
- Fully customizable output format
- Available variables: `{{card}}`, `{{index}}`, `{{intention}}`, `{{timestamp}}`, `{{date}}`, `{{time}}`, `{{datetime}}`
- Two-column editor: data dictionary on left, template on right
- Default template maintains traditional tarot journal format

## Usage

### Drawing a Card

1. **Click the sparkles icon** in the left ribbon, or
2. **Run the command** "Daily Tarot Practice Draw" (Cmd/Ctrl+P)
3. **Enter your intention** in the modal (required)
4. **Click "Draw Card"**

The result is inserted according to your settings.

### Default Output Format

```markdown
## Tarot Draw - 1/11/2026, 3:45:23 PM

**Intention:** What do I need to know today?
**Card:** The Hermit (Index: 9)
**Drawn at:** 2026-01-11T15:45:23.818Z

---
```

### Customizing Output

You can completely customize the output format in Settings. For example:

**Minimal format:**
```
- {{time}}: [[{{card}}]] - {{intention}}
```

**Custom format:**
```
### {{card}}
*Drawn: {{datetime}}*

> {{intention}}

---
```

## Settings

### Daily Practice
- **Use daily note**: Toggle auto-creation of daily notes when no file is open
- **Daily note path pattern**: Customize where daily notes are created (supports Moment.js format)
- **Insert location**: Choose append, prepend, or under a specific heading
- **Heading name**: Specify which heading to insert under (only when "under heading" is selected)
- **Output template**: Customize the format using template variables

### Inline Practice
- **Use daily practice format**: Toggle to share the same template as daily practice
- **Output template**: Separate customizable template (only shown when not using shared format)

## Template Variables

Customize your tarot draw output using these variables:

### Basic Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{card}}` | Card name | The Hermit |
| `{{index}}` | Card index (0-77) | 9 |
| `{{intention}}` | Your intention text | What do I need to know today? |
| `{{timestamp}}` | ISO 8601 timestamp | 2026-01-11T15:45:23.818Z |

### Date/Time Variables

All date/time variables support [Moment.js format strings](https://momentjs.com/docs/#/displaying/format/):

| Variable | Description | Default Format | Example |
|----------|-------------|----------------|---------|
| `{{date}}` | Localized date | `L` | 1/11/2026 |
| `{{date:FORMAT}}` | Custom date format | — | `{{date:YYYY-MM-DD}}` → 2026-01-11 |
| `{{time}}` | Localized time | `LT` | 3:45 PM |
| `{{time:FORMAT}}` | Custom time format | — | `{{time:HH:mm}}` → 15:45 |
| `{{datetime}}` | Date + time | `L LT` | 1/11/2026, 3:45 PM |
| `{{datetime:FORMAT}}` | Custom datetime format | — | `{{datetime:MMM D, h:mm A}}` → Jan 11, 3:45 PM |

### Common Format Patterns

| Pattern | Output Example |
|---------|----------------|
| `YYYY-MM-DD` | 2026-01-11 |
| `MMM D, YYYY` | Jan 11, 2026 |
| `dddd, MMMM Do` | Saturday, January 11th |
| `HH:mm` | 15:45 |
| `h:mm A` | 3:45 PM |
| `YYYY-MM-DD HH:mm` | 2026-01-11 15:45 |

### Template Examples

**Minimal:**
```
- {{time}}: [[{{card}}]] - {{intention}}
```

**Detailed:**
```
## {{card}} - {{date:MMM D}}

**Question:** {{intention}}
**Drawn:** {{datetime:h:mm A}}
**Index:** {{index}}

---
```

**Journal style:**
```
### Tarot Draw

> {{intention}}

**Card:** {{card}}  
**Time:** {{time}}
```

## Installation

> **Note:** This plugin is currently pending review for the Obsidian Community Plugins directory. Until then, please use manual installation.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/w8s/obsidian-tarot-practice/releases)
2. Create folder `VaultFolder/.obsidian/plugins/tarot-practice/`
3. Copy the three files into that folder
4. Reload Obsidian
5. Enable "Tarot Practice" in Settings → Community Plugins

### Development Installation

```bash
git clone https://github.com/w8s/obsidian-tarot-practice.git
cd obsidian-tarot-practice
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` to your vault's plugin folder.

## How It Works

1. You provide an intention (any text)
2. The exact timestamp is captured (milliseconds)
3. System entropy is added (cryptographic randomness)
4. These combine via the `rng-with-intention` library to generate a card index
5. The intention is discarded (never stored)
6. The card name and metadata are formatted using your template
7. The result is inserted into your note based on your settings

## Roadmap

Current version focuses on single-card daily practice. Potential future additions:

- Multiple spread types (3-card, Celtic Cross, etc.)
- Quick inline draw command (ignores settings)
- Card interpretation database
- Reversal support
- Reading history tracking
- Custom card databases

## License

MIT

## Credits

Built with [rng-with-intention](https://github.com/w8s/rng-with-intention) - a library for generating random numbers seeded by human intention.
