# Week Ahead - {{datetime}}

## {{spread_name}}

**Intention:** {{intention}}

---

{{#each positions}}
### {{label}}
{{card}}{{#if isReversed}} (reversed){{/if}}

{{/each}}

---

**Summary**

This week's energy flows from {{positions.0.card}} to {{positions.4.card}}.

---

*Draw details: {{shuffle_count}} shuffles{{#if was_cut}}, cut at {{cut_position}}{{/if}}*
