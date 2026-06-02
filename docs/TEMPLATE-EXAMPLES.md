# Template Examples

Copy-paste ready templates for Tarot Practice plugin, organized by insert mode and formatting pattern.

**Note:** These patterns work with any spread - single card, three card, Celtic Cross, or custom spreads. The `{{#each cards}}` loop automatically adapts to however many cards are drawn.

For complete variable reference, see [Template Variables](TEMPLATE-VARIABLES.md).

---

## Table of Contents

- [Daily Note Templates](#daily-note-templates)
- [Inline Templates](#inline-templates)
- [New Note Templates](#new-note-templates)
- [Handlebars Patterns](#handlebars-patterns)

---

## Daily Note Templates

Templates optimized for `insertMode: 'daily-note'` - designed to append to your daily notes without overwhelming the page.

### Minimal Daily Log

Perfect for quick daily practice with minimal formatting.

```markdown
- {{time}}: [[{{cards.0.name}}]] {{cards.0.orientation}} - {{{intention}}}
```

**Output:**
```markdown
- 3:45 PM: [[The Hermit]] reversed - What do I need to know today?
```

**Best for:** Single card daily draws, quick logging

---

### Journal Entry Style

Clean format for reflective journaling in daily notes.

```markdown
### {{spread_name}} - {{time}}

> {{{intention}}}

{{#each cards}}
**{{position.label}}:** {{name}} {{orientation}}
{{/each}}

---
```

**Output:**
```markdown
### Daily Draw - 3:45 PM

> What guidance do I need today?

**Guidance:** The Hermit reversed

---
```

**Best for:** Daily reflection, spreads with 1-3 cards

---

### Daily with Position Descriptions

Include spread position context for deeper reflection.

```markdown
### {{spread_name}} - {{date:MMM D}}

**Intention:** {{{intention}}}

{{#each cards}}
**{{position.label}}**{{#if position.description}} - *{{position.description}}*{{/if}}  
{{name}} {{orientation}}

{{/each}}
```

**Output:**
```markdown
### Three Card - Past/Present/Future - Jan 24

**Intention:** Show me the day ahead

**Past** - *Events and influences that led to this moment*  
The Fool

**Present** - *Your current situation and state of being*  
The Hermit reversed

**Future** - *What's emerging or where this is heading*  
The Tower

```

**Best for:** Learning spread positions, multi-card daily practice

---

### Compact List Format

Minimal vertical space for busy daily notes.

```markdown
**{{spread_name}}** ({{time}}): {{#each cards}}{{name}}{{#if isReversed}}R{{/if}}{{#unless @last}}, {{/unless}}{{/each}} — {{{intention}}}
```

**Output:**
```markdown
**Three Card - Past/Present/Future** (3:45 PM): The Fool, The HermitR, The Tower — Show me the day ahead
```

**Best for:** High-volume daily draws, minimal clutter

---

## Inline Templates

Templates optimized for `insertMode: 'inline'` - designed to drop into any note at cursor position.

### Quick Reference

Minimal format for dropping cards mid-note.

```markdown
{{#each cards}}**{{name}}** {{orientation}}{{#unless @last}}, {{/unless}}{{/each}}
```

**Output:**
```markdown
**The Fool**, **The Hermit** reversed, **The Tower**
```

**Best for:** Referencing cards in existing notes, meeting notes

---

### Inline with Context

More context while staying compact.

```markdown
**{{spread_name}}:** {{#each cards}}{{position.label}} = {{name}} {{orientation}}{{#unless @last}} | {{/unless}}{{/each}}
```

**Output:**
```markdown
**Three Card - Past/Present/Future:** Past = The Fool | Present = The Hermit reversed | Future = The Tower
```

**Best for:** Project notes, decision documentation

---

### Blockquote Format

Visually distinct inline reading.

```markdown
> **{{spread_name}}**  
> *{{{intention}}}*
> 
{{#each cards}}> **{{position.label}}:** {{name}} {{orientation}}  
{{/each}}
```

**Output:**
```markdown
> **Three Card - Past/Present/Future**  
> *Show me the day ahead*
> 
> **Past:** The Fool  
> **Present:** The Hermit reversed  
> **Future:** The Tower  
```

**Best for:** Making readings stand out in long notes

---

### Numbered Inline List

Clean numbered format for any card count.

```markdown
{{#each cards}}
{{position.number}}. {{name}} {{orientation}}
{{/each}}
```

**Output:**

```markdown
1. The Fool
2. The Hermit reversed
3. The Tower
```

**Best for:** Action lists, sequential planning

---

## New Note Templates

Templates optimized for `insertMode: 'new-note'` - designed for standalone reading documents.

### Standard Reading Format

Clean, professional layout for full readings.

```markdown
## {{spread_name}}

**Date:** {{date:MMMM D, YYYY}} at {{time}}  
**Deck:** {{deck_name}}

### Intention

{{{intention}}}

### Cards

{{#each cards}}
#### {{position.number}}. {{position.label}}

**Card:** {{name}} {{orientation}}{{#if position.description}}  
**Position:** {{position.description}}{{/if}}

**Notes:**


---
{{/each}}

### Reflection


```

**Output:**
```markdown
## Three Card - Past/Present/Future

**Date:** January 24, 2026 at 3:45 PM  
**Deck:** Rider-Waite-Smith

### Intention

Show me the day ahead

### Cards

#### 1. Past

**Card:** The Fool  
**Position:** Events and influences that led to this moment

**Notes:**


---

#### 2. Present

**Card:** The Hermit reversed  
**Position:** Your current situation and state of being

**Notes:**


---

#### 3. Future

**Card:** The Tower  
**Position:** What's emerging or where this is heading

**Notes:**


---

### Reflection


```

**Best for:** Deep readings, study, archival

---

### Minimal New Note

Clean format without extra structure.

```markdown
# {{spread_name}} - {{date:YYYY-MM-DD}}

> {{{intention}}}

{{#each cards}}
## {{position.label}}
{{name}} {{orientation}}

{{/each}}
```

**Best for:** Simple readings, quick documentation

---

### Reading for Others

Template for professional or personal readings with querent tracking.

```markdown
# {{spread_name}} - {{date:YYYY-MM-DD}}

**Querent:** [[People/First Last]]  
**Date:** {{datetime}}

## Question

{{{intention}}}

## Reading

{{#each cards}}
### {{position.label}}
{{name}} {{orientation}}

**Notes:**


{{/each}}

## Summary


---
*Next session:*
```

**Output example:**

```markdown
# Three Card - Past/Present/Future - 2026-01-24

**Querent:** [[People/Sarah Chen]]  
**Date:** 1/24/2026 3:45 PM

## Question

Career transition guidance

## Reading

### Past
The Fool

**Notes:**


### Present
The Hermit reversed

**Notes:**


### Future
The Tower

**Notes:**


## Summary


---
*Next session:*
```

**Best for:** Professional readers, tracking client readings, reading for friends/family

---

### Detailed Study Format

Complete metadata for tracking and analysis.

```markdown
# {{spread_name}}

**Created:** {{datetime:YYYY-MM-DD HH:mm}}  
**Deck:** {{deck_name}} ({{deck_type}})  
**Card Count:** {{card_count}}

## Question

{{{intention}}}

## Draw Details

- Shuffles: {{shuffle_count}}
- Cut: {{was_cut}} at {{cut_position}} (card {{cut_position_cards}})
- RNG Base: {{cut_base}}
- Variance: {{cut_variance}}

## Reading

{{#each cards}}
### {{position.number}}. {{position.label}}

**Card:** {{name}} (Index: {{index}})  
**Orientation:** {{orientation}}{{#unless orientation}}Upright{{/unless}}{{#if position.description}}  
**Position Meaning:** {{position.description}}{{/if}}

**Interpretation:**


---
{{/each}}

## Summary


## Tags

#tarot #{{deck_type}} #{{spread_name}}
```

**Best for:** Study, pattern tracking, statistical analysis

---

### Week Ahead Format

Optimized for the Five Card - Week Ahead spread (works with any 5+ card spread).

```markdown
# Week of {{date:MMM D, YYYY}}

**Intention:** {{{intention}}}

{{#each cards}}
## {{position.label}}
{{name}} {{orientation}}

**Reflection:**


---
{{/each}}

## Weekly Summary


```

**Best for:** Weekly planning spreads

---

### Celtic Cross Grouped Format

Organized sections for 10-card spreads (adaptable to any large spread).

```markdown
# {{spread_name}}

**Date:** {{datetime}}  
**Question:** {{{intention}}}

## The Cross

**{{cards.0.position.label}}:** {{cards.0.name}} {{cards.0.orientation}}  
**{{cards.1.position.label}}:** {{cards.1.name}} {{cards.1.orientation}}

## The Foundation

**{{cards.2.position.label}}:** {{cards.2.name}} {{cards.2.orientation}}  
**{{cards.3.position.label}}:** {{cards.3.name}} {{cards.3.orientation}}

## The Crown

**{{cards.4.position.label}}:** {{cards.4.name}} {{cards.4.orientation}}  
**{{cards.5.position.label}}:** {{cards.5.name}} {{cards.5.orientation}}

## The Staff

**{{cards.6.position.label}}:** {{cards.6.name}} {{cards.6.orientation}}  
**{{cards.7.position.label}}:** {{cards.7.name}} {{cards.7.orientation}}  
**{{cards.8.position.label}}:** {{cards.8.name}} {{cards.8.orientation}}  
**{{cards.9.position.label}}:** {{cards.9.name}} {{cards.9.orientation}}

## Interpretation


```

**Best for:** Celtic Cross and other structured multi-section spreads

---

## Handlebars Patterns

Technical examples and patterns that work across all insert modes.

### Basic Loop

The fundamental pattern for any card count.

```handlebars
{{#each cards}}
{{position.number}}. {{name}} {{orientation}}
{{/each}}
```

---

### Loop with Position Labels

Access position metadata.

```handlebars
{{#each cards}}
**{{position.label}}:** {{name}} {{orientation}}
{{/each}}
```

---

### Loop with Descriptions

Show optional position descriptions when available.

```handlebars
{{#each cards}}
**{{position.label}}**{{#if position.description}} - *{{position.description}}*{{/if}}  
{{name}} {{orientation}}
{{/each}}
```

---

### Direct Card Access

Access specific cards by index (0-based).

```handlebars
First card: {{cards.0.name}}
Second card: {{cards.1.name}}
Third card: {{cards.2.name}}

First card position: {{cards.0.position.label}}
```

---

### Conditional: Reversed Cards

Show content only for reversed cards.

```handlebars
{{#each cards}}
{{name}}{{#if isReversed}} ⚠️ (reversed){{/if}}
{{/each}}
```

---

### Conditional: Upright Only

Show content only when card is upright.

```handlebars
{{#each cards}}
{{#unless isReversed}}
✓ {{name}} - upright energy
{{/unless}}
{{/each}}
```

---

### Loop Context Variables

Use `@first`, `@last`, `@index` for special formatting.

```handlebars
{{#each cards}}
{{#if @first}}
=== Opening Card ===
{{/if}}
{{position.number}}. {{name}}
{{#if @last}}
=== Final Card ===
{{/if}}
{{/each}}
```

---

### Separate Reversed Cards

Group upright and reversed separately.

```handlebars
## Upright Cards
{{#each cards}}
{{#unless isReversed}}
- {{name}}
{{/unless}}
{{/each}}

## Reversed Cards
{{#each cards}}
{{#if isReversed}}
- {{name}}
{{/if}}
{{/each}}
```

---

### Card Index Reference

Show card deck positions for study.

```handlebars
{{#each cards}}
{{name}} [{{index}}] {{orientation}}
{{/each}}
```

**Output example:**
```
The Fool [0]
The Hermit [9] reversed
The Tower [16]
```

---

### Date Formatting

Custom date/time formats for any use case.

```handlebars
ISO: {{date:YYYY-MM-DD}}
US: {{date:M/D/YYYY}}
European: {{date:DD/MM/YYYY}}
Full: {{date:MMMM D, YYYY}}
Weekday: {{date:dddd, MMM D}}

12-hour: {{time:h:mm A}}
24-hour: {{time:HH:mm}}
```

---

### Triple Braces for User Input

Always use triple braces `{{{intention}}}` for user-entered text to preserve quotes and apostrophes.

```handlebars
**Bad:** {{intention}}
Converts "What's next?" → "What&#x27;s next?"

**Good:** {{{intention}}}
Keeps "What's next?" → "What's next?"
```

---

### Querent Information

When doing a reading for someone else, querent information can be included conditionally.

```handlebars
# {{spread_name}}

{{#if querent}}
**Querent:** {{#if querent.hasPath}}[[{{querent.notePath}}|{{querent.name}}]]{{else}}{{querent.name}}{{/if}}
{{/if}}
**Intention:** {{{intention}}}
**Date:** {{date}}

{{#each cards}}
**{{position.label}}:** {{name}} {{orientation}}
{{/each}}
```

**Output (with querent and note path):**
```markdown
# Three Card - Past/Present/Future

**Querent:** [[People/Sarah Chen|Sarah Chen]]
**Intention:** What career path should I consider?
**Date:** 1/24/2026

**Past:** The Fool
**Present:** The Hermit reversed
**Future:** The Tower
```

**Output (with querent, no note path):**
```markdown
# Single Card

**Querent:** Alex Martinez
**Intention:** Daily guidance
**Date:** 1/24/2026

**Guidance:** The Star
```

**Output (no querent):**
```markdown
# Celtic Cross

**Intention:** What do I need to know?
**Date:** 1/24/2026

**Present Situation:** The Fool
**Challenge:** The Hermit reversed
...
```

The `{{#if querent}}` block only appears when you've entered querent information. The nested `{{#if querent.hasPath}}` creates a wikilink when a note path is provided, otherwise just shows the name.

---

## Tips & Best Practices

### Choose Template by Insert Mode

- **Daily Note:** Minimal vertical space, append-friendly
- **Inline:** Compact, blends with surrounding text
- **New Note:** Full structure, standalone document

### Test with Different Card Counts

Templates should work with:

- Single card (1)
- Few cards (2-5)
- Many cards (10+)
- Reversed and upright cards
- Long and short intentions

### Metadata Considerations

**Include metadata when:**

- Studying patterns over time
- Tracking RNG/shuffle details
- Archiving important readings

**Exclude metadata when:**

- Daily quick practice
- Inline references
- Space is limited

### Date Format Consistency

Pick one date format and use it consistently:

- **ISO:** `YYYY-MM-DD` (sorts well, universal)
- **US:** `M/D/YYYY` (familiar to US users)
- **European:** `DD/MM/YYYY` (familiar to EU users)
- **Full:** `MMMM D, YYYY` (readable, formal)

---

### Linking to Your Card Notes

If you maintain individual notes for each card, you can link to them in your templates.

**Example: Card notes in a Tarot folder**

```handlebars
{{#each cards}}
**{{position.label}}:** [[Tarot/{{name}}]]{{#if isReversed}} (reversed){{/if}}
{{/each}}
```

**Output:**
```markdown
**Past:** [[Tarot/The Fool]]
**Present:** [[Tarot/The Hermit]] (reversed)
**Future:** [[Tarot/The Tower]]
```

**Example: With custom note naming**

If your card notes use different naming (e.g., "The Fool Card.md"):

```handlebars
{{#each cards}}
- [[Tarot/{{name}} Card|{{name}}]] {{orientation}}
{{/each}}
```

**Output:**
```markdown
- [[Tarot/The Fool Card|The Fool]]
- [[Tarot/The Hermit Card|The Hermit]] reversed
- [[Tarot/The Tower Card|The Tower]]
```

**Example: Journal entry with card links**

```handlebars
### {{spread_name}} - {{time}}

> {{{intention}}}

{{#each cards}}
**{{position.label}}:** [[Tarot/{{name}}]] {{orientation}}
{{#if position.description}}
*{{position.description}}*
{{/if}}

My notes:


{{/each}}
```

**Best for:** Integrating with existing card study notes, building a connected knowledge base

---

## Related Documentation

- [Template Variables](TEMPLATE-VARIABLES.md) - Complete variable reference
- [Settings Reference](SETTINGS.md) - Configure template behavior
- [Handlebars Documentation](https://handlebarsjs.com/) - Official Handlebars guide
