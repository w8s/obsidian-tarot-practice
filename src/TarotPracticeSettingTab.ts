import { App, PluginSettingTab, Setting } from 'obsidian';
import TarotPracticePlugin from './main';

export class TarotPracticeSettingTab extends PluginSettingTab {
	plugin: TarotPracticePlugin;

	constructor(app: App, plugin: TarotPracticePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'Tarot Practice Settings' });

		// Toggle for using daily notes
		new Setting(containerEl)
			.setName('Use daily note')
			.setDesc('Automatically open/create daily note when no file is active')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useDailyNote)
				.onChange(async (value) => {
					this.plugin.settings.useDailyNote = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show/hide path pattern
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
		containerEl.createEl('h3', { text: 'Insert Location' });
		containerEl.createEl('p', { 
			text: 'When in edit mode, draws always insert at cursor. These settings apply when not in edit mode.',
			cls: 'setting-item-description'
		});

		new Setting(containerEl)
			.setName('Insert location')
			.setDesc('Where to insert the tarot draw in the file')
			.addDropdown(dropdown => dropdown
				.addOption('append', 'Append to end')
				.addOption('prepend', 'Prepend to beginning')
				.addOption('heading', 'Under heading')
				.setValue(this.plugin.settings.insertLocation)
				.onChange(async (value) => {
					this.plugin.settings.insertLocation = value as any;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show/hide heading name
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
	}
}
