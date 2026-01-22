import { Plugin, moment, TFile, Notice, MarkdownView } from 'obsidian';
import { TarotDrawModal, DrawResult, MultipleDrawResult } from './TarotDrawModal';
import { TarotPracticeSettings, DEFAULT_SETTINGS, DEFAULT_TEMPLATE, DEFAULT_MULTIPLE_TEMPLATE } from './settings';
import { TarotPracticeSettingTab } from './TarotPracticeSettingTab';
import { TemplateResolver } from './TemplateResolver';
import { SpreadDrawModal } from './SpreadDrawModal';
import { SpreadResolver } from './SpreadResolver';
import { SpreadFormatter, registerHandlebarsHelpers } from './SpreadFormatter';
import { Spread, SpreadDrawResult, SpreadPositionResult } from './spreads';
import { prepareDeck } from './DeckPreparation';
import { getCardName } from './CardDatabase';
import { DEFAULT_DECK } from './Deck';

interface ShuffleMetadata {
	shuffleCount: number;
	wasCut: boolean;
	cutPositionPercent: number | null;
	cutPositionCards: number | null;
	cutBasePercent: number | null;
	cutVariancePercent: number | null;
}

export default class TarotPracticePlugin extends Plugin {
	settings: TarotPracticeSettings;

	async onload() {
		await this.loadSettings();

		// Register Handlebars helpers for spread templates
		registerHandlebarsHelpers();

		// Add ribbon icon for quick draw
		this.addRibbonIcon('sparkles', 'Draw daily tarot', () => {
			this.openDailyDrawModal();
		});

		// Add command for daily tarot draw (uses dailyCardCount setting)
		this.addCommand({
			id: 'draw-daily-tarot',
			name: 'Draw daily tarot',
			callback: () => {
				this.openDailyDrawModal();
			}
		});

		// Add command for inline single card
		this.addCommand({
			id: 'draw-tarot-card-inline',
			name: 'Inline draw tarot card',
			callback: () => {
				this.openInlineSingleDrawModal();
			}
		});

		// Add command for inline multiple cards
		this.addCommand({
			id: 'draw-multiple-tarot-cards-inline',
			name: 'Inline draw multiple tarot cards',
			callback: () => {
				this.openInlineMultipleDrawModal();
			}
		});

		// Add command for spread draw
		this.addCommand({
			id: 'draw-tarot-spread',
			name: 'Draw tarot spread',
			callback: () => {
				this.openSpreadDrawModal();
			}
		});

		// Add settings tab
		this.addSettingTab(new TarotPracticeSettingTab(this.app, this));
	}

	openDailyDrawModal() {
		// Always use the same modal, just with different card counts
		// Card count comes from dailyCardCount setting
		// showCardCountSetting = false (fixed count for daily)
		if (this.settings.dailyCardCount === 1) {
			new TarotDrawModal(this.app, this.settings, async (result: DrawResult) => {
				await this.insertDrawIntoNote(result);
			}, 1, false, 'Daily tarot draw').open();
		} else {
			new TarotDrawModal(this.app, this.settings, async (result: MultipleDrawResult) => {
				await this.insertMultipleDrawIntoNote(result);
			}, this.settings.dailyCardCount, false, 'Daily tarot draw').open();
		}
	}

	openInlineSingleDrawModal() {
		// Single card inline draw
		new TarotDrawModal(this.app, this.settings, async (result: DrawResult) => {
			await this.insertDrawInline(result);
		}, 1, false, 'Inline tarot draw').open();
	}

	openInlineMultipleDrawModal() {
		// Multiple card inline draw with user-editable count
		// showCardCountSetting = true (user can change count)
		new TarotDrawModal(this.app, this.settings, async (result: MultipleDrawResult) => {
			await this.insertMultipleDrawInline(result);
		}, 3, true, 'Inline draw multiple cards').open();
	}

	openSpreadDrawModal() {
		// Get all available spreads
		const spreadResolver = new SpreadResolver(this.app);
		const allSpreads = spreadResolver.getAllSpreads(
			this.settings.customSpreads,
			this.settings.builtInSpreadOverrides
		);

		// Open modal to select spread and enter intention
		new SpreadDrawModal(this.app, allSpreads, async (spread: Spread, intention: string) => {
			await this.drawSpread(spread, intention);
		}).open();
	}

	async drawSpread(spread: Spread, intention: string) {
		try {
			// Prepare the deck using spread's shuffle settings
			const timestamp = Date.now();
			const seed = `${intention}:${timestamp}`;
			
			// Create a settings object for deck preparation
			const deckSettings = {
				...this.settings,
				shuffleCount: spread.shuffleCount,
				cutDeck: spread.cutDeck
			};
			
			const preparedDeck = await prepareDeck(
				intention,
				timestamp.toString(),
				deckSettings
			);

			// Draw cards for each position
			const positions: SpreadPositionResult[] = [];
			for (let i = 0; i < spread.positions.length; i++) {
				const cardIndex = preparedDeck.deck[i];
				
				if (cardIndex === undefined) {
					throw new Error(`Failed to draw card at position ${i}`);
				}
				
				const cardName = getCardName(cardIndex);
				
				// Determine reversal
				let isReversed = false;
				if (this.settings.enableReversals) {
					// Use a simple hash of the card index + position to determine reversal
					const reversalSeed = cardIndex + i + timestamp;
					isReversed = (reversalSeed % 100) < this.settings.reversalChance;
				}

				const orientation = isReversed 
					? this.settings.reversedIndicator 
					: this.settings.uprightIndicator;

				const positionDef = spread.positions[i];
				if (!positionDef) {
					throw new Error(`Missing position definition at index ${i}`);
				}

				positions.push({
					index: i,
					number: i + 1,
					label: positionDef.label,
					card: cardName,
					cardIndex: cardIndex,
					orientation: orientation,
					isReversed: isReversed
				});
			}

			// Build draw result
			const drawResult: SpreadDrawResult = {
				spread: spread,
				intention: intention,
				timestamp: timestamp,
				positions: positions,
				deck: DEFAULT_DECK,
				shuffleCount: preparedDeck.metadata.shuffleCount,
				wasCut: preparedDeck.metadata.wasCut,
				cutPosition: preparedDeck.metadata.cutPositionPercent ?? undefined,
				cutPositionCards: preparedDeck.metadata.cutPositionCards ?? undefined,
				cutBase: preparedDeck.metadata.cutBasePercent ?? undefined,
				cutVariance: preparedDeck.metadata.cutVariancePercent ?? undefined
			};

			// Insert into note
			await this.insertSpreadIntoNote(drawResult);

		} catch (error) {
			console.error('Error drawing spread:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice('Failed to draw spread: ' + errorMessage);
		}
	}

	async insertSpreadIntoNote(result: SpreadDrawResult) {
		// Get spread template
		const spreadResolver = new SpreadResolver(this.app);
		const template = await spreadResolver.getSpreadTemplate(result.spread);

		// Format using Handlebars
		const formatter = new SpreadFormatter(this.settings);
		const output = formatter.format(result, template);

		// Get target file (active file or daily note)
		let targetFile = this.app.workspace.getActiveFile();
		
		if (!targetFile) {
			if (!this.settings.useDailyNote) {
				new Notice('Please open a note to insert the spread');
				return;
			}
			
			const dailyNotePath = moment().format(this.settings.dailyNotePathPattern);
			const abstractFile = this.app.vault.getAbstractFileByPath(dailyNotePath);
			
			if (abstractFile instanceof TFile) {
				targetFile = abstractFile;
			} else {
				targetFile = await this.app.vault.create(dailyNotePath, '');
			}
			
			await this.app.workspace.openLinkText(dailyNotePath, '', false);
		}

		const fileContent = await this.app.vault.read(targetFile);
		let newContent: string;

		switch (this.settings.insertLocation) {
			case 'append':
				newContent = fileContent + '\n' + output;
				break;
			case 'prepend':
				newContent = output + '\n' + fileContent;
				break;
			case 'heading':
				newContent = this.insertUnderHeading(fileContent, output);
				break;
			default:
				newContent = fileContent + '\n' + output;
		}

		await this.app.vault.modify(targetFile, newContent);
		new Notice(`${result.spread.name} drawn`);
	}

	async insertDrawInline(result: DrawResult) {
		// Get the active markdown editor
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (!activeView) {
			new Notice('No active note found');
			return;
		}
		
		// Get template using resolver - always use inline template
		const resolver = new TemplateResolver(this.app, this.settings);
		const template = await resolver.getInlineTemplate();
		
		// Format the output using SpreadFormatter
		const formatter = new SpreadFormatter(this.settings);
		const output = formatter.formatSingle(result, template);
		
		// Insert at current cursor position ONLY
		const editor = activeView.editor;
		editor.replaceSelection(output);
		
		new Notice('Card drawn: ' + result.cardName);
	}

	formatTemplate(result: DrawResult, template: string): string {
		const formatter = new SpreadFormatter(this.settings);
		return formatter.formatSingle(result, template);
	}

	formatMultipleTemplate(result: MultipleDrawResult, template: string): string {
		const formatter = new SpreadFormatter(this.settings);
		return formatter.formatMultiple(result, template);
	}

	async insertMultipleDrawInline(result: MultipleDrawResult) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (!activeView) {
			new Notice('No active note found');
			return;
		}
		
		// Get template using resolver
		const resolver = new TemplateResolver(this.app, this.settings);
		const template = await resolver.getMultipleTemplate();
		
		// Format the output using SpreadFormatter
		const formatter = new SpreadFormatter(this.settings);
		const output = formatter.formatMultiple(result, template);
		
		const editor = activeView.editor;
		editor.replaceSelection(output);
		
		new Notice(`${result.cards.length} cards drawn`);
	}

	async insertMultipleDrawIntoNote(result: MultipleDrawResult) {
		// Get template using resolver
		// This is called from daily draw, so use daily template
		const resolver = new TemplateResolver(this.app, this.settings);
		const template = await resolver.getDailyTemplate();
		
		// Format the output using SpreadFormatter
		const formatter = new SpreadFormatter(this.settings);
		const output = formatter.formatMultiple(result, template);

		// Get target file (active file or daily note)
		let targetFile = this.app.workspace.getActiveFile();
		
		if (!targetFile) {
			if (!this.settings.useDailyNote) {
				new Notice('Please open a note to insert the tarot draw');
				return;
			}
			
			const dailyNotePath = moment().format(this.settings.dailyNotePathPattern);
			const abstractFile = this.app.vault.getAbstractFileByPath(dailyNotePath);
			
			if (abstractFile instanceof TFile) {
				targetFile = abstractFile;
			} else {
				targetFile = await this.app.vault.create(dailyNotePath, '');
			}
			
			await this.app.workspace.openLinkText(dailyNotePath, '', false);
		}

		const fileContent = await this.app.vault.read(targetFile);
		let newContent: string;

		switch (this.settings.insertLocation) {
			case 'append':
				newContent = fileContent + '\n' + output;
				break;
			case 'prepend':
				newContent = output + '\n' + fileContent;
				break;
			case 'heading':
				newContent = this.insertUnderHeading(fileContent, output);
				break;
			default:
				newContent = fileContent + '\n' + output;
		}

		await this.app.vault.modify(targetFile, newContent);
		new Notice(`${result.cards.length} cards drawn`);
	}

	async insertDrawIntoNote(result: DrawResult) {
		// Get template using resolver
		const resolver = new TemplateResolver(this.app, this.settings);
		const template = await resolver.getDailyTemplate();
		
		// Format the output using SpreadFormatter
		const formatter = new SpreadFormatter(this.settings);
		const output = formatter.formatSingle(result, template);

		// Get target file (active file or daily note)
		let targetFile = this.app.workspace.getActiveFile();
		
		if (!targetFile) {
			// No active file - check if daily note is enabled
			if (!this.settings.useDailyNote) {
				new Notice('Please open a note to insert the tarot draw');
				return;
			}
			
			// Try to get/create today's daily note
			const dailyNotePath = moment().format(this.settings.dailyNotePathPattern);
			const abstractFile = this.app.vault.getAbstractFileByPath(dailyNotePath);
			
			if (abstractFile instanceof TFile) {
				targetFile = abstractFile;
			} else {
				targetFile = await this.app.vault.create(dailyNotePath, '');
			}
			
			// Open the daily note
			await this.app.workspace.openLinkText(dailyNotePath, '', false);
		}
		
		// Insert based on settings
		const currentContent = await this.app.vault.read(targetFile);
		let newContent: string;

		switch (this.settings.insertLocation) {
			case 'prepend': {
				newContent = output + currentContent;
				break;
			}
			case 'heading': {
				newContent = this.insertUnderHeading(currentContent, output);
				break;
			}
			case 'append':
			default: {
				// Only add newline if file doesn't end with one
				const separator = currentContent.endsWith('\n') ? '' : '\n';
				newContent = currentContent + separator + output;
				break;
			}
		}

		await this.app.vault.modify(targetFile, newContent);
		new Notice('Card drawn: ' + result.cardName);
	}

	insertUnderHeading(content: string, textToInsert: string): string {
		const lines = content.split('\n');
		const headingToFind = this.settings.headingName.trim();
		
		// Find the heading
		let headingIndex = -1;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i]?.trim() === headingToFind) {
				headingIndex = i;
				break;
			}
		}

		if (headingIndex === -1) {
			// Heading doesn't exist, append it to the end
			return content + '\n\n' + headingToFind + '\n\n' + textToInsert;
		}

		// Find the next heading or end of file
		let insertIndex = headingIndex + 1;
		for (let i = headingIndex + 1; i < lines.length; i++) {
			// Check if this line is a heading (starts with #)
			if (lines[i]?.trim().startsWith('#')) {
				insertIndex = i;
				break;
			}
			insertIndex = i + 1;
		}

		// Insert the text
		lines.splice(insertIndex, 0, '', textToInsert.trim());
		return lines.join('\n');
	}

	async loadSettings() {
		const data = await this.loadData() as Partial<TarotPracticeSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
