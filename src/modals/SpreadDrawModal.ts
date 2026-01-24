import { App, Modal, Setting, DropdownComponent } from 'obsidian';
import { Spread } from '../core/spreads';
import { FileSuggest } from '../ui/FileSuggest';

/**
 * Modal for selecting a spread and entering intention before drawing cards
 */
export class SpreadDrawModal extends Modal {
	private spreads: Spread[];
	private selectedSpread: Spread;
	private intention: string = '';
	private showQuerentInput: boolean = false;
	private querentName: string = '';
	private querentNotePath: string = '';
	private callback: (spread: Spread, intention: string, querent?: { name: string; notePath?: string }) => void;

	constructor(
		app: App,
		spreads: Spread[],
		callback: (spread: Spread, intention: string, querent?: { name: string; notePath?: string }) => void
	) {
		super(app);
		this.spreads = spreads;
		
		if (spreads.length === 0) {
			throw new Error('No spreads available');
		}
		
		const firstSpread = spreads[0];
		if (!firstSpread) {
			throw new Error('No spreads available');
		}
		
		this.selectedSpread = firstSpread;
		this.callback = callback;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		contentEl.createEl('h2', { text: 'Draw tarot spread' });

		// Spread selection dropdown
		new Setting(contentEl)
			.setName('Spread')
			.setDesc('Choose which spread to use')
			.addDropdown((dropdown: DropdownComponent) => {
				// Add all spreads to dropdown
				this.spreads.forEach(spread => {
					dropdown.addOption(spread.id, spread.name);
				});

				// Set initial value
				dropdown.setValue(this.selectedSpread.id);

				// Handle selection change
				dropdown.onChange(async (value) => {
					const spread = this.spreads.find(s => s.id === value);
					if (spread) {
						this.selectedSpread = spread;
						this.updateSpreadDescription();
					}
				});
			});

		// Spread description (dynamically updated)
		const descContainer = contentEl.createDiv({ cls: 'spread-description' });
		this.updateSpreadDescription(descContainer);

		// Intention input
		new Setting(contentEl)
			.setName('Intention')
			.setDesc('What question or intention guides this reading?')
			.addText(text => text
				.setPlaceholder('Enter your intention...')
				.setValue(this.intention)
				.onChange(async (value) => {
					this.intention = value;
				})
				.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						this.submit();
					}
				})
			);

		// Querent toggle
		new Setting(contentEl)
			.setName('Reading for someone else?')
			.setDesc('Track who this reading is for')
			.addToggle(toggle => toggle
				.setValue(this.showQuerentInput)
				.onChange(async (value) => {
					this.showQuerentInput = value;
					this.updateQuerentFields();
				})
			);

		// Querent fields container (initially hidden)
		const querentContainer = contentEl.createDiv({ cls: 'querent-fields' });
		querentContainer.setAttr('style', 'display: none;');
		
		new Setting(querentContainer)
			.setName('Querent name')
			.setDesc('Name of the person this reading is for')
			.addText(text => text
				.setPlaceholder('Name')
				.setValue(this.querentName)
				.onChange(async (value) => {
					this.querentName = value;
				})
			);

		new Setting(querentContainer)
			.setName('Note path')
			.setDesc('Link to a note about this person')
			.addText(text => {
				text
					.setPlaceholder('Path to note')
					.setValue(this.querentNotePath)
					.onChange(async (value) => {
						this.querentNotePath = value;
					});
				// Attach file suggester
				new FileSuggest(this.app, text.inputEl);
			});

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		buttonContainer.setAttr('style', 'display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;');

		// Cancel button
		buttonContainer.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => {
				this.close();
			});

		// Draw button
		const drawButton = buttonContainer.createEl('button', { 
			text: 'Draw cards',
			cls: 'mod-cta'
		});
		drawButton.addEventListener('click', () => {
			this.submit();
		});

		// Focus intention input
		const intentionInput = contentEl.querySelector('input[type="text"]') as HTMLInputElement;
		if (intentionInput) {
			intentionInput.focus();
		}
	}

	/**
	 * Update the spread description display
	 */
	private updateSpreadDescription(container?: HTMLElement) {
		const descContainer = container || this.contentEl.querySelector('.spread-description') as HTMLElement;
		if (!descContainer) return;

		descContainer.empty();
		
		// Spread details
		const detailsEl = descContainer.createDiv({ cls: 'spread-details' });
		detailsEl.setAttr('style', 'padding: 12px; background-color: var(--background-secondary); border-radius: 4px; margin-bottom: 16px;');

		// Description
		const descP = detailsEl.createEl('p', { 
			text: this.selectedSpread.description,
			cls: 'spread-description-text'
		});
		descP.setAttr('style', 'margin-bottom: 8px;');

		// Card count
		const cardCountP = detailsEl.createEl('p', { 
			text: `${this.selectedSpread.positions.length} card${this.selectedSpread.positions.length === 1 ? '' : 's'}`,
			cls: 'spread-card-count'
		});
		cardCountP.setAttr('style', 'font-size: 0.9em;');
		
		// Deck preparation
		const deckPrepText = `${this.selectedSpread.shuffleCount} shuffle${this.selectedSpread.shuffleCount === 1 ? '' : 's'}${this.selectedSpread.cutDeck ? ', cut deck' : ''}`;
		const deckPrepP = detailsEl.createEl('p', { 
			text: deckPrepText,
			cls: 'spread-deck-prep'
		});
		deckPrepP.setAttr('style', 'font-size: 0.9em;');
	}

	/**
	 * Show/hide querent input fields
	 */
	private updateQuerentFields() {
		const querentContainer = this.contentEl.querySelector('.querent-fields') as HTMLElement;
		if (!querentContainer) return;

		querentContainer.style.display = this.showQuerentInput ? 'block' : 'none';
	}

	/**
	 * Submit the form (draw cards)
	 */
	private submit() {
		if (!this.intention.trim()) {
			// Could add a notice here, but let's allow empty intentions
			// Some users might want to draw without a specific question
		}

		// Build querent object if provided
		let querent: { name: string; notePath?: string } | undefined;
		if (this.showQuerentInput && this.querentName.trim()) {
			querent = {
				name: this.querentName.trim(),
				notePath: this.querentNotePath.trim() || undefined
			};
		}

		this.callback(this.selectedSpread, this.intention, querent);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
