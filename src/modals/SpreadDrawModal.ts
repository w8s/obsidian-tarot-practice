import { App, Modal, Setting, DropdownComponent, Notice } from 'obsidian';
import { Spread } from '../core/spreads';
import { FileSuggest } from '../ui/FileSuggest';
import type TarotPracticePlugin from '../main';
import type { DeckDefinition, CardDefinition } from '../types/deck';
import {
	isStructuredDeck,
	getSuitLabels,
	getCardsForSuit,
	getCardDisplayValue
} from '../utils/cardPicker';

/** Selection state for a single position in physical draw mode */
interface PositionSelection {
	/** Suit label chosen (structured) or null (flat) */
	suitLabel: string | null;
	/** Display value chosen (rank or card name) */
	valueLabel: string | null;
	/** True if user selected reversed orientation */
	isReversed: boolean;
}

/**
 * Modal for selecting a spread and entering intention before drawing cards.
 *
 * In digital mode: collects spread / deck / intention then fires callback
 * to let main.ts execute the RNG draw.
 *
 * In physical mode: presents per-position card selectors after the setup
 * phase, then resolves cardIndex values from user selections before firing
 * the same callback shape — downstream code (SpreadFormatter, DrawHistory,
 * note insertion) is completely unchanged.
 */
export class SpreadDrawModal extends Modal {
	private spreads: Spread[];
	private selectedSpread: Spread;
	private selectedDeckId: string;
	private intention: string = '';
	private showQuerentInput: boolean = false;
	private querentName: string = '';
	private querentNotePath: string = '';
	private isPhysicalDraw: boolean = false;
	private callback: (
		spread: Spread,
		intention: string,
		deckId: string,
		querent?: { name: string; notePath?: string },
		physicalSelections?: PositionSelection[]
	) => void;
	private plugin: TarotPracticePlugin;

	constructor(
		app: App,
		plugin: TarotPracticePlugin,
		spreads: Spread[],
		callback: (
			spread: Spread,
			intention: string,
			deckId: string,
			querent?: { name: string; notePath?: string },
			physicalSelections?: PositionSelection[]
		) => void
	) {
		super(app);
		this.plugin = plugin;
		this.spreads = spreads;

		if (spreads.length === 0) {
			throw new Error('No spreads available');
		}

		const firstSpread = spreads[0];
		if (!firstSpread) {
			throw new Error('No spreads available');
		}

		this.selectedSpread = firstSpread;
		this.callback = callback;

		// Determine initial deck selection
		if (plugin.settings.rememberDeckPerSpread && plugin.settings.perSpreadDeckIds[firstSpread.id]) {
			this.selectedDeckId = plugin.settings.perSpreadDeckIds[firstSpread.id]!;
		} else {
			this.selectedDeckId = plugin.settings.defaultDeckId;
		}
	}

	onOpen() {
		this.renderSetupPhase();
	}

	// ─── Phase 1: Setup ────────────────────────────────────────────────────────

	private renderSetupPhase() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		new Setting(contentEl).setName('Draw tarot spread').setHeading();

		// Spread selection dropdown
		new Setting(contentEl)
			.setName('Spread')
			.setDesc('Choose which spread to use')
			.addDropdown((dropdown: DropdownComponent) => {
				this.spreads.forEach(spread => {
					dropdown.addOption(spread.id, spread.name);
				});
				dropdown.setValue(this.selectedSpread.id);
				dropdown.onChange((value) => {
					const spread = this.spreads.find(s => s.id === value);
					if (spread) {
						this.selectedSpread = spread;
						this.updateSpreadDescription();
						if (this.plugin.settings.rememberDeckPerSpread && this.plugin.settings.perSpreadDeckIds[spread.id]) {
							this.selectedDeckId = this.plugin.settings.perSpreadDeckIds[spread.id]!;
						}
					}
				});
			});

		// Deck selection dropdown
		const allDecks = this.plugin.deckRegistry.getAllDecks();
		new Setting(contentEl)
			.setName('Deck')
			.setDesc('Choose which deck to use for this reading')
			.addDropdown((dropdown: DropdownComponent) => {
				allDecks.forEach(deck => {
					dropdown.addOption(deck.id, deck.name);
				});
				dropdown.setValue(this.selectedDeckId);
				dropdown.onChange((value) => {
					this.selectedDeckId = value;
				});
			});

		// Spread description (dynamically updated)
		const descContainer = contentEl.createDiv({ cls: 'spread-description' });
		this.updateSpreadDescription(descContainer);

		// Intention input
		new Setting(contentEl)
			.setName('Intention')
			.setDesc('What question or intention guides this reading?')
			.addText(text => text
				.setPlaceholder('Enter your intention...')
				.setValue(this.intention)
				.onChange((value) => {
					this.intention = value;
				})
				.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						this.submitSetupPhase();
					}
				})
			);

		// Physical draw toggle
		new Setting(contentEl)
			.setName('Physical draw')
			.setDesc('Select cards manually from a real deck instead of using a random number generator')
			.addToggle(toggle => toggle
				.setValue(this.isPhysicalDraw)
				.onChange((value) => {
					this.isPhysicalDraw = value;
				})
			);

		// Querent toggle
		new Setting(contentEl)
			.setName('Reading for someone else?')
			.setDesc('Track who this reading is for')
			.addToggle(toggle => toggle
				.setValue(this.showQuerentInput)
				.onChange((value) => {
					this.showQuerentInput = value;
					this.updateQuerentFields();
				})
			);

		// Querent fields container (initially hidden)
		const querentContainer = contentEl.createDiv({ cls: 'querent-fields' });
		querentContainer.hide();

		new Setting(querentContainer)
			.setName('Querent name')
			.setDesc('Name of the person this reading is for')
			.addText(text => text
				.setPlaceholder('Name')
				.setValue(this.querentName)
				.onChange((value) => {
					this.querentName = value;
				})
			);

		new Setting(querentContainer)
			.setName('Note path')
			.setDesc('Link to a note about this person')
			.addText(text => {
				text
					.setPlaceholder('Path to note')
					.setValue(this.querentNotePath)
					.onChange((value) => {
						this.querentNotePath = value;
					});
				new FileSuggest(this.app, text.inputEl);
			});

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-row' });

		buttonContainer.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => this.close());

		const nextLabel = this.isPhysicalDraw ? 'Select cards →' : 'Draw cards';
		const drawButton = buttonContainer.createEl('button', {
			text: nextLabel,
			cls: 'mod-cta'
		});
		drawButton.addEventListener('click', () => this.submitSetupPhase());

		// Focus intention input
		const intentionInput = contentEl.querySelector('input[type="text"]') as HTMLInputElement;
		if (intentionInput) intentionInput.focus();
	}


	// ─── Phase 1 submission ────────────────────────────────────────────────────

	private submitSetupPhase() {
		// Save deck selection for this spread if remembering
		if (this.plugin.settings.rememberDeckPerSpread) {
			this.plugin.settings.perSpreadDeckIds[this.selectedSpread.id] = this.selectedDeckId;
			void this.plugin.saveSettings();
		}

		if (this.isPhysicalDraw) {
			// Resolve the deck definition and proceed to card-selection phase
			const deck = this.plugin.deckRegistry.getDeck(this.selectedDeckId);
			if (!deck) {
				new Notice(`Deck "${this.selectedDeckId}" not found`);
				return;
			}
			this.renderCardSelectionPhase(deck);
		} else {
			// Digital draw — fire callback immediately
			this.callback(
				this.selectedSpread,
				this.intention,
				this.selectedDeckId,
				this.buildQuerent()
			);
			this.close();
		}
	}

	// ─── Phase 2: Card selection (physical draw only) ──────────────────────────

	private renderCardSelectionPhase(deck: DeckDefinition) {
		const { contentEl } = this;
		contentEl.empty();

		new Setting(contentEl)
			.setName(`Physical draw — ${this.selectedSpread.name}`)
			.setHeading();

		contentEl.createEl('p', {
			text: 'Select the card you drew for each position.',
			cls: 'physical-draw-instructions'
		});

		const structured = isStructuredDeck(deck.cards);
		const positions = this.selectedSpread.positions;

		// Per-position selection state
		const selections: PositionSelection[] = positions.map(() => ({
			suitLabel: null,
			valueLabel: null,
			isReversed: false
		}));

		// Render a row for each spread position
		for (let i = 0; i < positions.length; i++) {
			const pos = positions[i];
			if (!pos) continue;

			const posContainer = contentEl.createDiv({ cls: 'physical-draw-position' });

			// Position heading
			posContainer.createEl('p', {
				text: `${i + 1}. ${pos.label}${pos.description ? ' — ' + pos.description : ''}`,
				cls: 'physical-draw-position-label'
			});

			if (structured) {
				this.renderStructuredPicker(posContainer, deck.cards, i, selections);
			} else {
				this.renderFlatPicker(posContainer, deck.cards, i, selections);
			}

			// Orientation (upright/reversed) — only if deck supports reversals
			if (deck.supportsReversals) {
				new Setting(posContainer)
					.setName('Orientation')
					.addDropdown(dd => {
						dd.addOption('upright', 'Upright');
						dd.addOption('reversed', 'Reversed');
						dd.setValue('upright');
						dd.onChange(value => {
							const sel = selections[i];
							if (sel) sel.isReversed = value === 'reversed';
						});
					});
			}
		}

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-row' });

		buttonContainer.createEl('button', { text: 'Back' })
			.addEventListener('click', () => this.renderSetupPhase());

		const submitButton = buttonContainer.createEl('button', {
			text: 'Confirm draw',
			cls: 'mod-cta'
		});
		submitButton.addEventListener('click', () => {
			this.submitCardSelectionPhase(deck, selections);
		});
	}

	/** Render suit → value dropdowns for a structured (tarot-style) deck position */
	private renderStructuredPicker(
		container: HTMLElement,
		cards: CardDefinition[],
		posIndex: number,
		selections: PositionSelection[]
	) {
		const suitLabels = getSuitLabels(cards);

		// Value dropdown (rendered first so we can reference it in suit onChange)
		let valueDropdown: DropdownComponent | null = null;

		const suitSetting = new Setting(container)
			.setName('Suit')
			.addDropdown(dd => {
				dd.addOption('', '');
				suitLabels.forEach(label => { dd.addOption(label, label); });
				dd.setValue('');

				dd.onChange(suitLabel => {
					const sel = selections[posIndex];
					if (sel) {
						sel.suitLabel = suitLabel || null;
						sel.valueLabel = null;
					}
					// Repopulate the value dropdown
					if (valueDropdown) {
						this.repopulateValueDropdown(valueDropdown, cards, suitLabel, posIndex, selections);
					}
				});
			});

		// Silence unused variable lint — suitSetting is needed for chaining
		void suitSetting;

		new Setting(container)
			.setName('Card')
			.addDropdown(dd => {
				valueDropdown = dd;
				dd.addOption('', '');
				dd.setDisabled(true);
				dd.onChange(valueLabel => {
					const sel = selections[posIndex];
					if (sel) sel.valueLabel = valueLabel || null;
				});
			});
	}

	/** Repopulate the value dropdown when suit changes */
	private repopulateValueDropdown(
		dd: DropdownComponent,
		cards: CardDefinition[],
		suitLabel: string,
		posIndex: number,
		selections: PositionSelection[]
	) {
		// Clear existing options
		dd.selectEl.empty();

		if (!suitLabel) {
			dd.addOption('', '');
			dd.setDisabled(true);
			return;
		}

		dd.setDisabled(false);
		dd.addOption('', '');

		const suitCards = getCardsForSuit(cards, suitLabel);
		// Deduplicate display values (handles custom decks with repeated rank names)
		const seen = new Set<string>();
		for (const card of suitCards) {
			const label = getCardDisplayValue(card);
			if (!seen.has(label)) {
				seen.add(label);
				dd.addOption(label, label);
			}
		}

		dd.setValue('');
		// Reset stored value
		const sel = selections[posIndex];
		if (sel) sel.valueLabel = null;
	}

	/** Render a single card-name dropdown for a flat (oracle/rune) deck position */
	private renderFlatPicker(
		container: HTMLElement,
		cards: CardDefinition[],
		posIndex: number,
		selections: PositionSelection[]
	) {
		new Setting(container)
			.setName('Card')
			.addDropdown(dd => {
				dd.addOption('', '');
				cards.forEach(card => { dd.addOption(card.name, card.name); });
				dd.setValue('');
				dd.onChange(valueName => {
					const sel = selections[posIndex];
					if (sel) {
						sel.suitLabel = null;
						sel.valueLabel = valueName || null;
					}
				});
			});
	}

	// ─── Phase 2 submission ────────────────────────────────────────────────────

	private submitCardSelectionPhase(deck: DeckDefinition, selections: PositionSelection[]) {
		// Validate: every position must have a card selected
		const structured = isStructuredDeck(deck.cards);
		for (let i = 0; i < selections.length; i++) {
			const sel = selections[i];
			const pos = this.selectedSpread.positions[i];
			const posLabel = pos?.label ?? `Position ${i + 1}`;

			if (!sel || !sel.valueLabel) {
				new Notice(`Please select a card for "${posLabel}"`);
				return;
			}
			if (structured && !sel.suitLabel) {
				new Notice(`Please select a suit for "${posLabel}"`);
				return;
			}
		}

		this.callback(
			this.selectedSpread,
			this.intention,
			this.selectedDeckId,
			this.buildQuerent(),
			selections
		);
		this.close();
	}

	// ─── Shared helpers ────────────────────────────────────────────────────────

	private buildQuerent(): { name: string; notePath?: string } | undefined {
		if (this.showQuerentInput && this.querentName.trim()) {
			return {
				name: this.querentName.trim(),
				notePath: this.querentNotePath.trim() || undefined
			};
		}
		return undefined;
	}

	private updateSpreadDescription(container?: HTMLElement) {
		const descContainer = container || this.contentEl.querySelector('.spread-description') as HTMLElement;
		if (!descContainer) return;

		descContainer.empty();

		const detailsEl = descContainer.createDiv({ cls: 'spread-details' });

		detailsEl.createEl('p', {
			text: this.selectedSpread.description,
			cls: 'spread-description-text'
		});

		detailsEl.createEl('p', {
			text: `${this.selectedSpread.positions.length} card${this.selectedSpread.positions.length === 1 ? '' : 's'}`,
			cls: 'spread-card-count'
		});

		detailsEl.createEl('p', {
			text: `${this.selectedSpread.shuffleCount} shuffle${this.selectedSpread.shuffleCount === 1 ? '' : 's'}${this.selectedSpread.cutDeck ? ', cut deck' : ''}`,
			cls: 'spread-deck-prep'
		});
	}

	private updateQuerentFields() {
		const querentContainer = this.contentEl.querySelector('.querent-fields') as HTMLElement;
		if (!querentContainer) return;

		if (this.showQuerentInput) {
			querentContainer.show();
		} else {
			querentContainer.hide();
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
