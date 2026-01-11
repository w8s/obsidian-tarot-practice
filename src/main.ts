import { Editor, MarkdownView, Plugin, moment } from 'obsidian';
import { TarotDrawModal } from './TarotDrawModal';

interface DrawResult {
	intention: string;
	cardIndex: number;
	cardName: string;
	timestamp: string;
}

export default class TarotPracticePlugin extends Plugin {
	async onload() {
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
	}

	openDrawModal() {
		new TarotDrawModal(this.app, (result) => {
			this.insertDrawIntoNote(result);
		}).open();
	}

	async insertDrawIntoNote(result: DrawResult) {		// Get the active editor
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) {
			// If no active editor, try to open today's daily note
			const dailyNotePath = moment().format('YYYY-MM-DD') + '.md';
			const file = this.app.vault.getAbstractFileByPath(dailyNotePath);
			
			if (file) {
				await this.app.workspace.openLinkText(dailyNotePath, '', false);
			}
		}

		// Format the output
		const formattedTime = new Date(result.timestamp).toLocaleString();
		const output = `## Tarot Draw - ${formattedTime}

**Intention:** ${result.intention}
**Card:** ${result.cardName} (Index: ${result.cardIndex})
**Drawn at:** ${result.timestamp}

---

`;

		// Insert into the current note
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			const editor = activeView.editor;
			editor.replaceSelection(output);
		}
	}
}
