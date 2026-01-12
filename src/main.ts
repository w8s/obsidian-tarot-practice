import { Plugin, moment, TFile, Notice } from 'obsidian';
import { TarotDrawModal } from './TarotDrawModal';
import { TarotPracticeSettings, DEFAULT_SETTINGS } from './settings';
import { TarotPracticeSettingTab } from './TarotPracticeSettingTab';

interface DrawResult {
	intention: string;
	cardIndex: number;
	cardName: string;
	timestamp: string;
}

export default class TarotPracticePlugin extends Plugin {
	settings: TarotPracticeSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbon icon for quick draw
		this.addRibbonIcon('sparkles', 'Daily tarot practice draw', () => {
			this.openDrawModal();
		});

		// Add command for drawing a card
		this.addCommand({
			id: 'draw-tarot-card',
			name: 'Draw daily tarot card',
			callback: () => {
				this.openDrawModal();
			}
		});

		// Add settings tab
		this.addSettingTab(new TarotPracticeSettingTab(this.app, this));
	}

	openDrawModal() {
		new TarotDrawModal(this.app, (result) => {
			void this.insertDrawIntoNote(result);
		}).open();
	}

	async insertDrawIntoNote(result: DrawResult) {
		// Format the output using template
		const timestamp = moment(result.timestamp);
		
		let output = this.settings.outputTemplate;
		
		// Replace simple variables
		output = output.replace(/{{card}}/g, result.cardName);
		output = output.replace(/{{index}}/g, result.cardIndex.toString());
		output = output.replace(/{{intention}}/g, result.intention);
		output = output.replace(/{{timestamp}}/g, result.timestamp);
		
		// Replace formatted date/time variables with custom formats
		// Format: {{date:YYYY-MM-DD}} or {{time:HH:mm:ss}} or {{datetime:YYYY-MM-DD HH:mm}}
		output = output.replace(/{{date(?::([^}]+))?}}/g, (match, format) => {
			return format ? timestamp.format(format) : timestamp.format('L');
		});
		
		output = output.replace(/{{time(?::([^}]+))?}}/g, (match, format) => {
			return format ? timestamp.format(format) : timestamp.format('LT');
		});
		
		output = output.replace(/{{datetime(?::([^}]+))?}}/g, (match, format) => {
			return format ? timestamp.format(format) : timestamp.format('L LT');
		});

		// Get target file (active file or daily note)
		let targetFile = this.app.workspace.getActiveFile();
		
		if (!targetFile) {
			// No active file - check if daily note is enabled
			if (!this.settings.useDailyNote) {
				new Notice('Please open a note to insert the tarot draw');
				return;
			}
			
			// Try to get/create today's daily note
			const dailyNotePath = moment().format(this.settings.dailyNotePathPattern);
			const abstractFile = this.app.vault.getAbstractFileByPath(dailyNotePath);
			
			if (abstractFile instanceof TFile) {
				targetFile = abstractFile;
			} else {
				targetFile = await this.app.vault.create(dailyNotePath, '');
			}
			
			// Open the daily note
			await this.app.workspace.openLinkText(dailyNotePath, '', false);
		}
		
		// Insert based on settings
		const currentContent = await this.app.vault.read(targetFile);
		let newContent: string;

		switch (this.settings.insertLocation) {
			case 'prepend': {
				newContent = output + currentContent;
				break;
			}
			case 'heading': {
				newContent = this.insertUnderHeading(currentContent, output);
				break;
			}
			case 'append':
			default: {
				// Only add newline if file doesn't end with one
				const separator = currentContent.endsWith('\n') ? '' : '\n';
				newContent = currentContent + separator + output;
				break;
			}
		}

		await this.app.vault.modify(targetFile, newContent);
		new Notice('Card drawn: ' + result.cardName);
	}

	insertUnderHeading(content: string, textToInsert: string): string {
		const lines = content.split('\n');
		const headingToFind = this.settings.headingName.trim();
		
		// Find the heading
		let headingIndex = -1;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i]?.trim() === headingToFind) {
				headingIndex = i;
				break;
			}
		}

		if (headingIndex === -1) {
			// Heading doesn't exist, append it to the end
			return content + '\n\n' + headingToFind + '\n\n' + textToInsert;
		}

		// Find the next heading or end of file
		let insertIndex = headingIndex + 1;
		for (let i = headingIndex + 1; i < lines.length; i++) {
			// Check if this line is a heading (starts with #)
			if (lines[i]?.trim().startsWith('#')) {
				insertIndex = i;
				break;
			}
			insertIndex = i + 1;
		}

		// Insert the text
		lines.splice(insertIndex, 0, '', textToInsert.trim());
		return lines.join('\n');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
