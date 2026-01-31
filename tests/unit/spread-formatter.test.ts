import { describe, test, expect, beforeEach } from 'vitest';
import { SpreadFormatter } from '../../src/templates/SpreadFormatter';
import type { SpreadDrawResult } from '../../src/core/spreads';
import type { TarotPracticeSettings } from '../../src/settings';

describe('SpreadFormatter', () => {
	let formatter: SpreadFormatter;
	let mockSettings: TarotPracticeSettings;
	let sampleResult: SpreadDrawResult;

	beforeEach(() => {
		// Mock settings
		mockSettings = {
			templateBaseFolder: 'Templates/Tarot',
		} as TarotPracticeSettings;

		formatter = new SpreadFormatter(mockSettings);

		// Sample draw result
		sampleResult = {
			spread: {
				id: 'single-card',
				name: 'Single Card',
				description: 'A simple one card draw',
				positions: [{ number: 1, label: 'Card' }],
			},
			deck: {
				id: 'test-deck',
				name: 'Test Deck',
				type: 'Tarot',
				cardCount: 5,
				supportsReversals: true,
				definition: {
					cards: [
						{
							index: 0,
							name: 'The Fool',
							category: 'Major',
						},
					],
				},
			},
			intention: 'Test intention',
			positions: [
				{
					cardIndex: 0,
					number: 1,
					label: 'Card',
					card: 'The Fool',  // String, not object!
					isReversed: false,
					orientation: 'upright',
				},
			],
			timestamp: Date.now(),
			shuffleCount: 3,
			wasCut: false,
			cutPosition: null,
			cutPositionCards: null,
			cutBase: null,
		} as SpreadDrawResult;
	});

	test('formats basic template variables', () => {
		const template = '{{intention}}';
		const result = formatter.format(sampleResult, template);
		expect(result).toBe('Test intention');
	});

	test('formats spread name', () => {
		const template = '{{spread_name}}';
		const result = formatter.format(sampleResult, template);
		expect(result).toBe('Single Card');
	});

	test('formats deck name', () => {
		const template = 'Deck: {{deck_name}}';
		const result = formatter.format(sampleResult, template);
		expect(result).toBe('Deck: Test Deck');
	});

	test('formats card count', () => {
		const template = 'Drew {{card_count}} cards';
		const result = formatter.format(sampleResult, template);
		expect(result).toBe('Drew 1 cards');
	});

	test('formats multiple variables in one template', () => {
		const template = '{{spread_name}} - {{intention}} - {{deck_name}}';
		const result = formatter.format(sampleResult, template);
		expect(result).toBe('Single Card - Test intention - Test Deck');
	});

	test('loops through cards with each helper', () => {
		const template = '{{#each cards}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}';
		const result = formatter.format(sampleResult, template);
		expect(result).toBe('The Fool');
	});

	test('handles card position information', () => {
		const template = '{{#each cards}}Position {{position.number}}: {{name}}{{/each}}';
		const result = formatter.format(sampleResult, template);
		expect(result).toContain('Position 1: The Fool');
	});

	test('formats card orientation', () => {
		const template = '{{#each cards}}{{name}} ({{orientation}}){{/each}}';
		const result = formatter.format(sampleResult, template);
		expect(result).toBe('The Fool (upright)');
	});

	test('handles conditional with if helper', () => {
		const template = '{{#each cards}}{{#if isReversed}}Reversed{{else}}Upright{{/if}}{{/each}}';
		const result = formatter.format(sampleResult, template);
		expect(result).toBe('Upright');
	});

	test('handles missing optional variables gracefully', () => {
		const template = '{{spread_name}} {{nonexistent}}';
		const result = formatter.format(sampleResult, template);
		expect(result).toBe('Single Card ');
	});
});
