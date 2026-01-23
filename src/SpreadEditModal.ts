import { App, Modal, Setting, Notice } from 'obsidian';
import { Spread, SpreadPositionDefinition } from './spreads';
import { FileSuggest } from './FileSuggest';
import { TemplateExporter } from './TemplateExporter';
import { TarotPracticeSettings } from './settings';

/**
 * Modal to edit spread settings - allows full customization
 */
export class SpreadEditModal extends Modal {
	private spread: Spread;
	private callback: (updatedSpread: Spread, isReset?: boolean) => void;
	private settings: TarotPracticeSettings;
	
	// Editable fields
	private name: string;
	private description: string;
	private positions: SpreadPositionDefinition[];
	private shuffleCount: number;
	private cutDeck: boolean;
	private insertMode: 'daily-note' | 'new-note' | 'inline';
	private templatePath: string;
	private templateExample: string = 'generic';

	constructor(
		app: App,
		spread: Spread,
		settings: TarotPracticeSettings,
		callback: (updatedSpread: Spread, isReset?: boolean) => void
	) {
		super(app);
		this.spread = spread;
		this.callback = callback;
		this.settings = settings;
		
		// Initialize editable fields from spread
		this.name = spread.name;
		this.description = spread.description;
		this.positions = JSON.parse(JSON.stringify(spread.positions)) as SpreadPositionDefinition[]; // Deep copy
		this.shuffleCount = spread.shuffleCount;
		this.cutDeck = spread.cutDeck;
		this.insertMode = spread.insertMode;
		this.templatePath = spread.templatePath;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		contentEl.createEl('h2', { text: `Edit: ${this.spread.name}` });

		// Show reset button for built-in spreads
		if (this.spread.isBuiltIn) {
			const resetContainer = contentEl.createDiv({ cls: 'setting-item' });
			resetContainer.setAttr('style', 'margin-bottom: 16px; padding: 8px; background-color: var(--background-secondary); border-radius: 4px;');
			
			const resetDesc = resetContainer.createEl('div', {
				text: 'This is a built-in spread. You can customize it, and your changes will be saved.',
				cls: 'setting-item-description'
			});
			resetDesc.setAttr('style', 'margin-bottom: 8px;');
			
			const resetButton = resetContainer.createEl('button', {
				text: 'Reset to default',
				cls: 'mod-warning'
			});
			resetButton.addEventListener('click', () => {
				// eslint-disable-next-line no-alert
				if (confirm('Reset this spread to its default settings? Your customizations will be lost.')) {
					this.callback(this.spread, true); // Pass reset flag
					this.close();
				}
			});
		}

		// Name (only editable for custom spreads)
		if (!this.spread.isBuiltIn) {
			new Setting(contentEl)
				.setName('Spread name')
				.setDesc('Name for your spread')
				.addText(text => text
					.setPlaceholder('Relationship spread')
					.setValue(this.name)
					.onChange((value) => {
						this.name = value;
					}));
		}

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

		// Insert mode
		new Setting(contentEl)
			.setName('Insert mode')
			.setDesc('Where should the reading be inserted?')
			.addDropdown(dropdown => dropdown
				.addOption('daily-note', 'Daily note')
				.addOption('inline', 'Inline at cursor')
				.addOption('new-note', 'New note')
				.setValue(this.insertMode)
				.onChange((value: 'daily-note' | 'new-note' | 'inline') => {
					this.insertMode = value;
				}));

		// Positions section
		new Setting(contentEl)
			.setName('Positions')
			.setDesc('Define the positions in your spread')
			.setHeading();

		// Positions container
		const positionsContainer = contentEl.createDiv({ cls: 'spread-positions-container' });
		this.renderPositions(positionsContainer);

		// Add position button
		const addButtonContainer = contentEl.createDiv();
		addButtonContainer.setAttr('style', 'margin-bottom: 16px;');
		
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

		// Template section
		new Setting(contentEl)
			.setName('Template')
			.setDesc('Choose template for this spread')
			.addDropdown(dropdown => {
				const isUsingBuiltIn = !this.templatePath || this.templatePath === '';
				
				dropdown.addOption('builtin', isUsingBuiltIn ? 'Built-in (current)' : 'Built-in');
				dropdown.addOption('create-example', 'Create from example...');
				dropdown.addOption('custom', this.templatePath ? `Custom: ${this.templatePath}` : 'Choose custom file...');
				
				dropdown.setValue(isUsingBuiltIn ? 'builtin' : 'custom');
				
				dropdown.onChange(async (value) => {
					if (value === 'create-example') {
						await this.createFromExample();
						dropdown.setValue('custom');
					} else if (value === 'builtin') {
						this.templatePath = '';
					} else if (value === 'custom') {
						this.showFilePicker();
					}
				});
			});

		// Template path display
		const templatePathContainer = contentEl.createDiv({ cls: 'template-path-container' });
		this.updateTemplateDescription(templatePathContainer);

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		buttonContainer.setAttr('style', 'display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;');

		buttonContainer.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => this.close());

		const saveButton = buttonContainer.createEl('button', { 
			text: 'Save',
			cls: 'mod-cta'
		});
		saveButton.addEventListener('click', () => this.save());
	}

	private renderPositions(container: HTMLElement) {
		container.empty();
		
		this.positions.forEach((position, index) => {
			const positionDiv = container.createDiv({ cls: 'spread-position-item' });
			positionDiv.setAttr('style', 'margin-bottom: 12px; padding: 12px; background-color: var(--background-secondary); border-radius: 4px;');

			// Position header with number and remove button
			const headerDiv = positionDiv.createDiv();
			headerDiv.setAttr('style', 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;');

			headerDiv.createEl('strong', { text: `Position ${index + 1}` });

			if (this.positions.length > 1) {
				const removeBtn = headerDiv.createEl('button', {
					text: '×',
					cls: 'clickable-icon'
				});
				removeBtn.setAttr('style', 'font-size: 20px;');
				removeBtn.addEventListener('click', () => {
					this.positions.splice(index, 1);
					this.renderPositions(container);
				});
			}

			// Label input
			const labelInput = positionDiv.createEl('input', {
				type: 'text',
				placeholder: 'Position label (e.g., past)',
				value: position.label
			});
			labelInput.setAttr('style', 'width: 100%; margin-bottom: 8px;');
			labelInput.addEventListener('input', () => {
				position.label = labelInput.value;
			});

			// Description input (optional)
			const descInput = positionDiv.createEl('input', {
				type: 'text',
				placeholder: 'Optional description',
				value: position.description || ''
			});
			descInput.setAttr('style', 'width: 100%;');
			descInput.addEventListener('input', () => {
				position.description = descInput.value || undefined;
			});
		});
	}

	private save() {
		// Validate
		if (!this.spread.isBuiltIn && !this.name.trim()) {
			new Notice('Please enter a spread name');
			return;
		}

		const validPositions = this.positions.filter(p => p.label.trim());
		if (validPositions.length === 0) {
			new Notice('Please add at least one position with a label');
			return;
		}

		// Create updated spread object
		const updatedSpread: Spread = {
			...this.spread,
			name: this.spread.isBuiltIn ? this.spread.name : this.name, // Keep original name for built-ins
			description: this.description,
			positions: validPositions,
			shuffleCount: this.shuffleCount,
			cutDeck: this.cutDeck,
			insertMode: this.insertMode,
			templatePath: this.templatePath
		};

		this.callback(updatedSpread, false);
		this.close();
	}

	private async createFromExample() {
		try {
			const exporter = new TemplateExporter(this.app, this.settings);
			const spreadId = this.spread.id || this.name.toLowerCase().replace(/\s+/g, '-');
			this.templatePath = await exporter.createSpreadTemplateFromExample(
				this.templateExample,
				spreadId
			);
			this.updateTemplateDescription();
			new Notice(`Template created at ${this.templatePath}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`Failed to create template: ${errorMessage}`);
		}
	}

	private showFilePicker() {
		const pathInput = this.contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Templates/Tarot/Spreads/my-spread.md',
			value: this.templatePath
		});
		
		new FileSuggest(this.app, pathInput);
		
		pathInput.addEventListener('change', () => {
			this.templatePath = pathInput.value;
			this.updateTemplateDescription();
		});
	}

	private updateTemplateDescription(container?: HTMLElement) {
		const targetContainer = container || this.contentEl.querySelector('.template-path-container') as HTMLElement;
		if (!targetContainer) return;

		targetContainer.empty();
		
		if (this.templatePath) {
			const usingDiv = targetContainer.createEl('div', {
				text: `Using: ${this.templatePath}`,
				cls: 'setting-item-description'
			});
			usingDiv.setAttr('style', 'margin-top: 8px;');
		} else {
			const builtInDiv = targetContainer.createEl('div', {
				text: 'Using built-in template',
				cls: 'setting-item-description'
			});
			builtInDiv.setAttr('style', 'margin-top: 8px;');
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
