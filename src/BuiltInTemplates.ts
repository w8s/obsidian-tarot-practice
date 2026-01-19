/**
 * Built-in default templates for tarot draws.
 * These are used when users haven't configured custom template files.
 */

export const BUILTIN_DAILY_TEMPLATE = `## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Card:** {{card}} {{orientation}}

**Draw details:**
- Shuffles: {{shuffle_count}}
- Cut: {{was_cut}} at {{cut_position}} (card {{cut_position_cards}})
- RNG: {{cut_base}} + {{cut_variance}}

---
`;

export const BUILTIN_INLINE_TEMPLATE = `## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Card:** {{card}} {{orientation}}
**Index:** {{index}}

---
`;

export const BUILTIN_MULTIPLE_TEMPLATE = `## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Cards drawn:** {{card_count}}

{{cards}}

**Draw details:**
- Shuffles: {{shuffle_count}}
- Cut: {{was_cut}} at {{cut_position}} (card {{cut_position_cards}})
- RNG: {{cut_base}} + {{cut_variance}}

---
`;
