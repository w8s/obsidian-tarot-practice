import { Notice, requestUrl } from 'obsidian';
import type { DeckDefinition } from '../types/deck';
import { DeckValidator } from './DeckValidator';
import { unzip } from 'fflate';
import type TarotPracticePlugin from '../main';

/** Allowed image extensions for ZIP extraction */
const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

/**
 * Promisify fflate's callback-based unzip for async use.
 */
function loadZip(data: Uint8Array): Promise<Record<string, Uint8Array>> {
	return new Promise((resolve, reject) => {
		unzip(data, (err, files) => {
			if (err) reject(err);
			else resolve(files);
		});
	});
}

/**
 * Sanitize and filter ZIP entries from the cards/ folder.
 * - Enforces cards/ prefix containment (blocks path traversal)
 * - Enforces image extension allowlist
 * Returns safe { name, data } pairs ready for extraction.
 */
export function sanitizeAndFilterZipEntries(
	files: Record<string, Uint8Array>
): Array<{ name: string; data: Uint8Array }> {
	const results: Array<{ name: string; data: Uint8Array }> = [];

	for (const [path, data] of Object.entries(files)) {
		// Only process entries inside cards/
		if (!path.startsWith('cards/')) continue;

		// Strip the cards/ prefix to get the relative name
		const relativePath = path.slice('cards/'.length);

		// Skip directory markers (empty name or trailing slash)
		if (!relativePath || relativePath.endsWith('/')) continue;

		// Normalize path separators and collapse any . or .. segments
		const normalized = relativePath.replace(/\\/g, '/').split('/').reduce<string[]>((acc, seg) => {
			if (seg === '' || seg === '.') return acc;
			if (seg === '..') { acc.pop(); return acc; }
			acc.push(seg);
			return acc;
		}, []).join('/');

		// Must not be empty after normalization
		if (!normalized) continue;

		// Must not escape cards/ (no leading ../ after normalization)
		if (normalized.startsWith('../')) continue;

		// Extension allowlist
		const ext = normalized.split('.').pop()?.toLowerCase() ?? '';
		if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) continue;

		results.push({ name: normalized, data });
	}

	return results;
}

/**
 * Handles loading and installing deck definitions from files
 */
export class DeckLoader {
	constructor(private plugin: TarotPracticePlugin) {}

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
		// Load and parse ZIP asynchronously (non-blocking for larger decks)
		const buffer = await file.arrayBuffer();
		const zip = await loadZip(new Uint8Array(buffer));

		// Find deck.json
		const deckJsonBytes = zip['deck.json'];
		if (!deckJsonBytes) {
			throw new Error('ZIP must contain deck.json in root');
		}

		// Decode deck.json to get deck ID
		const jsonContent = new TextDecoder().decode(deckJsonBytes);
		const deckData = JSON.parse(jsonContent) as { id: string };

		// Install deck with image extraction callback
		return await this.installDeck(jsonContent, async (_deckPath) => {
			// Get sanitized image entries from cards/ folder
			const imageFiles = sanitizeAndFilterZipEntries(zip);
			if (imageFiles.length === 0) return; // No images to extract

			// Get template base folder from settings
			const templateBaseFolder = this.plugin.settings.templateBaseFolder || 'Templates/Tarot';

			// Extract images to vault: {templateBaseFolder}/Decks/{deck-id}/cards/
			const vaultImagePath = `${templateBaseFolder}/Decks/${deckData.id}/cards`;
			await this.plugin.app.vault.adapter.mkdir(vaultImagePath);

			// Write each image to vault
			for (const { name, data } of imageFiles) {
				const imagePath = `${vaultImagePath}/${name}`;
				await this.plugin.app.vault.adapter.writeBinary(imagePath, data);
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
		const templateBaseFolder = this.plugin.settings.templateBaseFolder || 'Templates/Tarot';
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

		// Constrain to HTTPS to prevent requests to arbitrary protocols
		if (!deck.sourceUrl.startsWith('https://')) {
			throw new Error(`Deck source URL must use HTTPS: ${deck.sourceUrl}`);
		}

		new Notice(`Downloading deck images for "${deck.name}"...`);

		try {
			// Download the ZIP file using Obsidian's requestUrl
			const response = await requestUrl({ url: deck.sourceUrl });
			const zip = await loadZip(new Uint8Array(response.arrayBuffer));

			// Get template base folder from settings
			const templateBaseFolder = this.plugin.settings.templateBaseFolder || 'Templates/Tarot';

			// Extract images to vault: {templateBaseFolder}/Decks/{deck-id}/cards/
			const vaultImagePath = `${templateBaseFolder}/Decks/${deck.id}/cards`;

			// Remove existing images if present
			const adapter = this.plugin.app.vault.adapter;
			if (await adapter.exists(vaultImagePath)) {
				await adapter.rmdir(vaultImagePath, true);
			}

			// Create directory
			await adapter.mkdir(vaultImagePath);

			// Get all files in cards/ folder — sanitized and filtered
			const imageFiles = sanitizeAndFilterZipEntries(zip);

			if (imageFiles.length === 0) {
				throw new Error('No images found in ZIP archive');
			}

			// Write each image to vault
			for (const { name, data } of imageFiles) {
				const imagePath = `${vaultImagePath}/${name}`;
				await adapter.writeBinary(imagePath, data);
			}

			new Notice(`Restored ${imageFiles.length} images for "${deck.name}"`);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to restore deck images: ${msg}`);
			throw error;
		}
	}
}
