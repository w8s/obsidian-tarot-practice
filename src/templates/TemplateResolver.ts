import { App, TFile, Notice } from 'obsidian';
import { TarotPracticeSettings } from '../settings';
import { BUILTIN_DAILY_TEMPLATE, BUILTIN_INLINE_TEMPLATE, BUILTIN_MULTIPLE_TEMPLATE } from './BuiltInTemplates';

/**
 * Resolves which template to use for tarot draws.
 * Handles loading custom templates from files or falling back to built-in defaults.
 */
export class TemplateResolver {
	constructor(
		private app: App,
		private settings: TarotPracticeSettings
	) {}

	/**
	 * Get template for daily practice draws
	 */
	async getDailyTemplate(): Promise<string> {
		if (this.settings.useCustomDailyTemplate && this.settings.customDailyTemplatePath) {
			const template = await this.loadTemplateFile(this.settings.customDailyTemplatePath);
			if (template !== null) {
				return template;
			}
			// Fall through to built-in if file load failed
		}
		return BUILTIN_DAILY_TEMPLATE;
	}

	/**
	 * Get template for inline single-card draws
	 */
	async getInlineTemplate(): Promise<string> {
		if (this.settings.useCustomInlineTemplate && this.settings.customInlineTemplatePath) {
			const template = await this.loadTemplateFile(this.settings.customInlineTemplatePath);
			if (template !== null) {
				return template;
			}
			// Fall through to built-in if file load failed
		}
		return BUILTIN_INLINE_TEMPLATE;
	}

	/**
	 * Get template for multiple card draws
	 */
	async getMultipleTemplate(): Promise<string> {
		if (this.settings.useCustomMultipleTemplate && this.settings.customMultipleTemplatePath) {
			const template = await this.loadTemplateFile(this.settings.customMultipleTemplatePath);
			if (template !== null) {
				return template;
			}
			// Fall through to built-in if file load failed
		}
		return BUILTIN_MULTIPLE_TEMPLATE;
	}

	/**
	 * Load a template file from the vault
	 * @returns Template content, or null if file doesn't exist or can't be read
	 */
	private async loadTemplateFile(path: string): Promise<string | null> {
		try {
			const file = this.app.vault.getAbstractFileByPath(path);
			
			if (!file) {
				new Notice(`Template file not found: ${path}\nUsing built-in template.`);
				return null;
			}
			
			if (!(file instanceof TFile)) {
				new Notice(`Path is not a file: ${path}\nUsing built-in template.`);
				return null;
			}
			
			const content = await this.app.vault.read(file);
			return content;
			
		} catch (error) {
			console.error('Failed to load template file:', path, error);
			new Notice(`Failed to load template: ${path}\nUsing built-in template.`);
			return null;
		}
	}
}
