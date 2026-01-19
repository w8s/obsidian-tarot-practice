## Example templates with all metadata variables

### Single Card Template with Full Metadata
```markdown
## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Card:** {{card}} {{orientation}}
**Index:** {{index}}

**Draw Metadata:**
- Shuffles: {{shuffle_count}}
- Cut: {{was_cut}}
- Cut position: {{cut_position}} (card {{cut_position_cards}})
- RNG base: {{cut_base}} + variance {{cut_variance}}

---
```

### Multiple Cards Template with Full Metadata
```markdown
## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Cards drawn:** {{card_count}}

{{cards}}

**Draw Metadata:**
- Shuffles: {{shuffle_count}}
- Cut: {{was_cut}}
- Cut position: {{cut_position}} (card {{cut_position_cards}})
- RNG base: {{cut_base}} + variance {{cut_variance}}

---
```

### Example Output (Single Card)
```markdown
## Tarot draw - 1/19/2026 8:45 PM

**Intention:** What do I need to know today?
**Card:** The Hermit reversed
**Index:** 9

**Draw Metadata:**
- Shuffles: 3
- Cut: yes
- Cut position: 54.3% (card 42)
- RNG base: 47% + variance +7.3%

---
```

### Example Output (Multiple Cards)
```markdown
## Tarot draw - 1/19/2026 8:47 PM

**Intention:** Show me the path forward
**Cards drawn:** 3

1. The Fool
2. The Tower reversed
3. The Star

**Draw Metadata:**
- Shuffles: 3
- Cut: yes
- Cut position: 23.8% (card 18)
- RNG base: 31% + variance -7.2%

---
```
