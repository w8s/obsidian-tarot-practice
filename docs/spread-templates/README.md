# Spread Template Examples

Example templates for the built-in spreads demonstrating different formatting approaches.

## Available Templates

- **single-card.md** - Minimal single card draw
- **three-card-ppf.md** - Past, Present, Future with numbered positions
- **three-card-sao.md** - Situation, Action, Outcome without position numbers
- **five-card-week.md** - Week ahead with summary synthesis
- **celtic-cross.md** - Grouped 10-card layout (Cross, Foundation, Crown, Staff)

## Using These Templates

1. Browse the templates in this directory
2. Copy the one you want to customize
3. Paste into your Obsidian vault (anywhere)
4. Modify to your preferences
5. In Settings → Spreads → Select your spread → Edit → Choose custom template file

## Template Documentation

For complete template reference, see:

- **[Template Variables](../TEMPLATE-VARIABLES.md)** - All available variables and data structure
- **[Template Examples](../TEMPLATE-EXAMPLES.md)** - More patterns organized by insert mode
- **[Handlebars Guide](https://handlebarsjs.com/guide/)** - Handlebars syntax reference

## Design Patterns

These templates demonstrate:

- **Loops vs Direct Access** - When to use `{{#each cards}}` vs `{{cards.0.name}}`
- **Grouped Sections** - Organizing multi-card spreads (see celtic-cross.md)
- **Synthesis** - Referencing multiple cards in narrative (see five-card-week.md)
- **Minimal vs Detailed** - Range from simple (single-card.md) to comprehensive (celtic-cross.md)
