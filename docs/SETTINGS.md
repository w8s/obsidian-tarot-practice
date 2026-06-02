# Settings Reference

Complete reference for all Tarot Practice plugin settings.

Settings are organized into logical sections for easy navigation. Access all settings in Obsidian via Settings → Tarot Practice.

---

## Table of Contents

- [Deck Management](#deck-management)
- [Deck Preparation](#deck-preparation)
- [Daily Practice](#daily-practice)
- [Templates](#templates)
- [Reversals](#reversals)
- [Spreads](#spreads)

---

## Deck Management

Settings for managing your deck collection. Add custom decks, set defaults, and control deck persistence across spreads.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Default deck** | Dropdown | Rider-Waite-Smith | The deck used when no spread-specific deck is set |
| **Remember last deck per spread** | Toggle | On | Each spread remembers the last deck used; when disabled, always use default deck |

### Available Decks

The plugin comes with Rider-Waite-Smith tarot (78 cards) built-in. Additional decks can be installed from JSON or ZIP files.

**Installing Decks:**

Two installation formats supported:

1. **ZIP Package** (recommended) - Complete deck with images
    - Contains `deck.json` in root + `cards/` folder with images
    - Images auto-extract to vault: `Templates/Tarot/Decks/{deck-id}/cards/`
    - Works with Obsidian wikilinks: `![[path/to/image.jpg]]`
    - Supports optional `sourceUrl` for image restoration

2. **JSON File** - Deck definition only (no images)
    - Lightweight option for text-only readings
    - Can reference external image paths if needed

**Installation Steps:**

1. Click "Add deck" button in Deck Management section
2. Select a `.json` or `.zip` file
3. Plugin validates deck structure and extracts content
4. Images (if present) are copied to your vault
5. Deck appears in available decks list

**Deck Actions:**

- **View details** (document icon) - See full card list, metadata, and deck info
    - Card list shows all cards with index numbers
    - Metadata displays author, year, publisher, tradition
    - "Restore images" button (if deck has sourceUrl and images were deleted)
- **Remove** (trash icon) - Delete custom decks
    - Removes both deck definition and vault images
    - Built-in decks cannot be removed
    - Confirmation required before deletion

**Image Restoration:**

If a deck includes a `sourceUrl` (typically a GitHub release URL), you can restore deleted images:

1. Open deck details via "View details" button
2. Click "Restore images" button
3. Plugin downloads ZIP from sourceUrl
4. Images re-extract to vault location
5. No need to re-import entire deck

**Download Additional Decks:**

Free public domain decks available from [obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks):

- Elder Futhark Runes (24 cards) - ZIP with images
- Petit Lenormand (36 cards) - ZIP with images
- Playing Cards (52 cards) - ZIP with images
- I Ching (64 hexagrams) - JSON only

**Creating Custom Decks:**

1. Click "Export example deck" to get a template
2. Edit the JSON with your cards and metadata
3. **For ZIP format:**
    - Create `cards/` folder with your images
    - Place `deck.json` in root of ZIP
    - Images should match paths in card definitions (e.g., `cards/00-fool.jpg`)
    - Optionally add `sourceUrl` for future restoration
4. **For JSON format:**
    - Just edit the deck.json file
    - Can include image paths pointing to vault files
5. Import via "Add deck" button

**ZIP Structure Example:**

```
my-deck.zip
├── deck.json           (required: deck definition)
└── cards/              (optional: card images)
    ├── 00-fool.jpg
    ├── 01-magician.jpg
    └── ...
```

**Image Path Resolution:**

When a deck is installed from ZIP:

- Images extract to: `{templateBaseFolder}/Decks/{deck-id}/cards/`
- Default location: `Templates/Tarot/Decks/{deck-id}/cards/`
- deck.json uses relative paths: `"imageUrl": "cards/00-fool.jpg"`
- Plugin resolves to full vault path at render time
- Works with Obsidian's `![[image]]` syntax in templates

See [Creating Decks](https://github.com/w8s/obsidian-tarot-decks/blob/master/CREATING-DECKS.md) for complete documentation including:

- JSON schema and validation rules
- ZIP packaging guidelines
- Image format recommendations
- sourceUrl best practices

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

Settings for customizing how card draws appear in your notes. All spreads use Handlebars templates with access to template variables.

### Built-in vs Custom Templates

Each spread can use either:

- **Built-in template** - Default formatting provided by the plugin
- **Custom template** - Your own Handlebars template file from the vault

### Spread Templates

Every spread (including Daily Draw, Single Card, etc.) has its own template that can be customized:

1. Navigate to Settings → Spreads
2. Find the spread you want to customize
3. Click "Customize" or "Edit"
4. Select "Custom template" to choose your own file
5. Or modify the built-in template directly

**Template organization:**

- Spread templates are managed per-spread in the Spreads section
- Each spread remembers its template choice
- Templates automatically reload when files change

For template syntax and examples, see:

- [Template Variables](TEMPLATE-VARIABLES.md) - All available variables
- [Template Examples](TEMPLATE-EXAMPLES.md) - Patterns organized by insert mode

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
**Card:** {{name}} {{orientation}}
```
Output examples:

- Upright (empty indicator): "The Fool"
- Upright (with "upright"): "The Fool upright"  
- Reversed: "The Hermit reversed"

---

## Spreads

Settings for managing built-in and custom spreads. Import and export spreads to share with the community.

### Spread Management Actions

**General Actions:**

- **Create spread** - Design your own custom spread layout
- **Import spread** - Install spreads from JSON or ZIP files
- **Export example spread** - Download template to learn format

**Per-Spread Actions (Built-in):**

- **View** - Preview spread definition and template
- **Customize** - Override shuffle/cut/template settings
- **Reset** - Restore to default settings
- *(Cannot delete built-in spreads)*

**Per-Spread Actions (Custom):**

- **View** - Preview spread definition
- **Edit** - Modify positions and settings
- **Export** - Share spread as JSON or ZIP
- **Delete** - Permanently remove custom spread

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

### Importing and Exporting Spreads

**Importing Spreads:**

Spreads can be imported from JSON or ZIP files shared by the community.

1. Click "Import spread" in Spreads section
2. Select a `.json` or `.zip` file
3. Plugin validates spread structure
4. Spread installs and appears in your list

**Import Formats:**

- **JSON file** - Spread definition only
    - Lightweight format
    - Uses built-in template or customize later
- **ZIP file** - Spread definition + custom template
    - Complete package ready to use
    - Template extracts to: `{templateBaseFolder}/Spreads/{spread-id}/template.md`
    - Template automatically linked to spread

**Validation:**

- Checks required fields (id, name, positions)
- Verifies position structure (labels required)
- Ensures ID is unique
- Shows clear error messages if validation fails

**Exporting Spreads:**

Share your custom spreads with the community.

1. Find custom spread in list
2. Click "Export" button (download icon)
3. Choose format:
    - **JSON only** - Spread definition without template
    - **ZIP with template** - Includes spread.json + template.md
4. File downloads to your computer
5. Share via GitHub, Discord, forums, etc.

**Export Format Selection:**

- **JSON only** - Best for simple spreads using default templates
- **ZIP with template** - Best for spreads with specialized formatting

**Example Use Cases:**

- Create specialized spreads for specific questions
- Share traditional spread layouts with the community
- Collaborate on spread designs with study groups
- Build personal spread libraries

For complete documentation on sharing spreads, see:

- [Usage Guide - Sharing Spreads](USAGE.md#sharing-spreads) - Import/export workflows
- Export example spread to see JSON structure

### Template Variables for Spreads

Spread templates have access to these variables:

- `{{spread_name}}` - Name of the spread
- `{{cards}}` - Array of card objects for loops
- `{{cards.0.name}}` - Access specific card by index
- `{{cards.0.position.label}}` - Position label for card
- `{{cards.0.position.number}}` - Position number (1-based)
- `{{cards.0.orientation}}` - Card orientation (if reversals enabled)

**Example spread template:**

```markdown
## {{spread_name}} - {{date}}

**Intention:** {{{intention}}}

{{#each cards}}
**{{position.label}}:** {{name}} {{orientation}}
{{/each}}
```

For complete template documentation, see:

- [Template Variables](TEMPLATE-VARIABLES.md) - All available variables
- [Template Examples](TEMPLATE-EXAMPLES.md) - Copy-paste ready patterns

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
