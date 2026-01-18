import { Plugin, moment, TFile, Notice, MarkdownView } from 'obsidian';
import { TarotDrawModal } from './TarotDrawModal';
import { TarotMultipleDrawModal } from './TarotMultipleDrawModal';
import { TarotPracticeSettings, DEFAULT_SETTINGS } from './settings';
import { TarotPracticeSettingTab } from './TarotPracticeSettingTab';

interface DrawResult {
	intention: string;
	cardIndex: number;
	cardName: string;
	timestamp: string;
	isReversed: boolean;
}

interface CardDraw {
	cardIndex: number;
	cardName: string;
	isReversed: boolean;
}

interface MultipleDrawResult {
	intention: string;
	cards: CardDraw[];
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

		// Add command for inline drawing at cursor
		this.addCommand({
			id: 'draw-tarot-card-inline',
			name: 'Draw tarot card inline',
			callback: () => {
				this.openInlineDrawModal();
			}
		});

		// Add command for multiple cards (daily)
		this.addCommand({
			id: 'draw-multiple-tarot-cards',
			name: 'Draw multiple tarot cards',
			callback: () => {
				this.openMultipleDrawModal();
			}
		});

		// Add command for multiple cards (inline)
		this.addCommand({
			id: 'draw-multiple-tarot-cards-inline',
			name: 'Draw multiple tarot cards inline',
			callback: () => {
				this.openInlineMultipleDrawModal();
			}
		});

		// Add settings tab
		this.addSettingTab(new TarotPracticeSettingTab(this.app, this));
	}

	openDrawModal() {
		new TarotDrawModal(this.app, this.settings, (result) => {
			void this.insertDrawIntoNote(result);
		}).open();
	}

	openInlineDrawModal() {
		new TarotDrawModal(this.app, this.settings, (result) => {
			void this.insertDrawInline(result);
		}).open();
	}

	openMultipleDrawModal() {
		new TarotMultipleDrawModal(this.app, this.settings, (result) => {
			void this.insertMultipleDrawIntoNote(result);
		}).open();
	}

	openInlineMultipleDrawModal() {
		new TarotMultipleDrawModal(this.app, this.settings, (result) => {
			void this.insertMultipleDrawInline(result);
		}).open();
	}

	async insertDrawInline(result: DrawResult) {
		// Get the active markdown editor
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (!activeView) {
			new Notice('No active note found');
			return;
		}
		
		// Format the output using appropriate template
		const output = this.formatTemplate(result, this.settings.useSharedTemplate 
			? this.settings.outputTemplate 
			: this.settings.inlineOutputTemplate);
		
		// Insert at current cursor position ONLY
		const editor = activeView.editor;
		editor.replaceSelection(output);
		
		new Notice('Card drawn: ' + result.cardName);
	}

	formatTemplate(result: DrawResult, template: string): string {
		const timestamp = moment(result.timestamp);
		let output = template;
		
		// Replace simple variables
		output = output.replace(/{{card}}/g, result.cardName);
		output = output.replace(/{{index}}/g, result.cardIndex.toString());
		output = output.replace(/{{intention}}/g, result.intention);
		output = output.replace(/{{timestamp}}/g, result.timestamp);
		
		// Replace orientation variable
		const orientation = result.isReversed 
			? this.settings.reversedIndicator 
			: this.settings.uprightIndicator;
		output = output.replace(/{{orientation}}/g, orientation);
		
		// Replace formatted date/time variables
		output = output.replace(/{{date(?::([^}]+))?}}/g, (_match, format: string | undefined) => {
			return format ? timestamp.format(format) : timestamp.format('L');
		});
		
		output = output.replace(/{{time(?::([^}]+))?}}/g, (_match, format: string | undefined) => {
			return format ? timestamp.format(format) : timestamp.format('LT');
		});
		
		output = output.replace(/{{datetime(?::([^}]+))?}}/g, (_match, format: string | undefined) => {
			return format ? timestamp.format(format) : timestamp.format('L LT');
		});
		
		return output;
	}

	formatMultipleTemplate(result: MultipleDrawResult, template: string): string {
		const timestamp = moment(result.timestamp);
		let output = template;
		
		// Replace simple variables
		output = output.replace(/{{intention}}/g, result.intention);
		output = output.replace(/{{timestamp}}/g, result.timestamp);
		output = output.replace(/{{card_count}}/g, result.cards.length.toString());
		
		// Format cards list
		const cardsList = result.cards.map((card, index) => {
			const orientation = card.isReversed 
				? this.settings.reversedIndicator 
				: this.settings.uprightIndicator;
			const orientationText = orientation ? ` ${orientation}` : '';
			return `${index + 1}. ${card.cardName}${orientationText}`;
		}).join('\n');
		
		output = output.replace(/{{cards}}/g, cardsList);
		
		// Replace formatted date/time variables
		output = output.replace(/{{date(?::([^}]+))?}}/g, (_match, format: string | undefined) => {
			return format ? timestamp.format(format) : timestamp.format('L');
		});
		
		output = output.replace(/{{time(?::([^}]+))?}}/g, (_match, format: string | undefined) => {
			return format ? timestamp.format(format) : timestamp.format('LT');
		});
		
		output = output.replace(/{{datetime(?::([^}]+))?}}/g, (_match, format: string | undefined) => {
			return format ? timestamp.format(format) : timestamp.format('L LT');
		});
		
		return output;
	}

	async insertMultipleDrawInline(result: MultipleDrawResult) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (!activeView) {
			new Notice('No active note found');
			return;
		}
		
		const output = this.formatMultipleTemplate(result, this.settings.multipleCardsTemplate);
		
		const editor = activeView.editor;
		editor.replaceSelection(output);
		
		new Notice(`${result.cards.length} cards drawn`);
	}

	async insertMultipleDrawIntoNote(result: MultipleDrawResult) {
		const output = this.formatMultipleTemplate(result, this.settings.multipleCardsTemplate);

		// Get target file (active file or daily note)
		let targetFile = this.app.workspace.getActiveFile();
		
		if (!targetFile) {
			if (!this.settings.useDailyNote) {
				new Notice('Please open a note to insert the tarot draw');
				return;
			}
			
			const dailyNotePath = moment().format(this.settings.dailyNotePathPattern);
			const abstractFile = this.app.vault.getAbstractFileByPath(dailyNotePath);
			
			if (abstractFile instanceof TFile) {
				targetFile = abstractFile;
			} else {
				targetFile = await this.app.vault.create(dailyNotePath, '');
			}
			
			await this.app.workspace.openLinkText(dailyNotePath, '', false);
		}

		const fileContent = await this.app.vault.read(targetFile);
		let newContent: string;

		switch (this.settings.insertLocation) {
			case 'append':
				newContent = fileContent + '\n' + output;
				break;
			case 'prepend':
				newContent = output + '\n' + fileContent;
				break;
			case 'heading':
				newContent = this.insertUnderHeading(fileContent, output);
				break;
			default:
				newContent = fileContent + '\n' + output;
		}

		await this.app.vault.modify(targetFile, newContent);
		new Notice(`${result.cards.length} cards drawn`);
	}

	async insertDrawIntoNote(result: DrawResult) {
		// Format the output using template
		const output = this.formatTemplate(result, this.settings.outputTemplate);

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
		const data = await this.loadData() as Partial<TarotPracticeSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
