# Release Notes - v1.1.0

## New Features

### Inline Draw Command
- **Draw tarot card inline** - Insert cards at cursor position in any note
- Works independently of daily note settings
- Assignable to custom hotkeys via Obsidian settings
- Press Enter in modal to quickly draw cards

### Separate Template Support
- Daily practice and inline draws can use different templates
- Toggle to share templates or customize separately
- Full control over formatting for each workflow

### Reversal Support
- Optional reversed cards with configurable probability
- Adjustable reversal chance (0-100%, default 50%)
- Customizable upright and reversed indicators
- New `{{orientation}}` template variable
- Example: "The Hermit reversed" or "The Hermit R"

## Improvements

- Reorganized settings into clear sections: Daily Practice, Inline Practice, Reversals
- Template documentation moved to README for easier reference
- Cleaner settings UI with links to comprehensive documentation
- Dynamic percentage display on reversal chance slider
- Updated default template to include orientation variable

## Template Variables

New variable:
- `{{orientation}}` - Outputs your configured upright/reversed indicator

Updated default template:
```markdown
## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Card:** {{card}} {{orientation}}
**Index:** {{index}}
**Drawn at:** {{timestamp}}

---
```

## Breaking Changes

None - all new features are opt-in and backwards compatible.

## Installation

Download `main.js`, `manifest.json`, and `styles.css` from this release and place them in your vault's `.obsidian/plugins/tarot-practice/` directory.
