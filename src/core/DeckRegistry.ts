import type { DeckDefinition } from '../types/deck';
import { RWS_DECK } from './CardDatabase';

/**
 * Registry for managing all available decks (built-in and custom)
 */
export class DeckRegistry {
	private decks: Map<string, DeckDefinition> = new Map();

	constructor() {
		// Register built-in RWS deck
		this.registerDeck(RWS_DECK);
	}

	/**
	 * Register a deck
	 */
	registerDeck(deck: DeckDefinition): void {
		this.decks.set(deck.id, deck);
	}

	/**
	 * Get deck by ID
	 */
	getDeck(id: string): DeckDefinition | undefined {
		return this.decks.get(id);
	}

	/**
	 * Get all decks
	 */
	getAllDecks(): DeckDefinition[] {
		return Array.from(this.decks.values());
	}

	/**
	 * Get built-in decks only
	 */
	getBuiltInDecks(): DeckDefinition[] {
		return this.getAllDecks().filter(d => d.isBuiltIn);
	}

	/**
	 * Get custom (user-added) decks only
	 */
	getCustomDecks(): DeckDefinition[] {
		return this.getAllDecks().filter(d => !d.isBuiltIn);
	}

	/**
	 * Remove a deck from registry
	 * Cannot remove built-in decks
	 */
	removeDeck(id: string): boolean {
		const deck = this.decks.get(id);
		if (!deck) {
			return false;
		}

		if (deck.isBuiltIn) {
			throw new Error('Cannot remove built-in decks');
		}

		return this.decks.delete(id);
	}

	/**
	 * Check if deck exists
	 */
	hasDeck(id: string): boolean {
		return this.decks.has(id);
	}

	/**
	 * Get total deck count
	 */
	getDeckCount(): number {
		return this.decks.size;
	}

	/**
	 * Clear all custom decks (keeps built-in)
	 */
	clearCustomDecks(): void {
		const customIds = this.getCustomDecks().map(d => d.id);
		for (const id of customIds) {
			this.decks.delete(id);
		}
	}
}
