import { App, Modal, Notice, Setting } from 'obsidian';
import { getCardName } from './CardDatabase';
import { TarotPracticeSettings } from './settings';
import { prepareDeck } from './DeckPreparation';

interface CardDraw {
	cardIndex: number;
	cardName: string;
	isReversed: boolean;
}

interface MultipleDrawResult {
	intention: string;
	cards: CardDraw[];
	timestamp: string;
	shuffleCount: number;
	wasCut: boolean;
	cutPositionPercent: number | null;
	cutPositionCards: number | null;
	cutBasePercent: number | null;
	cutVariancePercent: number | null;
}

export class TarotMultipleDrawModal extends Modal {
	intention: string = '';
	cardCount: number;
	fixedCardCount: boolean;
	onSubmit: (result: MultipleDrawResult) => void | Promise<void>;
	settings: TarotPracticeSettings;

	constructor(app: App, settings: TarotPracticeSettings, onSubmit: (result: MultipleDrawResult) => void | Promise<void>, fixedCount?: number) {
		super(app);
		this.settings = settings;
		if (fixedCount !== undefined) {
			this.cardCount = fixedCount;
			this.fixedCardCount = true;
		} else {
			this.cardCount = 3; // Default for inline multiple
			this.fixedCardCount = false;
		}
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

		// Only show card count slider if not fixed (inline multiple only)
		if (!this.fixedCardCount) {
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
		}

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Draw cards')
				.setCta()
				.onClick(() => {
					this.drawCards();
				}));
	}

	async drawCards() {
		if (!this.intention || this.intention.trim() === '') {
			new Notice('Please enter an intention before drawing');
			return;
		}

		if (this.cardCount < 1 || this.cardCount > 78) {
			new Notice('Please select between 1 and 78 cards');
			return;
		}

		try {
			const timestamp = new Date().toISOString();
			
			// Prepare deck (shuffle and cut)
			const { deck, metadata } = await prepareDeck(this.intention, timestamp, this.settings);
			
			// Draw consecutive cards from top
			const drawnCards = deck.slice(0, this.cardCount);
			
			// Build the result with reversals
			const cards: CardDraw[] = drawnCards.map(cardIndex => {
				// Calculate reversal if enabled
				let isReversed = false;
				if (this.settings.enableReversals) {
					isReversed = Math.random() < (this.settings.reversalChance / 100);
				}
				
				return {
					cardIndex: cardIndex,
					cardName: getCardName(cardIndex),
					isReversed: isReversed
				};
			});

			const drawResult: MultipleDrawResult = {
				intention: this.intention,
				cards: cards,
				timestamp: timestamp,
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
			new Notice('Error drawing cards. Check console for details.');
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
