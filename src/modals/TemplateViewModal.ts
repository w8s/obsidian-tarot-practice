import { App, Modal } from 'obsidian';

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

		contentEl.createEl('h2', { text: this.templateName });
		
		const codeBlock = contentEl.createEl('pre');
		codeBlock.createEl('code', { text: this.content });

		// Style the code block using setCssProps
		codeBlock.setCssProps({
			'background-color': 'var(--background-primary-alt)',
			'padding': '1em',
			'border-radius': '4px',
			'overflow': 'auto',
			'max-height': '60vh'
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
