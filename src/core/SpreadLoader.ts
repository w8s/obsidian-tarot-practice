import { Notice } from 'obsidian';
import type { Spread } from './spreads';
import { SpreadValidator } from './SpreadValidator';
import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';
import type TarotPracticePlugin from '../main';

/**
 * Handles loading and installing spread definitions from files
 */
export class SpreadLoader {
	constructor(private plugin: TarotPracticePlugin) {}

	/**
	 * Get the spreads directory path
	 */
	private getSpreadsPath(): string {
		const pluginDir = this.plugin.manifest.dir;
		if (!pluginDir) {
			throw new Error('Plugin directory not available');
		}
		return `${pluginDir}/spreads`;
	}

	/**
	 * Ensure spreads directory exists
	 */
	async ensureSpreadsDirectory(): Promise<void> {
		const spreadsPath = this.getSpreadsPath();
		const adapter = this.plugin.app.vault.adapter;
		
		try {
			await adapter.mkdir(spreadsPath);
		} catch {
			// Directory might already exist, that's fine
		}
	}

	/**
	 * Load all custom spreads from the spreads directory
	 */
	async loadAllSpreads(): Promise<Spread[]> {
		await this.ensureSpreadsDirectory();
		
		const spreadsPath = this.getSpreadsPath();
		const adapter = this.plugin.app.vault.adapter;
		const spreads: Spread[] = [];

		try {
			const spreadDirs = await adapter.list(spreadsPath);
			
			for (const dir of spreadDirs.folders) {
				const spreadJsonPath = `${dir}/spread.json`;
				
				try {
					const jsonContent = await adapter.read(spreadJsonPath);
					const spread = await this.parseSpread(jsonContent, dir);
					
					if (spread) {
						spreads.push(spread);
					}
				} catch (error) {
					console.error(`Failed to load spread from ${dir}:`, error);
					new Notice(`Failed to load spread from ${dir.split('/').pop()}`);
				}
			}
		} catch (error) {
			console.error('Failed to list spreads directory:', error);
		}

		return spreads;
	}

	/**
	 * Parse and validate spread JSON
	 */
	private async parseSpread(jsonContent: string, spreadPath: string): Promise<Spread | null> {
		try {
			const data: unknown = JSON.parse(jsonContent);
			
			// Validate
			const result = SpreadValidator.validate(data);
			
			if (!result.isValid) {
				const spreadId = spreadPath.split('/').pop() || 'unknown';
				new Notice(`Spread "${spreadId}" has errors: ${result.errors.join(', ')}`);
				return null;
			}

			// Show warnings if any
			if (result.warnings.length > 0) {
				console.warn(`Spread warnings for ${spreadPath}:`, result.warnings);
			}

			return data as Spread;
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to parse spread JSON: ${msg}`);
		}
	}

	/**
	 * Shared helper to install a spread from validated JSON content
	 * 
	 * @param jsonContent - The spread.json content as a string
	 * @param extractTemplate - Optional callback to extract template file
	 */
	private async installSpread(
		jsonContent: string,
		extractTemplate?: (spreadPath: string) => Promise<void>
	): Promise<Spread> {
		// Parse and validate
		const data: unknown = JSON.parse(jsonContent);
		const result = SpreadValidator.validate(data);
		
		if (!result.isValid) {
			throw new Error(`Invalid spread: ${result.errors.join(', ')}`);
		}

		const spread = data as Spread;
		
		// Check if spread already exists
		if (await this.spreadExists(spread.id)) {
			throw new Error(`Spread "${spread.id}" already exists`);
		}

		// Create spread directory
		await this.ensureSpreadsDirectory();
		const spreadPath = `${this.getSpreadsPath()}/${spread.id}`;
		await this.plugin.app.vault.adapter.mkdir(spreadPath);

		try {
			// Write spread.json
			const jsonPath = `${spreadPath}/spread.json`;
			await this.plugin.app.vault.adapter.write(jsonPath, jsonContent);

			// Extract template if provided
			if (extractTemplate) {
				await extractTemplate(spreadPath);
			}

			new Notice(`Spread "${spread.name}" installed successfully`);
			return spread;
		} catch (error) {
			// Cleanup on failure
			try {
				await this.plugin.app.vault.adapter.rmdir(spreadPath, true);
			} catch {
				// Ignore cleanup errors
			}
			throw error;
		}
	}

	/**
	 * Install spread from JSON file
	 */
	async installFromJSON(file: File): Promise<Spread> {
		const content = await file.text();
		return await this.installSpread(content);
	}

	/**
	 * Install spread from ZIP file
	 * 
	 * Expected ZIP structure:
	 *   spread.json        (required)
	 *   template.md        (optional)
	 * 
	 * Template is extracted to: {templateBaseFolder}/Spreads/{spread-id}/template.md
	 * spread.json is stored in: .obsidian/plugins/tarot-practice/spreads/{spread-id}/
	 */
	async installFromZIP(file: File): Promise<Spread> {
		// Spread ZIPs are always small (JSON + markdown) — sync is fine
		const buffer = await file.arrayBuffer();
		const zip = unzipSync(new Uint8Array(buffer));

		// Find spread.json
		const spreadJsonBytes = zip['spread.json'];
		if (!spreadJsonBytes) {
			throw new Error('ZIP must contain spread.json in root');
		}

		// Decode spread.json
		const jsonContent = strFromU8(spreadJsonBytes);
		const spreadData = JSON.parse(jsonContent) as { id: string };

		// Install spread with template extraction callback
		return await this.installSpread(jsonContent, async (spreadPath) => {
			// Extract template.md if present
			const templateBytes = zip['template.md'];
			if (!templateBytes) return; // No template to extract

			// Get template base folder from settings
			const templateBaseFolder = this.plugin.settings.templateBaseFolder || 'Templates/Tarot';

			// Extract template to vault: {templateBaseFolder}/Spreads/{spread-id}/template.md
			const vaultTemplatePath = `${templateBaseFolder}/Spreads/${spreadData.id}`;
			await this.plugin.app.vault.adapter.mkdir(vaultTemplatePath);

			// Write template file
			const templateContent = strFromU8(templateBytes);
			const templatePath = `${vaultTemplatePath}/template.md`;
			await this.plugin.app.vault.adapter.write(templatePath, templateContent);

			// Update spread.json to point to extracted template
			const spread = JSON.parse(jsonContent) as Spread;
			spread.templatePath = templatePath;
			const updatedJson = JSON.stringify(spread, null, 2);
			const jsonPath = `${spreadPath}/spread.json`;
			await this.plugin.app.vault.adapter.write(jsonPath, updatedJson);
		});
	}

	/**
	 * Remove a spread (removes both spread.json and template if present)
	 */
	async removeSpread(spreadId: string): Promise<void> {
		const spreadPath = `${this.getSpreadsPath()}/${spreadId}`;
		const adapter = this.plugin.app.vault.adapter;

		if (!(await adapter.exists(spreadPath))) {
			throw new Error(`Spread "${spreadId}" not found`);
		}

		// Remove spread.json directory
		await adapter.rmdir(spreadPath, true);
		
		// Remove template from vault if it exists
		const templateBaseFolder = this.plugin.settings.templateBaseFolder || 'Templates/Tarot';
		const vaultTemplatePath = `${templateBaseFolder}/Spreads/${spreadId}`;
		
		if (await adapter.exists(vaultTemplatePath)) {
			await adapter.rmdir(vaultTemplatePath, true);
		}
		
		new Notice(`Spread "${spreadId}" removed`);
	}

	/**
	 * Check if spread exists
	 */
	async spreadExists(spreadId: string): Promise<boolean> {
		const spreadPath = `${this.getSpreadsPath()}/${spreadId}`;
		return await this.plugin.app.vault.adapter.exists(spreadPath);
	}

	/**
	 * Export spread to JSON or ZIP format
	 * 
	 * @param spread - The spread to export
	 * @param includeTemplate - If true and spread has template, export as ZIP with template
	 * @returns Blob that can be downloaded
	 */
	async exportSpread(spread: Spread, includeTemplate: boolean): Promise<{ blob: Blob; filename: string }> {
		// Clean spread data (remove any runtime-only fields)
		const spreadData = { ...spread };
		
		// If exporting as JSON only
		if (!includeTemplate || !spread.templatePath || spread.templatePath.trim() === '') {
			const json = JSON.stringify(spreadData, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			return {
				blob,
				filename: `${spread.id}.json`
			};
		}
		
		// Export as ZIP with template
		const json = JSON.stringify(spreadData, null, 2);
		const zipFiles: Record<string, Uint8Array> = {
			'spread.json': strToU8(json)
		};

		// Add template.md if it exists
		try {
			const adapter = this.plugin.app.vault.adapter;
			if (await adapter.exists(spread.templatePath)) {
				const templateContent = await adapter.read(spread.templatePath);
				zipFiles['template.md'] = strToU8(templateContent);
			}
		} catch (error) {
			console.warn('Failed to read template for export:', error);
			// Continue without template
		}

		// Generate ZIP blob (sync — content is always small)
		const zipBlob = new Blob([zipSync(zipFiles)], { type: 'application/zip' });
		return {
			blob: zipBlob,
			filename: `${spread.id}.zip`
		};
	}
}
