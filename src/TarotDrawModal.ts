import { App, Modal, Notice, Setting } from 'obsidian';
import { RngWithIntention } from 'rng-with-intention';
import { getCardName } from './CardDatabase';

interface DrawResult {
	intention: string;
	cardIndex: number;
	cardName: string;
	timestamp: string;
}

export class TarotDrawModal extends Modal {
	intention: string = '';
	onSubmit: (result: DrawResult) => void;

	constructor(app: App, onSubmit: (result: DrawResult) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.empty();
		contentEl.createEl('h2', { text: 'Daily tarot draw' });

		new Setting(contentEl)
			.setName('Intention')
			.setDesc('What question or focus do you bring to this draw?')
			.addText(text => text
				.setPlaceholder('Enter your intention...')
				.onChange(value => {
					this.intention = value;
				}));

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Draw Card')
				.setCta()
				.onClick(() => {
					this.drawCard();
				}));
	}

	drawCard() {
		if (!this.intention || this.intention.trim() === '') {
			new Notice('Please enter an intention before drawing');
			return;
		}

		const rngi = new RngWithIntention();
		const result = rngi.draw(this.intention, 78);
		
		const drawResult: DrawResult = {
			intention: this.intention,
			cardIndex: result.index,
			cardName: getCardName(result.index),
			timestamp: result.timestamp
		};

		this.close();
		this.onSubmit(drawResult);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
