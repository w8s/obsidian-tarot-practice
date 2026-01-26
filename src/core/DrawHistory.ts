/**
 * Draw history tracking with AlaSQL for querying
 */

import alasql from 'alasql';
import type TarotPracticePlugin from '../main';
import type { SpreadDrawResult } from './spreads';
import type {
	DrawHistoryEntry,
	DeckUsageStats,
	SpreadUsageStats,
	CardFrequencyStats,
	QuerentStats,
	DateRangeStats
} from '../types/history';

export class DrawHistory {
	private plugin: TarotPracticePlugin;
	private draws: DrawHistoryEntry[] = [];
	private readonly MAX_ENTRIES = 1000;

	constructor(plugin: TarotPracticePlugin) {
		this.plugin = plugin;
		// Configure AlaSQL
		alasql.options.cache = false; // Disable query caching for fresh results
	}

	/**
	 * Load draw history from plugin data
	 */
	async load(): Promise<void> {
		const data = await this.plugin.loadData() as { drawHistory?: DrawHistoryEntry[] } | null;
		this.draws = data?.drawHistory ?? [];
	}

	/**
	 * Save draw history to plugin data
	 */
	async save(): Promise<void> {
		const currentData = await this.plugin.loadData() as Record<string, unknown> | null;
		await this.plugin.saveData({
			...(currentData ?? {}),
			drawHistory: this.draws
		});
	}

	/**
	 * Add a new draw to history
	 */
	async addDraw(result: SpreadDrawResult): Promise<void> {
		const entry: DrawHistoryEntry = {
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			spreadId: result.spread.id,
			spreadName: result.spread.name,
			deckId: result.deck.id,
			deckName: result.deck.name,
			intention: result.intention,
			cards: result.positions.map((pos) => ({
				index: pos.cardIndex,
				name: pos.card,
				position: pos.label,
				orientation: pos.orientation
			})),
			querent: result.querent,
			metadata: {
				shuffleCount: result.shuffleCount,
				wasCut: result.wasCut,
				cutPosition: result.cutPosition
			}
		};

		// Add to beginning (newest first)
		this.draws.unshift(entry);

		// Trim to max entries
		if (this.draws.length > this.MAX_ENTRIES) {
			this.draws = this.draws.slice(0, this.MAX_ENTRIES);
		}

		await this.save();
	}

	/**
	 * Get recent draws
	 */
	getRecent(count: number = 10): DrawHistoryEntry[] {
		// Sort in-memory instead of using SQL
		return this.draws
			.slice()
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, count);
	}

	/**
	 * Get draws by date range (Unix timestamps)
	 */
	getByDateRange(start: number, end: number): DrawHistoryEntry[] {
		return this.draws
			.filter(d => d.timestamp >= start && d.timestamp <= end)
			.sort((a, b) => b.timestamp - a.timestamp);
	}

	/**
	 * Get draws by deck
	 */
	getByDeck(deckId: string): DrawHistoryEntry[] {
		return this.draws
			.filter(d => d.deckId === deckId)
			.sort((a, b) => b.timestamp - a.timestamp);
	}

	/**
	 * Get draws by spread
	 */
	getBySpread(spreadId: string): DrawHistoryEntry[] {
		return this.draws
			.filter(d => d.spreadId === spreadId)
			.sort((a, b) => b.timestamp - a.timestamp);
	}

	/**
	 * Get deck usage statistics
	 */
	getDeckUsage(): DeckUsageStats[] {
		if (this.draws.length === 0) {
			return [];
		}

		// Use AlaSQL for aggregation - pass data directly, not as parameter
		return alasql(`
			SELECT deckId, deckName, COUNT(*) as count 
			FROM ? 
			GROUP BY deckId, deckName 
			ORDER BY count DESC
		`, [this.draws]);
	}

	/**
	 * Get spread usage statistics
	 */
	getSpreadUsage(): SpreadUsageStats[] {
		if (this.draws.length === 0) {
			return [];
		}

		return alasql(`
			SELECT spreadId, spreadName, COUNT(*) as count 
			FROM ? 
			GROUP BY spreadId, spreadName 
			ORDER BY count DESC
		`, [this.draws]);
	}

	/**
	 * Get card frequency statistics
	 * Note: This queries nested arrays
	 */
	getCardFrequency(): CardFrequencyStats[] {
		if (this.draws.length === 0) {
			return [];
		}

		// Flatten cards from all draws for frequency counting
		const allCards: Array<{ name: string }> = [];
		for (const draw of this.draws) {
			for (const card of draw.cards) {
				allCards.push({ name: card.name });
			}
		}

		return alasql(`
			SELECT name as cardName, COUNT(*) as frequency 
			FROM ? 
			GROUP BY name 
			ORDER BY frequency DESC
		`, [allCards]);
	}

	/**
	 * Get querent statistics
	 */
	getQuerentStats(): QuerentStats[] {
		// Filter to draws with querents first
		const querents = this.draws
			.filter(d => d.querent)
			.map(d => ({ name: d.querent!.name }));

		if (querents.length === 0) {
			return [];
		}

		return alasql(`
			SELECT name as querent, COUNT(*) as readings 
			FROM ? 
			GROUP BY name 
			ORDER BY readings DESC
		`, [querents]);
	}

	/**
	 * Get statistics for a date range
	 */
	getDateRangeStats(start: number, end: number): DateRangeStats[] {
		const rangeDraws = this.getByDateRange(start, end);

		if (rangeDraws.length === 0) {
			return [];
		}

		// Group by date for statistics
		const results = alasql(`
			SELECT 
				DATE(NEW Date(timestamp)) as date,
				COUNT(*) as draws,
				COUNT(DISTINCT deckId) as decksUsed,
				COUNT(DISTINCT spreadId) as spreadsUsed
			 FROM ? 
			 GROUP BY DATE(NEW Date(timestamp))
			 ORDER BY date
		`, [rangeDraws]) as DateRangeStats[];

		return results;
	}

	/**
	 * Get total number of draws
	 */
	getTotalDraws(): number {
		return this.draws.length;
	}

	/**
	 * Clear all history
	 */
	async clearHistory(): Promise<void> {
		this.draws = [];
		await this.save();
	}

	/**
	 * Export history as JSON string
	 */
	exportAsJSON(): string {
		return JSON.stringify(this.draws, null, 2);
	}

	/**
	 * Export history as CSV string
	 */
	exportAsCSV(): string {
		if (this.draws.length === 0) {
			return '';
		}

		// CSV headers
		const headers = [
			'ID',
			'Timestamp',
			'Date',
			'Spread ID',
			'Spread Name',
			'Deck ID',
			'Deck Name',
			'Intention',
			'Cards',
			'Card Count',
			'Querent Name',
			'Querent Note Path',
			'Shuffle Count',
			'Was Cut',
			'Cut Position'
		];

		const rows: string[] = [headers.join(',')];

		for (const entry of this.draws) {
			const cardsList = entry.cards
				.map(c => `${c.position}: ${c.name} ${c.orientation}`)
				.join('; ');

			const row = [
				entry.id,
				entry.timestamp.toString(),
				new Date(entry.timestamp).toISOString(),
				entry.spreadId,
				this.escapeCSV(entry.spreadName),
				entry.deckId,
				this.escapeCSV(entry.deckName),
				this.escapeCSV(entry.intention),
				this.escapeCSV(cardsList),
				entry.cards.length.toString(),
				entry.querent ? this.escapeCSV(entry.querent.name) : '',
				entry.querent?.notePath ? this.escapeCSV(entry.querent.notePath) : '',
				entry.metadata.shuffleCount.toString(),
				entry.metadata.wasCut.toString(),
				entry.metadata.cutPosition?.toString() ?? ''
			];

			rows.push(row.join(','));
		}

		return rows.join('\n');
	}

	/**
	 * Escape CSV field values
	 */
	private escapeCSV(value: string): string {
		// If value contains comma, quote, or newline, wrap in quotes and escape quotes
		if (value.includes(',') || value.includes('"') || value.includes('\n')) {
			return `"${value.replace(/"/g, '""')}"`;
		}
		return value;
	}

	/**
	 * Execute custom SQL query for power users
	 * @param sql SQL query string
	 * @param params Optional parameters (defaults to using draws array)
	 */
	query(sql: string, params?: unknown[]): unknown {
		return alasql(sql, params ?? [this.draws]);
	}
}
