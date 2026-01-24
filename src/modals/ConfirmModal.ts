import { App, Modal } from 'obsidian';

/**
 * Simple confirmation modal for destructive actions
 */
export class ConfirmModal extends Modal {
	private message: string;
	private onConfirm: () => void;

	constructor(app: App, message: string, onConfirm: () => void) {
		super(app);
		this.message = message;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.createEl('p', { text: this.message });

		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		buttonContainer.setCssProps({
			display: 'flex',
			justifyContent: 'flex-end',
			gap: '8px',
			marginTop: '16px'
		});

		// Cancel button
		buttonContainer.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => this.close());

		// Confirm button (warning style for destructive actions)
		const confirmBtn = buttonContainer.createEl('button', { 
			text: 'Confirm',
			cls: 'mod-warning'
		});
		confirmBtn.addEventListener('click', () => {
			this.onConfirm();
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
