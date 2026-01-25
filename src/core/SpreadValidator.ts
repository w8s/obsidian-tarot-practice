import type { Spread } from './spreads';

/**
 * Validation result with errors and warnings
 */
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validates spread definitions to ensure they meet requirements
 */
export class SpreadValidator {
	/**
	 * Validate a complete spread definition
	 */
	static validate(spread: unknown): ValidationResult {
		const result: ValidationResult = {
			isValid: true,
			errors: [],
			warnings: []
		};

		// Check if spread is an object
		if (!spread || typeof spread !== 'object') {
			result.errors.push('Spread must be an object');
			result.isValid = false;
			return result;
		}

		const s = spread as Partial<Spread>;

		// Required field checks
		this.validateRequiredFields(s, result);
		
		if (!result.isValid) {
			return result; // Stop if critical errors
		}
		// Type-safe checks after required fields validated
		this.validateId(s as Spread, result);
		this.validatePositions(s as Spread, result);
		this.validateShuffleSettings(s as Spread, result);
		this.validateOptionalFields(s as Spread, result);

		return result;
	}

	private static validateRequiredFields(
		spread: Partial<Spread>,
		result: ValidationResult
	): void {
		// Check required string fields
		const requiredStrings: Array<keyof Spread> = ['id', 'name', 'description'];
		for (const field of requiredStrings) {
			if (!spread[field] || typeof spread[field] !== 'string') {
				result.errors.push(`Missing or invalid required field: ${field}`);
				result.isValid = false;
			}
		}

		// Check positions array
		if (!Array.isArray(spread.positions)) {
			result.errors.push('Missing or invalid required field: positions (must be array)');
			result.isValid = false;
		} else if (spread.positions.length === 0) {
			result.errors.push('Spread must have at least one position');
			result.isValid = false;
		}

		// Check boolean fields
		if (typeof spread.isBuiltIn !== 'boolean') {
			result.errors.push('Missing or invalid required field: isBuiltIn (must be boolean)');
			result.isValid = false;
		}

		// Check numeric fields
		if (typeof spread.shuffleCount !== 'number' || spread.shuffleCount < 1 || spread.shuffleCount > 7) {
			result.errors.push('Missing or invalid required field: shuffleCount (must be 1-7)');
			result.isValid = false;
		}

		if (typeof spread.cutDeck !== 'boolean') {
			result.errors.push('Missing or invalid required field: cutDeck (must be boolean)');
			result.isValid = false;
		}

		// Check templatePath (can be empty string)
		if (typeof spread.templatePath !== 'string') {
			result.errors.push('Missing or invalid required field: templatePath (must be string)');
			result.isValid = false;
		}

		// Check insertMode
		const validInsertModes = ['daily-note', 'new-note', 'inline'];
		if (!spread.insertMode || !validInsertModes.includes(spread.insertMode)) {
			result.errors.push(`Missing or invalid required field: insertMode (must be one of: ${validInsertModes.join(', ')})`);
			result.isValid = false;
		}
	}

	private static validateId(
		spread: Spread,
		result: ValidationResult
	): void {
		// ID should be lowercase with hyphens only
		if (!/^[a-z0-9-]+$/.test(spread.id)) {
			result.errors.push('Spread ID must be lowercase letters, numbers, and hyphens only');
			result.isValid = false;
		}

		// Warn about very long IDs
		if (spread.id.length > 50) {
			result.warnings.push(`Spread ID is very long (${spread.id.length} chars)`);
		}
	}

	private static validatePositions(
		spread: Spread,
		result: ValidationResult
	): void {
		// Maximum positions is a full deck
		if (spread.positions.length > 78) {
			result.errors.push(`Too many positions (${spread.positions.length}). Maximum is 78.`);
			result.isValid = false;
			return;
		}

		// Warn about large spreads
		if (spread.positions.length > 20) {
			result.warnings.push(`Large spread with ${spread.positions.length} positions`);
		}

		// Validate each position
		const labels = new Map<string, number[]>(); // label -> indices
		
		for (let i = 0; i < spread.positions.length; i++) {
			const position = spread.positions[i];

			// Check position is an object
			if (!position || typeof position !== 'object') {
				result.errors.push(`Position at index ${i} is not an object`);
				result.isValid = false;
				continue;
			}

			// Check required label field
			if (!position.label || typeof position.label !== 'string') {
				result.errors.push(`Position at index ${i} missing or invalid 'label' field`);
				result.isValid = false;
				continue;
			}

			// Track labels for duplicate detection
			if (!labels.has(position.label)) {
				labels.set(position.label, []);
			}
			labels.get(position.label)!.push(i);

			// Check optional description field
			if (position.description !== undefined && typeof position.description !== 'string') {
				result.errors.push(`Position "${position.label}" has invalid 'description' field (must be string)`);
				result.isValid = false;
			}
		}

		// Check for duplicate position labels (warning only - allowed but unusual)
		for (const [label, indices] of labels.entries()) {
			if (indices.length > 1) {
				result.warnings.push(
					`Duplicate position label "${label}" at indices: ${indices.join(', ')}`
				);
			}
		}
	}

	private static validateShuffleSettings(
		spread: Spread,
		result: ValidationResult
	): void {
		// Warn about unusual shuffle counts
		if (spread.shuffleCount === 1) {
			result.warnings.push('Only 1 shuffle - consider 3 or more for better randomness');
		}
		if (spread.shuffleCount === 7) {
			result.warnings.push('7 shuffles is maximum - diminishing returns beyond 3-5');
		}
	}

	private static validateOptionalFields(
		spread: Spread,
		result: ValidationResult
	): void {
		// Check metadata if present
		if ('metadata' in spread) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
			const metadata = (spread as any).metadata;
			
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (metadata && typeof metadata === 'object') {
				// Recommend metadata fields
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if (!metadata.author) {
					result.warnings.push('Consider adding metadata.author for attribution');
				}
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if (!metadata.tradition) {
					result.warnings.push('Consider adding metadata.tradition (e.g., "tarot", "oracle")');
				}
			}
		}
	}
}
