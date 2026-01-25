# Usage Guide

Detailed instructions for using Tarot Practice plugin in Obsidian.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Installing Custom Decks](#installing-custom-decks)
- [Daily Practice](#daily-practice)
- [Spread Draws](#spread-draws)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Common Workflows](#common-workflows)
- [Tips & Tricks](#tips--tricks)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Draw

After installing and enabling the plugin:

1. **Open command palette** (⌘P on Mac, Ctrl+P on Windows/Linux)
2. **Type** "Draw daily tarot"
3. **Press Enter**
4. **Enter your intention** when prompted (e.g., "What do I need to know today?")
5. **Press Enter** to confirm

Your card will appear in:
- Current note if one is open
- Today's daily note if no note is open (created automatically)

### Customizing Settings

Access settings via Settings → Tarot Practice to configure:
- Number of cards to draw
- Where draws appear
- Template formatting
- Deck preparation options
- Reversal settings

See [Settings Reference](SETTINGS.md) for complete options.

---

## Installing Custom Decks

The plugin supports custom decks from ZIP packages or JSON files. ZIP packages are recommended as they include card images that display in your readings.

### Downloading Decks

**Free public domain decks available from [obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks):**

1. **Elder Futhark Runes** (24 runes) - Norse divination
2. **Petit Lenormand** (36 cards) - French cartomancy
3. **Playing Cards** (52 cards) - Standard deck divination
4. **I Ching** (64 hexagrams) - Ancient Chinese oracle

**To download:**
1. Visit the [releases page](https://github.com/w8s/obsidian-tarot-decks/releases)
2. Find the deck you want
3. Download the ZIP file to your computer
4. Remember where you saved it

### Installing a Deck

**Process:**

1. **Open Settings** → Tarot Practice → Deck Management
2. **Click** "Add deck" button
3. **Select** the downloaded ZIP file (or JSON file)
4. **Wait** for validation and extraction
5. **Success!** Deck appears in available decks list

**What happens during installation:**

For ZIP packages:
- Plugin validates deck structure
- Extracts `deck.json` to plugin directory
- Extracts card images to vault: `Templates/Tarot/Decks/{deck-id}/cards/`
- Images work with Obsidian wikilinks: `![[path/to/card.jpg]]`

For JSON files:
- Plugin validates deck structure
- Saves deck definition only (no images)

**Validation checks:**
- Required fields present (id, name, cards)
- Card indices are sequential (0, 1, 2...)
- No duplicate card indices
- Card count matches array length
- If validation fails, you'll see specific error messages

### Using Your New Deck

Once installed, select your deck for readings:

**Method 1: Set as default**
1. Settings → Deck Management
2. Default deck → Select your new deck
3. All future readings use this deck

**Method 2: Choose per spread**
1. Run "Draw tarot spread"
2. Dropdown shows all available decks
3. Select deck for this reading
4. Plugin remembers choice for this spread (if "Remember last deck" is enabled)

**Example with Elder Futhark Runes:**
```markdown
## Rune Draw - 1/25/2026

**Deck:** Elder Futhark Runes
**Intention:** What energy do I need today?

**Rune:** ![[Templates/Tarot/Decks/elder-futhark/cards/ansuz.png]]
**Ansuz** - Communication, divine inspiration

The rune of Odin, suggesting messages and wisdom...
```

### Viewing Deck Details

**To see what's in a deck:**

1. Settings → Deck Management
2. Find deck in list
3. Click document icon (View details)
4. See:
   - Card count and reversal support
   - Complete card list with indices
   - Metadata (author, year, publisher, tradition)
   - "Restore images" button (if deck has sourceUrl)

### Restoring Deck Images

If you accidentally delete deck images or want to re-download them:

**Process:**

1. Settings → Deck Management
2. Find deck in list
3. Click document icon (View details)
4. Click "Restore images" button (if available)
5. Plugin downloads ZIP from sourceUrl
6. Images re-extract to vault
7. No need to re-import entire deck

**Note:** Only works for decks that include a `sourceUrl` field (typically GitHub releases)

### Removing Decks

**To uninstall a custom deck:**

1. Settings → Deck Management
2. Find deck in list
3. Click trash icon
4. Confirm deletion
5. Both deck definition and images are removed

**Note:** Built-in decks (like Rider-Waite-Smith) cannot be removed

---

## Daily Practice

The **Daily Draw** spread is designed for regular tarot practice that automatically integrates with your daily notes.

### Using Daily Draw

**To draw your daily card:**

1. **Click** the sparkles ✨ icon in the left sidebar, or
2. **Run** "Draw tarot spread" from command palette
3. **Select** "Daily Draw" from the spread list
4. **Enter** your intention
5. Card appears in your daily note

**Quick tip:** Assign a hotkey in Settings → Hotkeys for one-click access!

### Where It Appears

The Daily Draw spread automatically inserts into your daily note. Location is controlled by Settings → Daily Practice → Insert location:

**Option 1: Append to end** (default)
- Adds draw at bottom of note
- Best for: Chronological journal style
- Multiple draws stack from top to bottom

**Option 2: Prepend to beginning**
- Adds draw at top of note
- Best for: "Most recent first" style
- New draws appear above older draws

**Option 3: Under heading**
- Inserts under specific heading (e.g., `## Tarot`)
- Heading auto-created if missing
- Best for: Organized note structure with sections

**Example heading-based insertion:**

Your note before:
```markdown
## Morning Routine
- Wake up at 6am
- Meditate

## Tarot

## Evening Review
- Gratitude list
```

After draw (inserts under `## Tarot`):
```markdown
## Morning Routine
- Wake up at 6am
- Meditate

## Tarot

### Tarot draw - 1/21/2026 8:30 AM
**Intention:** What do I need to know today?
**Card:** The Hermit reversed

## Evening Review
- Gratitude list
```

### Daily Note Creation

When enabled (Settings → Daily Practice → Use daily note):

**Auto-creates daily notes:**
- Only when no file is open
- Follows path pattern: `YYYY-MM-DD.md` (default)
- Creates in root of vault or subfolder

**Path pattern examples:**
- `YYYY-MM-DD.md` → `2026-01-21.md` (root folder)
- `Daily/YYYY-MM-DD.md` → `Daily/2026-01-21.md` (Daily subfolder)
- `Journal/YYYY/MM-DD.md` → `Journal/2026/01-21.md` (nested folders)
- `YYYY-[W]WW.md` → `2026-W04.md` (weekly notes)

**When disabled:**
- Always inserts into current file
- Shows error if no file is open
- Must manually create notes

### Customizing Card Count

The Daily Draw spread can pull multiple cards. Change this in Settings → Daily Practice → Number of cards:

**Single card (default: 1)**
- One card for daily guidance

**Multiple cards (2-78)**
- Multiple cards for deeper daily reflection
- All cards share the same intention

**Example 3-card daily draw:**
```markdown
## Tarot draw - 1/21/2026 8:30 AM

**Intention:** Show me the day ahead
**Cards drawn:** 3

1. The Fool
2. The Hermit reversed
3. The Tower

---
```

---

## Spread Draws

Structured multi-card layouts with predefined position meanings.

### Using Built-in Spreads

**Process:**
1. **Command palette** → "Draw tarot spread"
2. **Select spread** from dropdown
3. **Enter intention**
4. Spread appears in current note

**Built-in spreads:**

| Spread | Cards | Use Case |
|--------|-------|----------|
| **Single Card** | 1 | Quick daily guidance |
| **Three Card - Past/Present/Future** | 3 | Timeline perspective |
| **Three Card - Situation/Action/Outcome** | 3 | Decision making |
| **Five Card - Week Ahead** | 5 | Weekly forecast (Mon-Fri) |
| **Celtic Cross** | 10 | Comprehensive life reading |

**Where it appears:**
- Always in current note at cursor position
- If no note open, shows error
- Uses spread-specific template

### Reading for Someone Else (Querent)

When doing a reading for another person, you can track who the reading is for:

**Process:**
1. **Command palette** → "Draw tarot spread"
2. **Select spread** from dropdown
3. **Enter intention**
4. **Check** "Reading for someone else?"
5. **Enter querent name** (required) - e.g., "Sarah Chen"
6. **Enter note path** (optional) - e.g., "People/Sarah Chen"
7. Spread includes querent information

**How it appears in your note:**

With note path (creates wikilink):
```markdown
# Three Card - Past/Present/Future

**Querent:** [[People/Sarah Chen|Sarah Chen]]
**Intention:** What career path should I consider?
**Date:** 1/24/2026
```

Without note path:
```markdown
# Single Card

**Querent:** Alex Martinez
**Intention:** Daily guidance
**Date:** 1/24/2026
```

**Tips:**
- **Note path** creates a backlink from your reading to the person's note
- Useful for tracking readings for specific people over time
- Leave querent unchecked for your own readings
- Querent only appears in output if you check the box

**Use cases:**
- Professional tarot readers tracking client readings
- Reading for friends and family
- Practice readings with study partners
- Linking readings to People notes in your vault

### Creating Custom Spreads

**When to use:**
- Specialized questions (career, relationship, etc.)
- Personal spread designs
- Adapting traditional spreads

**Steps:**

1. **Open settings** → Tarot Practice → Spreads
2. **Click** "Create Custom Spread"
3. **Fill in details:**
   - Name: "Career Path Spread"
   - Description: "Exploring career decisions"
4. **Add positions:**
   - Click "Add Position"
   - Name: "Current Role"
   - Description: "Where you are now"
   - Repeat for each position
5. **Configure** (optional):
   - Override shuffle count
   - Override cut deck setting
   - Select custom template
6. **Save**

**Example custom spread:**

```
Name: "Relationship Spread"
Description: "Understanding relationship dynamics"

Positions:
1. "My Perspective" - How I view the relationship
2. "Their Perspective" - How they might view it
3. "Current Dynamic" - The energy between us
4. "Challenge" - What needs attention
5. "Guidance" - Path forward
```

### Customizing Spreads

**Per-spread settings:**

Each spread can override global deck preparation:
- Different shuffle count (e.g., 7 for important readings)
- Enable/disable cutting
- Custom template formatting

**Example use:**
- Celtic Cross: 7 shuffles (more thorough)
- Single Card: 1 shuffle (quick guidance)
- Custom spread: No cutting (personal preference)

**To customize:**
1. Settings → Spreads
2. Find spread in list
3. Click "Customize"
4. Change settings
5. Save

### Spread Templates

Spreads use Handlebars templates for flexible formatting. Each spread can use a custom template or the built-in default.

**To customize a spread template:**
1. Settings → Spreads
2. Find spread in list
3. Click "Edit"
4. Modify template
5. Save

For complete template documentation, see:
- [Template Variables](TEMPLATE-VARIABLES.md) - All available variables
- [Template Examples](TEMPLATE-EXAMPLES.md) - Copy-paste ready templates organized by insert mode

---

## Keyboard Shortcuts

Assign hotkeys for faster access to common commands.

### Setting Up Hotkeys

1. **Open** Settings → Hotkeys
2. **Search** for "tarot"
3. **Click** on command to assign
4. **Press** desired key combination
5. **Repeat** for other commands

### Recommended Shortcuts

| Command | Suggested Hotkey | Use Case |
|---------|-----------------|----------|
| Draw tarot spread | `⌘⇧T` or `Ctrl+Shift+T` | All spreads including Daily Draw |

**Tips:**
- Assign this to quickly access any spread
- Daily Draw appears at top of spread list for easy selection

---

## Common Workflows

### Morning Routine

**Goal:** Daily card as part of morning journaling

**Workflow:**
1. Open today's daily note (or let plugin create it)
2. Run "Draw tarot spread" → Select "Daily Draw"
3. Enter intention: "What do I need to know today?"
4. Card appears in note
5. Continue with morning journaling

**Quick tip:** Assign a hotkey to "Draw tarot spread" for faster access!

**Optimization:**
- Settings → Daily Practice → Insert location → "Under heading"
- Create `## Tarot` heading in daily note template
- Draws automatically organize under this heading

### Decision Making

**Goal:** Three-card spread for exploring a decision

**Workflow:**
1. Create new note or use journal
2. Write context about decision
3. Command: "Draw tarot spread"
4. Select: "Three Card - Situation/Action/Outcome"
5. Intention: Your specific question
6. Reflect on cards in context of decision

**Example note:**
```markdown
## Should I take the new job?

Context: Offered role at startup, higher pay but less stability.

[Three Card Spread]
- Situation: The Hermit
- Action: The Fool
- Outcome: The Star

Interpretation: ...
```

### Weekly Planning

**Goal:** Five-card week-ahead spread

**Workflow:**
1. Sunday evening or Monday morning
2. Open weekly note
3. Command: "Draw tarot spread"
4. Select: "Five Card - Week Ahead"
5. Intention: "Show me the week ahead"
6. Review throughout week

**Template customization:**
Create custom template with days:
```markdown
## Week of {{date:MMM D}}

{{#each cards}}
**{{position}}:** {{name}} {{orientation}}
{{/each}}
```

### Journaling Integration

**Goal:** Cards as journaling prompts

**Workflow:**
1. While journaling, pause for reflection
2. Position cursor mid-entry
3. Run "Draw tarot spread" → Select "Single Card"
4. Use card as prompt for deeper exploration
5. Continue writing

**Example:**
```markdown
Feeling stuck with creative project...

[Single Card draw: The Tower - "What's blocking me?"]

Realized I'm clinging to old ideas. The Tower suggests
necessary destruction of previous approach. Time to 
start fresh rather than patching old work.
```

---

## Tips & Tricks

### Template Customization

Templates control how card draws appear in your notes.

**Getting started:**
1. Start with built-in templates
2. View template: Settings → Templates → "View" button
3. Modify gradually based on your needs
4. Test with different spreads and card counts

**Template types by insert mode:**
- **Daily Note templates:** Optimized for appending to daily notes
- **Inline templates:** Compact for cursor-position insertion
- **New Note templates:** Full document formatting

For complete template patterns and examples, see [Template Examples](TEMPLATE-EXAMPLES.md).

### Organization Strategies

**By heading:**
- All draws under `## Tarot` heading
- Easy to find in long daily notes
- Can fold/unfold section

**By time:**
- Prepend draws (newest first)
- Or append (chronological order)
- Choose based on review preference

**Separate notes:**
- Create dedicated tarot note
- Link from daily note
- Example: `[[2026-01-21 Tarot]]`

### Mobile Usage

**Touch-friendly:**
- Commands work via command palette (tap search icon)
- Spread selection uses native dropdown
- Templates render correctly on mobile

**Optimization for mobile:**
- Use shorter templates (less scrolling)
- Set up daily note automation
- Use append/prepend (easier than heading nav)

**Sync:**
- Templates sync via Obsidian Sync or Git
- Settings sync across devices
- Custom spreads available everywhere

---

## Troubleshooting

### Daily Draw Not Appearing

**Problem:** Ran daily draw but nothing appeared

**Solutions:**
1. Check if file is open - plugin inserts into current file
2. Settings → Daily Practice → "Use daily note" - should be ON
3. Check insert location setting - might be at top/bottom
4. Scroll through note - might be far from cursor
5. Check console for errors (⌘⌥I / Ctrl+Shift+I)

### Wrong Template Used

**Problem:** Draw used unexpected template

**Solutions:**
1. Check which command you used:
   - "Draw daily tarot" → Daily template
   - "Draw tarot spread" → Spread-specific template
2. Settings → Templates → Verify template assignments
3. Click "View" to preview current template
4. Click "Reset" to restore default if customized

### Intention Not Saved

**Problem:** Typed intention but it doesn't appear in output

**Solutions:**
1. Check template includes `{{intention}}` variable
2. Verify you pressed Enter after typing (not Escape)
3. Try typing intention again
4. Check template with "View" button

### Cards Not Reversed

**Problem:** Reversals enabled but all cards upright

**Solutions:**
1. Settings → Reversals → "Enable reversals" - should be ON
2. Check "Reversal chance" - 0% means never reversed
3. Try setting to 50% and draw multiple times
4. Check template uses `{{orientation}}` variable

### Daily Note Not Created

**Problem:** Daily note doesn't auto-create

**Solutions:**
1. Settings → Daily Practice → "Use daily note" - should be ON
2. Check "Daily note path pattern" - verify format
3. Pattern must be valid Moment.js format
4. Test: Set pattern to `YYYY-MM-DD.md` (simple)
5. Check vault permissions (mobile: storage access)

### Spread Not Showing All Cards

**Problem:** Celtic Cross only showing some positions

**Solutions:**
1. Check template includes loop: `{{#each cards}}`
2. Verify template closed properly: `{{/each}}`
3. Try built-in template: Settings → Spreads → Reset
4. Count positions in spread definition (should be 10)

### Hotkey Conflicts

**Problem:** Assigned hotkey doesn't work

**Solutions:**
1. Check Settings → Hotkeys for conflicts
2. Try different key combination
3. Test in different note (some views block shortcuts)
4. Restart Obsidian if recently changed

### Template Changes Not Applying

**Problem:** Edited template but draws still use old format

**Solutions:**
1. Save template file
2. Settings → Templates → Click "View" to verify changes
3. May need to restart Obsidian
4. Check file path is correct
5. Try "Reset" then "Edit" again

---

## Related Documentation

- [Settings Reference](SETTINGS.md) - All configuration options
- [Template Variables](TEMPLATE-VARIABLES.md) - Complete variable list
- [Template Examples](TEMPLATE-EXAMPLES.md) - Copy-paste templates
- [Changelog](../CHANGELOG.md) - Version history and updates

---

**Need more help?**
- Check [GitHub Issues](https://github.com/w8s/obsidian-tarot-practice/issues)
- Ask in [Discussions](https://github.com/w8s/obsidian-tarot-practice/discussions)
- Review [Development Notes](AGENTS.md) for technical details
