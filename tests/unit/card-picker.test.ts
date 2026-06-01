import { describe, it, expect } from 'vitest';
import {
	isStructuredDeck,
	getSuitLabels,
	getCardsForSuit,
	getCardDisplayValue,
	findCard,
	MAJOR_ARCANA_SUIT_LABEL
} from '../../src/utils/cardPicker';
import type { CardDefinition } from '../../src/types/deck';

// ── Fixtures ────────────────────────────────────────────────────────────────

const fool: CardDefinition = {
	index: 0, name: 'The Fool', category: 'Major', suit: null, rank: null, value: 0
};
const highPriestess: CardDefinition = {
	index: 2, name: 'The High Priestess', category: 'Major', suit: null, rank: null, value: 2
};
const aceOfWands: CardDefinition = {
	index: 22, name: 'Ace of Wands', category: 'Minor', suit: 'Wands', rank: 'Ace', value: 1
};
const twoOfWands: CardDefinition = {
	index: 23, name: 'Two of Wands', category: 'Minor', suit: 'Wands', rank: 'Two', value: 2
};
const aceOfCups: CardDefinition = {
	index: 36, name: 'Ace of Cups', category: 'Minor', suit: 'Cups', rank: 'Ace', value: 1
};
// Edge case: suited card with no rank (custom deck scenario)
const customNoRank: CardDefinition = {
	index: 99, name: 'The Dragon', category: undefined, suit: 'Fire', rank: null
};

const rwsCards = [fool, highPriestess, aceOfWands, twoOfWands, aceOfCups];
const flatCards = [
	{ index: 0, name: 'Fehu', suit: null } as CardDefinition,
	{ index: 1, name: 'Uruz', suit: null } as CardDefinition,
];
const customCards = [customNoRank];
const mixedCustomCards = [fool, customNoRank]; // structured (customNoRank has suit)

// ── isStructuredDeck ─────────────────────────────────────────────────────────

describe('isStructuredDeck', () => {
	it('returns true when any card has a non-null suit', () => {
		expect(isStructuredDeck(rwsCards)).toBe(true);
	});

	it('returns false when all cards have null suit', () => {
		expect(isStructuredDeck(flatCards)).toBe(false);
	});

	it('returns true for a mix of null and non-null suits', () => {
		expect(isStructuredDeck(mixedCustomCards)).toBe(true);
	});

	it('returns false for empty deck', () => {
		expect(isStructuredDeck([])).toBe(false);
	});
});

// ── getSuitLabels ─────────────────────────────────────────────────────────────

describe('getSuitLabels', () => {
	it('puts Major Arcana first, followed by minor suits in deck order', () => {
		const labels = getSuitLabels(rwsCards);
		expect(labels[0]).toBe(MAJOR_ARCANA_SUIT_LABEL);
		expect(labels).toContain('Wands');
		expect(labels).toContain('Cups');
		expect(labels.indexOf('Wands')).toBeLessThan(labels.indexOf('Cups'));
	});

	it('omits Major Arcana label when no Major cards present', () => {
		const labels = getSuitLabels([aceOfWands, aceOfCups]);
		expect(labels).not.toContain(MAJOR_ARCANA_SUIT_LABEL);
		expect(labels).toEqual(['Wands', 'Cups']);
	});

	it('does not duplicate suit names', () => {
		const labels = getSuitLabels(rwsCards);
		const wands = labels.filter(l => l === 'Wands');
		expect(wands.length).toBe(1);
	});

	it('returns empty array for flat deck', () => {
		expect(getSuitLabels(flatCards)).toEqual([]);
	});

	it('includes custom suit names', () => {
		expect(getSuitLabels(customCards)).toContain('Fire');
	});
});

// ── getCardsForSuit ───────────────────────────────────────────────────────────

describe('getCardsForSuit', () => {
	it('returns Major Arcana cards for MAJOR_ARCANA_SUIT_LABEL', () => {
		const result = getCardsForSuit(rwsCards, MAJOR_ARCANA_SUIT_LABEL);
		expect(result).toContain(fool);
		expect(result).toContain(highPriestess);
		expect(result).not.toContain(aceOfWands);
	});

	it('returns only cards matching the given suit', () => {
		const result = getCardsForSuit(rwsCards, 'Wands');
		expect(result).toContain(aceOfWands);
		expect(result).toContain(twoOfWands);
		expect(result).not.toContain(aceOfCups);
	});

	it('returns empty array for unknown suit', () => {
		expect(getCardsForSuit(rwsCards, 'Ether')).toEqual([]);
	});
});

// ── getCardDisplayValue ───────────────────────────────────────────────────────

describe('getCardDisplayValue', () => {
	it('returns card name for Major Arcana (null suit)', () => {
		expect(getCardDisplayValue(fool)).toBe('The Fool');
	});

	it('returns rank for Minor Arcana when rank is present', () => {
		expect(getCardDisplayValue(aceOfWands)).toBe('Ace');
		expect(getCardDisplayValue(twoOfWands)).toBe('Two');
	});

	it('falls back to card name when rank is null on a suited card', () => {
		expect(getCardDisplayValue(customNoRank)).toBe('The Dragon');
	});
});

// ── findCard ──────────────────────────────────────────────────────────────────

describe('findCard', () => {
	it('finds a Major Arcana card by name', () => {
		const card = findCard(rwsCards, MAJOR_ARCANA_SUIT_LABEL, 'The Fool');
		expect(card).toBe(fool);
	});

	it('finds a Minor Arcana card by rank', () => {
		const card = findCard(rwsCards, 'Wands', 'Ace');
		expect(card).toBe(aceOfWands);
	});

	it('returns undefined for a non-existent combination', () => {
		expect(findCard(rwsCards, 'Wands', 'The Empress')).toBeUndefined();
	});

	it('returns undefined for an unknown suit', () => {
		expect(findCard(rwsCards, 'Ether', 'Ace')).toBeUndefined();
	});
});
