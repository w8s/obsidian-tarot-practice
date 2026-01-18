import { App, Modal, Notice, Setting } from 'obsidian';
import { RngWithIntention } from 'rng-with-intention';
import { getCardName } from './CardDatabase';
import { TarotPracticeSettings } from './settings';

interface CardDraw {
	cardIndex: number;
	cardName: string;
	isReversed: boolean;
}

interface MultipleDrawResult {
	intention: string;
	cards: CardDraw[];
	timestamp: string;
}

export class TarotMultipleDrawModal extends Modal {
	intention: string = '';
	cardCount: number;
	onSubmit: (result: MultipleDrawResult) => void;
	settings: TarotPracticeSettings;

	constructor(app: App, settings: TarotPracticeSettings, onSubmit: (result: MultipleDrawResult) => void) {
		super(app);
		this.settings = settings;
		this.cardCount = settings.multipleCardsDefault;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.empty();
		contentEl.createEl('h2', { text: 'Draw multiple tarot cards' });

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
						this.drawCards();
					}
				});
			});

		const cardCountSetting = new Setting(contentEl)
			.setName('Number of cards')
			.setDesc('How many cards to draw (1-78)')
			.addSlider(slider => slider
				.setLimits(1, 78, 1)
				.setValue(this.cardCount)
				.setDynamicTooltip()
				.onChange(value => {
					this.cardCount = value;
					// Update the display value
					cardCountSetting.controlEl.querySelector('.tarot-modal-card-count')!.textContent = `${value}`;
				}));
		
		// Add count display to the right of slider
		cardCountSetting.controlEl.createSpan({ 
			text: `${this.cardCount}`,
			cls: 'tarot-modal-card-count'
		});

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Draw cards')
				.setCta()
				.onClick(() => {
					this.drawCards();
				}));
	}

	drawCards() {
		if (!this.intention || this.intention.trim() === '') {
			new Notice('Please enter an intention before drawing');
			return;
		}

		if (this.cardCount < 1 || this.cardCount > 78) {
			new Notice('Please select between 1 and 78 cards');
			return;
		}

		const rngi = new RngWithIntention();
		const cards: CardDraw[] = [];
		const drawnIndices = new Set<number>();

		// Draw unique cards
		const timestamp = new Date().toISOString();
		for (let i = 0; i < this.cardCount; i++) {
			let cardIndex: number;
			let attempts = 0;
			
			// Keep drawing until we get a unique card (with safety limit)
			do {
				const result = rngi.draw(`${this.intention}-${i}-${attempts}`, 78);
				cardIndex = result.index;
				attempts++;
			} while (drawnIndices.has(cardIndex) && attempts < 100);

			if (drawnIndices.has(cardIndex)) {
				new Notice('Error: Could not draw unique cards');
				return;
			}

			drawnIndices.add(cardIndex);

			// Calculate reversal if enabled
			let isReversed = false;
			if (this.settings.enableReversals) {
				isReversed = Math.random() < (this.settings.reversalChance / 100);
			}

			cards.push({
				cardIndex: cardIndex,
				cardName: getCardName(cardIndex),
				isReversed: isReversed
			});
		}

		const drawResult: MultipleDrawResult = {
			intention: this.intention,
			cards: cards,
			timestamp: timestamp
		};

		this.close();
		this.onSubmit(drawResult);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
