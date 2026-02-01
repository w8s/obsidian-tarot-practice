/**
 * Chart.js utilities for draw history statistics
 */

import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Tarot-themed color palette
 */
export const TAROT_COLORS = {
	// Suit colors
	majorArcana: 'rgb(218, 165, 32)',  // Gold
	wands: 'rgb(255, 99, 71)',          // Tomato/red-orange
	cups: 'rgb(100, 149, 237)',         // Cornflower blue
	swords: 'rgb(169, 169, 169)',       // Dark gray
	pentacles: 'rgb(60, 179, 113)',     // Medium sea green
	
	// Chart accents
	primary: 'rgb(147, 51, 234)',       // Purple (tarot mysticism)
	secondary: 'rgb(234, 179, 8)',      // Gold (wisdom)
	tertiary: 'rgb(59, 130, 246)',      // Blue (intuition)
	
	// Dark mode compatible
	text: 'rgb(229, 231, 235)',         // Light gray text
	grid: 'rgba(75, 85, 99, 0.3)',      // Subtle grid lines
};

/**
 * Get common chart options for dark mode compatibility
 */
export function getBaseChartOptions(): ChartConfiguration['options'] {
	return {
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				labels: {
					color: TAROT_COLORS.text,
					font: {
						size: 12,
						family: "'Inter', sans-serif"
					}
				}
			},
			tooltip: {
				backgroundColor: 'rgba(17, 24, 39, 0.9)',
				titleColor: TAROT_COLORS.text,
				bodyColor: TAROT_COLORS.text,
				borderColor: TAROT_COLORS.grid,
				borderWidth: 1
			}
		},
		scales: {
			y: {
				ticks: {
					color: TAROT_COLORS.text,
					precision: 0  // Whole numbers only
				},
				grid: {
					color: TAROT_COLORS.grid
				}
			},
			x: {
				ticks: {
					color: TAROT_COLORS.text
				},
				grid: {
					color: TAROT_COLORS.grid
				}
			}
		}
	};
}

/**
 * Destroy existing chart instance to prevent memory leaks
 */
export function destroyChart(chart: Chart | null): void {
	if (chart) {
		chart.destroy();
	}
}

/**
 * Extract suit from card name
 */
export function getCardSuit(cardName: string): string {
	// Check for Major Arcana
	const majorArcana = [
		'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 
		'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot',
		'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice',
		'The Hanged Man', 'Death', 'Temperance', 'The Devil',
		'The Tower', 'The Star', 'The Moon', 'The Sun',
		'Judgement', 'The World'
	];
	
	if (majorArcana.some(card => cardName.includes(card))) {
		return 'Major Arcana';
	}
	
	// Check for suits in card name
	if (cardName.includes('Wands')) return 'Wands';
	if (cardName.includes('Cups')) return 'Cups';
	if (cardName.includes('Swords')) return 'Swords';
	if (cardName.includes('Pentacles') || cardName.includes('Coins')) return 'Pentacles';
	
	// Default to Unknown if can't determine
	return 'Unknown';
}

/**
 * Get color for a suit
 */
export function getSuitColor(suit: string): string {
	switch (suit) {
		case 'Major Arcana': return TAROT_COLORS.majorArcana;
		case 'Wands': return TAROT_COLORS.wands;
		case 'Cups': return TAROT_COLORS.cups;
		case 'Swords': return TAROT_COLORS.swords;
		case 'Pentacles': return TAROT_COLORS.pentacles;
		default: return TAROT_COLORS.grid;  // Gray for unknown
	}
}
