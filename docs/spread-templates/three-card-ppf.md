# Three Card Reading - {{datetime}}

## {{spread_name}}

**Intention:** {{{intention}}}

---

{{#each cards}}
### {{position.number}}. {{position.label}}
**{{name}}**{{#if isReversed}} (reversed){{/if}}

{{/each}}

---

*Draw details: {{shuffle_count}} shuffles{{#if was_cut}}, cut at {{cut_position}}{{/if}}*
