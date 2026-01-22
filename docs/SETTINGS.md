# Settings Reference

Complete reference for all Tarot Practice plugin settings.

Settings are organized into logical sections for easy navigation. Access all settings in Obsidian via Settings → Tarot Practice.

---

## Table of Contents

- [Deck Preparation](#deck-preparation)
- [Daily Practice](#daily-practice)
- [Templates](#templates)
- [Reversals](#reversals)
- [Spreads](#spreads)

---

## Deck Preparation

Settings that control how the deck is prepared before drawing cards. These are global defaults that apply to all draws unless overridden by individual spread settings.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Number of shuffles** | Number (1-7) | 3 | How many times to shuffle the deck before drawing |
| **Cut deck** | Toggle | On | Whether to cut the deck after shuffling using intention-based positioning |

### Details

**Number of shuffles:**
- Minimum: 1 shuffle
- Maximum: 7 shuffles
- Recommended: 3 shuffles (traditional)
- Each shuffle uses cryptographically secure Fisher-Yates algorithm

**Cut deck:**
- When enabled, your intention influences the cut position
- Cut position includes natural ±10% variance for authenticity
- Metadata captures: cut position, base percentage, variance applied
- Can be disabled if you prefer shuffle-only preparation

---

## Daily Practice

Settings for daily tarot draws that appear in your daily notes.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Number of cards** | Number (1-78) | 1 | How many cards to draw for daily practice |
| **Use daily note** | Toggle | On | Auto-create daily notes when no file is open |
| **Daily note path pattern** | Text | `YYYY-MM-DD.md` | Where daily notes are created (Moment.js format) |
| **Insert location** | Dropdown | Append to end | Where to insert the draw in your note |
| **Heading name** | Text | *(empty)* | Which heading to insert under (auto-created if missing) |

### Details

**Number of cards:**
- Range: 1 to 78 cards
- Single card is most common for daily practice
- Multiple cards use the "Multiple cards template"

**Use daily note:**
- When enabled: Creates daily note if no file is open
- When disabled: Always inserts into current file
- Daily notes follow the path pattern specified below

**Daily note path pattern:**
- Supports Moment.js format tokens
- Examples:
  - `YYYY-MM-DD.md` → `2026-01-21.md`
  - `Daily/YYYY-MM-DD.md` → `Daily/2026-01-21.md`
  - `YYYY/MM-DD.md` → `2026/01-21.md`
  - `YYYY-[W]WW.md` → `2026-W04.md` (weekly notes)

**Insert location:**
- **Append to end** - Adds draw at bottom of note
- **Prepend to beginning** - Adds draw at top of note
- **Under heading** - Inserts under specific heading (uses "Heading name" setting)

**Heading name:**
- Only used when Insert location = "Under heading"
- Heading is auto-created if it doesn't exist
- Use format: `## My Heading` or just `My Heading`
- Leave empty to disable heading-based insertion

---

## Templates

Settings for customizing draw output formatting. Templates use Handlebars syntax with template variables.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Daily practice template** | File selector | Built-in | Template for daily draws |
| **Inline practice template** | File selector | Built-in | Template for single inline cards |
| **Multiple cards template** | File selector | Built-in | Template for multiple inline cards |
| **Template base folder** | Text | `Templates/Tarot` | Where custom templates are stored |

### Template Actions

Each template has three action buttons:

- **📄 View** - Preview the current template content
- **✏️ Edit** - Select a custom template file from your vault
- **🔄 Reset** - Revert to built-in default template

### Details

**Template types:**

1. **Daily practice template**
   - Used for: Daily tarot draws (sparkles icon or "Draw daily tarot" command)
   - Card count: Controlled by "Number of cards for daily practice" setting
   - Default format: Shows intention, card(s), date/time

2. **Inline practice template**
   - Used for: "Inline draw tarot card" command
   - Card count: Always 1 card
   - Default format: Minimal formatting for quick inline draws

3. **Multiple cards template**
   - Used for: "Inline draw multiple tarot cards" command
   - Card count: User chooses at draw time (1-78)
   - Default format: Numbered list of cards with intention

**Template base folder:**
- Where the plugin looks for custom templates
- Subfolders are organized automatically:
  - `Templates/Tarot/Spreads/` - Spread templates
  - `Templates/Tarot/Daily/` - Daily practice templates
  - `Templates/Tarot/Inline/` - Inline draw templates
  - `Templates/Tarot/Multiple/` - Multiple card templates
- Change this to match your vault's template organization

**Using custom templates:**
1. Create a `.md` file anywhere in your vault
2. Add template variables using Handlebars syntax
3. Click "Edit" button next to template type
4. Select your custom template file
5. Template automatically reloads when file changes

**Reverting to defaults:**
- Click "Reset" button to restore built-in template
- Your custom template file is not deleted
- Can switch back to custom template anytime

For template syntax and variables, see:
- [Template Variables](TEMPLATE-VARIABLES.md)
- [Template Examples](TEMPLATE-EXAMPLES.md)

---

## Reversals

Settings for reversed card appearances in readings.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Enable reversals** | Toggle | Off | Allow cards to appear reversed in readings |
| **Reversal chance** | Slider (0-100%) | 50% | Probability that any given card is reversed |
| **Upright indicator** | Text | *(empty)* | Text shown for upright cards |
| **Reversed indicator** | Text | `"reversed"` | Text shown for reversed cards |

### Details

**Enable reversals:**
- When off: All cards appear upright (no orientation checking)
- When on: Each card is randomly checked for reversal
- Affects all draw types (daily, inline, spreads)

**Reversal chance:**
- Range: 0% (never reversed) to 100% (always reversed)
- Default: 50% (traditional equal probability)
- Examples:
  - 0% → All cards upright
  - 25% → 1 in 4 cards reversed
  - 50% → Equal chance upright/reversed
  - 75% → 3 in 4 cards reversed
  - 100% → All cards reversed

**Indicators:**
- **Upright indicator**: Added after card name for upright cards
  - Default: empty (nothing added)
  - Example: Set to `"upright"` → "The Fool upright"
  - Common choice: Leave empty for cleaner output
  
- **Reversed indicator**: Added after card name for reversed cards
  - Default: `"reversed"`
  - Example: "The Hermit reversed"
  - Alternative: `"(R)"`, `"↓"`, `"inverted"`

**Template usage:**
The `{{orientation}}` variable contains the appropriate indicator:
```markdown
**Card:** {{card}} {{orientation}}
```
Output examples:
- Upright (empty indicator): "The Fool"
- Upright (with "upright"): "The Fool upright"  
- Reversed: "The Hermit reversed"

---

## Spreads

Settings for managing built-in and custom spreads.

### Built-in Spreads

Five traditional spreads included by default:

| Spread Name | Cards | Positions |
|-------------|-------|-----------|
| **Single Card** | 1 | General guidance |
| **Three Card - Past/Present/Future** | 3 | Timeline reading |
| **Three Card - Situation/Action/Outcome** | 3 | Decision making |
| **Five Card - Week Ahead** | 5 | Monday through Friday forecast |
| **Celtic Cross** | 10 | Comprehensive 10-position layout |

### Customization Options

Each spread (built-in or custom) can be customized:

**Deck Preparation Override:**
- Use custom shuffle count (different from global default)
- Enable/disable deck cutting
- Overrides global Deck Preparation settings

**Template Override:**
- Use custom Handlebars template for this spread
- Click "Create from Example" to start with built-in template
- Template stored in `Templates/Tarot/Spreads/`

**Built-in Spread Actions:**
- **View** - Preview spread definition and template
- **Customize** - Override shuffle/cut/template settings
- **Reset** - Restore to default settings
- *(Cannot delete built-in spreads)*

**Custom Spread Actions:**
- **View** - Preview spread definition
- **Edit** - Modify positions and settings
- **Delete** - Permanently remove custom spread
- **Duplicate** - Create copy to customize

### Creating Custom Spreads

1. Click "Create Custom Spread" in Spreads section
2. Define spread properties:
   - **Name** - Display name for spread
   - **Description** - Optional purpose description
   - **Positions** - Add position definitions:
     - Position name (e.g., "Past", "Challenge", "Outcome")
     - Position description (optional guidance)
3. Configure deck preparation (optional):
   - Override shuffle count
   - Override cut deck setting
4. Choose template (optional):
   - Use default spread template
   - Create from example
   - Select custom template file

**Position Examples:**
- Timeline: "Past", "Present", "Future"
- Decision: "Current Situation", "Action to Take", "Likely Outcome"
- Celtic Cross: "Present", "Challenge", "Past", "Future", "Above", "Below", "Advice", "External", "Hopes/Fears", "Outcome"

### Template Variables for Spreads

Spread templates have access to additional variables:

- `{{spread_name}}` - Name of the spread
- `{{cards}}` - Array of card objects for loops
- `{{cards.[0].name}}` - Access specific card by index
- `{{cards.[0].position}}` - Position label for card
- `{{cards.[0].orientation}}` - Card orientation (if reversals enabled)

**Example spread template:**
```markdown
## {{spread_name}} - {{date}}

**Intention:** {{intention}}

{{#each cards}}
**{{position}}:** {{name}} {{orientation}}
{{/each}}
```

For spread template examples, see [Spread Templates](spread-templates/README.md).

---

## Tips & Tricks

### Workflow Optimization
- Assign hotkeys to frequently used commands (Settings → Hotkeys)
- Use heading-based insertion for organized daily notes
- Create custom templates for different reading contexts

### Template Management
- Store all templates in one folder for easy backup
- Use descriptive filenames: `daily-detailed.md`, `spread-celtic-cross.md`
- Test templates with different card combinations

### Spread Customization
- Override shuffle count for significant readings (e.g., 7 shuffles for Celtic Cross)
- Create spreads for specific questions (relationship, career, etc.)
- Document position meanings in spread descriptions

### Mobile Usage
- Daily draws work seamlessly on mobile
- Spread selection works via touch interface
- Custom templates sync across devices via Obsidian Sync

---

## Related Documentation

- [Template Variables](TEMPLATE-VARIABLES.md) - Complete variable reference
- [Template Examples](TEMPLATE-EXAMPLES.md) - Copy-paste ready templates
- [Usage Guide](USAGE.md) - Detailed usage instructions
- [Changelog](../CHANGELOG.md) - Version history
