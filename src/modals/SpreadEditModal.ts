import { App, Modal, Setting, Notice } from 'obsidian';
import { Spread, SpreadPositionDefinition } from '../core/spreads';
import { FileSuggest } from '../ui/FileSuggest';
import { TemplateExporter } from '../templates/TemplateExporter';
import { TarotPracticeSettings } from '../settings';
import { ConfirmModal } from './ConfirmModal';

interface TemplateUIElements {
	toggle: Setting;
	customContainer: HTMLElement;
	pathContainer: HTMLElement;
}

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
	private templateUIElements?: TemplateUIElements;
	private fileInput?: HTMLInputElement;
	private useBuiltInTemplate: boolean;

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
		this.useBuiltInTemplate = !spread.templatePath || spread.templatePath === '';
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		new Setting(contentEl).setName(`Edit: ${this.spread.name}`).setHeading();

		// Show reset button for built-in spreads
		if (this.spread.isBuiltIn) {
			const resetContainer = contentEl.createDiv({ cls: 'spread-built-in-notice' });
			
			resetContainer.createEl('div', {
				text: 'This is a built-in spread. You can customize it, and your changes will be saved.',
				cls: 'setting-item-description'
			});
			
			const resetButton = resetContainer.createEl('button', {
				text: 'Reset to default',
				cls: 'mod-warning'
			});
			resetButton.addEventListener('click', () => {
				new ConfirmModal(
					this.app,
					'Reset this spread to its default settings? Your customizations will be lost.',
					() => {
						this.callback(this.spread, true); // Pass reset flag
						this.close();
					}
				).open();
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

		// Template section - Toggle for built-in vs custom
		const useBuiltInToggle = new Setting(contentEl)
			.setName('Use built-in template')
			.setDesc('Use the default template for this spread type')
			.addToggle(toggle => toggle
				.setValue(this.useBuiltInTemplate)
				.onChange((value) => {
					this.useBuiltInTemplate = value;
					if (value) {
						// Switching to built-in - clear the path
						this.templatePath = '';
					}
					this.updateTemplateUI();
				}));

		// Custom template file picker container (will be populated by updateTemplateUI)
		const customTemplateContainer = contentEl.createDiv({ cls: 'custom-template-container' });

		// Template path display
		const templatePathContainer = contentEl.createDiv({ cls: 'template-path-container' });
		
		// Store references for updating
		this.templateUIElements = {
			toggle: useBuiltInToggle,
			customContainer: customTemplateContainer,
			pathContainer: templatePathContainer
		};
		
		// Initial UI setup
		this.updateTemplateUI();

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-row' });

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

			// Position header with number and remove button
			const headerDiv = positionDiv.createDiv({ cls: 'spread-position-header' });

			headerDiv.createEl('strong', { text: `Position ${index + 1}` });

			if (this.positions.length > 1) {
				const removeBtn = headerDiv.createEl('button', {
					text: '×',
					cls: 'clickable-icon spread-position-remove'
				});
				removeBtn.addEventListener('click', () => {
					this.positions.splice(index, 1);
					this.renderPositions(container);
				});
			}

			// Label input
			const labelInput = positionDiv.createEl('input', {
				type: 'text',
				placeholder: 'Position label (e.g., past)',
				value: position.label,
				cls: 'spread-position-label'
			});
			labelInput.addEventListener('input', () => {
				position.label = labelInput.value;
			});

			// Description input (optional)
			const descInput = positionDiv.createEl('input', {
				type: 'text',
				placeholder: 'Optional description',
				value: position.description || '',
				cls: 'spread-position-desc'
			});
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
			this.updateTemplateUI();
			new Notice(`Template created at ${this.templatePath}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`Failed to create template: ${errorMessage}`);
		}
	}

	private updateTemplateUI() {
		if (!this.templateUIElements) return;

		const { customContainer } = this.templateUIElements;

		// Always clear and recreate the custom container content
		customContainer.empty();

		if (this.useBuiltInTemplate) {
			// Hide when using built-in
			customContainer.hide();
		} else {
			// Show and populate when using custom
			customContainer.show();
			
			const fileInputContainer = customContainer.createDiv({ cls: 'spread-template-file-container' });
			
			this.fileInput = fileInputContainer.createEl('input', {
				type: 'text',
				placeholder: 'templates/Tarot/Spreads/my-spread.md',
				value: this.templatePath,
				cls: 'spread-template-file-input'
			});
			
			new FileSuggest(this.app, this.fileInput);
			
			this.fileInput.addEventListener('input', () => {
				this.templatePath = this.fileInput!.value;
				this.updateTemplatePathDisplay();
			});
			
			// Create from example button
			const createExampleButton = customContainer.createEl('button', {
				text: 'Create from example...',
				cls: 'mod-cta spread-template-create-btn'
			});
			createExampleButton.addEventListener('click', () => {
				void this.createFromExample();
			});
		}

		this.updateTemplatePathDisplay();
	}

	private updateTemplatePathDisplay() {
		if (!this.templateUIElements) return;
		
		const { pathContainer } = this.templateUIElements;
		pathContainer.empty();
		
		if (this.templatePath) {
			const usingDiv = pathContainer.createEl('div', {
				text: `Using: ${this.templatePath}`,
				cls: 'setting-item-description'
			});
			usingDiv.addClass('spread-template-path-info');
		} else {
			const builtInDiv = pathContainer.createEl('div', {
				text: 'Using built-in template',
				cls: 'setting-item-description'
			});
			builtInDiv.addClass('spread-template-path-info');
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
