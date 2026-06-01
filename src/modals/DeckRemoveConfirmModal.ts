import { App, Modal, Notice, Setting } from 'obsidian';
import type TarotPracticePlugin from '../main';
import type { DeckDefinition } from '../types/deck';

/**
 * Modal for confirming deck removal
 */
export class DeckRemoveConfirmModal extends Modal {
	constructor(
		app: App,
		private plugin: TarotPracticePlugin,
		private deck: DeckDefinition,
		private onRemoved: () => void
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('tarot-deck-remove-modal');

		new Setting(contentEl).setName('Remove deck?').setHeading();
		
		contentEl.createEl('p', { 
			text: `Are you sure you want to remove "${this.deck.name}"? This will delete the deck directory and all its files.`
		});

		contentEl.createEl('p', { 
			text: 'This action cannot be undone.',
			cls: 'mod-warning'
		});

		// Buttons
		const buttonContainer = contentEl.createDiv('modal-button-container');
		
		buttonContainer.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => {
				this.close();
			});

		const removeButton = buttonContainer.createEl('button', { 
			text: 'Remove',
			cls: 'mod-warning'
		});
		removeButton.addEventListener('click', () => {
			void (async () => {
				try {
					removeButton.disabled = true;
					removeButton.textContent = 'Removing...';

					await this.plugin.deckLoader.removeDeck(this.deck.id);
					this.plugin.deckRegistry.removeDeck(this.deck.id);
					
					// Update settings if this was the default deck
					if (this.plugin.settings.defaultDeckId === this.deck.id) {
						this.plugin.settings.defaultDeckId = 'rider-waite-smith';
						await this.plugin.saveSettings();
					}

					new Notice(`Deck "${this.deck.name}" removed`);
					this.onRemoved();
					this.close();
				} catch (error) {
					const msg = error instanceof Error ? error.message : String(error);
					new Notice(`Failed to remove deck: ${msg}`);
					removeButton.disabled = false;
					removeButton.textContent = 'Remove';
				}
			})();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
