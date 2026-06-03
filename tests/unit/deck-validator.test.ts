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

	describe('deck id validation', () => {
		test('rejects id exceeding max length', () => {
			const deck = { ...validDeck, id: 'a'.repeat(DeckValidator.MAX_ID_LENGTH + 1) };
			const result = DeckValidator.validate(deck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(e => e.includes('id') && e.includes('length'))).toBe(true);
		});

		test('accepts id at exactly max length', () => {
			const deck = { ...validDeck, id: 'a'.repeat(DeckValidator.MAX_ID_LENGTH) };
			const result = DeckValidator.validate(deck);
			expect(result.isValid).toBe(true);
		});

		test('rejects id with spaces', () => {
			const deck = { ...validDeck, id: 'my deck' };
			const result = DeckValidator.validate(deck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(e => e.includes('alphanumeric'))).toBe(true);
		});

		test('rejects id with path separators', () => {
			const deck = { ...validDeck, id: '../evil' };
			const result = DeckValidator.validate(deck);
			expect(result.isValid).toBe(false);
		});

		test('rejects id with special characters', () => {
			const deck = { ...validDeck, id: 'deck<script>' };
			const result = DeckValidator.validate(deck);
			expect(result.isValid).toBe(false);
		});

		test('accepts id with hyphens and underscores', () => {
			const deck = { ...validDeck, id: 'my-deck_v2' };
			const result = DeckValidator.validate(deck);
			expect(result.isValid).toBe(true);
		});
	});

	describe('field length caps', () => {
		test('rejects deck name exceeding max length', () => {
			const deck = { ...validDeck, name: 'a'.repeat(DeckValidator.MAX_NAME_LENGTH + 1) };
			const result = DeckValidator.validate(deck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(e => e.includes('name') && e.includes('length'))).toBe(true);
		});

		test('rejects card name exceeding max length', () => {
			const deck = {
				...validDeck,
				cards: validDeck.cards.map((c, i) =>
					i === 0 ? { ...c, name: 'a'.repeat(DeckValidator.MAX_NAME_LENGTH + 1) } : c
				)
			};
			const result = DeckValidator.validate(deck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(e => e.includes('name') && e.includes('length'))).toBe(true);
		});
	});

	describe('card count cap', () => {
		test('rejects cardCount exceeding max', () => {
			// Build a deck that claims more cards than allowed
			const deck = { ...validDeck, cardCount: DeckValidator.MAX_CARD_COUNT + 1 };
			const result = DeckValidator.validate(deck);
			expect(result.isValid).toBe(false);
			expect(result.errors.some(e => e.includes('cardCount') && e.includes('maximum'))).toBe(true);
		});
	});
});
