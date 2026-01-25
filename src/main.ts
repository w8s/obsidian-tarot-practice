import { Plugin, moment, TFile, Notice, MarkdownView } from 'obsidian';
import { TarotPracticeSettings, DEFAULT_SETTINGS } from './settings';
import { TarotPracticeSettingTab } from 'ui/TarotPracticeSettingTab';
import { SpreadDrawModal } from 'modals/SpreadDrawModal';
import { SpreadResolver } from 'spreads/SpreadResolver';
import { SpreadFormatter, registerHandlebarsHelpers } from 'templates/SpreadFormatter';
import { Spread, SpreadDrawResult, SpreadPositionResult } from 'core/spreads';
import { prepareDeck } from 'core/DeckPreparation';
import { DeckType } from 'core/Deck';
import { DeckRegistry } from 'core/DeckRegistry';
import { DeckLoader } from 'core/DeckLoader';
import { DrawHistory } from 'core/DrawHistory';

export default class TarotPracticePlugin extends Plugin {
	settings: TarotPracticeSettings;
	deckRegistry: DeckRegistry;
	deckLoader: DeckLoader;
	drawHistory: DrawHistory;

	async onload() {
		await this.loadSettings();

		// Initialize deck system (v1.7.0)
		this.deckRegistry = new DeckRegistry();
		this.deckLoader = new DeckLoader(this);
		
		// Load custom decks
		const customDecks = await this.deckLoader.loadAllDecks();
		for (const deck of customDecks) {
			this.deckRegistry.registerDeck(deck);
		}

		// Initialize draw history system (v1.8.2)
		this.drawHistory = new DrawHistory(this);
		await this.drawHistory.load();

		// Register Handlebars helpers for spread templates
		registerHandlebarsHelpers();

		// Add ribbon icon for spread selection
		this.addRibbonIcon('sparkles', 'Draw tarot spread', () => {
			this.openSpreadDrawModal();
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

	openSpreadDrawModal() {
		// Get all available spreads
		const spreadResolver = new SpreadResolver(this.app);
		const allSpreads = spreadResolver.getAllSpreads(
			this.settings.customSpreads,
			this.settings.builtInSpreadOverrides
		);

		// Open modal to select spread and enter intention
		new SpreadDrawModal(this.app, this, allSpreads, (spread: Spread, intention: string, deckId: string, querent?: { name: string; notePath?: string }) => {
			void this.drawSpread(spread, intention, deckId, querent);
		}).open();
	}

	async drawSpread(spread: Spread, intention: string, deckId: string, querent?: { name: string; notePath?: string }) {
		// Delegate to unified execution method
		await this.executeSpread(spread, intention, deckId, querent);
	}

	/**
	 * Unified spread execution that handles all insert modes
	 */
	async executeSpread(spread: Spread, intention: string, deckId: string, querent?: { name: string; notePath?: string }): Promise<void> {
		try {
			// Get the selected deck
			const deck = this.deckRegistry.getDeck(deckId);
			if (!deck) {
				throw new Error(`Deck "${deckId}" not found`);
			}

			// Prepare the deck using spread's shuffle settings
			const timestamp = Date.now();
			const deckSettings = {
				...this.settings,
				shuffleCount: spread.shuffleCount,
				cutDeck: spread.cutDeck
			};
			
			const preparedDeck = await prepareDeck(
				intention,
				timestamp.toString(),
				deckSettings,
				deck.cardCount
			);

			// Draw cards for each position
			const positions: SpreadPositionResult[] = [];
			for (let i = 0; i < spread.positions.length; i++) {
				const cardIndex = preparedDeck.deck[i];
				
				if (cardIndex === undefined) {
					throw new Error(`Failed to draw card at position ${i}`);
				}
				
				// Get card name from the selected deck
				const card = deck.cards[cardIndex];
				if (!card) {
					throw new Error(`Card at index ${cardIndex} not found in deck "${deck.name}"`);
				}
				const cardName = card.name;
				
				// Determine reversal
				let isReversed = false;
				if (this.settings.enableReversals) {
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
					description: positionDef.description,
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
				deck: {
					id: deck.id,
					name: deck.name,
					type: deck.metadata?.tradition as DeckType || 'other',
					cardCount: deck.cardCount,
					supportsReversals: deck.supportsReversals,
					isBuiltIn: deck.isBuiltIn,
					definition: deck
				},
				shuffleCount: preparedDeck.metadata.shuffleCount,
				wasCut: preparedDeck.metadata.wasCut,
				cutPosition: preparedDeck.metadata.cutPositionPercent ?? undefined,
				cutPositionCards: preparedDeck.metadata.cutPositionCards ?? undefined,
				cutBase: preparedDeck.metadata.cutBasePercent ?? undefined,
				cutVariance: preparedDeck.metadata.cutVariancePercent ?? undefined,
				querent: querent
			};

			// Save to history (v1.8.2)
			await this.drawHistory.addDraw(drawResult);

			// Get template
			const spreadResolver = new SpreadResolver(this.app);
			const template = await spreadResolver.getSpreadTemplate(spread);

			// Format using Handlebars
			const formatter = new SpreadFormatter(this.settings);
			const output = formatter.format(drawResult, template);

			// Insert based on spread's insertMode
			switch (spread.insertMode) {
				case 'daily-note':
					await this.insertIntoDailyNote(output, spread.name);
					break;
				case 'inline':
					await this.insertInline(output, spread.name);
					break;
				case 'new-note':
					await this.insertIntoNewNote(output, spread.name, intention);
					break;
			}

		} catch (error) {
			console.error('Error executing spread:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice('Failed to execute spread: ' + errorMessage);
		}
	}

	/**
	 * Insert content into daily note
	 */
	async insertIntoDailyNote(output: string, spreadName: string): Promise<void> {
		// Get or create daily note
		// The path pattern should be a literal path where only the filename is formatted with moment
		// Example: "Periodic/Daily/YYYY-MM-DD.md" becomes "Periodic/Daily/" + moment().format("YYYY-MM-DD.md")
		const pathPattern = this.settings.dailyNotePathPattern;
		
		// Split path into directory and filename
		const lastSlashIndex = pathPattern.lastIndexOf('/');
		let dailyNotePath: string;
		
		if (lastSlashIndex === -1) {
			// No directory, just filename - split filename from extension
			const lastDot = pathPattern.lastIndexOf('.');
			const namePattern = lastDot !== -1 ? pathPattern.substring(0, lastDot) : pathPattern;
			const extension = lastDot !== -1 ? pathPattern.substring(lastDot) : '';
			dailyNotePath = `${moment().format(namePattern)}${extension}`;
		} else {
			// Has directory path - only format the filename part (excluding extension)
			const directory = pathPattern.substring(0, lastSlashIndex + 1);
			const filenamePattern = pathPattern.substring(lastSlashIndex + 1);
			const lastDot = filenamePattern.lastIndexOf('.');
			const namePattern = lastDot !== -1 ? filenamePattern.substring(0, lastDot) : filenamePattern;
			const extension = lastDot !== -1 ? filenamePattern.substring(lastDot) : '';
			dailyNotePath = `${directory}${moment().format(namePattern)}${extension}`;
		}
		const abstractFile = this.app.vault.getAbstractFileByPath(dailyNotePath);
		
		let targetFile: TFile;
		if (abstractFile instanceof TFile) {
			targetFile = abstractFile;
		} else {
			// Ensure parent folder exists before creating file
			if (lastSlashIndex !== -1) {
				const folderPath = dailyNotePath.substring(0, dailyNotePath.lastIndexOf('/'));
				const folder = this.app.vault.getAbstractFileByPath(folderPath);
				if (!folder) {
					await this.app.vault.createFolder(folderPath);
				}
			}
			targetFile = await this.app.vault.create(dailyNotePath, '');
		}
		
		// Open the daily note
		await this.app.workspace.openLinkText(dailyNotePath, '', false);
		
		// Insert based on settings
		const currentContent = await this.app.vault.read(targetFile);
		let newContent: string;

		switch (this.settings.insertLocation) {
			case 'prepend':
				newContent = output + '\n' + currentContent;
				break;
			case 'heading':
				newContent = this.insertUnderHeading(currentContent, output);
				break;
			case 'append':
			default: {
				const separator = currentContent.endsWith('\n') ? '' : '\n';
				newContent = currentContent + separator + output;
				break;
			}
		}

		await this.app.vault.modify(targetFile, newContent);
		new Notice(`${spreadName} drawn`);
	}

	/**
	 * Insert content inline at cursor position
	 */
	async insertInline(output: string, spreadName: string): Promise<void> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (!activeView) {
			new Notice('No active note found');
			return;
		}
		
		const editor = activeView.editor;
		editor.replaceSelection(output);
		
		new Notice(`${spreadName} drawn`);
	}

	/**
	 * Insert content into a new note
	 */
	async insertIntoNewNote(output: string, spreadName: string, intention: string): Promise<void> {
		// Create filename: SpreadName - Intention - Timestamp
		const timestamp = moment().format('YYYY-MM-DD-HHmmss');
		const sanitizedIntention = intention.replace(/[\\/:*?"<>|]/g, '-').substring(0, 50);
		const filename = `${spreadName} - ${sanitizedIntention} - ${timestamp}.md`;
		
		// Create the new file
		const newFile = await this.app.vault.create(filename, output);
		
		// Open the new file
		await this.app.workspace.getLeaf(false).openFile(newFile);
		
		new Notice(`${spreadName} created`);
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
