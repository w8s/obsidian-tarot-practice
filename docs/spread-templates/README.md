# Spread Template Examples

This directory contains example templates for the built-in spreads. These templates demonstrate how to use Handlebars syntax to format spread readings.

## Using These Templates

1. Copy the template you want to use into your Obsidian vault
2. Customize it to your preferences
3. In the Tarot Practice settings, point the spread to your custom template file

## Template Variables

All spread templates have access to these variables:

### Spread Information
- `{{spread_name}}` - Name of the spread (e.g., "Celtic Cross")
- `{{spread_description}}` - Description of the spread
- `{{intention}}` - Your intention for the reading
- `{{card_count}}` - Number of cards in the spread

### Date/Time
- `{{date}}` - Localized date
- `{{time}}` - Localized time  
- `{{datetime}}` - Combined date and time
- Custom formats: `{{date:YYYY-MM-DD}}`, `{{time:HH:mm}}`

### Deck Preparation
- `{{shuffle_count}}` - Number of shuffles performed
- `{{was_cut}}` - Whether deck was cut (true/false)
- `{{cut_position}}` - Cut position as percentage (e.g., "54.3%")
- `{{cut_position_cards}}` - Cut position as card number
- `{{cut_base}}` - RNG result before variance
- `{{cut_variance}}` - Variance applied to cut

### Positions Array

Each item in the `positions` array has:
- `{{index}}` - 0-based position index
- `{{number}}` - 1-based position number (for display)
- `{{label}}` - Position meaning (e.g., "Past", "Challenge")
- `{{card}}` - Card name (e.g., "The Hermit")
- `{{cardIndex}}` - Card's deck index (0-77)
- `{{orientation}}` - Orientation text ("" or "reversed")
- `{{isReversed}}` - Boolean for conditionals

## Handlebars Syntax

### Loops

Iterate through all positions:
```handlebars
{{#each positions}}
### {{number}}. {{label}}
{{card}}{{#if isReversed}} (reversed){{/if}}

{{/each}}
```

### Conditionals

Show content based on conditions:
```handlebars
{{#if was_cut}}
Deck was cut at {{cut_position}}
{{else}}
Deck was not cut
{{/if}}
```

### Individual Position Access

Access specific positions directly:
```handlebars
**Present:** {{positions.0.card}}
**Challenge:** {{positions.1.card}}
**Outcome:** {{positions.9.card}}
```

## Example Templates

- **single-card.md** - Simple single card draw
- **three-card-ppf.md** - Past, Present, Future spread
- **three-card-sao.md** - Situation, Action, Outcome spread
- **five-card-week.md** - Week ahead forecast with summary
- **celtic-cross.md** - Full 10-card Celtic Cross with grouped sections

## Tips

1. **Keep it simple** - Start with basic templates and add complexity as needed
2. **Group related positions** - Like the Celtic Cross example (Cross, Foundation, Crown, Staff)
3. **Add context** - Include descriptions or synthesis sections
4. **Use conditionals** - Show/hide content based on reversals or deck preparation
5. **Mix loops and direct access** - Use loops for lists, direct access for highlighted positions

## Resources

- [Handlebars Documentation](https://handlebarsjs.com/guide/)
- [Moment.js Format Reference](https://momentjs.com/docs/#/displaying/format/)
