import { App, Modal, Setting } from 'obsidian';
import { Spread } from './spreads';
import { FileSuggest } from './FileSuggest';

/**
 * Modal to edit spread settings (shuffle count, cut, template)
 * Note: Cannot edit positions or core spread properties
 */
export class SpreadEditModal extends Modal {
	private spread: Spread;
	private callback: (updatedSpread: Spread) => void;
	
	// Editable fields
	private shuffleCount: number;
	private cutDeck: boolean;
	private templatePath: string;

	constructor(
		app: App,
		spread: Spread,
		callback: (updatedSpread: Spread) => void
	) {
		super(app);
		this.spread = spread;
		this.callback = callback;
		
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

		// Template path
		new Setting(contentEl)
			.setName('Template file')
			.setDesc('Path to custom template file (leave empty for built-in)')
			.addSearch(search => {
				search
					.setPlaceholder('e.g., Templates/Spreads/Celtic-Cross.md')
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

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
