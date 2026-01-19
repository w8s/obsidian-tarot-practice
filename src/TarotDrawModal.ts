import { App, Modal, Notice, Setting } from 'obsidian';
import { getCardName } from './CardDatabase';
import { TarotPracticeSettings } from './settings';
import { prepareDeck } from './DeckPreparation';

interface DrawResult {
	intention: string;
	cardIndex: number;
	cardName: string;
	timestamp: string;
	isReversed: boolean;
	shuffleCount: number;
	wasCut: boolean;
	cutPositionPercent: number | null;
	cutPositionCards: number | null;
	cutBasePercent: number | null;
	cutVariancePercent: number | null;
}

export class TarotDrawModal extends Modal {
	intention: string = '';
	onSubmit: (result: DrawResult) => void | Promise<void>;
	settings: TarotPracticeSettings;

	constructor(app: App, settings: TarotPracticeSettings, onSubmit: (result: DrawResult) => void | Promise<void>) {
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

	async drawCard() {
		if (!this.intention || this.intention.trim() === '') {
			new Notice('Please enter an intention before drawing');
			return;
		}

		try {
			const timestamp = new Date().toISOString();
			
			// Prepare deck (shuffle and cut)
			const { deck, metadata } = await prepareDeck(this.intention, timestamp, this.settings);
			
			// Draw first card from prepared deck
			const cardIndex = deck[0];
			if (cardIndex === undefined) {
				new Notice('Error: Could not draw card');
				return;
			}
			
			// Calculate reversal if enabled
			let isReversed = false;
			if (this.settings.enableReversals) {
				isReversed = Math.random() < (this.settings.reversalChance / 100);
			}
			
			const drawResult: DrawResult = {
				intention: this.intention,
				cardIndex: cardIndex,
				cardName: getCardName(cardIndex),
				timestamp: timestamp,
				isReversed: isReversed,
				shuffleCount: metadata.shuffleCount,
				wasCut: metadata.wasCut,
				cutPositionPercent: metadata.cutPositionPercent,
				cutPositionCards: metadata.cutPositionCards,
				cutBasePercent: metadata.cutBasePercent,
				cutVariancePercent: metadata.cutVariancePercent
			};

			this.close();
			await this.onSubmit(drawResult);
		} catch (error) {
			console.error('Tarot draw error:', error);
			new Notice('Error drawing card. Check console for details.');
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
