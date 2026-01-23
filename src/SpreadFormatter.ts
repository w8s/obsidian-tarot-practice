import Handlebars from 'handlebars';
import { moment } from 'obsidian';
import { SpreadDrawResult } from './spreads';
import { DrawResult, MultipleDrawResult } from './TarotDrawModal';
import { TarotPracticeSettings } from './settings';

/**
 * Template data structure for Handlebars rendering
 */
interface TemplatePosition {
	index: number;
	number: number;
	label: string;
	name: string;
	orientation: string;
	isReversed: boolean;
}

interface TemplateData {
	spread_name: string;
	spread_description: string;
	intention: string;
	card_count: number;
	deck_name: string;
	deck_type: string;
	timestamp: number;
	positions: TemplatePosition[];
	date: string;
	time: string;
	year: string;
	month: string;
	day: string;
	hour: string;
	minute: string;
	second: string;
	[key: string]: string | number | boolean | TemplatePosition[];
}

/**
 * Formats draw results using Handlebars templates
 * Handles all template variable substitution including loops and conditionals
 * Used for spreads, single draws, and multiple draws
 */
export class SpreadFormatter {
	constructor(private settings: TarotPracticeSettings) {}

	/**
	 * Format a spread draw result using a Handlebars template
	 */
	format(result: SpreadDrawResult, template: string): string {
		const processedTemplate = this.preprocessTemplate(template);
		const compiledTemplate = Handlebars.compile(processedTemplate);
		const data = this.prepareTemplateData(result);
		return compiledTemplate(data);
	}

	/**
	 * Prepare the data object for Handlebars template rendering
	 */
	private prepareTemplateData(result: SpreadDrawResult): TemplateData {
		// Ensure timestamp is a number
		const timestampNum = typeof result.timestamp === 'number' 
			? result.timestamp 
			: parseInt(result.timestamp as string, 10);
		
		const date = moment(timestampNum);

		return {
			// Spread information
			spread_name: result.spread.name,
			spread_description: result.spread.description,
			intention: result.intention,
			card_count: result.positions.length,

			// Deck information
			deck_name: result.deck.name,
			deck_type: result.deck.type,

			// Raw timestamp for Handlebars helpers
			timestamp: timestampNum,

			// Positions array for loops
			positions: result.positions.map(pos => ({
				index: pos.cardIndex,
				number: pos.number,
				label: pos.label,
				name: pos.card,
				orientation: pos.orientation,
				isReversed: pos.isReversed
			})),

			// Date/time variables (default formats)
			date: date.format('L'),
			time: date.format('LT'),
			datetime: date.format('L LT'),
			
			// Individual date/time components
			year: date.format('YYYY'),
			month: date.format('MM'),
			day: date.format('DD'),
			hour: date.format('HH'),
			minute: date.format('mm'),
			second: date.format('ss'),

			// Deck preparation metadata
			shuffle_count: result.shuffleCount,
			was_cut: result.wasCut ? 'yes' : 'no',
			cut_position: result.cutPosition ? `${result.cutPosition.toFixed(1)}%` : 'N/A',
			cut_position_cards: result.cutPositionCards || 'N/A',
			cut_base: result.cutBase ? `${result.cutBase.toFixed(1)}%` : 'N/A',
			cut_variance: result.cutVariance ? `${result.cutVariance >= 0 ? '+' : ''}${result.cutVariance.toFixed(1)}%` : 'N/A'
		};
	}

	/**
	 * Format a single card draw using a Handlebars template
	 */
	formatSingle(result: DrawResult, template: string): string {
		const processedTemplate = this.preprocessTemplate(template);
		const compiledTemplate = Handlebars.compile(processedTemplate);
		const data = this.prepareSingleDrawData(result);
		return compiledTemplate(data);
	}

	/**
	 * Format a multiple card draw using a Handlebars template
	 */
	formatMultiple(result: MultipleDrawResult, template: string): string {
		const processedTemplate = this.preprocessTemplate(template);
		const compiledTemplate = Handlebars.compile(processedTemplate);
		const data = this.prepareMultipleDrawData(result);
		return compiledTemplate(data);
	}

	/**
	 * Preprocess template to convert {{date:FORMAT}} syntax to Handlebars helper calls
	 * This maintains backward compatibility with existing templates
	 */
	private preprocessTemplate(template: string): string {
		// Convert {{date:FORMAT}} to {{formatDate timestamp "FORMAT"}}
		template = template.replace(/\{\{date:([^}]+)\}\}/g, '{{formatDate timestamp "$1"}}');
		
		// Convert {{time:FORMAT}} to {{formatTime timestamp "FORMAT"}}
		template = template.replace(/\{\{time:([^}]+)\}\}/g, '{{formatTime timestamp "$1"}}');
		
		// Convert {{datetime:FORMAT}} to {{formatDateTime timestamp "FORMAT"}}
		template = template.replace(/\{\{datetime:([^}]+)\}\}/g, '{{formatDateTime timestamp "$1"}}');
		
		return template;
	}

	/**
	 * Prepare data for single card draw
	 */
	private prepareSingleDrawData(result: DrawResult): Record<string, string | number> {
		const date = moment(result.timestamp);
		
		// Calculate orientation from settings
		const orientation = result.isReversed 
			? this.settings.reversedIndicator 
			: this.settings.uprightIndicator;

		return {
			// Card information
			name: result.cardName,
			index: result.cardIndex,
			intention: result.intention,
			orientation: orientation,

			// Deck information
			deck_name: result.deck.name,
			deck_type: result.deck.type,

			// Timestamp for helpers
			timestamp: result.timestamp,

			// Date/time variables (default formats)
			date: date.format('L'),
			time: date.format('LT'),
			datetime: date.format('L LT'),

			// Deck preparation metadata
			shuffle_count: result.shuffleCount,
			was_cut: result.wasCut ? 'yes' : 'no',
			cut_position: result.cutPositionPercent !== null ? `${result.cutPositionPercent}%` : 'N/A',
			cut_position_cards: result.cutPositionCards !== null ? result.cutPositionCards.toString() : 'N/A',
			cut_base: result.cutBasePercent !== null ? `${result.cutBasePercent}%` : 'N/A',
			cut_variance: result.cutVariancePercent !== null 
				? `${result.cutVariancePercent >= 0 ? '+' : ''}${result.cutVariancePercent}%` 
				: 'N/A'
		};
	}

	/**
	 * Prepare data for multiple card draw
	 */
	private prepareMultipleDrawData(result: MultipleDrawResult): Record<string, string | number | Array<{number: number; name: string; index: number; orientation: string; isReversed: boolean}>> {
		const date = moment(result.timestamp);

		// Provide cards as array for loops
		const cards = result.cards.map((card, index) => ({
			number: index + 1,
			name: card.cardName,
			index: card.cardIndex,
			orientation: card.isReversed 
				? this.settings.reversedIndicator 
				: this.settings.uprightIndicator,
			isReversed: card.isReversed
		}));

		return {
			// Draw information
			intention: result.intention,
			card_count: result.cards.length,

			// Deck information
			deck_name: result.deck.name,
			deck_type: result.deck.type,

			// Timestamp for helpers
			timestamp: result.timestamp,

			// Cards as array for loops
			cards: cards,

			// Date/time variables (default formats)
			date: date.format('L'),
			time: date.format('LT'),
			datetime: date.format('L LT'),

			// Deck preparation metadata
			shuffle_count: result.shuffleCount,
			was_cut: result.wasCut ? 'yes' : 'no',
			cut_position: result.cutPositionPercent !== null ? `${result.cutPositionPercent}%` : 'N/A',
			cut_position_cards: result.cutPositionCards !== null ? result.cutPositionCards.toString() : 'N/A',
			cut_base: result.cutBasePercent !== null ? `${result.cutBasePercent}%` : 'N/A',
			cut_variance: result.cutVariancePercent !== null 
				? `${result.cutVariancePercent >= 0 ? '+' : ''}${result.cutVariancePercent}%` 
				: 'N/A'
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
