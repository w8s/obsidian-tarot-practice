/**
 * Types for draw history tracking
 */

export interface DrawHistoryEntry {
	/** Unique identifier for this draw */
	id: string;
	
	/** Unix timestamp (milliseconds) */
	timestamp: number;
	
	/** Spread used */
	spreadId: string;
	spreadName: string;
	
	/** Deck used */
	deckId: string;
	deckName: string;
	
	/** User's intention for the draw */
	intention: string;
	
	/** Cards drawn */
	cards: Array<{
		index: number;
		name: string;
		position?: string;
		orientation: string;
	}>;
	
	/** Optional querent information */
	querent?: {
		name: string;
		notePath?: string;
	};
	
	/** Draw metadata */
	metadata: {
		shuffleCount: number;
		wasCut: boolean;
		cutPosition?: number;
		/** Whether this draw was entered manually from a physical deck */
		source?: 'physical' | 'digital';
	};
}

/**
 * Statistics about deck usage
 */
export interface DeckUsageStats {
	deckId: string;
	deckName: string;
	count: number;
}

/**
 * Statistics about spread usage
 */
export interface SpreadUsageStats {
	spreadId: string;
	spreadName: string;
	count: number;
}

/**
 * Card frequency statistics
 */
export interface CardFrequencyStats {
	cardName: string;
	frequency: number;
}

/**
 * Querent reading statistics
 */
export interface QuerentStats {
	querent: string;
	readings: number;
}

/**
 * Date range statistics
 */
export interface DateRangeStats {
	date: string;
	draws: number;
	decksUsed: number;
	spreadsUsed: number;
}
