import { MarkdownView, Plugin, moment, TFile, Notice } from 'obsidian';
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
		this.addRibbonIcon('sparkles', 'Daily Tarot Practice Draw', () => {
			this.openDrawModal();
		});

		// Add command for drawing a card
		this.addCommand({
			id: 'draw-tarot-card',
			name: 'Daily Tarot Practice Draw',
			callback: () => {
				this.openDrawModal();
			}
		});

		// Add settings tab
		this.addSettingTab(new TarotPracticeSettingTab(this.app, this));
	}

	openDrawModal() {
		new TarotDrawModal(this.app, (result) => {
			this.insertDrawIntoNote(result);
		}).open();
	}

	async insertDrawIntoNote(result: DrawResult) {
		console.log('Tarot: insertDrawIntoNote called', result);
		
		// Format the output using template
		const timestamp = new Date(result.timestamp);
		const output = this.settings.outputTemplate
			.replace(/{{card}}/g, result.cardName)
			.replace(/{{index}}/g, result.cardIndex.toString())
			.replace(/{{intention}}/g, result.intention)
			.replace(/{{timestamp}}/g, result.timestamp)
			.replace(/{{date}}/g, timestamp.toLocaleDateString())
			.replace(/{{time}}/g, timestamp.toLocaleTimeString())
			.replace(/{{datetime}}/g, timestamp.toLocaleString());

		// Try to insert at cursor if in edit mode AND setting is enabled
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const viewMode = view?.getMode();
		const isEditMode = viewMode === 'source';
		
		console.log('Tarot: View mode:', viewMode, 'Is edit mode:', isEditMode, 'Insert at cursor:', this.settings.insertAtCursor);
		
		if (view?.editor && isEditMode && this.settings.insertAtCursor) {
			console.log('Tarot: Inserting at cursor in edit mode');
			view.editor.replaceSelection(output);
			new Notice('Card drawn: ' + result.cardName);
			return;
		}

		console.log('Tarot: Using configured insert location');

		// Otherwise, use configured location
		let targetFile = this.app.workspace.getActiveFile();
		console.log('Tarot: Active file:', targetFile?.path);
		
		if (!targetFile) {
			// No active file - check if daily note is enabled
			if (!this.settings.useDailyNote) {
				console.log('Tarot: No active file and daily note disabled');
				new Notice('Please open a note to insert the tarot draw');
				return;
			}
			
			// Try to get/create today's daily note
			const dailyNotePath = moment().format(this.settings.dailyNotePathPattern);
			console.log('Tarot: No active file, trying daily note:', dailyNotePath);
			const abstractFile = this.app.vault.getAbstractFileByPath(dailyNotePath);
			
			if (abstractFile instanceof TFile) {
				console.log('Tarot: Found existing daily note');
				targetFile = abstractFile;
			} else {
				console.log('Tarot: Creating new daily note');
				targetFile = await this.app.vault.create(dailyNotePath, '');
			}
			
			// Open the daily note
			await this.app.workspace.openLinkText(dailyNotePath, '', false);
		}

		console.log('Tarot: Inserting to file:', targetFile.path, 'Location:', this.settings.insertLocation);
		
		// Insert based on settings
		const currentContent = await this.app.vault.read(targetFile);
		let newContent: string;

		switch (this.settings.insertLocation) {
			case 'prepend':
				newContent = output + currentContent;
				break;
			
			case 'heading':
				newContent = this.insertUnderHeading(currentContent, output);
				break;
			
			case 'append':
			default:
				// Only add newline if file doesn't end with one
				const separator = currentContent.endsWith('\n') ? '' : '\n';
				newContent = currentContent + separator + output;
				break;
		}

		await this.app.vault.modify(targetFile, newContent);
		new Notice('Card drawn: ' + result.cardName);
		console.log('Tarot: Done!');
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
