# Tarot Practice

![Over-Engineered](https://img.shields.io/badge/Shuffle_Variance-excessively_engineered-purple?style=for-the-badge&logo=sparkles)

*Bringing unnecessary precision to digital mystical arts since 2025*

A feature-rich Obsidian plugin for daily tarot practice. Draw cards with intention using true randomness seeded by your words and the exact moment of the draw.

## Philosophy

Digital tarot tools often feel hollow because they lack the intentionality present in physical practice. This plugin bridges that gap by using your intention and the precise moment of drawing to seed the randomness - making each draw feel participatory rather than mechanical.

## Features

### Core Functionality
- 🎴 Single or multiple card draws with intention input
- ✨ Uses [rng-with-intention](https://github.com/w8s/rng-with-intention) for meaningful randomness
- 🔀 Traditional deck preparation: configurable shuffles (1-7) and optional cutting
- 🎯 Intention-influenced cut position with natural variance (±10%)
- 🔄 Optional reversal support with configurable probability and indicators
- 📝 Highly customizable output format with template variables
- 📊 Complete draw metadata capture (shuffles, cut position, variance) for analytics
- 🃏 Standard Rider-Waite-Smith (RWS) card ordering (0-77)
- ⏱️ Captures exact timestamp (to the millisecond) of each draw
- 🔔 Notification showing which card(s) were drawn

### Configuration Options

**Daily Note Integration**
- Toggle daily note auto-creation
- Customizable daily note path pattern (e.g., `YYYY-MM-DD.md`, `Daily/YYYY-MM-DD.md`)

**Insert Location**
- Choose where draws appear: append to end, prepend to beginning, or under a specific heading
- Heading auto-creation if it doesn't exist

**Deck Preparation**
- Configurable shuffle count (1-7 times)
- Optional deck cutting with intention-based position
- Applies to both single and multiple card draws

**Output Templates**
- Fully customizable output format
- Card variables: `{{card}}`, `{{index}}`, `{{orientation}}`
- Multiple card variables: `{{card_count}}`, `{{cards}}`
- Date/time variables: `{{date}}`, `{{time}}`, `{{datetime}}`
- Metadata variables: `{{shuffle_count}}`, `{{was_cut}}`, `{{cut_position}}`, `{{cut_position_cards}}`, `{{cut_base}}`, `{{cut_variance}}`
- Default templates maintain traditional tarot journal format

## Usage

### Drawing Cards

**Daily Practice:**
1. Run command: **"Draw daily tarot"** (or click sparkles icon)
2. Enter your intention
3. Card count is set in Settings → Daily Practice → Number of cards

**Inline Draws:**
1. Position cursor where you want the draw
2. For single card: **"Inline draw tarot card"**
3. For multiple cards: **"Inline draw multiple tarot cards"** (choose count in modal)

**Tip:** Assign hotkeys to these commands in Settings → Hotkeys for faster access.

## Settings

### Daily Practice
- **Use daily note**: Auto-create daily notes when no file is open
- **Daily note path pattern**: Where daily notes are created (supports Moment.js format like `YYYY-MM-DD.md`)
- **Insert location**: Append to end, prepend to beginning, or under a specific heading
- **Heading name**: Which heading to insert under (auto-created if missing)
- **Number of cards**: How many cards to draw for daily practice (1-78, default: 1)
- **Output template**: Format for single card daily draws (see Template Variables below)

### Deck Preparation
*These settings apply to all draws (daily and inline)*
- **Number of shuffles**: How many times to shuffle the deck (1-7, default: 3)
- **Cut deck**: Enable intention-based deck cutting (default: true)

### Inline Practice
- **Use daily practice format**: Share the same template as daily practice
- **Output template**: Separate format for inline single card draws (only shown when toggle is off)

### Reversals
- **Enable reversals**: Allow cards to appear reversed in readings
- **Reversal chance**: Probability of reversal (0-100%, default 50%)
- **Upright indicator**: Text for upright cards (default: empty)
- **Reversed indicator**: Text for reversed cards (default: "reversed")

### Templates
- **Multiple cards output template**: Template for multiple card draws (daily or inline)

## Template Variables

Customize your tarot draw output using these variables:

### Card Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{card}}` | Card name | The Hermit |
| `{{index}}` | Card index (0-77) | 9 |
| `{{intention}}` | Your intention text | What do I need to know today? |
| `{{orientation}}` | Upright/reversed indicator | reversed |

### Multiple Card Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{card_count}}` | Number of cards drawn | 3 |
| `{{cards}}` | Formatted numbered list | 1. The Hermit reversed<br>2. The Fool<br>3. The Tower |

### Draw Metadata Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{shuffle_count}}` | Number of shuffles performed | 3 |
| `{{was_cut}}` | Whether deck was cut | yes |
| `{{cut_position}}` | Cut position as percentage | 54.3% |
| `{{cut_position_cards}}` | Cut position as card number | 42 |
| `{{cut_base}}` | RNG result before variance | 47% |
| `{{cut_variance}}` | Variance applied to cut | +7.3% |

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

**Single Card (default):**
```
## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Card:** {{card}} {{orientation}}
**Index:** {{index}}

---
```

**Multiple Cards (default):**
```
## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Cards drawn:** {{card_count}}

{{cards}}

---
```

**With metadata:**
```
## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Card:** {{card}} {{orientation}}

**Draw details:**
- Shuffles: {{shuffle_count}}
- Cut: {{was_cut}} at {{cut_position}} (card {{cut_position_cards}})
- RNG: {{cut_base}} + {{cut_variance}}

---
```

**Minimal:**
```
- {{time}}: [[{{card}}]] {{orientation}} - {{intention}}
```

**Journal style:**
```
### Tarot draw

> {{intention}}

**Card:** {{card}} {{orientation}}
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
3. The deck is shuffled 1-7 times using intention-seeded randomness
4. Optional cut: intention determines position (1-100%) with ±10% variance
5. Cards are drawn consecutively from the prepared deck
6. Reversals calculated if enabled
7. Complete metadata captured (shuffles, cut details, variance)
8. Result formatted using your template and inserted into your note

## Roadmap

Current version includes:
- ✅ Single and multiple card draws with intention
- ✅ Traditional deck preparation (shuffle and cut)
- ✅ Intention-influenced randomness with variance
- ✅ Complete metadata capture for analytics
- ✅ Reversal support with configurable indicators
- ✅ Inline draw commands with separate templates

Potential future additions:

- Multiple spread types (3-card, Celtic Cross, etc.)
- Spread-specific deck preparation settings (custom shuffle/cut per spread)
- Different shuffle/cut styles (overhand, riffle, Hindu shuffle, etc.)
- Shuffle style variance - each shuffle slightly different based on intention/entropy
- Card interpretation database
- Reading history tracking and analytics
- Custom card databases (Oracle decks, etc.)

## License

MIT

## Credits

Built with [rng-with-intention](https://github.com/w8s/rng-with-intention) - a library for generating random numbers seeded by human intention.
