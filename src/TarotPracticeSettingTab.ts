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

		// Output template
		containerEl.createEl('h3', { text: 'Output Format' });
		
		const helpText = containerEl.createEl('p', { cls: 'setting-item-description' });
		helpText.innerHTML = 'Customize output using template variables. Date/time formatting supports <a href="https://momentjs.com/docs/#/displaying/format/">Moment.js syntax</a>.';
		
		const templateContainer = containerEl.createDiv({ cls: 'tarot-template-container' });
		
		const leftColumn = templateContainer.createDiv({ cls: 'tarot-template-dictionary' });
		leftColumn.createEl('h4', { text: 'Template Variables' });
		const dict = leftColumn.createEl('div', { cls: 'tarot-dictionary' });
		
		const variables = [
			['{{card}}', 'Card name'],
			['{{index}}', 'Card index (0-77)'],
			['{{intention}}', 'Your intention'],
			['{{timestamp}}', 'ISO timestamp'],
			['', ''],
			['{{date}}', 'Localized date'],
			['{{date:FORMAT}}', 'Custom date format'],
			['{{time}}', 'Localized time'],
			['{{time:FORMAT}}', 'Custom time format'],
			['{{datetime}}', 'Date + time'],
			['{{datetime:FORMAT}}', 'Custom datetime format']
		];
		
		const table = dict.createEl('table', { cls: 'tarot-var-table' });
		variables.forEach(([variable, description]) => {
			const row = table.createEl('tr');
			row.createEl('td', { text: variable, cls: 'tarot-var-name' });
			row.createEl('td', { text: description, cls: 'tarot-var-desc' });
		});
		
		const examplesHeader = leftColumn.createEl('h4', { text: 'Format Examples', cls: 'tarot-examples-header' });
		const examples = leftColumn.createEl('div', { cls: 'tarot-examples' });
		examples.innerHTML = `<code>YYYY-MM-DD</code> → 2026-01-11<br>
<code>MMM D, YYYY</code> → Jan 11, 2026<br>
<code>HH:mm</code> → 16:20<br>
<code>h:mm A</code> → 4:20 PM`;

		const rightColumn = templateContainer.createDiv({ cls: 'tarot-template-editor' });
		const textArea = rightColumn.createEl('textarea', { 
			cls: 'tarot-template-textarea'
		});
		textArea.value = this.plugin.settings.outputTemplate;
		textArea.rows = 10;
		textArea.addEventListener('input', async () => {
			this.plugin.settings.outputTemplate = textArea.value;
			await this.plugin.saveSettings();
		});
	}
}
