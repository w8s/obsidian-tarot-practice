import { TarotPracticeSettings } from '../settings';

/**
 * Utility for managing standardized template paths
 * Provides consistent folder structure based on user's templateBaseFolder setting
 */
export class TemplatePaths {
	private baseFolder: string;

	constructor(settings: TarotPracticeSettings) {
		this.baseFolder = settings.templateBaseFolder || 'Templates/Tarot';
		// Ensure no trailing slash
		this.baseFolder = this.baseFolder.replace(/\/$/, '');
	}

	/**
	 * Get the base template folder
	 */
	getBaseFolder(): string {
		return this.baseFolder;
	}

	/**
	 * Get the spreads template folder
	 */
	getSpreadsFolder(): string {
		return `${this.baseFolder}/Spreads`;
	}

	/**
	 * Get the daily practice template folder
	 */
	getDailyFolder(): string {
		return `${this.baseFolder}/Daily`;
	}

	/**
	 * Get the inline template folder
	 */
	getInlineFolder(): string {
		return `${this.baseFolder}/Inline`;
	}

	/**
	 * Get the multiple cards template folder
	 */
	getMultipleFolder(): string {
		return `${this.baseFolder}/Multiple`;
	}

	/**
	 * Get the full path for a spread template
	 * @param spreadId - ID of the spread (e.g., 'celtic-cross')
	 */
	getSpreadTemplatePath(spreadId: string): string {
		return `${this.getSpreadsFolder()}/${spreadId}.md`;
	}

	/**
	 * Get the default daily template path
	 */
	getDailyTemplatePath(): string {
		return `${this.getDailyFolder()}/daily-default.md`;
	}

	/**
	 * Get the default inline template path
	 */
	getInlineTemplatePath(): string {
		return `${this.getInlineFolder()}/inline-default.md`;
	}

	/**
	 * Get the default multiple cards template path
	 */
	getMultipleTemplatePath(): string {
		return `${this.getMultipleFolder()}/multiple-default.md`;
	}
}
