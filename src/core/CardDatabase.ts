import type { CardDefinition, DeckDefinition } from '../types/deck';

/**
 * Helper to create a Major Arcana card definition
 */
function createMajorCard(index: number, name: string): CardDefinition {
	return {
		index,
		name,
		category: "Major",
		suit: null,
		rank: null,
		value: index
	};
}

/**
 * Helper to create a Minor Arcana card definition
 */
function createMinorCard(
	index: number,
	suit: "Wands" | "Cups" | "Swords" | "Pentacles",
	rank: string,
	value: number
): CardDefinition {
	return {
		index,
		name: `${rank} of ${suit}`,
		category: "Minor",
		suit,
		rank,
		value
	};
}

// Major Arcana (0-21)
const MAJOR_ARCANA: CardDefinition[] = [
	createMajorCard(0, "The Fool"),
	createMajorCard(1, "The Magician"),
	createMajorCard(2, "The High Priestess"),
	createMajorCard(3, "The Empress"),
	createMajorCard(4, "The Emperor"),
	createMajorCard(5, "The Hierophant"),
	createMajorCard(6, "The Lovers"),
	createMajorCard(7, "The Chariot"),
	createMajorCard(8, "Strength"),
	createMajorCard(9, "The Hermit"),
	createMajorCard(10, "Wheel of Fortune"),
	createMajorCard(11, "Justice"),
	createMajorCard(12, "The Hanged Man"),
	createMajorCard(13, "Death"),
	createMajorCard(14, "Temperance"),
	createMajorCard(15, "The Devil"),
	createMajorCard(16, "The Tower"),
	createMajorCard(17, "The Star"),
	createMajorCard(18, "The Moon"),
	createMajorCard(19, "The Sun"),
	createMajorCard(20, "Judgement"),
	createMajorCard(21, "The World")
];

// Helper to create a full suit of Minor Arcana
function createSuit(
	suit: "Wands" | "Cups" | "Swords" | "Pentacles",
	startIndex: number
): CardDefinition[] {
	const ranks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
	const courts = ["Page", "Knight", "Queen", "King"];
	
	const cards: CardDefinition[] = [];
	
	// Numbered cards (Ace-Ten)
	ranks.forEach((rank, i) => {
		cards.push(createMinorCard(startIndex + i, suit, rank, i + 1));
	});
	
	// Court cards
	courts.forEach((rank, i) => {
		cards.push(createMinorCard(startIndex + 10 + i, suit, rank, 11 + i));
	});
	
	return cards;
}

// Minor Arcana - Wands (22-35)
const WANDS = createSuit("Wands", 22);

// Minor Arcana - Cups (36-49)
const CUPS = createSuit("Cups", 36);

// Minor Arcana - Swords (50-63)
const SWORDS = createSuit("Swords", 50);

// Minor Arcana - Pentacles (64-77)
const PENTACLES = createSuit("Pentacles", 64);

// Complete RWS Deck Definition
export const RWS_DECK: DeckDefinition = {
	id: "rider-waite-smith",
	name: "Rider-Waite-Smith",
	description: "The classic tarot deck created by Arthur Edward Waite and illustrated by Pamela Colman Smith",
	cards: [
		...MAJOR_ARCANA,
		...WANDS,
		...CUPS,
		...SWORDS,
		...PENTACLES
	],
	cardCount: 78,
	supportsReversals: true,
	isBuiltIn: true,
	metadata: {
		author: "Pamela Colman Smith",
		year: 1909,
		publisher: "Rider & Company",
		tradition: "tarot"
	}
};

// Backward compatibility - export the cards array
export const RWS_CARDS = RWS_DECK.cards;

// Get a specific card by index
export function getCard(index: number): CardDefinition {
	if (index < 0 || index >= RWS_DECK.cardCount) {
		throw new Error(`Invalid card index: ${index}. Must be between 0 and ${RWS_DECK.cardCount - 1}`);
	}
	return RWS_DECK.cards[index]!;
}

// Backward compatibility - keep the old function
export function getCardName(index: number): string {
	return getCard(index).name;
}

// New helper - get the current deck
export function getDeck(): DeckDefinition {
	return RWS_DECK;
}
