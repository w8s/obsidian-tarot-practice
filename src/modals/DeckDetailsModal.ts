import { App, Modal, Notice } from 'obsidian';
import type { DeckDefinition } from '../types/deck';
import type TarotPracticePlugin from '../main';

/**
 * Modal for viewing deck details
 */
export class DeckDetailsModal extends Modal {
	constructor(
		app: App,
		private deck: DeckDefinition,
		private plugin?: TarotPracticePlugin
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('tarot-deck-details-modal');

		contentEl.createEl('h2', { text: this.deck.name });
		
		if (this.deck.description) {
			contentEl.createEl('p', { text: this.deck.description });
		}

		// Basic info
		const infoDiv = contentEl.createDiv('deck-info');
		infoDiv.createEl('p', { text: `Cards: ${this.deck.cardCount}` });
		infoDiv.createEl('p', { text: `Reversals: ${this.deck.supportsReversals ? 'Yes' : 'No'}` });
		infoDiv.createEl('p', { text: `Type: ${this.deck.isBuiltIn ? 'Built-in' : 'Custom'}` });

		// Metadata if available
		if (this.deck.metadata) {
			const metaDiv = contentEl.createDiv('deck-metadata');
			metaDiv.createEl('h3', { text: 'Metadata' });
			
			if (this.deck.metadata.author) {
				metaDiv.createEl('p', { text: `Author: ${this.deck.metadata.author}` });
			}
			if (this.deck.metadata.year) {
				metaDiv.createEl('p', { text: `Year: ${this.deck.metadata.year}` });
			}
			if (this.deck.metadata.publisher) {
				metaDiv.createEl('p', { text: `Publisher: ${this.deck.metadata.publisher}` });
			}
			if (this.deck.metadata.tradition) {
				metaDiv.createEl('p', { text: `Tradition: ${this.deck.metadata.tradition}` });
			}
		}

		// Card list (collapsed by default, expandable)
		const cardListToggle = contentEl.createEl('details');
		cardListToggle.createEl('summary', { text: `Card list (${this.deck.cardCount} cards)` });
		
		const cardList = cardListToggle.createEl('ul', { cls: 'deck-card-list' });
		for (const card of this.deck.cards) {
			const cardText = card.suit && card.rank 
				? `${card.rank} of ${card.suit}`
				: card.name;
			cardList.createEl('li', { text: `${card.index}: ${cardText}` });
		}

		// Button container
		const buttonContainer = contentEl.createDiv('modal-button-container');
		
		// Restore images button (if deck has sourceUrl and plugin is available)
		if (this.deck.sourceUrl && this.plugin) {
			buttonContainer.createEl('button', { text: 'Restore images' })
				.addEventListener('click', () => {
					void (async () => {
						try {
							await this.plugin!.deckLoader.restoreDeckImages(this.deck);
							new Notice(`Images restored for "${this.deck.name}"`);
						} catch (error) {
							console.error('Failed to restore images:', error);
							// Error notice already shown by restoreDeckImages
						}
					})();
				});
		}
		
		// Close button
		buttonContainer.createEl('button', { text: 'Close', cls: 'mod-cta' })
			.addEventListener('click', () => {
				this.close();
			});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
