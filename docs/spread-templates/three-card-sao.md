# Decision Reading - {{datetime}}

## {{spread_name}}

**Intention:** {{{intention}}}

---

{{#each positions}}
### {{label}}
**{{name}}**{{#if isReversed}} (reversed){{/if}}

{{/each}}

---

*Draw details: {{shuffle_count}} shuffles{{#if was_cut}}, cut at {{cut_position}}{{/if}}*
