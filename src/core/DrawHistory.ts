/**
 * Draw history tracking
 */

import type TarotPracticePlugin from '../main';
import type { SpreadDrawResult } from './spreads';
import type {
	DrawHistoryEntry,
	DeckUsageStats,
	SpreadUsageStats,
	CardFrequencyStats,
	QuerentStats
} from '../types/history';

export class DrawHistory {
	private plugin: TarotPracticePlugin;
	private draws: DrawHistoryEntry[] = [];
	private readonly MAX_ENTRIES = 1000;

	constructor(plugin: TarotPracticePlugin) {
		this.plugin = plugin;
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
				cutPosition: result.cutPosition,
				source: result.source ?? 'digital'
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

		// Use JavaScript aggregation for reliability
		const deckCounts = new Map<string, { deckName: string; count: number }>();
		
		for (const draw of this.draws) {
			const existing = deckCounts.get(draw.deckId);
			if (existing) {
				existing.count++;
			} else {
				deckCounts.set(draw.deckId, {
					deckName: draw.deckName,
					count: 1
				});
			}
		}

		// Convert to array and sort by count
		return Array.from(deckCounts.entries())
			.map(([deckId, data]) => ({
				deckId,
				deckName: data.deckName,
				count: data.count
			}))
			.sort((a, b) => b.count - a.count);
	}

	/**
	 * Get spread usage statistics
	 */
	getSpreadUsage(): SpreadUsageStats[] {
		if (this.draws.length === 0) {
			return [];
		}

		// Use JavaScript aggregation for reliability
		const spreadCounts = new Map<string, { spreadName: string; count: number }>();
		
		for (const draw of this.draws) {
			const existing = spreadCounts.get(draw.spreadId);
			if (existing) {
				existing.count++;
			} else {
				spreadCounts.set(draw.spreadId, {
					spreadName: draw.spreadName,
					count: 1
				});
			}
		}

		// Convert to array and sort by count
		return Array.from(spreadCounts.entries())
			.map(([spreadId, data]) => ({
				spreadId,
				spreadName: data.spreadName,
				count: data.count
			}))
			.sort((a, b) => b.count - a.count);
	}

	/**
	 * Get card frequency statistics
	 */
	getCardFrequency(): CardFrequencyStats[] {
		if (this.draws.length === 0) {
			return [];
		}

		// Count card occurrences using JavaScript
		const cardCounts = new Map<string, number>();
		
		for (const draw of this.draws) {
			for (const card of draw.cards) {
				const count = cardCounts.get(card.name) || 0;
				cardCounts.set(card.name, count + 1);
			}
		}

		// Convert to array and sort by frequency
		return Array.from(cardCounts.entries())
			.map(([cardName, frequency]) => ({
				cardName,
				frequency
			}))
			.sort((a, b) => b.frequency - a.frequency);
	}

	/**
	 * Get querent statistics
	 */
	getQuerentStats(): QuerentStats[] {
		// Filter to draws with querents
		const querentsWithDraws = this.draws.filter(d => d.querent);
		
		if (querentsWithDraws.length === 0) {
			return [];
		}

		// Count readings per querent using JavaScript
		const querentCounts = new Map<string, number>();
		
		for (const draw of querentsWithDraws) {
			const querentName = draw.querent!.name;
			const count = querentCounts.get(querentName) || 0;
			querentCounts.set(querentName, count + 1);
		}

		// Convert to array and sort by readings
		return Array.from(querentCounts.entries())
			.map(([querent, readings]) => ({
				querent,
				readings
			}))
			.sort((a, b) => b.readings - a.readings);
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

}
