/**
 * Modal for viewing draw history and statistics
 */

import { App, Modal, Setting } from 'obsidian';
import type TarotPracticePlugin from '../main';
import type { DrawHistoryEntry } from '../types/history';

export class DrawHistoryModal extends Modal {
	plugin: TarotPracticePlugin;

	constructor(app: App, plugin: TarotPracticePlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Draw history' });

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
				.setWarning()
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
		exportSection.createEl('h3', { text: 'Export history' });
		
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
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
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
		header.createEl('span', { 
			text: new Date(entry.timestamp).toLocaleString(),
			cls: 'tarot-history-entry-date'
		});

		// Deck used
		entryEl.createEl('div', { 
			text: `Deck: ${entry.deckName}`,
			cls: 'tarot-history-entry-deck'
		});

		// Intention
		if (entry.intention) {
			entryEl.createEl('div', { 
				text: `"${entry.intention}"`,
				cls: 'tarot-history-entry-intention'
			});
		}

		// Querent if present
		if (entry.querent) {
			entryEl.createEl('div', { 
				text: `For: ${entry.querent.name}`,
				cls: 'tarot-history-entry-querent'
			});
		}

		// Cards drawn
		const cardsContainer = entryEl.createDiv({ cls: 'tarot-history-entry-cards' });
		for (const card of entry.cards) {
			const cardEl = cardsContainer.createEl('div', { cls: 'tarot-history-card' });
			
			if (card.position) {
				cardEl.createEl('span', { 
					text: `${card.position}: `,
					cls: 'tarot-history-card-position'
				});
			}
			
			cardEl.createEl('span', { 
				text: card.name,
				cls: 'tarot-history-card-name'
			});
			
			if (card.orientation === 'reversed') {
				cardEl.createEl('span', { 
					text: ' (reversed)',
					cls: 'tarot-history-card-reversed'
				});
			}
		}
	}

	showStatistics(container: HTMLElement) {
		container.empty();

		// Deck usage
		const deckSection = container.createDiv({ cls: 'tarot-history-stat-section' });
		deckSection.createEl('h3', { text: 'Most used decks' });
		const deckUsage = this.plugin.drawHistory.getDeckUsage();
		
		if (deckUsage.length > 0) {
			const deckList = deckSection.createEl('ol');
			for (const stat of deckUsage.slice(0, 5)) {
				deckList.createEl('li', { 
					text: `${stat.deckName}: ${stat.count} draws`
				});
			}
		} else {
			deckSection.createEl('p', { text: 'No deck statistics yet' });
		}

		// Spread usage
		const spreadSection = container.createDiv({ cls: 'tarot-history-stat-section' });
		spreadSection.createEl('h3', { text: 'Most used spreads' });
		const spreadUsage = this.plugin.drawHistory.getSpreadUsage();
		
		if (spreadUsage.length > 0) {
			const spreadList = spreadSection.createEl('ol');
			for (const stat of spreadUsage.slice(0, 5)) {
				spreadList.createEl('li', { 
					text: `${stat.spreadName}: ${stat.count} draws`
				});
			}
		} else {
			spreadSection.createEl('p', { text: 'No spread statistics yet' });
		}

		// Card frequency
		const cardSection = container.createDiv({ cls: 'tarot-history-stat-section' });
		cardSection.createEl('h3', { text: 'Most frequent cards' });
		const cardFreq = this.plugin.drawHistory.getCardFrequency();
		
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

		// Querent stats if any
		const querentStats = this.plugin.drawHistory.getQuerentStats();
		if (querentStats.length > 0) {
			const querentSection = container.createDiv({ cls: 'tarot-history-stat-section' });
			querentSection.createEl('h3', { text: 'Readings by querent' });
			const querentList = querentSection.createEl('ol');
			for (const stat of querentStats) {
				querentList.createEl('li', { 
					text: `${stat.querent}: ${stat.readings} readings`
				});
			}
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
