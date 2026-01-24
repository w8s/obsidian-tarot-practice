/**
 * Deck type definitions
 */

/**
 * Types of divination decks supported
 */
export type DeckType = 'tarot' | 'oracle' | 'lenormand' | 'playing-cards' | 'other';

/**
 * Definition of a divination deck
 */
export interface Deck {
	/** Unique identifier (e.g., "rws", "sacred-rebels-oracle") */
	id: string;
	
	/** Display name (e.g., "Rider-Waite-Smith", "Sacred Rebels Oracle") */
	name: string;
	
	/** Type of deck */
	type: DeckType;
	
	/** Number of cards in the deck */
	cardCount: number;
	
	/** Whether this deck supports reversals */
	supportsReversals: boolean;
	
	/** True for built-in decks (cannot be deleted) */
	isBuiltIn: boolean;
}

/**
 * Default Rider-Waite-Smith tarot deck
 */
export const DEFAULT_DECK: Deck = {
	id: 'rws',
	name: 'Rider-Waite-Smith',
	type: 'tarot',
	cardCount: 78,
	supportsReversals: true,
	isBuiltIn: true
};
