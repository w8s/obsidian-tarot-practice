# Usage Guide

Detailed instructions for using Tarot Practice plugin in Obsidian.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Daily Practice](#daily-practice)
- [Inline Draws](#inline-draws)
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

## Daily Practice

Daily practice is designed for regular tarot readings that automatically integrate with your daily notes.

### Basic Daily Draw

**Three ways to trigger:**

1. **Ribbon icon** - Click sparkles ✨ in left sidebar
2. **Command palette** - "Draw daily tarot"
3. **Hotkey** - Assign in Settings → Hotkeys (recommended!)

**Process:**
1. Plugin checks if you have a note open
2. If yes → Inserts into current note
3. If no → Creates/opens daily note automatically
4. Shows modal for intention input
5. Draws cards and inserts formatted result
6. Shows notification with card(s) drawn

### Where It Appears

Controlled by Settings → Daily Practice → Insert location:

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

### Multiple Cards for Daily Practice

Change card count in Settings → Daily Practice → Number of cards:

**Single card (default: 1)**
- Uses "Daily practice template"
- Shows single card with intention

**Multiple cards (2-78)**
- Uses "Multiple cards template"  
- Shows numbered list of cards
- All cards from same draw/intention

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

## Inline Draws

Inline draws let you insert cards anywhere in any note, anytime.

### Single Inline Card

**When to use:**
- Quick card draws while journaling
- Adding cards to existing notes
- Drawing cards for specific questions mid-note

**How:**
1. **Position cursor** where you want the card
2. **Command palette** → "Inline draw tarot card"
3. **Enter intention**
4. Card appears at cursor position

**Uses:** "Inline practice template" (separate from daily template)

**Example use case:**

Writing in journal:
```markdown
## Meeting Notes
Discussed project timeline with team.
Feeling uncertain about approach.

[cursor here - run inline draw command]

Decision: Will proceed with phased rollout.
```

After draw:
```markdown
## Meeting Notes
Discussed project timeline with team.
Feeling uncertain about approach.

**Card:** The Hermit reversed - "Should I trust my instincts?"

Decision: Will proceed with phased rollout.
```

### Multiple Inline Cards

**When to use:**
- Drawing several cards for deeper exploration
- Creating mini-spreads in notes
- Journaling with multiple perspectives

**How:**
1. **Position cursor** where you want cards
2. **Command palette** → "Inline draw multiple tarot cards"
3. **Choose number** of cards (1-78)
4. **Enter intention**
5. Cards appear at cursor position

**Uses:** "Multiple cards template"

**Example:**

```markdown
## Relationship Reflection

Reflecting on recent tensions.

[run inline multiple draw, choose 3 cards]

Three aspects to consider:
1. The Tower - Current situation
2. The Star - Hope/guidance  
3. The Sun - Potential outcome

Will focus on open communication.
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

Spreads use Handlebars templates with access to:
- `{{spread_name}}` - Name of spread
- `{{cards}}` - Array of card objects
- Each card has: `name`, `position`, `orientation`, `index`

**Basic spread template:**
```markdown
## {{spread_name}} - {{date}}

**Intention:** {{intention}}

{{#each cards}}
**{{position}}:** {{name}} {{orientation}}
{{/each}}
```

See [Spread Templates](spread-templates/README.md) for more examples.

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
| Draw daily tarot | `⌘⇧T` or `Ctrl+Shift+T` | Daily practice |
| Inline draw tarot card | `⌘⇧C` or `Ctrl+Shift+C` | Quick inline card |
| Draw tarot spread | `⌘⇧S` or `Ctrl+Shift+S` | Spread readings |

**Tips:**
- Use same modifier (⌘ or Ctrl) for consistency
- Add Shift for less common commands
- Avoid conflicts with other plugins

---

## Common Workflows

### Morning Routine

**Goal:** Daily card as part of morning journaling

**Workflow:**
1. Open today's daily note (or let plugin create it)
2. Press hotkey for daily draw (e.g., `⌘⇧T`)
3. Enter intention: "What do I need to know today?"
4. Card appears in note
5. Continue with morning journaling

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
3. Inline draw single card
4. Use card as prompt for deeper exploration
5. Continue writing

**Example:**
```markdown
Feeling stuck with creative project...

[Inline card: The Tower - "What's blocking me?"]

Realized I'm clinging to old ideas. The Tower suggests
necessary destruction of previous approach. Time to 
start fresh rather than patching old work.
```

---

## Tips & Tricks

### Template Customization

**Keep it simple:**
- Start with built-in templates
- Modify gradually
- Test with different card combinations

**Minimal template for quick logging:**
```markdown
- {{time}}: [[{{card}}]] {{orientation}} - {{intention}}
```

**Detailed template for analysis:**
```markdown
## Tarot Draw
**Date:** {{datetime:YYYY-MM-DD HH:mm}}
**Intention:** {{intention}}
**Card:** {{card}} {{orientation}} (Index: {{index}})

**Draw Details:**
- Shuffles: {{shuffle_count}}
- Cut: {{was_cut}} at {{cut_position}}

**Interpretation:**
[Write notes here]
```

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

### Metadata for Analytics

**Capture draw details:**
Use metadata variables in templates:
```markdown
draw:: {{datetime:YYYY-MM-DD HH:mm}}
card:: {{card}}
orientation:: {{orientation}}
shuffle_count:: {{shuffle_count}}
cut_position:: {{cut_position}}
```

**Later analysis:**
- Use Dataview plugin to query
- Track card frequencies
- Analyze patterns over time

**Example Dataview query:**
```dataview
TABLE card, orientation, draw
FROM "Daily"
WHERE contains(file.content, "card::")
SORT draw DESC
LIMIT 10
```

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
   - "Inline draw tarot card" → Inline template
   - "Inline draw multiple" → Multiple template
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
