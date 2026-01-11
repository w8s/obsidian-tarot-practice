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
}
