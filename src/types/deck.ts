/**
 * Represents a single card with its metadata
 * 
 * Based on v1.6.0 planning: structured card data to enable:
 * - Richer templating (filter by suit, rank, category)
 * - Future analytics (suit frequency, court card ratios)
 * - Multi-deck support (different deck structures)
 */
export interface CardDefinition {
	/** Zero-based index in the deck (0-77 for RWS tarot) */
	index: number;

	/** Full card name (e.g., "Ace of Wands", "The Fool") */
	name: string;

	/** 
	 * Deck-specific grouping/category
	 * - Tarot: "Major" or "Minor"
	 * - Runes: "Freyr's Aett", "Heimdall's Aett", "Tyr's Aett"
	 * - Oracle: null or theme name ("Heart Chakra", "Abundance")
	 * - Playing Cards: null
	 */
	category?: string | null;

	/**
	 * Suit name for applicable cards
	 * - Tarot Minor Arcana: "Wands", "Cups", "Swords", "Pentacles"
	 * - Playing Cards: "Hearts", "Diamonds", "Clubs", "Spades"
	 * - Tarot Major Arcana: null
	 * - Oracle: null
	 */
	suit?: string | null;

	/**
	 * Rank name for numbered/court cards
	 * - Values: "Ace", "Two", "Three", ..., "Ten", "Page", "Knight", "Queen", "King"
	 * - Major Arcana: null
	 * - Oracle: null
	 */
	rank?: string | null;

	/**
	 * Numeric value for comparisons and sorting
	 * - Minor Arcana: 1-14 (Ace=1, Two=2, ..., Page=11, Knight=12, Queen=13, King=14)
	 * - Major Arcana: 0-21 (matches index)
	 * - Oracle: null
	 */
	value?: number | null;

	/**
	 * Optional card image path (v1.7.0)
	 * - Relative to deck directory: "cards/00-the-fool.png"
	 * - Or vault path: "Assets/Tarot/RWS/fool.png"
	 * - External URLs NOT supported per Obsidian security guidelines
	 */
	imageUrl?: string;
}

/**
 * Represents a complete deck with metadata
 * 
 * Added in v1.6.1 to prepare for multi-deck support.
 * Wraps a collection of cards with deck-level information.
 */
export interface DeckDefinition {
	/** Unique identifier for this deck (e.g., "rider-waite-smith") */
	id: string;

	/** Display name of the deck (e.g., "Rider-Waite-Smith") */
	name: string;

	/** Optional description of the deck */
	description?: string;

	/** Array of all cards in this deck */
	cards: CardDefinition[];

	/** Total number of cards (convenience, should match cards.length) */
	cardCount: number;

	/** Whether this deck supports reversed cards */
	supportsReversals: boolean;

	/** Whether this is a built-in deck */
	isBuiltIn: boolean;

	/**
	 * Optional deck back image path (v1.7.0)
	 * - Relative to deck directory: "back.png"
	 * - Or vault path: "Assets/Tarot/deck-back.png"
	 * - External URLs NOT supported per Obsidian security guidelines
	 */
	backImageUrl?: string;

	/**
	 * Optional source URL for re-downloading deck images (v1.8.0)
	 * - GitHub release URL: "https://github.com/w8s/obsidian-tarot-decks/releases/download/v1.0.0/elder-futhark.zip"
	 * - Direct download link to ZIP file
	 * - Used for restoring deleted images or updating deck
	 */
	sourceUrl?: string;

	/** Optional metadata about the deck */
	metadata?: {
		/** Deck author/creator */
		author?: string;
		/** Publication year */
		year?: number;
		/** Publisher */
		publisher?: string;
		/** Deck tradition (tarot, oracle, lenormand, runes, etc.) */
		tradition?: string;
		/** Any other custom metadata */
		[key: string]: unknown;
	};
}
