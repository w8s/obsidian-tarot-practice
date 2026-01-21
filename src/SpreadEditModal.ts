import { App, Modal, Setting, Notice } from 'obsidian';
import { Spread } from './spreads';
import { FileSuggest } from './FileSuggest';
import { TemplateExporter } from './TemplateExporter';
import { TarotPracticeSettings } from './settings';

/**
 * Modal to edit spread settings (shuffle count, cut, template)
 * Note: Cannot edit positions or core spread properties
 */
export class SpreadEditModal extends Modal {
	private spread: Spread;
	private callback: (updatedSpread: Spread) => void;
	private settings: TarotPracticeSettings;
	
	// Editable fields
	private shuffleCount: number;
	private cutDeck: boolean;
	private templatePath: string;

	constructor(
		app: App,
		spread: Spread,
		settings: TarotPracticeSettings,
		callback: (updatedSpread: Spread) => void
	) {
		super(app);
		this.spread = spread;
		this.callback = callback;
		this.settings = settings;
		
		// Initialize editable fields
		this.shuffleCount = spread.shuffleCount;
		this.cutDeck = spread.cutDeck;
		this.templatePath = spread.templatePath;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		contentEl.createEl('h2', { text: `Edit: ${this.spread.name}` });
		
		contentEl.createEl('p', { 
			text: 'Edit deck preparation and template settings for this spread',
			cls: 'setting-item-description'
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

		// Template path with "Create from Example" option
		const templateSetting = new Setting(contentEl)
			.setName('Template')
			.setDesc('Choose how to configure the template for this spread');

		// Create dropdown for template options
		templateSetting.addDropdown(dropdown => {
			const isUsingBuiltIn = !this.templatePath || this.templatePath === '';
			
			// Add options
			dropdown.addOption('builtin', isUsingBuiltIn ? 'Built-in (current)' : 'Built-in');
			dropdown.addOption('create-builtin', 'Create from Built-in');
			dropdown.addOption('create-example', 'Create from Example...');
			dropdown.addOption('custom', this.templatePath ? `Custom: ${this.templatePath}` : 'Choose Custom File...');
			
			// Set current value
			if (isUsingBuiltIn) {
				dropdown.setValue('builtin');
			} else {
				dropdown.setValue('custom');
			}
			
			// Handle changes
			dropdown.onChange(async (value) => {
				if (value === 'create-builtin') {
					await this.createFromBuiltIn();
					dropdown.setValue('custom');
				} else if (value === 'create-example') {
					await this.createFromExample();
					dropdown.setValue('custom');
				} else if (value === 'builtin') {
					this.templatePath = '';
					this.updateTemplateDescription();
				} else if (value === 'custom') {
					// Show file picker
					this.showFilePicker();
				}
			});
		});

		// Template path display/edit (only if custom)
		const templatePathContainer = contentEl.createDiv({ cls: 'template-path-container' });
		this.updateTemplateDescription(templatePathContainer);

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

		// Save button
		const saveButton = buttonContainer.createEl('button', { 
			text: 'Save',
			cls: 'mod-cta'
		});
		saveButton.addEventListener('click', () => {
			this.save();
		});
	}

	private save() {
		// Create updated spread object
		const updatedSpread: Spread = {
			...this.spread,
			shuffleCount: this.shuffleCount,
			cutDeck: this.cutDeck,
			templatePath: this.templatePath
		};

		this.callback(updatedSpread);
		this.close();
	}

	private async createFromBuiltIn() {
		try {
			const exporter = new TemplateExporter(this.app, this.settings);
			const path = await exporter.createSpreadTemplateFromBuiltIn(this.spread.id);
			this.templatePath = path;
			this.updateTemplateDescription();
			new Notice(`Template created at ${path}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`Failed to create template: ${errorMessage}`);
		}
	}

	private async createFromExample() {
		// For now, just create from built-in for this spread
		// In the future, could show a modal to choose which example
		await this.createFromBuiltIn();
	}

	private showFilePicker() {
		// Create a temporary input for file path
		const pathInput = this.contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Templates/Tarot/Spreads/my-spread.md',
			value: this.templatePath
		});
		pathInput.style.display = 'none';
		
		// Add FileSuggest
		new FileSuggest(this.app, pathInput);
		
		// Show it and focus
		pathInput.style.display = 'block';
		pathInput.focus();
		
		// Handle changes
		pathInput.addEventListener('change', () => {
			this.templatePath = pathInput.value;
			this.updateTemplateDescription();
			pathInput.remove();
		});
	}

	private updateTemplateDescription(container?: HTMLElement) {
		const targetContainer = container || this.contentEl.querySelector('.template-path-container') as HTMLElement;
		if (!targetContainer) return;

		targetContainer.empty();
		
		if (this.templatePath) {
			targetContainer.createEl('div', {
				text: `Using: ${this.templatePath}`,
				cls: 'setting-item-description'
			}).style.marginTop = '8px';
		} else {
			targetContainer.createEl('div', {
				text: 'Using built-in template',
				cls: 'setting-item-description'
			}).style.marginTop = '8px';
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
