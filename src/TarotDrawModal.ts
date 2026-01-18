import { App, Modal, Notice, Setting } from 'obsidian';
import { RngWithIntention } from 'rng-with-intention';
import { getCardName } from './CardDatabase';
import { TarotPracticeSettings } from './settings';

interface DrawResult {
	intention: string;
	cardIndex: number;
	cardName: string;
	timestamp: string;
	isReversed: boolean;
}

export class TarotDrawModal extends Modal {
	intention: string = '';
	onSubmit: (result: DrawResult) => void;
	settings: TarotPracticeSettings;

	constructor(app: App, settings: TarotPracticeSettings, onSubmit: (result: DrawResult) => void) {
		super(app);
		this.settings = settings;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.empty();
		contentEl.createEl('h2', { text: 'Daily tarot draw' });

		new Setting(contentEl)
			.setName('Intention')
			.setDesc('What question or focus do you bring to this draw?')
			.addText(text => {
				text
					.setPlaceholder('Enter your intention...')
					.onChange(value => {
						this.intention = value;
					});
				
				// Submit on Enter key
				text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						this.drawCard();
					}
				});
			});

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Draw card')
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
		
		// Calculate reversal if enabled
		let isReversed = false;
		if (this.settings.enableReversals) {
			isReversed = Math.random() < (this.settings.reversalChance / 100);
		}
		
		const drawResult: DrawResult = {
			intention: this.intention,
			cardIndex: result.index,
			cardName: getCardName(result.index),
			timestamp: result.timestamp,
			isReversed: isReversed
		};

		this.close();
		this.onSubmit(drawResult);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
