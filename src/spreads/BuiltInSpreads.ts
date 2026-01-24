import { Spread } from '../core/spreads';

/**
 * Built-in spread definitions
 * These cannot be deleted by users but can be customized
 */

export const DAILY_DRAW_SPREAD: Spread = {
	id: 'daily-draw',
	name: 'Daily Draw',
	description: 'Daily tarot practice - customize card count and deck as needed',
	isBuiltIn: true,
	positions: [
		{ label: 'Card', description: 'Daily guidance card' }
	],
	shuffleCount: 3,
	cutDeck: true,
	templatePath: '',
	insertMode: 'daily-note'
};

export const SINGLE_CARD_SPREAD: Spread = {
	id: 'single-card',
	name: 'Single Card',
	description: 'Quick inline guidance',
	isBuiltIn: true,
	positions: [
		{ label: 'Guidance', description: 'The card drawn for guidance' }
	],
	shuffleCount: 3,
	cutDeck: true,
	templatePath: '',
	insertMode: 'inline'
};

export const THREE_CARD_PAST_PRESENT_FUTURE: Spread = {
	id: 'three-card-ppf',
	name: 'Three Card - Past, Present, Future',
	description: 'Timeline reading showing progression',
	isBuiltIn: true,
	positions: [
		{ label: 'Past', description: 'Past influences affecting the situation' },
		{ label: 'Present', description: 'Current state of affairs' },
		{ label: 'Future', description: 'Likely outcome or future direction' }
	],
	shuffleCount: 3,
	cutDeck: true,
	templatePath: '',
	insertMode: 'new-note'
};

export const THREE_CARD_SITUATION_ACTION_OUTCOME: Spread = {
	id: 'three-card-sao',
	name: 'Three Card - Situation, Action, Outcome',
	description: 'Decision-making spread for clarity',
	isBuiltIn: true,
	positions: [
		{ label: 'Current Situation', description: 'Where you are now' },
		{ label: 'Recommended Action', description: 'What you should do' },
		{ label: 'Likely Outcome', description: 'Result of taking this action' }
	],
	shuffleCount: 3,
	cutDeck: true,
	templatePath: '',
	insertMode: 'new-note'
};

export const FIVE_CARD_WEEK_AHEAD: Spread = {
	id: 'five-card-week',
	name: 'Five Card - Week Ahead',
	description: 'Weekly forecast for planning',
	isBuiltIn: true,
	positions: [
		{ label: 'Monday', description: 'Start of the week energy' },
		{ label: 'Tuesday', description: 'Building momentum' },
		{ label: 'Wednesday', description: 'Mid-week focus' },
		{ label: 'Thursday', description: 'Approaching completion' },
		{ label: 'Friday', description: 'Week\'s conclusion' }
	],
	shuffleCount: 5,
	cutDeck: true,
	templatePath: '',
	insertMode: 'new-note'
};

export const CELTIC_CROSS: Spread = {
	id: 'celtic-cross',
	name: 'Celtic Cross',
	description: 'Comprehensive reading for complex situations',
	isBuiltIn: true,
	positions: [
		{ label: 'Present', description: 'Current situation or heart of the matter' },
		{ label: 'Challenge', description: 'Obstacle or what crosses you' },
		{ label: 'Distant Past', description: 'Foundation or root of the situation' },
		{ label: 'Recent Past', description: 'Recent events that are passing' },
		{ label: 'Best Outcome', description: 'What you can achieve' },
		{ label: 'Near Future', description: 'What is approaching' },
		{ label: 'Your Approach', description: 'Your attitude or how you see yourself' },
		{ label: 'External Influences', description: 'How others see you or environmental factors' },
		{ label: 'Hopes and Fears', description: 'Your inner emotional state' },
		{ label: 'Final Outcome', description: 'Where things are heading' }
	],
	shuffleCount: 7,
	cutDeck: true,
	templatePath: '',
	insertMode: 'new-note'
};

/**
 * Array of all built-in spreads
 */
export const BUILTIN_SPREADS: Spread[] = [
	DAILY_DRAW_SPREAD,
	SINGLE_CARD_SPREAD,
	THREE_CARD_PAST_PRESENT_FUTURE,
	THREE_CARD_SITUATION_ACTION_OUTCOME,
	FIVE_CARD_WEEK_AHEAD,
	CELTIC_CROSS
];
