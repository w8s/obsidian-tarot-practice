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
	fixedCardCount: boolean;
	onSubmit: (result: MultipleDrawResult) => void;
	settings: TarotPracticeSettings;

	constructor(app: App, settings: TarotPracticeSettings, onSubmit: (result: MultipleDrawResult) => void, fixedCount?: number) {
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
		const timestamp = new Date().toISOString();
		
		// Use intention + timestamp to get a seed index
		const seedResult = rngi.draw(this.intention + timestamp, 78);
		
		// Create array of all card indices [0-77]
		const availableCards = Array.from({ length: 78 }, (_, i) => i);
		
		// Fisher-Yates shuffle starting from the seed position
		// This ensures uniqueness and uses the intention for randomness
		const shuffled: number[] = [];
		const remaining = [...availableCards];
		
		for (let i = 0; i < this.cardCount; i++) {
			// Use intention + index to get random position in remaining cards
			const drawSeed = `${this.intention}-${timestamp}-${i}`;
			const result = rngi.draw(drawSeed, remaining.length);
			const selectedIndex = result.index;
			
			// Take the card at that position
			const cardIndex = remaining[selectedIndex];
			if (cardIndex === undefined) {
				new Notice('Error: Could not draw cards');
				return;
			}
			
			shuffled.push(cardIndex);
			
			// Remove it from remaining cards
			remaining.splice(selectedIndex, 1);
		}
		
		// Build the result with reversals
		const cards: CardDraw[] = shuffled.map(cardIndex => {
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
