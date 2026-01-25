import Handlebars from 'handlebars';
import { moment } from 'obsidian';
import { SpreadDrawResult } from '../core/spreads';
import { TarotPracticeSettings } from '../settings';

/**
 * Template data structure for Handlebars rendering
 */
interface TemplateCard {
	index: number;
	position: {
		number: number;
		label: string;
		description?: string;
	};
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
	deck_id: string;
	deck_card_count: number;
	deck_supports_reversals: boolean;
	timestamp: number;
	cards: TemplateCard[];
	date: string;
	time: string;
	querent?: {
		name: string;
		notePath: string;
		hasPath: boolean;
	} | null;
	[key: string]: string | number | boolean | TemplateCard[] | object | null | undefined;
}

/**
 * Formats draw results using Handlebars templates
 * Handles all template variable substitution including loops and conditionals
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
			deck_id: result.deck.id,
			deck_card_count: result.deck.cardCount,
			deck_supports_reversals: result.deck.supportsReversals,

			// Raw timestamp for Handlebars helpers
			timestamp: timestampNum,

			// Querent information (optional)
			querent: result.querent
				? {
					name: result.querent.name,
					notePath: result.querent.notePath ?? '',
					hasPath: !!result.querent.notePath
				}
				: null,

			// Cards array for loops
			cards: result.positions.map(pos => ({
				index: pos.cardIndex,
				position: {
					number: pos.number,
					label: pos.label,
					description: pos.description
				},
				name: pos.card,
				orientation: pos.orientation,
				isReversed: pos.isReversed
			})),

			// Date/time variables (default formats)
			date: date.format('L'),
			time: date.format('LT'),
			datetime: date.format('L LT'),

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
