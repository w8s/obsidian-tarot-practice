# Template Variables

Complete reference for all template variables available in Tarot Practice templates.

Templates use **Handlebars** syntax for advanced formatting including loops, conditionals, and helpers.

---

## Table of Contents

- [Spread-Level Variables](#spread-level-variables)
- [Cards Array](#cards-array)
- [Card Variables](#card-variables)
- [Date & Time Variables](#date--time-variables)
- [Draw Metadata Variables](#draw-metadata-variables)
- [Handlebars Syntax](#handlebars-syntax)

---

## Spread-Level Variables

Variables about the spread itself. Available at the top level of all templates.

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{spread_name}}` | String | Name of the spread | `"Celtic Cross"` |
| `{{spread_description}}` | String | Purpose/explanation | `"A comprehensive 10-card reading"` |
| `{{intention}}` | String | Your intention text | `"What do I need to know?"` |
| `{{card_count}}` | Number | Number of cards drawn | `3` |
| `{{deck_name}}` | String | Deck name | `"Rider-Waite-Smith"` |
| `{{deck_type}}` | String | Deck type | `"tarot"` |
| `{{deck_id}}` | String | Deck identifier | `"rider-waite-smith"` |
| `{{deck_card_count}}` | Number | Total cards in deck | `78` |
| `{{deck_supports_reversals}}` | Boolean | Whether deck supports reversals | `true` |
| `{{deck_back_image_url}}` | String | Deck back image path (optional) | `"back.png"` |
| `{{deck_back_image}}` | String | Deck back as Obsidian wikilink (optional) | `"![[back.png]]"` |

### Querent (Optional)

When a reading is for someone else, querent information is available:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{querent.name}}` | String | Name of person | `"Sarah Chen"` |
| `{{querent.notePath}}` | String | Note path if provided | `"People/Sarah Chen"` |
| `{{querent.hasPath}}` | Boolean | Whether notePath exists | `true` or `false` |

**Usage example:**
```handlebars
{{#if querent}}
**Querent:** {{#if querent.hasPath}}[[{{querent.notePath}}|{{querent.name}}]]{{else}}{{querent.name}}{{/if}}
{{/if}}
```

This creates a wikilink to the person's note if provided, otherwise just shows their name.

### Details

**`{{spread_name}}`**
- Display name of the spread used
- Examples: "Single Card", "Three Card - Past/Present/Future", "Celtic Cross"

**`{{spread_description}}`**
- Optional explanation of the spread's purpose
- May be empty for simple spreads

**`{{{intention}}}`** (note: triple braces recommended)
- Exactly as you typed it
- Preserves capitalization, punctuation, line breaks
- Can be multi-line if entered that way
- **Use triple braces `{{{intention}}}` to prevent HTML escaping of quotes/apostrophes**

**`{{card_count}}`**
- Total number of cards in this draw
- Range: 1-78
- Useful for conditional formatting

**`{{deck_name}}`**
- Current deck name
- Default: `"Rider-Waite-Smith"`
- Useful for multi-deck setups or custom decks

**`{{deck_type}}`**
- Type of divination deck
- Values: `"tarot"`, `"oracle"`, `"lenormand"`, `"playing-cards"`, `"runes"`, `"other"`
- Default: `"tarot"`

**`{{deck_id}}`**
- Unique identifier for the deck
- Examples: `"rider-waite-smith"`, `"elder-futhark"`, `"lenormand"`
- Used internally for deck selection

**`{{deck_card_count}}`**
- Total number of cards/symbols in the deck
- Examples: 78 (tarot), 24 (runes), 36 (Lenormand), 52 (playing cards)

**`{{deck_supports_reversals}}`**
- Whether the deck definition supports reversed meanings
- `true` or `false`
- Useful for conditional formatting based on deck type

**`{{deck_back_image_url}}`**
- File path to the deck back image (if defined)
- Relative to deck directory: `"back.png"`
- Or vault path: `"Assets/Decks/my-deck-back.png"`
- Empty string if not defined
- Use for custom deck back display

**`{{deck_back_image}}`**
- Deck back image formatted as Obsidian wikilink
- Automatically formatted as `![[path]]`
- Empty string if no image defined
- Displays immediately in reading view
- Example: `![[Assets/Decks/celtic-back.png]]`

---

## Cards Array

The `{{cards}}` array contains all drawn cards. Use with loops or direct access.

### Looping Through Cards

```handlebars
{{#each cards}}
**{{position.number}}. {{position.label}}:** {{name}} {{orientation}}
{{/each}}
```

Output:
```markdown
**1. Past:** The Fool
**2. Present:** The Hermit reversed
**3. Future:** The Tower
```

### Direct Access

Access specific cards by index:

```handlebars
First card: {{cards.0.name}}
Second card: {{cards.1.name}}
Third card: {{cards.2.name}}
```

Output:
```
First card: The Fool
Second card: The Hermit
Third card: The Tower
```

### Array Structure

Each item in `{{cards}}` is an object with these properties (see [Card Variables](#card-variables) for details):

```javascript
{
  index: 9,                          // Card index in deck (0-77)
  position: {
    number: 2,                       // Position number (1-based)
    label: "Present",                // Position name
    description: "Your current state" // Optional explanation
  },
  name: "The Hermit",                // Card name
  orientation: "reversed",           // Orientation indicator
  isReversed: true                   // Boolean for conditionals
}
```

---

## Card Variables

Variables available for each card. Use inside `{{#each cards}}` loops or via direct access like `{{cards.0.name}}`.

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{index}}` | Number | Card index in deck (0-77) | `9` |
| `{{position.number}}` | Number | Position number (1-based) | `2` |
| `{{position.label}}` | String | Position name | `"Present"` |
| `{{position.description}}` | String | Position explanation (optional) | `"Your current state"` |
| `{{name}}` | String | Card name | `"The Hermit"` |
| `{{orientation}}` | String | Orientation indicator | `"reversed"` or `""` |
| `{{isReversed}}` | Boolean | Reversal flag for conditionals | `true` or `false` |
| `{{imageUrl}}` | String | Card image path (optional) | `"cards/09-hermit.png"` |
| `{{image}}` | String | Card image as Obsidian wikilink (optional) | `"![[cards/09-hermit.png]]"` |

### Details

**`{{index}}`**
- Zero-based card index in the deck (0-77)
- Major Arcana: 0-21
- Wands: 22-35
- Cups: 36-49
- Swords: 50-63
- Pentacles: 64-77
- Useful for analytics, sorting, or lookups

**`{{position.number}}`**
- One-based position number in the spread
- First card = 1, second card = 2, etc.
- Use for numbering: `**{{position.number}}.** {{name}}`

**`{{position.label}}`**
- Short name for this position in the spread
- Examples: "Past", "Present", "Challenge", "Guidance"
- Always present

**`{{position.description}}`**
- Optional longer explanation of what this position represents
- May be undefined for simple spreads
- Use with conditional: `{{#if position.description}}...{{/if}}`

**`{{name}}`**
- Full card name from the deck
- Major Arcana: "The Fool", "The Magician", etc.
- Minor Arcana: "Ace of Wands", "Two of Cups", "King of Swords", etc.
- Always capitalized

**`{{orientation}}`**
- Orientation indicator text from settings
- If reversals disabled: Always empty string `""`
- If upright: Contains "Upright indicator" setting (default: `""`)
- If reversed: Contains "Reversed indicator" setting (default: `"reversed"`)
- Use in templates: `{{name}} {{orientation}}`

**`{{isReversed}}`**
- Boolean flag for conditional logic
- `true` if card is reversed
- `false` if card is upright
- Use with `{{#if isReversed}}...{{/if}}`

**`{{imageUrl}}`**
- File path to the card image (if defined in deck)
- Relative to deck directory: `"cards/09-hermit.png"`
- Or vault path: `"Assets/Tarot/RWS/hermit.png"`
- Empty string if not defined
- Use for custom image embedding or linking

**`{{image}}`**
- Card image formatted as Obsidian wikilink
- Automatically formatted as `![[path]]`
- Empty string if no image defined
- Displays immediately in reading view
- Example: `![[cards/09-hermit.png]]`
- Useful for visual spreads with card images

### Usage Examples

**Loop with position labels:**
```handlebars
{{#each cards}}
**{{position.label}}:** {{name}}{{#if isReversed}} (reversed){{/if}}
{{/each}}
```

**Loop with position descriptions:**
```handlebars
{{#each cards}}
**{{position.number}}. {{position.label}}:** {{name}} {{orientation}}
{{#if position.description}}
*{{position.description}}*
{{/if}}
{{/each}}
```

**Direct access to specific cards:**
```handlebars
### The Cross
**{{cards.0.position.label}}:** {{cards.0.name}}
**{{cards.1.position.label}}:** {{cards.1.name}}
```

**Conditional formatting:**
```handlebars
{{#each cards}}
{{#if isReversed}}
⚠️ {{name}} (reversed)
{{else}}
✓ {{name}}
{{/if}}
{{/each}}
```

---

## Date & Time Variables

All date/time variables support custom formatting using Moment.js format strings.

### Basic Variables

| Variable | Default Format | Example Output |
|----------|----------------|----------------|
| `{{date}}` | `L` (localized date) | `1/21/2026` |
| `{{time}}` | `LT` (localized time) | `3:45 PM` |
| `{{datetime}}` | `L LT` | `1/21/2026 3:45 PM` |

### Custom Formatting

Use `:FORMAT` to specify custom Moment.js format:

| Variable | Output |
|----------|--------|
| `{{date:YYYY-MM-DD}}` | `2026-01-21` |
| `{{date:MMM D, YYYY}}` | `Jan 21, 2026` |
| `{{date:dddd, MMMM Do}}` | `Wednesday, January 21st` |
| `{{time:HH:mm}}` | `15:45` (24-hour) |
| `{{time:h:mm A}}` | `3:45 PM` (12-hour) |
| `{{datetime:YYYY-MM-DD HH:mm}}` | `2026-01-21 15:45` |
| `{{datetime:MMM D, h:mm A}}` | `Jan 21, 3:45 PM` |

### Common Format Tokens

| Token | Meaning | Example |
|-------|---------|---------|
| `YYYY` | 4-digit year | `2026` |
| `YY` | 2-digit year | `26` |
| `MMMM` | Full month name | `January` |
| `MMM` | Short month name | `Jan` |
| `MM` | 2-digit month | `01` |
| `M` | Month number | `1` |
| `DD` | 2-digit day | `21` |
| `D` | Day number | `21` |
| `Do` | Day with ordinal | `21st` |
| `dddd` | Full weekday | `Wednesday` |
| `ddd` | Short weekday | `Wed` |
| `HH` | Hour (24-hour) | `15` |
| `h` | Hour (12-hour) | `3` |
| `mm` | Minutes | `45` |
| `ss` | Seconds | `07` |
| `A` | AM/PM | `PM` |

Full reference: [Moment.js Format Documentation](https://momentjs.com/docs/#/displaying/format/)

---

## Draw Metadata Variables

Variables capturing technical details about how the draw was performed.

| Variable | Type | Description | Example Output |
|----------|------|-------------|----------------|
| `{{shuffle_count}}` | Number | Number of shuffles performed | `3` |
| `{{was_cut}}` | String | Whether deck was cut | `"yes"` or `"no"` |
| `{{cut_position}}` | String | Cut position as percentage | `"54.3%"` |
| `{{cut_position_cards}}` | Number | Cut position in card count | `42` |
| `{{cut_base}}` | String | RNG result before variance | `"47%"` |
| `{{cut_variance}}` | String | Variance applied to cut | `"+7.3%"` or `"-2.1%"` |

### Details

**`{{shuffle_count}}`**
- From Deck Preparation settings
- Range: 1-7
- Can be overridden per spread

**`{{was_cut}}`**
- `"yes"` if deck was cut
- `"no"` if cutting was disabled
- From Deck Preparation settings

**`{{cut_position}}`**
- Where deck was cut as percentage (0-100%)
- Includes one decimal place
- Example: `"23.8%"` means cut at 23.8% through deck

**`{{cut_position_cards}}`**
- Cut position in card numbers (1-78)
- Example: `18` means cut after 18th card
- Calculated from percentage

**`{{cut_base}}`**
- RNG-generated percentage from intention
- Before variance is applied
- Shows deterministic component

**`{{cut_variance}}`**
- Natural variance applied (±10% max)
- Shown with sign: `"+7.3%"` or `"-2.1%"`
- Makes cuts feel more natural/random

### Usage Example

Show full draw transparency:

```markdown
**Draw Details:**
- Shuffles: {{shuffle_count}}
- Cut: {{was_cut}} at {{cut_position}} (card {{cut_position_cards}})
- RNG: {{cut_base}} + {{cut_variance}}
```

Output:
```markdown
**Draw Details:**
- Shuffles: 3
- Cut: yes at 54.3% (card 42)
- RNG: 47% + +7.3%
```

---

## Handlebars Syntax

Templates support full Handlebars functionality for advanced formatting.

### HTML Escaping

**Important:** Handlebars has two types of variable output:

**Double braces `{{variable}}`** - HTML-escapes the output
- Converts special characters: `'` → `&#x27;`, `"` → `&#x22;`, `&` → `&#x38;`
- Use for card names and controlled data
- Example: `{{name}}` outputs card names safely

**Triple braces `{{{variable}}}`** - Raw output, no escaping
- Outputs exactly as entered
- Use for user input fields like `{{{intention}}}`
- Preserves apostrophes, quotes, and special characters
- Example: `{{{intention}}}` keeps "peppa's back" as-is instead of "peppa&#x27;s back"

**Best Practice:**
```handlebars
**Intention:** {{{intention}}}     ← Triple braces for user input
**Card:** {{name}} {{orientation}} ← Double braces for card names
```

**When to use which:**
- `{{{intention}}}` - User's text (may contain quotes/apostrophes)
- `{{name}}` - Card name (controlled data)
- `{{orientation}}` - Controlled data
- `{{spread_name}}` - Controlled data
- `{{date}}`, `{{time}}` - Controlled data

### Conditionals

```handlebars
{{#if isReversed}}
This card is reversed!
{{else}}
This card is upright.
{{/if}}
```

### Loops

```handlebars
{{#each cards}}
{{number}}. {{name}} - {{position.label}}
{{/each}}
```

### Loop Context Variables

Inside `{{#each}}` loops, special variables are available:

| Variable | Description | Example |
|----------|-------------|---------|
| `@index` | Current loop index (0-based) | `0`, `1`, `2` |
| `@first` | True if first item | `true` or `false` |
| `@last` | True if last item | `true` or `false` |

Example:
```handlebars
{{#each cards}}
{{#if @first}}
=== First Card ===
{{/if}}
{{position.number}}. {{name}}
{{#if @last}}
=== Last Card ===
{{/if}}
{{/each}}
```

### Comments

```handlebars
{{!-- This is a comment, won't appear in output --}}
```

### Built-in Helpers

- `{{#if}}` - Conditional block
- `{{#unless}}` - Inverted conditional
- `{{#each}}` - Loop over array
- `{{#with}}` - Change context

Full reference: [Handlebars Guide](https://handlebarsjs.com/guide/)

---

## Appendix: Complete Data Structure

Full JSON representation of a draw result showing all available template variables.

```json
{
  "spread_name": "Three Card - Past/Present/Future",
  "spread_description": "Explore the progression from past through present to future",
  "intention": "What's happening with my career transition?",
  "card_count": 3,
  "deck_name": "Rider-Waite-Smith",
  "deck_type": "tarot",
  "timestamp": 1737751200000,
  "date": "1/24/2026",
  "time": "3:45 PM",
  "datetime": "1/24/2026 3:45 PM",
  
  "cards": [
    {
      "index": 0,
      "position": {
        "number": 1,
        "label": "Past",
        "description": "Events and influences that led to this moment"
      },
      "name": "The Fool",
      "orientation": "",
      "isReversed": false
    },
    {
      "index": 9,
      "position": {
        "number": 2,
        "label": "Present",
        "description": "Your current situation and state of being"
      },
      "name": "The Hermit",
      "orientation": "reversed",
      "isReversed": true
    },
    {
      "index": 16,
      "position": {
        "number": 3,
        "label": "Future",
        "description": "What's emerging or where this is heading"
      },
      "name": "The Tower",
      "orientation": "",
      "isReversed": false
    }
  ],
  
  "shuffle_count": 3,
  "was_cut": "yes",
  "cut_position": "54.3%",
  "cut_position_cards": 42,
  "cut_base": "47%",
  "cut_variance": "+7.3%"
}
```

**Notes:**
- `timestamp` is milliseconds since epoch (used by Handlebars date helpers)
- `date`, `time`, `datetime` are pre-formatted with default formats
- `position.description` may be `undefined` for simple spreads
- `orientation` is empty string `""` for upright cards
- All string values use double quotes in JSON but render without them in templates

---

## Related Documentation

- [Template Examples](TEMPLATE-EXAMPLES.md) - Copy-paste ready templates with patterns
- [Settings Reference](SETTINGS.md) - Configure template behavior
- [Handlebars Documentation](https://handlebarsjs.com/) - Official Handlebars guide
