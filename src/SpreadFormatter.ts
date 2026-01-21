import Handlebars from 'handlebars';
import { moment } from 'obsidian';
import { SpreadDrawResult } from './spreads';

/**
 * Formats spread draw results using Handlebars templates
 * Handles all template variable substitution including loops and conditionals
 */
export class SpreadFormatter {
	/**
	 * Format a spread draw result using a Handlebars template
	 */
	format(result: SpreadDrawResult, template: string): string {
		// Compile the Handlebars template
		const compiledTemplate = Handlebars.compile(template);

		// Prepare the data object for Handlebars
		const data = this.prepareTemplateData(result);

		// Render the template with the data
		return compiledTemplate(data);
	}

	/**
	 * Prepare the data object for Handlebars template rendering
	 */
	private prepareTemplateData(result: SpreadDrawResult): Record<string, any> {
		// Ensure timestamp is a number
		const timestampNum = typeof result.timestamp === 'number' 
			? result.timestamp 
			: parseInt(result.timestamp as any, 10);
		
		const date = moment(timestampNum);

		return {
			// Spread information
			spread_name: result.spread.name,
			spread_description: result.spread.description,
			intention: result.intention,
			card_count: result.positions.length,

			// Raw timestamp for Handlebars helpers
			timestamp: timestampNum,

			// Positions array for loops
			positions: result.positions.map(pos => ({
				index: pos.index,
				number: pos.number,
				label: pos.label,
				card: pos.card,
				cardIndex: pos.cardIndex,
				orientation: pos.orientation,
				isReversed: pos.isReversed
			})),

			// Date/time variables (default formats)
			date: date.format('L'),
			time: date.format('LT'),
			datetime: date.format('L LT'),

			// Deck preparation metadata
			shuffle_count: result.shuffleCount,
			was_cut: result.wasCut,
			cut_position: result.cutPosition ? `${result.cutPosition.toFixed(1)}%` : '',
			cut_position_cards: result.cutPositionCards || '',
			cut_base: result.cutBase ? `${result.cutBase.toFixed(1)}%` : '',
			cut_variance: result.cutVariance ? `${result.cutVariance >= 0 ? '+' : ''}${result.cutVariance.toFixed(1)}%` : ''
		};
	}
}

/**
 * Register custom Handlebars helpers for advanced formatting
 * Call this once during plugin initialization
 */
export function registerHandlebarsHelpers(): void {
	// Custom date/time formatting helpers
	// These helpers accept the timestamp and optional format as parameters
	// Usage: {{formatDate timestamp "YYYY-MM-DD"}}
	
	Handlebars.registerHelper('formatDate', function(timestamp: number, format?: string) {
		const m = moment(timestamp);
		return format ? m.format(format) : m.format('L');
	});

	Handlebars.registerHelper('formatTime', function(timestamp: number, format?: string) {
		const m = moment(timestamp);
		return format ? m.format(format) : m.format('LT');
	});

	Handlebars.registerHelper('formatDateTime', function(timestamp: number, format?: string) {
		const m = moment(timestamp);
		return format ? m.format(format) : m.format('L LT');
	});
}
