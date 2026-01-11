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
		this.addRibbonIcon('sparkles', 'Draw Tarot Card', () => {
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
			this.insertDrawIntoNote(result);
		}).open();
	}

	async insertDrawIntoNote(result: DrawResult) {
		console.log('Tarot: insertDrawIntoNote called', result);
		
		// Format the output
		const formattedTime = new Date(result.timestamp).toLocaleString();
		const output = `## Tarot Draw - ${formattedTime}

**Intention:** ${result.intention}
**Card:** ${result.cardName} (Index: ${result.cardIndex})
**Drawn at:** ${result.timestamp}

---

`;

		// Try to insert at cursor if in edit mode
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const viewMode = view?.getMode();
		const isEditMode = viewMode === 'source';
		
		console.log('Tarot: View mode:', viewMode, 'Is edit mode:', isEditMode);
		
		if (view?.editor && isEditMode) {
			console.log('Tarot: Inserting at cursor in edit mode');
			view.editor.replaceSelection(output);
			new Notice('Card drawn: ' + result.cardName);
			return;
		}

		console.log('Tarot: Not in edit mode, will append to file');

		// Otherwise, append to the active file or daily note
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

		console.log('Tarot: Appending to file:', targetFile.path);
		// Append to the file
		const currentContent = await this.app.vault.read(targetFile);
		await this.app.vault.modify(targetFile, currentContent + '\n' + output);
		new Notice('Card drawn: ' + result.cardName);
		console.log('Tarot: Done!');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
