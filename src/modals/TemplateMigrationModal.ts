import { App, Modal, Setting, ButtonComponent } from 'obsidian';

/**
 * Modal shown to user when migrating from inline templates to file-based templates.
 * Allows user to confirm the folder location and preview files to be created.
 */
export class TemplateMigrationModal extends Modal {
	private folderPath: string;
	private folderInput: HTMLInputElement;
	private previewEl: HTMLElement;

	constructor(
		app: App,
		private detectedFolder: string | null,
		private existingTemplates: {
			daily?: string;
			inline?: string;
			multiple?: string;
		},
		private onConfirm: (folderPath: string) => Promise<void>
	) {
		super(app);
		this.folderPath = detectedFolder || 'Templates';
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		new Setting(contentEl).setName('Migrate to file-based templates').setHeading();

		// Explanation
		contentEl.createEl('p', {
			text: 'The tarot practice plugin now uses file-based templates instead of inline editors. Your customized templates will be migrated to files in your vault.'
		});

		// Folder selection
		new Setting(contentEl)
			.setName('Template folder')
			.setDesc('Where to create your template files')
			.addText(text => {
				this.folderInput = text.inputEl;
				text.setPlaceholder('Templates')
					.setValue(this.folderPath)
					.onChange(value => {
						this.folderPath = value || 'Templates';
						this.updatePreview();
					});
			});

		// Detection info
		if (this.detectedFolder) {
			contentEl.createEl('p', {
				cls: 'setting-item-description',
				text: `✓ Detected template folder: ${this.detectedFolder}`
			});
		} else {
			contentEl.createEl('p', {
				cls: 'setting-item-description',
				text: 'No template folder detected. Using default "templates" folder.'
			});
		}

		// Preview section
		new Setting(contentEl).setName('Files to be created').setHeading();
		this.previewEl = contentEl.createEl('div', { cls: 'tarot-migration-preview' });
		this.updatePreview();

		// Buttons
		const buttonDiv = contentEl.createEl('div', { cls: 'modal-button-container' });
		
		new ButtonComponent(buttonDiv)
			.setButtonText('Cancel')
			.onClick(() => {
				this.close();
			});

		new ButtonComponent(buttonDiv)
			.setButtonText('Migrate templates')
			.setCta()
			.onClick(async () => {
				await this.onConfirm(this.folderPath);
				this.close();
			});
	}

	private updatePreview() {
		this.previewEl.empty();

		const files: string[] = [];
		const tarotFolder = `${this.folderPath}/Tarot`;

		if (this.existingTemplates.daily) {
			files.push(`${tarotFolder}/Daily.md`);
		}
		if (this.existingTemplates.inline) {
			files.push(`${tarotFolder}/Inline.md`);
		}
		if (this.existingTemplates.multiple) {
			files.push(`${tarotFolder}/Multiple.md`);
		}

		if (files.length === 0) {
			this.previewEl.createEl('p', { text: 'No customized templates to migrate.' });
			return;
		}

		const ul = this.previewEl.createEl('ul');
		files.forEach(file => {
			ul.createEl('li', { text: file });
		});

		this.previewEl.createEl('p', {
			cls: 'setting-item-description',
			text: 'Your customized templates will be preserved in these files.'
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
