/**
 * Utility functions for physical card selection UI.
 *
 * These helpers are deck-type-agnostic: they work purely from
 * CardDefinition data, with no knowledge of UI framework.
 * Reusable for any future card-picker surface.
 */

import type { CardDefinition } from '../types/deck';

/** Sentinel label used for Major Arcana in the suit dropdown */
export const MAJOR_ARCANA_SUIT_LABEL = 'Major Arcana';

/**
 * Determine whether a deck uses structured card data (tarot-style).
 *
 * A deck is "structured" when at least one card has a non-null suit.
 * Oracle / rune / flat decks have all-null suits and render as a
 * single card-name dropdown.
 */
export function isStructuredDeck(cards: CardDefinition[]): boolean {
	return cards.some(card => card.suit != null);
}

/**
 * Build the ordered list of suit labels for the suit dropdown.
 *
 * Order: Major Arcana first (if present), then minor suits in the
 * order they first appear in the deck array (preserves deck author intent).
 *
 * @param cards - Full card array from the selected deck
 * @returns Array of suit display labels (never empty for structured decks)
 */
export function getSuitLabels(cards: CardDefinition[]): string[] {
	const suits: string[] = [];
	let hasMajor = false;

	for (const card of cards) {
		if (card.suit == null) {
			// Null suit + "Major" category → Major Arcana bucket
			if (card.category === 'Major' && !hasMajor) {
				hasMajor = true;
			}
		} else if (!suits.includes(card.suit)) {
			suits.push(card.suit);
		}
	}

	return hasMajor ? [MAJOR_ARCANA_SUIT_LABEL, ...suits] : suits;
}

/**
 * Get the display label for a card within the value dropdown.
 *
 * - Major Arcana → card name ("The Fool", "The World", …)
 * - Minor suit cards with rank → rank ("Ace", "Two", … "King")
 * - Minor suit cards without rank (custom edge case) → card name
 */
export function getCardDisplayValue(card: CardDefinition): string {
	if (card.suit == null) {
		// Major Arcana — always show full name
		return card.name;
	}
	// Minor suit: prefer rank, fall back to name for custom cards
	return card.rank ?? card.name;
}

/**
 * Return all cards that belong to a given suit label.
 *
 * Handles the MAJOR_ARCANA_SUIT_LABEL sentinel: cards with null suit
 * and category === "Major" are returned for that label.
 *
 * @param cards - Full card array from the selected deck
 * @param suitLabel - Value from getSuitLabels()
 */
export function getCardsForSuit(cards: CardDefinition[], suitLabel: string): CardDefinition[] {
	if (suitLabel === MAJOR_ARCANA_SUIT_LABEL) {
		return cards.filter(c => c.suit == null && c.category === 'Major');
	}
	return cards.filter(c => c.suit === suitLabel);
}

/**
 * Find a specific card given a suit label and value label.
 *
 * Used to resolve user dropdown selections back to a CardDefinition.
 * Returns undefined if no match (shouldn't happen with valid UI state).
 */
export function findCard(
	cards: CardDefinition[],
	suitLabel: string,
	valueLabel: string
): CardDefinition | undefined {
	const candidates = getCardsForSuit(cards, suitLabel);
	return candidates.find(c => getCardDisplayValue(c) === valueLabel);
}
