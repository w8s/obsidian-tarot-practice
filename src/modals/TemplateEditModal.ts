import { App, Modal, Setting } from 'obsidian';
import { FileSuggest } from '../ui/FileSuggest';

/**
 * Modal to select a custom template file
 */
export class TemplateEditModal extends Modal {
	private templateName: string;
	private currentPath: string;
	private onSubmit: (path: string) => void;

	constructor(
		app: App,
		templateName: string,
		currentPath: string,
		onSubmit: (path: string) => void
	) {
		super(app);
		this.templateName = templateName;
		this.currentPath = currentPath;
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		new Setting(contentEl).setName(`Edit ${this.templateName}`).setHeading();
		
		let selectedPath = this.currentPath;

		new Setting(contentEl)
			.setName('Template file')
			.setDesc('Select a Markdown file from your vault')
			.addText(text => {
				new FileSuggest(this.app, text.inputEl);
				text.setPlaceholder('Example: Templates/Tarot/Daily.md')
					.setValue(this.currentPath)
					.onChange((value) => {
						selectedPath = value;
					});
			});

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Cancel')
				.onClick(() => {
					this.close();
				}))
			.addButton(btn => btn
				.setButtonText('Save')
				.setCta()
				.onClick(() => {
					this.onSubmit(selectedPath);
					this.close();
				}));
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
