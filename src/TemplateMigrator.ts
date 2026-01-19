import { App, Notice, TFolder } from 'obsidian';
import { TarotPracticeSettings, DEFAULT_TEMPLATE, DEFAULT_MULTIPLE_TEMPLATE } from './settings';
import { BUILTIN_DAILY_TEMPLATE, BUILTIN_INLINE_TEMPLATE, BUILTIN_MULTIPLE_TEMPLATE } from './BuiltInTemplates';

/**
 * Handles migration from inline templates to file-based templates.
 */
export class TemplateMigrator {
	constructor(
		private app: App,
		private settings: TarotPracticeSettings
	) {}

	/**
	 * Check if migration is needed
	 */
	needsMigration(): boolean {
		// Already migrated
		if (this.settings.hasTemplatesMigrated) {
			return false;
		}

		// Check if any old template fields exist and are customized
		// Compare against OLD defaults (v1.2.0), not new built-ins
		return (
			this.isCustomized(this.settings.outputTemplate, DEFAULT_TEMPLATE) ||
			this.isCustomized(this.settings.inlineOutputTemplate, DEFAULT_TEMPLATE) ||
			this.isCustomized(this.settings.multipleCardsTemplate, DEFAULT_MULTIPLE_TEMPLATE)
		);
	}

	/**
	 * Get existing customized templates for migration
	 */
	getExistingTemplates(): { daily?: string; inline?: string; multiple?: string } {
		const templates: { daily?: string; inline?: string; multiple?: string } = {};

		if (this.isCustomized(this.settings.outputTemplate, DEFAULT_TEMPLATE)) {
			templates.daily = this.settings.outputTemplate;
		}
		if (this.isCustomized(this.settings.inlineOutputTemplate, DEFAULT_TEMPLATE)) {
			templates.inline = this.settings.inlineOutputTemplate;
		}
		if (this.isCustomized(this.settings.multipleCardsTemplate, DEFAULT_MULTIPLE_TEMPLATE)) {
			templates.multiple = this.settings.multipleCardsTemplate;
		}

		return templates;
	}

	/**
	 * Perform the migration
	 */
	async migrate(targetFolder: string): Promise<void> {
		try {
			const tarotFolder = `${targetFolder}/Tarot`;

			// Create folder structure
			await this.ensureFolder(tarotFolder);

			const templates = this.getExistingTemplates();
			let filesCreated = 0;

			// Migrate daily template
			if (templates.daily) {
				await this.createTemplateFile(`${tarotFolder}/Daily.md`, templates.daily);
				this.settings.useCustomDailyTemplate = true;
				this.settings.customDailyTemplatePath = `${tarotFolder}/Daily.md`;
				filesCreated++;
			}

			// Migrate inline template
			if (templates.inline) {
				await this.createTemplateFile(`${tarotFolder}/Inline.md`, templates.inline);
				this.settings.useCustomInlineTemplate = true;
				this.settings.customInlineTemplatePath = `${tarotFolder}/Inline.md`;
				filesCreated++;
			}

			// Migrate multiple template
			if (templates.multiple) {
				await this.createTemplateFile(`${tarotFolder}/Multiple.md`, templates.multiple);
				this.settings.useCustomMultipleTemplate = true;
				this.settings.customMultipleTemplatePath = `${tarotFolder}/Multiple.md`;
				filesCreated++;
			}

			// Set migration flag
			this.settings.hasTemplatesMigrated = true;

			new Notice(`✓ Migrated ${filesCreated} template${filesCreated !== 1 ? 's' : ''} to ${tarotFolder}`);

		} catch (error) {
			console.error('Migration failed:', error);
			new Notice('Migration failed. See console for details.');
			throw error;
		}
	}

	/**
	 * Check if a template has been customized from default
	 */
	/**
	 * Check if a template has been customized from default
	 */
	private isCustomized(template: string | undefined, builtIn: string): boolean {
		if (!template) {
			return false;
		}
		// Normalize whitespace for comparison
		const normalized = template.trim();
		const builtInNormalized = builtIn.trim();
		return normalized !== builtInNormalized;
	}

	/**
	 * Ensure a folder exists, creating it if necessary
	 */
	private async ensureFolder(path: string): Promise<void> {
		const folder = this.app.vault.getAbstractFileByPath(path);
		if (!folder) {
			await this.app.vault.createFolder(path);
		} else if (!(folder instanceof TFolder)) {
			throw new Error(`Path exists but is not a folder: ${path}`);
		}
	}

	/**
	 * Create a template file with the given content
	 */
	private async createTemplateFile(path: string, content: string): Promise<void> {
		const existingFile = this.app.vault.getAbstractFileByPath(path);
		if (existingFile) {
			// File already exists - don't overwrite
			new Notice(`Template file already exists: ${path}`);
			return;
		}

		await this.app.vault.create(path, content);
	}
}
