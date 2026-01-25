## {{spread_name}} - {{date}}

**Question:** {{{intention}}}

{{#each cards}}
### {{position.number}}. {{position.label}}
**{{name}}**{{#if isReversed}} ({{orientation}}){{/if}}

{{#if imageUrl}}
![[{{imageUrl}}]]
{{/if}}

---
{{/each}}

**Deck:** {{deck_name}}
**Draw ID:** {{draw_id}}