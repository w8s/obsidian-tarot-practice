# Week Ahead - {{datetime}}

## {{spread_name}}

**Intention:** {{intention}}

---

{{#each cards}}
### {{position.label}}
{{name}}{{#if isReversed}} (reversed){{/if}}

{{/each}}

---

**Summary**

This week's energy flows from {{cards.0.name}} to {{cards.4.name}}.

---

*Draw details: {{shuffle_count}} shuffles{{#if was_cut}}, cut at {{cut_position}}{{/if}}*
