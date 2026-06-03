import type { DeckDefinition } from '../types/deck';

/**
 * Validation result with errors and warnings
 */
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validates deck definitions to ensure they meet requirements
 */
export class DeckValidator {
	/** Maximum allowed card count */
	static readonly MAX_CARD_COUNT = 1000;
	/** Maximum length for deck id */
	static readonly MAX_ID_LENGTH = 64;
	/** Maximum length for deck/card name fields */
	static readonly MAX_NAME_LENGTH = 256;
	/** Valid deck id pattern: alphanumeric, hyphens, underscores only */
	static readonly VALID_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
	/**
	 * Validate a complete deck definition
	 */
	static validate(deck: unknown): ValidationResult {
		const result: ValidationResult = {
			isValid: true,
			errors: [],
			warnings: []
		};

		// Check if deck is an object
		if (!deck || typeof deck !== 'object') {
			result.errors.push('Deck must be an object');
			result.isValid = false;
			return result;
		}

		const d = deck as Partial<DeckDefinition>;

		// Required field checks
		this.validateRequiredFields(d, result);
		
		if (!result.isValid) {
			return result; // Stop if critical errors
		}

		// Type-safe checks after required fields validated
		this.validateCardCount(d as DeckDefinition, result);
		this.validateCardIndices(d as DeckDefinition, result);
		this.validateCardNames(d as DeckDefinition, result);

		return result;
	}

	private static validateRequiredFields(
		deck: Partial<DeckDefinition>,
		result: ValidationResult
	): void {
		// Check required string fields
		const requiredStrings: Array<keyof DeckDefinition> = ['id', 'name'];
		for (const field of requiredStrings) {
			if (!deck[field] || typeof deck[field] !== 'string') {
				result.errors.push(`Missing or invalid required field: ${field}`);
				result.isValid = false;
			}
		}

		// Validate id format and length
		if (deck.id && typeof deck.id === 'string') {
			if (deck.id.length > DeckValidator.MAX_ID_LENGTH) {
				result.errors.push(`Deck id exceeds maximum length of ${DeckValidator.MAX_ID_LENGTH} characters`);
				result.isValid = false;
			} else if (!DeckValidator.VALID_ID_PATTERN.test(deck.id)) {
				result.errors.push('Deck id must contain only alphanumeric characters, hyphens, and underscores');
				result.isValid = false;
			}
		}

		// Validate name length
		if (deck.name && typeof deck.name === 'string') {
			if (deck.name.length > DeckValidator.MAX_NAME_LENGTH) {
				result.errors.push(`Deck name exceeds maximum length of ${DeckValidator.MAX_NAME_LENGTH} characters`);
				result.isValid = false;
			}
		}

		// Check cards array
		if (!Array.isArray(deck.cards)) {
			result.errors.push('Missing or invalid required field: cards (must be array)');
			result.isValid = false;
		}

		// Check numeric fields
		if (typeof deck.cardCount !== 'number' || deck.cardCount < 1) {
			result.errors.push('Missing or invalid required field: cardCount (must be positive number)');
			result.isValid = false;
		}

		// Check boolean fields
		if (typeof deck.supportsReversals !== 'boolean') {
			result.errors.push('Missing or invalid required field: supportsReversals (must be boolean)');
			result.isValid = false;
		}

		if (typeof deck.isBuiltIn !== 'boolean') {
			result.errors.push('Missing or invalid required field: isBuiltIn (must be boolean)');
			result.isValid = false;
		}
	}

	private static validateCardCount(
		deck: DeckDefinition,
		result: ValidationResult
	): void {
		if (deck.cards.length !== deck.cardCount) {
			result.errors.push(
				`cardCount (${deck.cardCount}) doesn't match cards.length (${deck.cards.length})`
			);
			result.isValid = false;
		}

		// Hard cap on card count
		if (deck.cardCount > DeckValidator.MAX_CARD_COUNT) {
			result.errors.push(`cardCount exceeds maximum of ${DeckValidator.MAX_CARD_COUNT}`);
			result.isValid = false;
		}

		// Warn about unusual card counts
		if (deck.cardCount < 10) {
			result.warnings.push(`Unusually small deck: ${deck.cardCount} cards`);
		}
		if (deck.cardCount > 100) {
			result.warnings.push(`Unusually large deck: ${deck.cardCount} cards`);
		}
	}

	private static validateCardIndices(
		deck: DeckDefinition,
		result: ValidationResult
	): void {
		const indices = new Set<number>();
		
		for (let i = 0; i < deck.cards.length; i++) {
			const card = deck.cards[i];
			
			// Check required card fields
			if (typeof card?.index !== 'number') {
				result.errors.push(`Card at position ${i} missing or invalid 'index' field`);
				result.isValid = false;
				continue;
			}
			
			if (!card.name || typeof card.name !== 'string') {
				result.errors.push(`Card at index ${card.index} missing or invalid 'name' field`);
				result.isValid = false;
				continue;
			}

			// Check for duplicate indices
			if (indices.has(card.index)) {
				result.errors.push(`Duplicate card index: ${card.index}`);
				result.isValid = false;
			}
			indices.add(card.index);

			// Check index is in valid range
			if (card.index < 0 || card.index >= deck.cardCount) {
				result.errors.push(
					`Card index ${card.index} out of range (must be 0-${deck.cardCount - 1})`
				);
				result.isValid = false;
			}
		}

		// Check indices are sequential (0 to cardCount-1)
		for (let i = 0; i < deck.cardCount; i++) {
			if (!indices.has(i)) {
				result.errors.push(`Missing card with index ${i} (indices must be sequential)`);
				result.isValid = false;
			}
		}
	}

	private static validateCardNames(
		deck: DeckDefinition,
		result: ValidationResult
	): void {
		const names = new Map<string, number[]>(); // name -> indices
		
		for (const card of deck.cards) {
			// Check card name length
			if (card.name.length > DeckValidator.MAX_NAME_LENGTH) {
				result.errors.push(
					`Card at index ${card.index} name exceeds maximum length of ${DeckValidator.MAX_NAME_LENGTH} characters`
				);
				result.isValid = false;
			}

			if (!names.has(card.name)) {
				names.set(card.name, []);
			}
			names.get(card.name)!.push(card.index);
		}

		// Check for duplicate names (warning only)
		for (const [name, indices] of names.entries()) {
			if (indices.length > 1) {
				result.warnings.push(
					`Duplicate card name "${name}" at indices: ${indices.join(', ')}`
				);
			}
		}
	}
}
