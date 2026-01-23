import { App, Modal, Notice, Setting } from 'obsidian';
import { getCardName } from './CardDatabase';
import { TarotPracticeSettings } from './settings';
import { prepareDeck } from './DeckPreparation';
import { Deck, DEFAULT_DECK } from './Deck';

// Single card draw result
export interface DrawResult {
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
	deck: Deck;
}

// Individual card in a multiple card draw
export interface CardDraw {
	cardIndex: number;
	cardName: string;
	isReversed: boolean;
}

// Multiple card draw result
export interface MultipleDrawResult {
	intention: string;
	cards: CardDraw[];
	timestamp: string;
	shuffleCount: number;
	wasCut: boolean;
	cutPositionPercent: number | null;
	cutPositionCards: number | null;
	cutBasePercent: number | null;
	cutVariancePercent: number | null;
	deck: Deck;
}

export class TarotDrawModal extends Modal {
	intention: string = '';
	cardCount: number;
	showCardCountSetting: boolean;
	title: string;
	onSubmit: ((result: DrawResult) => void | Promise<void>) | ((result: MultipleDrawResult) => void | Promise<void>);
	settings: TarotPracticeSettings;

	/**
	 * Unified modal for drawing single or multiple cards
	 * @param cardCount Number of cards to draw (default: 1)
	 * @param showCardCountSetting Whether to show card count input (default: false)
	 * @param title Modal title (default: auto-generated based on card count)
	 */
	constructor(
		app: App,
		settings: TarotPracticeSettings,
		onSubmit: ((result: DrawResult) => void | Promise<void>) | ((result: MultipleDrawResult) => void | Promise<void>),
		cardCount: number = 1,
		showCardCountSetting: boolean = false,
		title?: string
	) {
		super(app);
		this.settings = settings;
		this.onSubmit = onSubmit;
		this.cardCount = cardCount;
		this.showCardCountSetting = showCardCountSetting;
		// Auto-generate title if not provided
		this.title = title || (cardCount === 1 ? 'Tarot draw' : `Draw ${cardCount} cards`);
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.empty();
		
		// Use configurable title
		contentEl.createEl('h2', { text: this.title });

		// Intention input
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
						void this.drawCards();
					}
				});
			});

		// Card count setting (optional)
		if (this.showCardCountSetting) {
			new Setting(contentEl)
				.setName('Number of cards')
				.setDesc('How many cards to draw (1-78)')
				.addText(text => text
					.setPlaceholder('3')
					.setValue(this.cardCount.toString())
					.onChange(value => {
						const num = parseInt(value);
						if (!isNaN(num) && num >= 1 && num <= 78) {
							this.cardCount = num;
						}
					}));
		}

		// Draw button
		const buttonText = this.cardCount === 1 ? 'Draw card' : `Draw ${this.cardCount} cards`;
		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText(buttonText)
				.setCta()
				.onClick(() => {
					void this.drawCards();
				}));
	}

	async drawCards() {
		if (!this.intention || this.intention.trim() === '') {
			new Notice('Please enter an intention before drawing');
			return;
		}

		if (this.cardCount < 1 || this.cardCount > 78) {
			new Notice('Please enter a valid number of cards (1-78)');
			return;
		}

		try {
			const timestamp = new Date().toISOString();
			
			// Prepare deck (shuffle and cut)
			const { deck, metadata } = await prepareDeck(this.intention, timestamp, this.settings);
			
			if (this.cardCount === 1) {
				// Single card draw
				const cardIndex = deck[0];
				if (cardIndex === undefined) {
					new Notice('Could not draw card');
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
					cutVariancePercent: metadata.cutVariancePercent,
					deck: DEFAULT_DECK
				};

				this.close();
				await (this.onSubmit as (result: DrawResult) => void | Promise<void>)(drawResult);
				
			} else {
				// Multiple card draw
				const cards: CardDraw[] = [];
				
				for (let i = 0; i < this.cardCount; i++) {
					const cardIndex = deck[i];
					if (cardIndex === undefined) {
						new Notice(`Error: Could not draw card ${i + 1}`);
						return;
					}
					
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
				
				const multipleResult: MultipleDrawResult = {
					intention: this.intention,
					cards: cards,
					timestamp: timestamp,
					shuffleCount: metadata.shuffleCount,
					wasCut: metadata.wasCut,
					cutPositionPercent: metadata.cutPositionPercent,
					cutPositionCards: metadata.cutPositionCards,
					cutBasePercent: metadata.cutBasePercent,
					cutVariancePercent: metadata.cutVariancePercent,
					deck: DEFAULT_DECK
				};

				this.close();
				await (this.onSubmit as (result: MultipleDrawResult) => void | Promise<void>)(multipleResult);
			}
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
