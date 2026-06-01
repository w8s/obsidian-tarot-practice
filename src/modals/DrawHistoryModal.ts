/**
 * Modal for viewing draw history and statistics
 */

import { App, Modal, Setting } from 'obsidian';
import { Chart } from 'chart.js';
import type TarotPracticePlugin from '../main';
import type { DrawHistoryEntry } from '../types/history';
import { 
	TAROT_COLORS, 
	getBaseChartOptions, 
	destroyChart,
	getCardSuit,
	getSuitColor 
} from '../utils/charts';

export class DrawHistoryModal extends Modal {
	plugin: TarotPracticePlugin;
	// Store chart instances for cleanup
	private deckChart: Chart | null = null;
	private spreadChart: Chart | null = null;
	private suitChart: Chart | null = null;

	constructor(app: App, plugin: TarotPracticePlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		new Setting(contentEl).setName('Draw history').setHeading();

		// Get total draws
		const totalDraws = this.plugin.drawHistory.getTotalDraws();
		
		if (totalDraws === 0) {
			contentEl.createEl('p', { 
				text: 'No draws recorded yet. Draw your first spread to start tracking history!',
				cls: 'tarot-history-empty'
			});
			return;
		}

		// Show total count
		contentEl.createEl('p', { 
			text: `Total draws: ${totalDraws}`,
			cls: 'tarot-history-count'
		});

		// Create tabs for different views
		const tabContainer = contentEl.createDiv({ cls: 'tarot-history-tabs' });
		
		const recentTab = tabContainer.createEl('button', { 
			text: 'Recent draws',
			cls: 'tarot-history-tab tarot-history-tab-active'
		});
		
		const statsTab = tabContainer.createEl('button', { 
			text: 'Statistics',
			cls: 'tarot-history-tab'
		});

		// Content area
		const contentArea = contentEl.createDiv({ cls: 'tarot-history-content' });

		// Show recent draws by default
		this.showRecentDraws(contentArea);

		// Tab switching
		recentTab.addEventListener('click', () => {
			// Clean up charts when switching away from statistics
			destroyChart(this.deckChart);
			destroyChart(this.spreadChart);
			destroyChart(this.suitChart);
			
			recentTab.addClass('tarot-history-tab-active');
			statsTab.removeClass('tarot-history-tab-active');
			this.showRecentDraws(contentArea);
		});

		statsTab.addEventListener('click', () => {
			statsTab.addClass('tarot-history-tab-active');
			recentTab.removeClass('tarot-history-tab-active');
			this.showStatistics(contentArea);
		});

		// Add clear history button at bottom
		new Setting(contentEl)
			.setName('Clear history')
			.setDesc('Permanently delete all draw history')
			.addButton(button => button
				.setButtonText('Clear all history')
				.setDestructive()
				.onClick(async () => {
					// Use Notice for confirmation instead of confirm()
					const confirmed = await this.confirmClearHistory(totalDraws);
					if (confirmed) {
						await this.plugin.drawHistory.clearHistory();
						this.close();
					}
				}));

		// Add export buttons
		const exportSection = contentEl.createDiv({ cls: 'tarot-history-export-section' });
		new Setting(exportSection).setName('Export history').setHeading();
		
		new Setting(exportSection)
			.setName('Export as JSON')
			.setDesc('Download history as JSON file for backup or analysis')
			.addButton(button => button
				.setButtonText('Export JSON')
				.onClick(() => {
					this.exportHistory('json');
				}));

		new Setting(exportSection)
			.setName('Export as CSV')
			.setDesc('Download history as CSV file for spreadsheet analysis')
			.addButton(button => button
				.setButtonText('Export CSV')
				.onClick(() => {
					this.exportHistory('csv');
				}));
	}

	async confirmClearHistory(totalDraws: number): Promise<boolean> {
		return new Promise((resolve) => {
			const modal = new Modal(this.app);
			modal.titleEl.setText('Clear draw history');
			modal.contentEl.createEl('p', {
				text: `Are you sure you want to delete all ${totalDraws} draw records? This cannot be undone.`
			});

			const buttonContainer = modal.contentEl.createDiv({ cls: 'modal-button-container' });
			
			buttonContainer.createEl('button', { text: 'Cancel' })
				.addEventListener('click', () => {
					modal.close();
					resolve(false);
				});

			const confirmBtn = buttonContainer.createEl('button', { 
				text: 'Delete all',
				cls: 'mod-warning'
			});
			confirmBtn.addEventListener('click', () => {
				modal.close();
				resolve(true);
			});

			modal.open();
		});
	}

	exportHistory(format: 'json' | 'csv') {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
		const filename = `tarot-draw-history-${timestamp}.${format}`;
		
		let content: string;
		let mimeType: string;

		if (format === 'json') {
			content = this.plugin.drawHistory.exportAsJSON();
			mimeType = 'application/json';
		} else {
			content = this.plugin.drawHistory.exportAsCSV();
			mimeType = 'text/csv';
		}

		// Create blob and download
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = activeDocument.createElement('a');
		link.href = url;
		link.download = filename;
		activeDocument.body.appendChild(link);
		link.click();
		activeDocument.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	showRecentDraws(container: HTMLElement) {
		container.empty();

		const recent = this.plugin.drawHistory.getRecent(20);
		
		if (recent.length === 0) {
			container.createEl('p', { text: 'No recent draws' });
			return;
		}

		const listContainer = container.createDiv({ cls: 'tarot-history-list' });

		for (const entry of recent) {
			this.createDrawEntry(listContainer, entry);
		}
	}

	createDrawEntry(container: HTMLElement, entry: DrawHistoryEntry) {
		const entryEl = container.createDiv({ cls: 'tarot-history-entry' });

		// Header with spread name and date
		const header = entryEl.createDiv({ cls: 'tarot-history-entry-header' });
		header.createEl('strong', { text: entry.spreadName });
		header.createSpan({ 
			text: new Date(entry.timestamp).toLocaleString(),
			cls: 'tarot-history-entry-date'
		});

		// Deck used
		entryEl.createDiv({ 
			text: `Deck: ${entry.deckName}`,
			cls: 'tarot-history-entry-deck'
		});

		// Intention
		if (entry.intention) {
			entryEl.createDiv({ 
				text: `"${entry.intention}"`,
				cls: 'tarot-history-entry-intention'
			});
		}

		// Querent if present
		if (entry.querent) {
			entryEl.createDiv({ 
				text: `For: ${entry.querent.name}`,
				cls: 'tarot-history-entry-querent'
			});
		}

		// Cards drawn
		const cardsContainer = entryEl.createDiv({ cls: 'tarot-history-entry-cards' });
		for (const card of entry.cards) {
			const cardEl = cardsContainer.createDiv({ cls: 'tarot-history-card' });
			
			if (card.position) {
				cardEl.createSpan({ 
					text: `${card.position}: `,
					cls: 'tarot-history-card-position'
				});
			}
			
			cardEl.createSpan({ 
				text: card.name,
				cls: 'tarot-history-card-name'
			});
			
			if (card.orientation === 'reversed') {
				cardEl.createSpan({ 
					text: ' (reversed)',
					cls: 'tarot-history-card-reversed'
				});
			}
		}
	}

	showStatistics(container: HTMLElement) {
		container.empty();
		
		// Clean up any existing charts
		destroyChart(this.deckChart);
		destroyChart(this.spreadChart);
		destroyChart(this.suitChart);

		// Get all statistics
		const deckUsage = this.plugin.drawHistory.getDeckUsage();
		const spreadUsage = this.plugin.drawHistory.getSpreadUsage();
		const cardFreq = this.plugin.drawHistory.getCardFrequency();
		const querentStats = this.plugin.drawHistory.getQuerentStats();

		// ===== COMBINED DECK & SPREAD USAGE CHART =====
		const usageSection = container.createDiv({ cls: 'tarot-history-stat-section' });
		new Setting(usageSection).setName('Usage patterns').setHeading();
		
		if (deckUsage.length > 0 || spreadUsage.length > 0) {
			const chartContainer = usageSection.createDiv({ cls: 'tarot-chart-container' });
			const canvas = chartContainer.createEl('canvas', { cls: 'tarot-chart' });
			
			// Get top 5 of each
			const topDecks = deckUsage.slice(0, 5);
			const topSpreads = spreadUsage.slice(0, 5);
			
			// Create combined labels (deck names and spread names)
			const allLabels = [
				...topDecks.map(d => d.deckName),
				...topSpreads.map(s => s.spreadName)
			];
			
			// Create datasets for each category
			const deckData: number[] = [
				...topDecks.map(d => d.count),
				...new Array<number>(topSpreads.length).fill(0)  // Fill with 0 for spread positions
			];
			
			const spreadData: number[] = [
				...new Array<number>(topDecks.length).fill(0),  // Fill with 0 for deck positions
				...topSpreads.map(s => s.count)
			];
			
			const baseOptions = getBaseChartOptions()!;
			this.deckChart = new Chart(canvas, {
				type: 'bar',
				data: {
					labels: allLabels,
					datasets: [
						{
							label: 'Decks',
							data: deckData,
							backgroundColor: TAROT_COLORS.primary,
							borderColor: TAROT_COLORS.primary,
							borderWidth: 2
						},
						{
							label: 'Spreads',
							data: spreadData,
							backgroundColor: TAROT_COLORS.secondary,
							borderColor: TAROT_COLORS.secondary,
							borderWidth: 2
						}
					]
				},
				options: {
					...baseOptions,
					indexAxis: 'y',  // Make horizontal
					scales: {
						...(baseOptions.scales || {}),
						x: {
							...(baseOptions.scales?.x || {}),
							beginAtZero: true,
							title: {
								display: true,
								text: 'Number of draws',
								color: TAROT_COLORS.text
							}
						},
						y: {
							...(baseOptions.scales?.y || {})
						}
					}
				}
			});
		} else {
			usageSection.createEl('p', { text: 'No usage statistics yet' });
		}

		// ===== SUIT DISTRIBUTION PIE CHART =====
		const suitSection = container.createDiv({ cls: 'tarot-history-stat-section' });
		new Setting(suitSection).setName('Suit distribution').setHeading();
		
		if (cardFreq.length > 0) {
			// Aggregate cards by suit
			const suitCounts = new Map<string, number>();
			for (const card of cardFreq) {
				const suit = getCardSuit(card.cardName);
				suitCounts.set(suit, (suitCounts.get(suit) || 0) + card.frequency);
			}
			
			const suitData = Array.from(suitCounts.entries())
				.map(([suit, count]) => ({ suit, count }))
				.sort((a, b) => b.count - a.count);
			
			const chartContainer = suitSection.createDiv({ cls: 'tarot-chart-container' });
			const canvas = chartContainer.createEl('canvas', { cls: 'tarot-chart' });
			
			this.suitChart = new Chart(canvas, {
				type: 'pie',
				data: {
					labels: suitData.map(s => s.suit),
					datasets: [{
						data: suitData.map(s => s.count),
						backgroundColor: suitData.map(s => getSuitColor(s.suit)),
						borderColor: 'rgba(0, 0, 0, 0.8)',
						borderWidth: 2
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: {
							position: 'right',
							labels: {
								color: TAROT_COLORS.text,
								font: {
									size: 13,
									family: "'Inter', sans-serif",
									weight: 500
								},
								padding: 12,
								usePointStyle: true,
								pointStyle: 'circle',
								// Show percentage in legend
								generateLabels: function(chart) {
									const data = chart.data;
									if (data.labels && data.datasets.length) {
										const dataset = data.datasets[0];
										if (!dataset || !dataset.data) return [];
										
										const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
										
										return (data.labels as string[]).map((label, i) => {
											const value = (dataset.data as number[])[i];
											if (value === undefined) return { text: label, fillStyle: '', hidden: false, index: i };
											
											const percentage = ((value / total) * 100).toFixed(1);
											return {
												text: `${label}: ${percentage}%`,
												fillStyle: ((dataset.backgroundColor as string[])?.[i]) || '',
												hidden: false,
												index: i
											};
										});
									}
									return [];
								}
							}
						},
						tooltip: {
							backgroundColor: 'rgba(17, 24, 39, 0.9)',
							titleColor: TAROT_COLORS.text,
							bodyColor: TAROT_COLORS.text,
							borderColor: TAROT_COLORS.grid,
							borderWidth: 1,
							callbacks: {
								label: function(context) {
									const label = context.label || '';
									const value = context.parsed;
									const total = context.dataset.data.reduce((a, b) => Number(a) + Number(b), 0);
									const percentage = ((value / total) * 100).toFixed(1);
									return `${label}: ${value} (${percentage}%)`;
								}
							}
						}
					}
				}
			});
		} else {
			suitSection.createEl('p', { text: 'No card statistics yet' });
		}

		// ===== MOST FREQUENT CARDS (TEXT LIST) =====
		const cardSection = container.createDiv({ cls: 'tarot-history-stat-section' });
		new Setting(cardSection).setName('Most frequent cards').setHeading();
		
		if (cardFreq.length > 0) {
			const cardList = cardSection.createEl('ol');
			for (const stat of cardFreq.slice(0, 10)) {
				cardList.createEl('li', { 
					text: `${stat.cardName}: ${stat.frequency} times`
				});
			}
		} else {
			cardSection.createEl('p', { text: 'No card statistics yet' });
		}

		// ===== QUERENT STATS (IF ANY) =====
		if (querentStats.length > 0) {
			const querentSection = container.createDiv({ cls: 'tarot-history-stat-section' });
			new Setting(querentSection).setName('Readings by querent').setHeading();
			const querentList = querentSection.createEl('ol');
			for (const stat of querentStats) {
				querentList.createEl('li', { 
					text: `${stat.querent}: ${stat.readings} readings`
				});
			}
		}
	}

	onClose() {
		// Clean up chart instances to prevent memory leaks
		destroyChart(this.deckChart);
		destroyChart(this.spreadChart);
		destroyChart(this.suitChart);
		
		const { contentEl } = this;
		contentEl.empty();
	}
}
