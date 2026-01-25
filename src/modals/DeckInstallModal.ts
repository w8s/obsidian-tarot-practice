import { App, Modal, Notice } from 'obsidian';
import type TarotPracticePlugin from '../main';

/**
 * Modal for installing a deck from JSON file
 */
export class DeckInstallModal extends Modal {
	constructor(
		app: App,
		private plugin: TarotPracticePlugin,
		private onInstalled: () => void
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('tarot-deck-install-modal');

		contentEl.createEl('h2', { text: 'Add deck' });
		
		contentEl.createEl('p', { 
			text: 'Select a deck file to install. The deck will be added to your plugin directory.'
		});

		// File input
		const fileInput = contentEl.createEl('input', {
			type: 'file',
			attr: {
				accept: '.json,.zip'
			}
		});

		// Install button
		const buttonContainer = contentEl.createDiv('modal-button-container');
		
		buttonContainer.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => {
				this.close();
			});

		const installButton = buttonContainer.createEl('button', { 
			text: 'Install',
			cls: 'mod-cta'
		});
		installButton.addEventListener('click', () => {
			void (async () => {
				const file = fileInput.files?.[0];
				if (!file) {
					new Notice('Please select a file');
					return;
				}

				try {
					installButton.disabled = true;
					installButton.textContent = 'Installing...';

					// Determine file type and call appropriate installer
					let deck;
					if (file.name.endsWith('.zip')) {
						deck = await this.plugin.deckLoader.installFromZIP(file);
					} else if (file.name.endsWith('.json')) {
						deck = await this.plugin.deckLoader.installFromJSON(file);
					} else {
						throw new Error('Invalid file type. Please select a .json or .zip file.');
					}

					this.plugin.deckRegistry.registerDeck(deck);
					this.onInstalled();
					this.close();
				} catch (error) {
					const msg = error instanceof Error ? error.message : String(error);
					new Notice(`Failed to install deck: ${msg}`);
					installButton.disabled = false;
					installButton.textContent = 'Install';
				}
			})();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
