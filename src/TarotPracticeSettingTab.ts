import { App, PluginSettingTab, Setting } from 'obsidian';
import TarotPracticePlugin from './main';
import { InsertLocation } from './settings';
import { FileSuggest } from './FileSuggest';
import { TemplateMigrator } from './TemplateMigrator';
import { TemplateFolderDetector } from './TemplateFolderDetector';
import { TemplateMigrationModal } from './TemplateMigrationModal';

export class TarotPracticeSettingTab extends PluginSettingTab {
	plugin: TarotPracticePlugin;

	constructor(app: App, plugin: TarotPracticePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Check if migration is needed
		const migrator = new TemplateMigrator(this.app, this.plugin.settings);
		if (migrator.needsMigration()) {
			this.showMigrationPrompt(migrator);
			return; // Don't show settings until migration is handled
		}

		// ===== DECK PREPARATION SECTION =====
		new Setting(containerEl).setName('Deck preparation').setHeading();

		new Setting(containerEl)
			.setName('')
			.setDesc('These settings apply to all draws (daily and inline)')
			.setClass('setting-item-description');

		// Shuffle count
		const shuffleCountSetting = new Setting(containerEl)
			.setName('Number of shuffles')
			.setDesc('How many times to shuffle the deck before drawing (1-7)')
			.addSlider(slider => slider
				.setLimits(1, 7, 1)
				.setValue(this.plugin.settings.shuffleCount)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.shuffleCount = value;
					await this.plugin.saveSettings();
					// Update the display value
					shuffleCountSetting.controlEl.querySelector('.tarot-shuffle-count-value')!.textContent = `${value}`;
				}));
		
		// Add count display to the right of slider
		shuffleCountSetting.controlEl.createSpan({ 
			text: `${this.plugin.settings.shuffleCount}`,
			cls: 'tarot-shuffle-count-value'
		});

		// Cut deck toggle
		new Setting(containerEl)
			.setName('Cut deck')
			.setDesc('Cut the deck after shuffling (cut position influenced by intention)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.cutDeck)
				.onChange(async (value) => {
					this.plugin.settings.cutDeck = value;
					await this.plugin.saveSettings();
				}));

		// Daily card count
		const dailyCardCountSetting = new Setting(containerEl)
			.setName('Number of cards for daily practice')
			.setDesc('How many cards to draw for daily practice (1-78)')
			.addSlider(slider => slider
				.setLimits(1, 78, 1)
				.setValue(this.plugin.settings.dailyCardCount)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.dailyCardCount = value;
					await this.plugin.saveSettings();
					// Update the display value
					dailyCardCountSetting.controlEl.querySelector('.tarot-daily-count-value')!.textContent = `${value}`;
				}));
		
		// Add count display to the right of slider
		dailyCardCountSetting.controlEl.createSpan({ 
			text: `${this.plugin.settings.dailyCardCount}`,
			cls: 'tarot-daily-count-value'
		});

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

		// ===== TEMPLATES SECTION =====
		new Setting(containerEl).setName('Templates').setHeading();

		// Daily template
		this.addTemplateSection(
			containerEl,
			'Daily practice template',
			'Template for daily tarot draws',
			'useCustomDailyTemplate',
			'customDailyTemplatePath'
		);

		// Inline template
		this.addTemplateSection(
			containerEl,
			'Inline practice template',
			'Template for inline single-card draws',
			'useCustomInlineTemplate',
			'customInlineTemplatePath'
		);

		// Multiple cards template
		this.addTemplateSection(
			containerEl,
			'Multiple cards template',
			'Template for multiple card draws',
			'useCustomMultipleTemplate',
			'customMultipleTemplatePath'
		);
	}

	addTemplateSection(
		containerEl: HTMLElement,
		name: string,
		desc: string,
		useCustomKey: 'useCustomDailyTemplate' | 'useCustomInlineTemplate' | 'useCustomMultipleTemplate',
		pathKey: 'customDailyTemplatePath' | 'customInlineTemplatePath' | 'customMultipleTemplatePath'
	): void {
		// Toggle for using custom template
		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings[useCustomKey])
				.onChange(async (value) => {
					this.plugin.settings[useCustomKey] = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show/hide file picker
				}));

		// Only show file picker if custom template enabled
		if (this.plugin.settings[useCustomKey]) {
			new Setting(containerEl)
				.setName('Template file')
				.setDesc('Select a markdown file from your vault')
				.addText(text => {
					new FileSuggest(this.app, text.inputEl);
					text.setPlaceholder('Example: Templates/Tarot/Daily.md')
						.setValue(this.plugin.settings[pathKey])
						.onChange(async (value) => {
							this.plugin.settings[pathKey] = value;
							await this.plugin.saveSettings();
						});
				});
		}
	}

	/**
	 * Show migration prompt to user
	 */
	private showMigrationPrompt(migrator: TemplateMigrator): void {
		const { containerEl } = this;
		
		// Show explanation
		containerEl.createEl('h2', { text: 'Template System Update' });
		containerEl.createEl('p', {
			text: 'The Tarot Practice plugin now uses file-based templates. Would you like to migrate your customized templates?'
		});

		new Setting(containerEl)
			.setName('Migrate templates')
			.setDesc('Convert your inline templates to files in your vault')
			.addButton(button => button
				.setButtonText('Migrate Now')
				.setCta()
				.onClick(async () => {
					const detector = new TemplateFolderDetector(this.app);
					const detectedFolder = detector.detectTemplateFolder();
					const templates = migrator.getExistingTemplates();

					new TemplateMigrationModal(
						this.app,
						detectedFolder,
						templates,
						async (folderPath) => {
							await migrator.migrate(folderPath);
							await this.plugin.saveSettings();
							this.display(); // Refresh settings
						}
					).open();
				}));

		new Setting(containerEl)
			.setName('Skip migration')
			.setDesc('Use built-in templates and mark migration as complete')
			.addButton(button => button
				.setButtonText('Skip')
				.onClick(async () => {
					this.plugin.settings.hasTemplatesMigrated = true;
					await this.plugin.saveSettings();
					this.display(); // Refresh settings
				}));
	}
}
