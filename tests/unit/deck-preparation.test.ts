import { describe, test, expect } from 'vitest';
import { prepareDeck } from '../../src/core/DeckPreparation';
import type { TarotPracticeSettings } from '../../src/settings';

describe('DeckPreparation', () => {
	const mockSettings: TarotPracticeSettings = {
		shuffleCount: 3,
		cutDeck: false,
	} as TarotPracticeSettings;

	describe('prepareDeck()', () => {
		test('creates deck with correct card count', async () => {
			const result = await prepareDeck('Test', '2025-01-31', mockSettings, 5);
			
			expect(result.deck).toHaveLength(5);
		});

		test('deck contains all unique indices', async () => {
			const result = await prepareDeck('Test', '2025-01-31', mockSettings, 5);
			
			const uniqueCards = new Set(result.deck);
			expect(uniqueCards.size).toBe(5);
		});

		test('deck contains only valid indices', async () => {
			const result = await prepareDeck('Test', '2025-01-31', mockSettings, 5);
			
			for (const cardIndex of result.deck) {
				expect(cardIndex).toBeGreaterThanOrEqual(0);
				expect(cardIndex).toBeLessThan(5);
			}
		});

		test('different intentions produce different shuffles', async () => {
			const result1 = await prepareDeck('Intention A', '2025-01-31', mockSettings, 10);
			const result2 = await prepareDeck('Intention B', '2025-01-31', mockSettings, 10);
			
			// Extremely unlikely to get identical shuffle with different intentions
			expect(result1.deck).not.toEqual(result2.deck);
		});

		test('different intentions produce different shuffles', async () => {
			const result1 = await prepareDeck('Intention A', '2025-01-31', mockSettings, 10);
			const result2 = await prepareDeck('Intention B', '2025-01-31', mockSettings, 10);
			
			// Extremely unlikely to get identical shuffle with different intentions
			expect(result1.deck).not.toEqual(result2.deck);
		});

		test('RNG includes timestamps by default (non-deterministic)', async () => {
			const settings = {
				shuffleCount: 3,
				cutDeck: false,
			} as TarotPracticeSettings;

			const result1 = await prepareDeck('Same intention', '2025-01-31-12:00:00', settings, 10);
			const result2 = await prepareDeck('Same intention', '2025-01-31-12:00:01', settings, 10);
			
			// Different timestamps produce different shuffles
			// This is expected behavior - RNG includes timestamp for randomness
			expect(result1.deck).not.toEqual(result2.deck);
		});

		test('metadata tracks shuffle count', async () => {
			const result = await prepareDeck('Test', '2025-01-31', mockSettings, 5);
			
			expect(result.metadata.shuffleCount).toBe(3);
		});

		test('metadata indicates cut was not performed when disabled', async () => {
			const result = await prepareDeck('Test', '2025-01-31', mockSettings, 5);
			
			expect(result.metadata.wasCut).toBe(false);
			expect(result.metadata.cutPositionPercent).toBeNull();
		});

		test('performs cut when enabled', async () => {
			const settingsWithCut = {
				...mockSettings,
				cutDeck: true,
			} as TarotPracticeSettings;

			const result = await prepareDeck('Test', '2025-01-31', settingsWithCut, 10);
			
			expect(result.metadata.wasCut).toBe(true);
			expect(result.metadata.cutPositionPercent).not.toBeNull();
			expect(result.metadata.cutPositionCards).not.toBeNull();
		});

		test('handles standard 78-card tarot deck', async () => {
			const result = await prepareDeck('Full deck test', '2025-01-31', mockSettings);
			
			expect(result.deck).toHaveLength(78);
			expect(new Set(result.deck).size).toBe(78);
		});

		test('handles small decks (5 cards)', async () => {
			const result = await prepareDeck('Small deck', '2025-01-31', mockSettings, 5);
			
			expect(result.deck).toHaveLength(5);
			expect(new Set(result.deck).size).toBe(5);
		});

		test('handles large decks (100+ cards)', async () => {
			const result = await prepareDeck('Large deck', '2025-01-31', mockSettings, 150);
			
			expect(result.deck).toHaveLength(150);
			expect(new Set(result.deck).size).toBe(150);
		});
	});
});
