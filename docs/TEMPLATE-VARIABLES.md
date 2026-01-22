# Template Variables

Complete reference for all template variables available in Tarot Practice templates.

Templates use **Handlebars** syntax for advanced formatting including loops, conditionals, and helpers.

---

## Table of Contents

- [Card Variables](#card-variables)
- [Multiple Card Variables](#multiple-card-variables)
- [Spread Variables](#spread-variables)
- [Date & Time Variables](#date--time-variables)
- [Draw Metadata Variables](#draw-metadata-variables)
- [Handlebars Syntax](#handlebars-syntax)
- [Examples](#examples)

---

## Card Variables

Variables for individual card information. Available in all draw types.

| Variable | Type | Description | Example Output |
|----------|------|-------------|----------------|
| `{{card}}` | String | Card name | `"The Hermit"` |
| `{{index}}` | Number | Card index (0-77) | `9` |
| `{{orientation}}` | String | Upright/reversed indicator | `"reversed"` or `""` |
| `{{intention}}` | String | Your intention text | `"What do I need to know today?"` |

### Details

**`{{card}}`**
- Full card name from Rider-Waite-Smith deck
- Major Arcana: "The Fool", "The Magician", etc.
- Minor Arcana: "Ace of Wands", "Two of Cups", "King of Swords", etc.
- Always capitalized

**`{{index}}`**
- Zero-based index (0-77)
- Major Arcana: 0-21
- Wands: 22-35
- Cups: 36-49
- Swords: 50-63
- Pentacles: 64-77
- Useful for analytics or sorting

**`{{orientation}}`**
- Contains the indicator text from settings
- If reversals disabled: Always empty string `""`
- If upright: Contains "Upright indicator" setting (default: `""`)
- If reversed: Contains "Reversed indicator" setting (default: `"reversed"`)
- Use in templates: `{{card}} {{orientation}}`

**`{{intention}}`**
- Exactly as you typed it
- Preserves capitalization, punctuation, line breaks
- Can be multi-line if entered that way

---

## Multiple Card Variables

Additional variables available when drawing multiple cards (inline multiple or daily with count > 1).

| Variable | Type | Description | Example Output |
|----------|------|-------------|----------------|
| `{{card_count}}` | Number | Number of cards drawn | `3` |
| `{{cards}}` | String | Pre-formatted numbered list | See below |

### Details

**`{{card_count}}`**
- Total number of cards in this draw
- Useful for conditional formatting
- Range: 1-78

**`{{cards}}`**
- Auto-formatted numbered list of all cards
- Format: `1. Card Name orientation\n2. Card Name orientation\n...`
- Example output:
  ```
  1. The Fool
  2. The Hermit reversed
  3. The Tower
  ```
- Each card on its own line
- Includes orientation indicators
- Ready to use directly in templates

**Note:** For spreads, use the spread-specific `{{cards}}` array instead (see [Spread Variables](#spread-variables)).

---

## Spread Variables

Variables available in spread templates (Handlebars templates only).

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{spread_name}}` | String | Name of the spread | `"Celtic Cross"` |
| `{{cards}}` | Array | Array of card objects | See below |
| `{{cards.[0]}}` | Object | First card object | See below |
| `{{cards.[0].name}}` | String | Card name | `"The Fool"` |
| `{{cards.[0].position}}` | String | Position label | `"Past"` |
| `{{cards.[0].orientation}}` | String | Orientation indicator | `"reversed"` |
| `{{cards.[0].index}}` | Number | Card index | `0` |

### Card Object Structure

Each card in the `{{cards}}` array contains:

```javascript
{
  name: "The Hermit",           // Card name
  position: "Present",          // Position in spread
  orientation: "reversed",      // Orientation indicator (or "")
  index: 9                      // Card index (0-77)
}
```

### Using Loops

Iterate through all cards in a spread:

```handlebars
{{#each cards}}
**{{position}}:** {{name}} {{orientation}}
{{/each}}
```

Output:
```markdown
**Past:** The Fool
**Present:** The Hermit reversed
**Future:** The Tower
```

### Accessing Specific Cards

```handlebars
First card: {{cards.[0].name}}
Second card: {{cards.[1].name}}
Last card: {{cards.[2].name}}
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

### Conditionals

```handlebars
{{#if orientation}}
This card is {{orientation}}!
{{else}}
This card is upright.
{{/if}}
```

### Loops

```handlebars
{{#each cards}}
{{@index}}. {{name}} - {{position}}
{{/each}}
```

### Comments

```handlebars
{{!-- This is a comment, won't appear in output --}}
```

### Helpers

Built-in Handlebars helpers:
- `{{#if}}` - Conditional block
- `{{#unless}}` - Inverted conditional
- `{{#each}}` - Loop over array
- `{{#with}}` - Change context
- `@index` - Current loop index (0-based)
- `@first` - True if first item in loop
- `@last` - True if last item in loop

Full reference: [Handlebars Guide](https://handlebarsjs.com/guide/)

---

## Examples

### Minimal Daily Draw

```markdown
- {{time}}: [[{{card}}]] {{orientation}} - {{intention}}
```

Output:
```markdown
- 3:45 PM: [[The Hermit]] reversed - What do I need to know today?
```

### Journal Style

```markdown
### Daily Tarot

> {{intention}}

**Card:** {{card}} {{orientation}}  
**Date:** {{date:MMMM D, YYYY}}
**Time:** {{time}}

---
```

### With Full Metadata

```markdown
## Tarot Draw - {{datetime:YYYY-MM-DD HH:mm}}

**Intention:** {{intention}}  
**Card:** {{card}} {{orientation}}  
**Index:** {{index}}

**Draw Details:**
- Shuffles: {{shuffle_count}}
- Cut: {{was_cut}} at {{cut_position}} (card {{cut_position_cards}})
- RNG: {{cut_base}} + variance {{cut_variance}}

---
```

### Multiple Cards

```markdown
## {{card_count}}-Card Draw - {{date}}

**Intention:** {{intention}}

{{cards}}

*Drawn at {{time}}*
```

### Three-Card Spread

```markdown
## {{spread_name}} - {{datetime}}

**Intention:** {{intention}}

{{#each cards}}
### {{position}}
{{name}} {{orientation}}

{{/each}}

---
*Shuffled {{shuffle_count}}x, cut at {{cut_position}}*
```

### Celtic Cross with Sections

```markdown
## {{spread_name}}
**Date:** {{date:dddd, MMMM Do YYYY}}  
**Intention:** {{intention}}

### The Cross
{{#each cards}}
{{#if @first}}**1. {{position}}:** {{name}} {{orientation}}{{/if}}
{{#if (eq @index 1)}}**2. {{position}}:** {{name}} {{orientation}}{{/if}}
{{#if (eq @index 2)}}**3. {{position}}:** {{name}} {{orientation}}{{/if}}
{{#if (eq @index 3)}}**4. {{position}}:** {{name}} {{orientation}}{{/if}}
{{#if (eq @index 4)}}**5. {{position}}:** {{name}} {{orientation}}{{/if}}
{{#if (eq @index 5)}}**6. {{position}}:** {{name}} {{orientation}}{{/if}}
{{/each}}

### The Staff
{{#each cards}}
{{#if (eq @index 6)}}**7. {{position}}:** {{name}} {{orientation}}{{/if}}
{{#if (eq @index 7)}}**8. {{position}}:** {{name}} {{orientation}}{{/if}}
{{#if (eq @index 8)}}**9. {{position}}:** {{name}} {{orientation}}{{/if}}
{{#if @last}}**10. {{position}}:** {{name}} {{orientation}}{{/if}}
{{/each}}
```

### Conditional Orientation

```markdown
**Card:** {{card}}{{#if orientation}} ({{orientation}}){{/if}}
```

Output when upright (empty indicator):
```markdown
**Card:** The Fool
```

Output when reversed:
```markdown
**Card:** The Fool (reversed)
```

---

## Related Documentation

- [Template Examples](TEMPLATE-EXAMPLES.md) - More copy-paste ready templates
- [Spread Templates](spread-templates/README.md) - Spread-specific examples
- [Settings Reference](SETTINGS.md) - Configure template behavior
- [Handlebars Documentation](https://handlebarsjs.com/) - Official Handlebars guide
