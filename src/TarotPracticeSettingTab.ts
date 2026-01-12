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
		new Setting(containerEl).setName('Insert location').setHeading();

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
		new Setting(containerEl).setName('Output format').setHeading();
		
		const helpText = containerEl.createEl('p', { cls: 'setting-item-description' });
		helpText.createEl('span', { text: 'Customize output using template variables. Date/time formatting supports ' });
		helpText.createEl('a', { 
			text: 'Moment.js syntax',
			href: 'https://momentjs.com/docs/#/displaying/format/'
		});
		helpText.createEl('span', { text: '.' });
		
		const templateContainer = containerEl.createDiv({ cls: 'tarot-template-container' });
		
		const leftColumn = templateContainer.createDiv({ cls: 'tarot-template-dictionary' });
		new Setting(leftColumn).setName('Template variables').setHeading();
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
		
		new Setting(leftColumn).setName('Format examples').setHeading();
		const examples = leftColumn.createEl('div', { cls: 'tarot-examples' });
		examples.createEl('code', { text: 'YYYY-MM-DD' });
		examples.createEl('span', { text: ' → 2026-01-11' });
		examples.createEl('br');
		examples.createEl('code', { text: 'MMM D, YYYY' });
		examples.createEl('span', { text: ' → Jan 11, 2026' });
		examples.createEl('br');
		examples.createEl('code', { text: 'HH:mm' });
		examples.createEl('span', { text: ' → 16:20' });
		examples.createEl('br');
		examples.createEl('code', { text: 'h:mm A' });
		examples.createEl('span', { text: ' → 4:20 PM' });

		const rightColumn = templateContainer.createDiv({ cls: 'tarot-template-editor' });
		const textArea = rightColumn.createEl('textarea', { 
			cls: 'tarot-template-textarea'
		});
		textArea.value = this.plugin.settings.outputTemplate;
		textArea.rows = 10;
		textArea.addEventListener('input', () => {
			this.plugin.settings.outputTemplate = textArea.value;
			void this.plugin.saveSettings();
		});
	}
}
