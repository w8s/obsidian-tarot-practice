import { App, Modal, Setting } from 'obsidian';

/**
 * Modal to ask user if they want to include template in spread export
 */
export class SpreadExportFormatModal extends Modal {
	private resolve: (value: boolean) => void;
	private spreadName: string;

	constructor(app: App, spreadName: string, resolve: (value: boolean) => void) {
		super(app);
		this.spreadName = spreadName;
		this.resolve = resolve;
	}

	onOpen(): void {
		const { contentEl } = this;
		
		new Setting(contentEl).setName('Export format').setHeading();
		contentEl.createEl('p', { 
			text: `The spread "${this.spreadName}" has a custom template. How would you like to export it?` 
		});
		
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		
		const zipButton = buttonContainer.createEl('button', { 
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			text: 'ZIP with template', 
			cls: 'mod-cta' 
		});
		zipButton.addEventListener('click', () => {
			this.resolve(true);
			this.close();
		});
		
		const jsonButton = buttonContainer.createEl('button', { text: 'JSON only' });
		jsonButton.addEventListener('click', () => {
			this.resolve(false);
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
