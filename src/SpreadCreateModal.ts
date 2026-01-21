import { App, Modal, Setting, TextComponent } from 'obsidian';
import { Spread, SpreadPositionDefinition } from './spreads';
import { FileSuggest } from './FileSuggest';

/**
 * Modal to create a new custom spread
 */
export class SpreadCreateModal extends Modal {
	private callback: (spread: Spread) => void;
	
	// Spread fields
	private name: string = '';
	private description: string = '';
	private positions: SpreadPositionDefinition[] = [{ label: '' }];
	private shuffleCount: number = 3;
	private cutDeck: boolean = true;
	private templatePath: string = '';

	constructor(
		app: App,
		callback: (spread: Spread) => void
	) {
		super(app);
		this.callback = callback;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		contentEl.createEl('h2', { text: 'Create Custom Spread' });

		// Name
		new Setting(contentEl)
			.setName('Spread name')
			.setDesc('Name for your custom spread')
			.addText(text => text
				.setPlaceholder('e.g., Relationship Spread')
				.setValue(this.name)
				.onChange((value) => {
					this.name = value;
				}));

		// Description
		new Setting(contentEl)
			.setName('Description')
			.setDesc('What is this spread used for?')
			.addTextArea(text => text
				.setPlaceholder('e.g., Explores dynamics in relationships')
				.setValue(this.description)
				.onChange((value) => {
					this.description = value;
				}));

		// Positions section
		const positionsHeading = new Setting(contentEl)
			.setName('Positions')
			.setDesc('Define the positions in your spread');

		// Positions container
		const positionsContainer = contentEl.createDiv({ cls: 'spread-positions-container' });
		this.renderPositions(positionsContainer);

		// Add position button
		const addButtonContainer = contentEl.createDiv();
		addButtonContainer.style.marginBottom = '16px';
		
		addButtonContainer.createEl('button', { text: '+ Add Position' })
			.addEventListener('click', () => {
				this.positions.push({ label: '' });
				this.renderPositions(positionsContainer);
			});

		// Shuffle count
		const shuffleCountSetting = new Setting(contentEl)
			.setName('Number of shuffles')
			.setDesc('How many times to shuffle the deck (1-7)')
			.addSlider(slider => slider
				.setLimits(1, 7, 1)
				.setValue(this.shuffleCount)
				.setDynamicTooltip()
				.onChange((value) => {
					this.shuffleCount = value;
					shuffleCountSetting.controlEl.querySelector('.shuffle-count-value')!.textContent = `${value}`;
				}));
		
		shuffleCountSetting.controlEl.createSpan({ 
			text: `${this.shuffleCount}`,
			cls: 'shuffle-count-value'
		});

		// Cut deck
		new Setting(contentEl)
			.setName('Cut deck')
			.setDesc('Cut the deck after shuffling')
			.addToggle(toggle => toggle
				.setValue(this.cutDeck)
				.onChange((value) => {
					this.cutDeck = value;
				}));

		// Template path
		new Setting(contentEl)
			.setName('Template file (optional)')
			.setDesc('Path to custom template file (leave empty for generic template)')
			.addSearch(search => {
				search
					.setPlaceholder('e.g., Templates/Spreads/My-Spread.md')
					.setValue(this.templatePath)
					.onChange((value) => {
						this.templatePath = value;
					});
				
				new FileSuggest(this.app, search.inputEl);
			});

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

		// Create button
		const createButton = buttonContainer.createEl('button', { 
			text: 'Create Spread',
			cls: 'mod-cta'
		});
		createButton.addEventListener('click', () => {
			this.create();
		});
	}

	private renderPositions(container: HTMLElement) {
		container.empty();

		this.positions.forEach((position, index) => {
			const positionSetting = new Setting(container)
				.setName(`Position ${index + 1}`)
				.addText(text => text
					.setPlaceholder('e.g., Past, Present, Future')
					.setValue(position.label || '')
					.onChange((value) => {
						const pos = this.positions[index];
						if (pos) {
							pos.label = value;
						}
					}));

			// Remove button (only if more than 1 position)
			if (this.positions.length > 1) {
				positionSetting.addButton(button => button
					.setButtonText('Remove')
					.onClick(() => {
						this.positions.splice(index, 1);
						this.renderPositions(container);
					}));
			}
		});
	}

	private create() {
		// Validation
		if (!this.name.trim()) {
			// Could add a Notice here
			return;
		}

		// Filter out empty position labels
		const validPositions = this.positions.filter(p => p && p.label.trim() !== '');
		
		if (validPositions.length === 0) {
			// Could add a Notice here
			return;
		}

		// Generate ID from name
		const id = 'custom-' + this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

		// Create spread object
		const spread: Spread = {
			id,
			name: this.name,
			description: this.description,
			isBuiltIn: false,
			positions: validPositions,
			shuffleCount: this.shuffleCount,
			cutDeck: this.cutDeck,
			templatePath: this.templatePath
		};

		this.callback(spread);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
