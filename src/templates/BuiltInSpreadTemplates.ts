/**
 * Built-in default templates for spreads
 * These are used when no custom template is specified
 */

export const BUILTIN_SINGLE_CARD_TEMPLATE = `## {{spread_name}} - {{datetime}}

**Intention:** {{{intention}}}

**Card:** {{cards.0.name}}{{#if cards.0.isReversed}} (reversed){{/if}}

---
`;

export const BUILTIN_THREE_CARD_TEMPLATE = `## {{spread_name}} - {{datetime}}

**Intention:** {{{intention}}}

{{#each cards}}
**{{position.number}}. {{position.label}}:** {{name}}{{#if isReversed}} (reversed){{/if}}
{{/each}}

---
`;

export const BUILTIN_FIVE_CARD_TEMPLATE = `## {{spread_name}} - {{datetime}}

**Intention:** {{{intention}}}

{{#each cards}}
**{{position.label}}:** {{name}}{{#if isReversed}} (reversed){{/if}}
{{/each}}

---
`;

export const BUILTIN_CELTIC_CROSS_TEMPLATE = `## {{spread_name}} - {{datetime}}

**Intention:** {{{intention}}}

### The Cross
**1. {{cards.0.position.label}}:** {{cards.0.name}}{{#if cards.0.isReversed}} (reversed){{/if}}
**2. {{cards.1.position.label}}:** {{cards.1.name}}{{#if cards.1.isReversed}} (reversed){{/if}}

### The Foundation
**3. {{cards.2.position.label}}:** {{cards.2.name}}{{#if cards.2.isReversed}} (reversed){{/if}}
**4. {{cards.3.position.label}}:** {{cards.3.name}}{{#if cards.3.isReversed}} (reversed){{/if}}

### The Crown
**5. {{cards.4.position.label}}:** {{cards.4.name}}{{#if cards.4.isReversed}} (reversed){{/if}}
**6. {{cards.5.position.label}}:** {{cards.5.name}}{{#if cards.5.isReversed}} (reversed){{/if}}

### The Staff
**7. {{cards.6.position.label}}:** {{cards.6.name}}{{#if cards.6.isReversed}} (reversed){{/if}}
**8. {{cards.7.position.label}}:** {{cards.7.name}}{{#if cards.7.isReversed}} (reversed){{/if}}
**9. {{cards.8.position.label}}:** {{cards.8.name}}{{#if cards.8.isReversed}} (reversed){{/if}}
**10. {{cards.9.position.label}}:** {{cards.9.name}}{{#if cards.9.isReversed}} (reversed){{/if}}

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

**Intention:** {{{intention}}}

{{#each cards}}
**{{position.number}}. {{position.label}}:** {{name}}{{#if isReversed}} (reversed){{/if}}
{{/each}}

---
`;
	}
}
