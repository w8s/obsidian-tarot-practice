import { App, PluginSettingTab, Setting } from 'obsidian';
import TarotPracticePlugin from './main';
import { InsertLocation } from './settings';

export class TarotPracticeSettingTab extends PluginSettingTab {
	plugin: TarotPracticePlugin;

	constructor(app: App, plugin: TarotPracticePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// ===== DAILY TAROT PRACTICE SECTION =====
		new Setting(containerEl).setName('Daily practice').setHeading();

		// Toggle for using daily notes
		new Setting(containerEl)
			.setName('Use daily note')
			.setDesc('Automatically open/create daily note when no file is active')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useDailyNote)
				.onChange(async (value) => {
					this.plugin.settings.useDailyNote = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		// Only show path pattern if daily note is enabled
		if (this.plugin.settings.useDailyNote) {
			new Setting(containerEl)
				.setName('Daily note path pattern')
				.setDesc('Pattern for daily notes (e.g., YYYY-MM-DD.md or Daily Notes/YYYY-MM-DD.md)')
				.addText(text => text
					.setPlaceholder('YYYY-MM-DD.md')
					.setValue(this.plugin.settings.dailyNotePathPattern)
					.onChange(async (value) => {
						this.plugin.settings.dailyNotePathPattern = value;
						await this.plugin.saveSettings();
					}));
		}

		// Insert location settings
		new Setting(containerEl)
			.setName('Insert location')
			.setDesc('Where to insert the tarot draw in the file')
			.addDropdown(dropdown => dropdown
				.addOption('append', 'Append to end')
				.addOption('prepend', 'Prepend to beginning')
				.addOption('heading', 'Under heading')
				.setValue(this.plugin.settings.insertLocation)
				.onChange(async (value) => {
					this.plugin.settings.insertLocation = value as InsertLocation;
					await this.plugin.saveSettings();
					this.display();
				}));

		// Only show heading name if "Under heading" is selected
		if (this.plugin.settings.insertLocation === 'heading') {
			new Setting(containerEl)
				.setName('Heading name')
				.setDesc('The heading to insert under (will be created if it doesn\'t exist)')
				.addText(text => text
					.setPlaceholder('## Tarot')
					.setValue(this.plugin.settings.headingName)
					.onChange(async (value) => {
						this.plugin.settings.headingName = value;
						await this.plugin.saveSettings();
					}));
		}

		// Daily template
		this.addTemplateEditor(containerEl, 'Daily practice output template', 'outputTemplate');

		// ===== INLINE TAROT PRACTICE SECTION =====
		new Setting(containerEl).setName('Inline practice').setHeading();

		// Use shared template toggle
		new Setting(containerEl)
			.setName('Use daily practice format')
			.setDesc('Use the same output template as daily practice')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useSharedTemplate)
				.onChange(async (value) => {
					this.plugin.settings.useSharedTemplate = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		// Only show inline template if NOT using shared
		if (!this.plugin.settings.useSharedTemplate) {
			this.addTemplateEditor(containerEl, 'Inline practice output template', 'inlineOutputTemplate');
		}

		// ===== REVERSALS SECTION =====
		new Setting(containerEl).setName('Reversals').setHeading();

		// Enable reversals toggle
		new Setting(containerEl)
			.setName('Enable reversals')
			.setDesc('Allow cards to appear reversed in readings')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableReversals)
				.onChange(async (value) => {
					this.plugin.settings.enableReversals = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		// Only show reversal settings if enabled
		if (this.plugin.settings.enableReversals) {
			const reversalChanceSetting = new Setting(containerEl)
				.setName('Reversal chance')
				.setDesc('Probability of a card appearing reversed (0-100%)')
				.addSlider(slider => slider
					.setLimits(0, 100, 5)
					.setValue(this.plugin.settings.reversalChance)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.reversalChance = value;
						await this.plugin.saveSettings();
						// Update the display value
						reversalChanceSetting.controlEl.querySelector('.tarot-reversal-value')!.textContent = `${value}%`;
					}));
			
			// Add percentage display to the right of slider
			reversalChanceSetting.controlEl.createSpan({ 
				text: `${this.plugin.settings.reversalChance}%`,
				cls: 'tarot-reversal-value'
			});

			new Setting(containerEl)
				.setName('Upright indicator')
				.setDesc('Text to append for upright cards (leave empty for none)')
				.addText(text => text
					.setPlaceholder('')
					.setValue(this.plugin.settings.uprightIndicator)
					.onChange(async (value) => {
						this.plugin.settings.uprightIndicator = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Reversed indicator')
				.setDesc('Text to append for reversed cards')
				.addText(text => text
					.setPlaceholder('reversed')
					.setValue(this.plugin.settings.reversedIndicator)
					.onChange(async (value) => {
						this.plugin.settings.reversedIndicator = value;
						await this.plugin.saveSettings();
					}));
		}

		// ===== MULTIPLE CARDS SECTION =====
		new Setting(containerEl).setName('Multiple cards').setHeading();

		const defaultCardCountSetting = new Setting(containerEl)
			.setName('Default card count')
			.setDesc('Number of cards to draw by default (1-10)')
			.addSlider(slider => slider
				.setLimits(1, 10, 1)
				.setValue(this.plugin.settings.multipleCardsDefault)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.multipleCardsDefault = value;
					await this.plugin.saveSettings();
					// Update the display value
					defaultCardCountSetting.controlEl.querySelector('.tarot-card-count-value')!.textContent = `${value}`;
				}));
		
		// Add count display to the right of slider
		defaultCardCountSetting.controlEl.createSpan({ 
			text: `${this.plugin.settings.multipleCardsDefault}`,
			cls: 'tarot-card-count-value'
		});

		this.addMultipleCardsTemplateEditor(containerEl);
	}

	addTemplateEditor(containerEl: HTMLElement, title: string, settingKey: 'outputTemplate' | 'inlineOutputTemplate'): void {
		new Setting(containerEl).setName(title).setHeading();
		
		const helpText = containerEl.createEl('p', { cls: 'setting-item-description' });
		helpText.createEl('span', { text: 'Customize output using template variables. See ' });
		helpText.createEl('a', { 
			text: 'template documentation',
			href: 'https://github.com/w8s/obsidian-tarot-practice#template-variables'
		});
		helpText.createEl('span', { text: ' for available variables and examples.' });
		
		const textArea = containerEl.createEl('textarea', { 
			cls: 'tarot-template-textarea'
		});
		textArea.value = this.plugin.settings[settingKey];
		textArea.rows = 10;
		textArea.addEventListener('input', () => {
			this.plugin.settings[settingKey] = textArea.value;
			void this.plugin.saveSettings();
		});
	}

	addMultipleCardsTemplateEditor(containerEl: HTMLElement): void {
		new Setting(containerEl).setName('Multiple cards output template').setHeading();
		
		const helpText = containerEl.createEl('p', { cls: 'setting-item-description' });
		helpText.createEl('span', { text: 'Template for multiple card draws. Available variables: {{intention}}, {{card_count}}, {{cards}}, {{timestamp}}, {{date}}, {{time}}, {{datetime}}. See ' });
		helpText.createEl('a', { 
			text: 'template documentation',
			href: 'https://github.com/w8s/obsidian-tarot-practice#template-variables'
		});
		helpText.createEl('span', { text: ' for formatting options.' });
		
		const textArea = containerEl.createEl('textarea', { 
			cls: 'tarot-template-textarea'
		});
		textArea.value = this.plugin.settings.multipleCardsTemplate;
		textArea.rows = 10;
		textArea.addEventListener('input', () => {
			this.plugin.settings.multipleCardsTemplate = textArea.value;
			void this.plugin.saveSettings();
		});
	}
}
