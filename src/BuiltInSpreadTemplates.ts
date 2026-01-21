/**
 * Built-in default templates for spreads
 * These are used when no custom template is specified
 */

export const BUILTIN_SINGLE_CARD_TEMPLATE = `## {{spread_name}} - {{datetime}}

**Intention:** {{intention}}

**Card:** {{positions.0.card}}{{#if positions.0.isReversed}} (reversed){{/if}}

---
`;

export const BUILTIN_THREE_CARD_TEMPLATE = `## {{spread_name}} - {{datetime}}

**Intention:** {{intention}}

{{#each positions}}
**{{number}}. {{label}}:** {{card}}{{#if isReversed}} (reversed){{/if}}
{{/each}}

---
`;

export const BUILTIN_FIVE_CARD_TEMPLATE = `## {{spread_name}} - {{datetime}}

**Intention:** {{intention}}

{{#each positions}}
**{{label}}:** {{card}}{{#if isReversed}} (reversed){{/if}}
{{/each}}

---
`;

export const BUILTIN_CELTIC_CROSS_TEMPLATE = `## {{spread_name}} - {{datetime}}

**Intention:** {{intention}}

### The Cross
**1. {{positions.0.label}}:** {{positions.0.card}}{{#if positions.0.isReversed}} (reversed){{/if}}
**2. {{positions.1.label}}:** {{positions.1.card}}{{#if positions.1.isReversed}} (reversed){{/if}}

### The Foundation
**3. {{positions.2.label}}:** {{positions.2.card}}{{#if positions.2.isReversed}} (reversed){{/if}}
**4. {{positions.3.label}}:** {{positions.3.card}}{{#if positions.3.isReversed}} (reversed){{/if}}

### The Crown
**5. {{positions.4.label}}:** {{positions.4.card}}{{#if positions.4.isReversed}} (reversed){{/if}}
**6. {{positions.5.label}}:** {{positions.5.card}}{{#if positions.5.isReversed}} (reversed){{/if}}

### The Staff
**7. {{positions.6.label}}:** {{positions.6.card}}{{#if positions.6.isReversed}} (reversed){{/if}}
**8. {{positions.7.label}}:** {{positions.7.card}}{{#if positions.7.isReversed}} (reversed){{/if}}
**9. {{positions.8.label}}:** {{positions.8.card}}{{#if positions.8.isReversed}} (reversed){{/if}}
**10. {{positions.9.label}}:** {{positions.9.card}}{{#if positions.9.isReversed}} (reversed){{/if}}

---
`;

/**
 * Get the built-in template for a spread by ID
 */
export function getBuiltInSpreadTemplate(spreadId: string): string {
	switch (spreadId) {
		case 'single-card':
			return BUILTIN_SINGLE_CARD_TEMPLATE;
		case 'three-card-ppf':
		case 'three-card-sao':
			return BUILTIN_THREE_CARD_TEMPLATE;
		case 'five-card-week':
			return BUILTIN_FIVE_CARD_TEMPLATE;
		case 'celtic-cross':
			return BUILTIN_CELTIC_CROSS_TEMPLATE;
		default:
			// Default to a generic template that works for any spread
			return `## {{spread_name}} - {{datetime}}

**Intention:** {{intention}}

{{#each positions}}
**{{number}}. {{label}}:** {{card}}{{#if isReversed}} (reversed){{/if}}
{{/each}}

---
`;
	}
}
