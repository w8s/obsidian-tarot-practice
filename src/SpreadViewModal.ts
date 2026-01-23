import { App, Modal } from 'obsidian';
import { Spread } from './spreads';

/**
 * Modal to view spread details
 */
export class SpreadViewModal extends Modal {
	private spread: Spread;

	constructor(app: App, spread: Spread) {
		super(app);
		this.spread = spread;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		contentEl.createEl('h2', { text: this.spread.name });

		// Description
		contentEl.createEl('p', { 
			text: this.spread.description,
			cls: 'spread-description'
		});

		// Details section
		const detailsContainer = contentEl.createDiv({ cls: 'spread-details-container' });
		detailsContainer.setCssProps({
			'padding': '16px',
			'background-color': 'var(--background-secondary)',
			'border-radius': '4px',
			'margin-top': '16px'
		});

		// Basic info
		const infoSection = detailsContainer.createDiv({ cls: 'spread-info' });
		infoSection.createEl('p', { 
			text: `Card count: ${this.spread.positions.length}`,
			cls: 'spread-info-item'
		});
		infoSection.createEl('p', { 
			text: `Shuffles: ${this.spread.shuffleCount}`,
			cls: 'spread-info-item'
		});
		infoSection.createEl('p', { 
			text: `Cut deck: ${this.spread.cutDeck ? 'Yes' : 'No'}`,
			cls: 'spread-info-item'
		});
		infoSection.createEl('p', { 
			text: `Template: ${this.spread.templatePath || 'Built-in'}`,
			cls: 'spread-info-item'
		});
		infoSection.createEl('p', { 
			text: `Type: ${this.spread.isBuiltIn ? 'Built-in' : 'Custom'}`,
			cls: 'spread-info-item'
		});

		// Positions section
		const positionsHeading = detailsContainer.createEl('h3', { 
			text: 'Positions',
			cls: 'spread-positions-heading'
		});
		positionsHeading.setCssProps({
			'margin-top': '16px'
		});

		const positionsList = detailsContainer.createEl('ol', { cls: 'spread-positions-list' });
		this.spread.positions.forEach((pos, index) => {
			const li = positionsList.createEl('li');
			li.createEl('strong', { text: pos.label });
			if (pos.description) {
				li.createEl('span', { text: ` - ${pos.description}` });
			}
		});

		// Close button
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		buttonContainer.setCssProps({
			'margin-top': '16px',
			'display': 'flex',
			'justify-content': 'flex-end'
		});

		buttonContainer.createEl('button', { text: 'Close' })
			.addEventListener('click', () => {
				this.close();
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
