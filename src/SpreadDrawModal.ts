import { App, Modal, Setting, DropdownComponent } from 'obsidian';
import { Spread } from './spreads';

/**
 * Modal for selecting a spread and entering intention before drawing cards
 */
export class SpreadDrawModal extends Modal {
	private spreads: Spread[];
	private selectedSpread: Spread;
	private intention: string = '';
	private callback: (spread: Spread, intention: string) => void;

	constructor(
		app: App,
		spreads: Spread[],
		callback: (spread: Spread, intention: string) => void
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
		contentEl.createEl('h2', { text: 'Draw Tarot Spread' });

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

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		buttonContainer.style.display = 'flex';
		buttonContainer.style.justifyContent = 'flex-end';
		buttonContainer.style.gap = '8px';
		buttonContainer.style.marginTop = '16px';

		// Cancel button
		buttonContainer.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => {
				this.close();
			});

		// Draw button
		const drawButton = buttonContainer.createEl('button', { 
			text: 'Draw Cards',
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
		detailsEl.style.padding = '12px';
		detailsEl.style.backgroundColor = 'var(--background-secondary)';
		detailsEl.style.borderRadius = '4px';
		detailsEl.style.marginBottom = '16px';

		// Description
		detailsEl.createEl('p', { 
			text: this.selectedSpread.description,
			cls: 'spread-description-text'
		}).style.marginBottom = '8px';

		// Card count
		detailsEl.createEl('p', { 
			text: `${this.selectedSpread.positions.length} card${this.selectedSpread.positions.length === 1 ? '' : 's'}`,
			cls: 'spread-card-count'
		}).style.fontSize = '0.9em';
		
		// Deck preparation
		const deckPrepText = `${this.selectedSpread.shuffleCount} shuffle${this.selectedSpread.shuffleCount === 1 ? '' : 's'}${this.selectedSpread.cutDeck ? ', cut deck' : ''}`;
		detailsEl.createEl('p', { 
			text: deckPrepText,
			cls: 'spread-deck-prep'
		}).style.fontSize = '0.9em';
	}

	/**
	 * Submit the form (draw cards)
	 */
	private submit() {
		if (!this.intention.trim()) {
			// Could add a notice here, but let's allow empty intentions
			// Some users might want to draw without a specific question
		}

		this.callback(this.selectedSpread, this.intention);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
