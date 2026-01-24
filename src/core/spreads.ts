import { Deck } from './Deck';

/**
 * Definition of a tarot spread
 */
export interface Spread {
	/** Unique identifier (e.g., "celtic-cross") */
	id: string;
	
	/** Display name (e.g., "Celtic Cross") */
	name: string;
	
	/** Purpose/explanation of the spread */
	description: string;
	
	/** True for built-in spreads (cannot be deleted) */
	isBuiltIn: boolean;
	
	/** Position definitions for this spread */
	positions: SpreadPositionDefinition[];
	
	/** Number of times to shuffle the deck (1-7) */
	shuffleCount: number;
	
	/** Whether to cut the deck after shuffling */
	cutDeck: boolean;
	
	/** Path to template file, or empty string for built-in template */
	templatePath: string;
	
	/** Where to insert the reading result */
	insertMode: 'daily-note' | 'new-note' | 'inline';
}

/**
 * Definition of a single position within a spread
 */
export interface SpreadPositionDefinition {
	/** Short label for the position (e.g., "Past", "Challenge") */
	label: string;
	
	/** Optional longer explanation of what this position represents */
	description?: string;
}

/**
 * Result of drawing cards for a spread
 */
export interface SpreadDrawResult {
	/** The spread that was used */
	spread: Spread;
	
	/** User's intention for the draw */
	intention: string;
	
	/** Timestamp of the draw (milliseconds) */
	timestamp: number;
	
	/** Results for each position */
	positions: SpreadPositionResult[];
	
	/** Deck used for this draw */
	deck: Deck;
	
	/** Deck preparation metadata */
	shuffleCount: number;
	wasCut: boolean;
	cutPosition?: number;
	cutPositionCards?: number;
	cutBase?: number;
	cutVariance?: number;
	
	/** Optional querent information (who the reading is for) */
	querent?: {
		name: string;
		notePath?: string;
	};
}

/**
 * Result for a single position in a spread draw
 */
export interface SpreadPositionResult {
	/** 0-based position index (for programmatic access) */
	index: number;
	
	/** 1-based position number (for display: "1.", "2.", etc.) */
	number: number;
	
	/** Position label from spread definition */
	label: string;
	
	/** Position description from spread definition */
	description?: string;
	
	/** Card name (e.g., "The Hermit", "Ace of Cups") */
	card: string;
	
	/** Card's index in deck (0-77) */
	cardIndex: number;
	
	/** Orientation text ("" for upright or "reversed") */
	orientation: string;
	
	/** Boolean for conditional logic in templates */
	isReversed: boolean;
}
