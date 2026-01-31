import { describe, test, expect, beforeEach } from 'vitest';
import { DeckValidator } from '../../src/core/DeckValidator';
import type { DeckDefinition } from '../../src/types/deck';

describe('DeckValidator', () => {
	let validDeck: DeckDefinition;

	beforeEach(async () => {
		// Load test fixture
		const fs = await import('fs/promises');
		const path = await import('path');
		const deckPath = path.resolve(__dirname, '../fixtures/test-deck.json');
		const content = await fs.readFile(deckPath, 'utf-8');
		validDeck = JSON.parse(content);
	});

	describe('validate()', () => {
		test('validates correct deck structure', () => {
			const result = DeckValidator.validate(validDeck);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		test('requires id field', () => {
			const invalidDeck = { ...validDeck };
			delete (invalidDeck as any).id;
			
			const result = DeckValidator.validate(invalidDeck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(err => err.includes('id'))).toBe(true);
		});

		test('requires name field', () => {
			const invalidDeck = { ...validDeck };
			delete (invalidDeck as any).name;
			
			const result = DeckValidator.validate(invalidDeck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(err => err.includes('name'))).toBe(true);
		});

		test('requires cards array', () => {
			const invalidDeck = { ...validDeck };
			delete (invalidDeck as any).cards;
			
			const result = DeckValidator.validate(invalidDeck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(err => err.includes('cards'))).toBe(true);
		});

		test('requires cardCount field', () => {
			const invalidDeck = { ...validDeck };
			delete (invalidDeck as any).cardCount;
			
			const result = DeckValidator.validate(invalidDeck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(err => err.includes('cardCount'))).toBe(true);
		});

		test('requires at least one card', () => {
			const invalidDeck = { ...validDeck, cards: [], cardCount: 0 };
			
			const result = DeckValidator.validate(invalidDeck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(err => err.includes('cardCount'))).toBe(true);
		});

		test('validates card structure', () => {
			const invalidDeck = {
				...validDeck,
				cards: [{ name: 'Invalid Card' }], // Missing index
				cardCount: 1
			};
			
			const result = DeckValidator.validate(invalidDeck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(err => err.includes('index'))).toBe(true);
		});

		test('accepts valid deck from fixture', () => {
			expect(validDeck.cards).toHaveLength(5);
			expect(validDeck.id).toBeDefined();
			expect(validDeck.name).toBe('Test Deck');
			
			const result = DeckValidator.validate(validDeck);
			expect(result.isValid).toBe(true);
		});
	});
});
