import { App, Modal, Setting, Notice } from 'obsidian';
import { Spread, SpreadPositionDefinition } from '../core/spreads';
import { TemplateExporter } from '../templates/TemplateExporter';
import { TarotPracticeSettings } from '../settings';

/**
 * Modal to create a new custom spread
 */
export class SpreadCreateModal extends Modal {
	private callback: (spread: Spread) => void;
	private settings: TarotPracticeSettings;
	
	// Spread fields
	private name: string = '';
	private description: string = '';
	private positions: SpreadPositionDefinition[] = [{ label: '' }];
	private shuffleCount: number = 3;
	private cutDeck: boolean = true;
	private templatePath: string = '';
	private templateExample: string = 'generic'; // Which example to use

	constructor(
		app: App,
		settings: TarotPracticeSettings,
		callback: (spread: Spread) => void
	) {
		super(app);
		this.settings = settings;
		this.callback = callback;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		new Setting(contentEl).setName('Create custom spread').setHeading();

		// Name
		new Setting(contentEl)
			.setName('Spread name')
			.setDesc('Name for your custom spread')
			.addText(text => text
				.setPlaceholder('Relationship spread')
				.setValue(this.name)
				.onChange((value) => {
					this.name = value;
				}));

		// Description
		new Setting(contentEl)
			.setName('Description')
			.setDesc('What is this spread used for?')
			.addTextArea(text => text
				.setPlaceholder('Explores dynamics in relationships')
				.setValue(this.description)
				.onChange((value) => {
					this.description = value;
				}));

		// Positions section
		new Setting(contentEl)
			.setName('Positions')
			.setDesc('Define the positions in your spread');

		// Positions container
		const positionsContainer = contentEl.createDiv({ cls: 'spread-positions-container' });
		this.renderPositions(positionsContainer);

		// Add position button
		const addButtonContainer = contentEl.createDiv({ cls: 'spread-add-position-row' });
		
		addButtonContainer.createEl('button', { text: 'Add position' })
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

		// Template selection with "Start with template" dropdown
		new Setting(contentEl)
			.setName('Start with template')
			.setDesc('Choose a template example to customize')
			.addDropdown(dropdown => {
				const exporter = new TemplateExporter(this.app, this.settings);
				const examples = exporter.getAvailableExamples();
				
				examples.forEach(example => {
					dropdown.addOption(example.id, example.name);
				});
				
				dropdown.setValue(this.templateExample);
				dropdown.onChange((value) => {
					this.templateExample = value;
				});
			});

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-row' });

		// Cancel button
		buttonContainer.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => {
				this.close();
			});

		// Create button
		const createButton = buttonContainer.createEl('button', { 
			text: 'Create spread',
			cls: 'mod-cta'
		});
		createButton.addEventListener('click', () => {
			void this.create();
		});
	}

	private renderPositions(container: HTMLElement) {
		container.empty();

		this.positions.forEach((position, index) => {
			const positionSetting = new Setting(container)
				.setName(`Position ${index + 1}`)
				.addText(text => text
					.setPlaceholder('Past, present, future')
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

	private async create() {
		// Validation
		if (!this.name.trim()) {
			new Notice('Please enter a spread name');
			return;
		}

		// Filter out empty position labels
		const validPositions = this.positions.filter(p => p && p.label.trim() !== '');
		
		if (validPositions.length === 0) {
			new Notice('Please add at least one position');
			return;
		}

		// Generate ID from name
		const id = 'custom-' + this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

		// Create template from example if not 'generic'
		let templatePath = '';
		if (this.templateExample !== 'generic') {
			try {
				const exporter = new TemplateExporter(this.app, this.settings);
				templatePath = await exporter.createSpreadTemplateFromExample(
					this.templateExample,
					id
				);
				new Notice(`Template created at ${templatePath}`);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				new Notice(`Failed to create template: ${errorMessage}`);
				// Continue without template path
			}
		}

		// Create spread object
		const spread: Spread = {
			id,
			name: this.name,
			description: this.description,
			isBuiltIn: false,
			positions: validPositions,
			shuffleCount: this.shuffleCount,
			cutDeck: this.cutDeck,
			templatePath: templatePath,
			insertMode: 'new-note' // Default for custom spreads
		};

		this.callback(spread);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
