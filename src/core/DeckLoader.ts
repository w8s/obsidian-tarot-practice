import { Notice, Plugin } from 'obsidian';
import type { DeckDefinition } from '../types/deck';
import { DeckValidator } from './DeckValidator';
import type JSZip from 'jszip';

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
	 * Shared helper to install a deck from validated JSON content
	 * 
	 * @param jsonContent - The deck.json content as a string
	 * @param extractAssets - Optional callback to extract additional assets (images, etc.)
	 */
	private async installDeck(
		jsonContent: string,
		extractAssets?: (deckPath: string) => Promise<void>
	): Promise<DeckDefinition> {
		// Parse and validate
		const data: unknown = JSON.parse(jsonContent);
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

		try {
			// Write deck.json
			const jsonPath = `${deckPath}/deck.json`;
			await this.plugin.app.vault.adapter.write(jsonPath, jsonContent);

			// Extract additional assets if provided
			if (extractAssets) {
				await extractAssets(deckPath);
			}

			new Notice(`Deck "${deck.name}" installed successfully`);
			return deck;
		} catch (error) {
			// Cleanup on failure
			try {
				await this.plugin.app.vault.adapter.rmdir(deckPath, true);
			} catch {
				// Ignore cleanup errors
			}
			throw error;
		}
	}

	/**
	 * Install deck from JSON file
	 */
	async installFromJSON(file: File): Promise<DeckDefinition> {
		const content = await file.text();
		return await this.installDeck(content);
	}

	/**
	 * Install deck from ZIP file
	 * 
	 * Expected ZIP structure:
	 *   deck.json          (required)
	 *   cards/             (optional)
	 *     card1.png
	 *     card2.jpg
	 *     ...
	 * 
	 * Images are extracted to: {templateBaseFolder}/Decks/{deck-id}/cards/
	 * deck.json is stored in: .obsidian/plugins/tarot-practice/decks/{deck-id}/
	 */
	async installFromZIP(file: File): Promise<DeckDefinition> {
		// Dynamically import JSZip
		const JSZip = (await import('jszip')).default;
		
		// Load ZIP file
		const zip = await JSZip.loadAsync(file);
		
		// Find deck.json
		const deckJsonFile = zip.file('deck.json');
		if (!deckJsonFile) {
			throw new Error('ZIP must contain deck.json in root');
		}
		
		// Read and parse deck.json to get deck ID
		const jsonContent = await deckJsonFile.async('text');
		const deckData = JSON.parse(jsonContent) as { id: string };
		
		// Install deck with image extraction callback
		return await this.installDeck(jsonContent, async (deckPath) => {
			// Extract images from cards/ folder if present
			const cardsFolder = zip.folder('cards');
			if (!cardsFolder) {
				return; // No images to extract
			}
			
			// Get template base folder from settings
			const settings = (this.plugin as any).settings;
			const templateBaseFolder = settings?.templateBaseFolder || 'Templates/Tarot';
			
			// Extract images to vault: {templateBaseFolder}/Decks/{deck-id}/cards/
			const vaultImagePath = `${templateBaseFolder}/Decks/${deckData.id}/cards`;
			await this.plugin.app.vault.adapter.mkdir(vaultImagePath);
			
			// Get all files in cards/ folder
			const imageFiles: Array<{ name: string; file: JSZip.JSZipObject }> = [];
			zip.folder('cards')?.forEach((relativePath, file) => {
				if (!file.dir) {
					imageFiles.push({ name: relativePath, file });
				}
			});
			
			// Extract each image to vault
			for (const { name, file } of imageFiles) {
				const imageData = await file.async('uint8array');
				const imagePath = `${vaultImagePath}/${name}`;
				await this.plugin.app.vault.adapter.writeBinary(imagePath, imageData);
			}
		});
	}

	/**
	 * Remove a deck (removes both deck.json and images if present)
	 */
	async removeDeck(deckId: string): Promise<void> {
		const deckPath = `${this.getDecksPath()}/${deckId}`;
		const adapter = this.plugin.app.vault.adapter;

		if (!(await adapter.exists(deckPath))) {
			throw new Error(`Deck "${deckId}" not found`);
		}

		// Remove deck.json directory
		await adapter.rmdir(deckPath, true);
		
		// Remove images from vault if they exist
		const settings = (this.plugin as any).settings;
		const templateBaseFolder = settings?.templateBaseFolder || 'Templates/Tarot';
		const vaultImagePath = `${templateBaseFolder}/Decks/${deckId}`;
		
		if (await adapter.exists(vaultImagePath)) {
			await adapter.rmdir(vaultImagePath, true);
		}
		
		new Notice(`Deck "${deckId}" removed`);
	}

	/**
	 * Check if deck exists
	 */
	async deckExists(deckId: string): Promise<boolean> {
		const deckPath = `${this.getDecksPath()}/${deckId}`;
		return await this.plugin.app.vault.adapter.exists(deckPath);
	}

	/**
	 * Re-download and restore deck images from sourceUrl
	 * 
	 * @param deck - The deck definition with sourceUrl
	 */
	async restoreDeckImages(deck: DeckDefinition): Promise<void> {
		if (!deck.sourceUrl) {
			throw new Error(`Deck "${deck.name}" does not have a source URL`);
		}

		new Notice(`Downloading deck images for "${deck.name}"...`);

		try {
			// Download the ZIP file
			const response = await fetch(deck.sourceUrl);
			if (!response.ok) {
				throw new Error(`Failed to download: ${response.statusText}`);
			}

			const blob = await response.blob();
			const file = new File([blob], `${deck.id}.zip`, { type: 'application/zip' });

			// Dynamically import JSZip
			const JSZip = (await import('jszip')).default;
			const zip = await JSZip.loadAsync(file);

			// Get template base folder from settings
			const settings = (this.plugin as any).settings;
			const templateBaseFolder = settings?.templateBaseFolder || 'Templates/Tarot';
			
			// Extract images to vault: {templateBaseFolder}/Decks/{deck-id}/cards/
			const vaultImagePath = `${templateBaseFolder}/Decks/${deck.id}/cards`;
			
			// Remove existing images if present
			const adapter = this.plugin.app.vault.adapter;
			if (await adapter.exists(vaultImagePath)) {
				await adapter.rmdir(vaultImagePath, true);
			}
			
			// Create directory
			await adapter.mkdir(vaultImagePath);
			
			// Get all files in cards/ folder
			const imageFiles: Array<{ name: string; file: JSZip.JSZipObject }> = [];
			zip.folder('cards')?.forEach((relativePath, file) => {
				if (!file.dir) {
					imageFiles.push({ name: relativePath, file });
				}
			});
			
			if (imageFiles.length === 0) {
				throw new Error('No images found in ZIP archive');
			}
			
			// Extract each image to vault
			for (const { name, file } of imageFiles) {
				const imageData = await file.async('uint8array');
				const imagePath = `${vaultImagePath}/${name}`;
				await adapter.writeBinary(imagePath, imageData);
			}

			new Notice(`Restored ${imageFiles.length} images for "${deck.name}"`);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to restore deck images: ${msg}`);
			throw error;
		}
	}
}
