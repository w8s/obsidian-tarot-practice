import { Notice, Plugin } from 'obsidian';
import type { DeckDefinition } from '../types/deck';
import { DeckValidator } from './DeckValidator';

/**
 * Handles loading and installing deck definitions from files
 */
export class DeckLoader {
	constructor(private plugin: Plugin) {}

	/**
	 * Get the decks directory path
	 */
	private getDecksPath(): string {
		const pluginDir = this.plugin.manifest.dir;
		if (!pluginDir) {
			throw new Error('Plugin directory not available');
		}
		return `${pluginDir}/decks`;
	}

	/**
	 * Ensure decks directory exists
	 */
	async ensureDecksDirectory(): Promise<void> {
		const decksPath = this.getDecksPath();
		const adapter = this.plugin.app.vault.adapter;
		
		try {
			await adapter.mkdir(decksPath);
		} catch {
			// Directory might already exist, that's fine
		}
	}

	/**
	 * Load all custom decks from the decks directory
	 */
	async loadAllDecks(): Promise<DeckDefinition[]> {
		await this.ensureDecksDirectory();
		
		const decksPath = this.getDecksPath();
		const adapter = this.plugin.app.vault.adapter;
		const decks: DeckDefinition[] = [];

		try {
			const deckDirs = await adapter.list(decksPath);
			
			for (const dir of deckDirs.folders) {
				const deckJsonPath = `${dir}/deck.json`;
				
				try {
					const jsonContent = await adapter.read(deckJsonPath);
					const deck = await this.parseDeck(jsonContent, dir);
					
					if (deck) {
						decks.push(deck);
					}
				} catch (error) {
					console.error(`Failed to load deck from ${dir}:`, error);
					new Notice(`Failed to load deck from ${dir.split('/').pop()}`);
				}
			}
		} catch (error) {
			console.error('Failed to list decks directory:', error);
		}

		return decks;
	}

	/**
	 * Parse and validate deck JSON
	 */
	private async parseDeck(jsonContent: string, deckPath: string): Promise<DeckDefinition | null> {
		try {
			const data: unknown = JSON.parse(jsonContent);
			
			// Validate
			const result = DeckValidator.validate(data);
			
			if (!result.isValid) {
				const deckId = deckPath.split('/').pop() || 'unknown';
				new Notice(`Deck "${deckId}" has errors: ${result.errors.join(', ')}`);
				return null;
			}

			// Show warnings if any
			if (result.warnings.length > 0) {
				console.warn(`Deck warnings for ${deckPath}:`, result.warnings);
				// TODO: Check ignoredDeckWarnings setting
			}

			return data as DeckDefinition;
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to parse deck JSON: ${msg}`);
		}
	}

	/**
	 * Install deck from JSON file
	 */
	async installFromJSON(file: File): Promise<DeckDefinition> {
		const content = await file.text();
		const data: unknown = JSON.parse(content);

		// Validate first
		const result = DeckValidator.validate(data);
		if (!result.isValid) {
			throw new Error(`Invalid deck: ${result.errors.join(', ')}`);
		}

		const deck = data as DeckDefinition;
		
		// Check if deck already exists
		if (await this.deckExists(deck.id)) {
			throw new Error(`Deck "${deck.id}" already exists`);
		}

		// Create deck directory
		await this.ensureDecksDirectory();
		const deckPath = `${this.getDecksPath()}/${deck.id}`;
		await this.plugin.app.vault.adapter.mkdir(deckPath);

		// Write deck.json
		const jsonPath = `${deckPath}/deck.json`;
		await this.plugin.app.vault.adapter.write(jsonPath, content);

		new Notice(`Deck "${deck.name}" installed successfully`);
		return deck;
	}

	/**
	 * Install deck from ZIP file (placeholder for v1.7.x)
	 */
	async installFromZIP(file: File): Promise<DeckDefinition> {
		throw new Error('ZIP installation not yet implemented');
		// TODO: Implement with jszip library
	}

	/**
	 * Remove a deck
	 */
	async removeDeck(deckId: string): Promise<void> {
		const deckPath = `${this.getDecksPath()}/${deckId}`;
		const adapter = this.plugin.app.vault.adapter;

		if (!(await adapter.exists(deckPath))) {
			throw new Error(`Deck "${deckId}" not found`);
		}

		// Remove entire directory
		await adapter.rmdir(deckPath, true);
		new Notice(`Deck "${deckId}" removed`);
	}

	/**
	 * Check if deck exists
	 */
	async deckExists(deckId: string): Promise<boolean> {
		const deckPath = `${this.getDecksPath()}/${deckId}`;
		return await this.plugin.app.vault.adapter.exists(deckPath);
	}
}
