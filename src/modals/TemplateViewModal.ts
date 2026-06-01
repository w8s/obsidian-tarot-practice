import { App, Modal, Setting } from 'obsidian';

/**
 * Modal to view template content
 */
export class TemplateViewModal extends Modal {
	private templateName: string;
	private content: string;

	constructor(app: App, templateName: string, content: string) {
		super(app);
		this.templateName = templateName;
		this.content = content;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		new Setting(contentEl).setName(this.templateName).setHeading();
		
		const codeBlock = contentEl.createEl('pre', { cls: 'tarot-template-preview' });
		codeBlock.createEl('code', { text: this.content });
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
