import { App, TFile } from 'obsidian';
import { TemplatePaths } from './TemplatePaths';
import { TarotPracticeSettings } from '../settings';
import { getBuiltInSpreadTemplate } from './BuiltInSpreadTemplates';

/**
 * Handles exporting/copying templates to the vault
 * Creates folders as needed and provides template content
 */
export class TemplateExporter {
	constructor(
		private app: App,
		private settings: TarotPracticeSettings
	) {}

	/**
	 * Create a customizable template from a built-in spread template
	 * @param spreadId - ID of the spread (e.g., 'celtic-cross')
	 * @returns Path to the created template file
	 */
	async createSpreadTemplateFromBuiltIn(spreadId: string): Promise<string> {
		const paths = new TemplatePaths(this.settings);
		const templatePath = paths.getSpreadTemplatePath(spreadId);
		
		// Get the built-in template content
		const content = getBuiltInSpreadTemplate(spreadId);
		
		// Create the template file
		await this.createTemplateFile(templatePath, content);
		
		return templatePath;
	}

	/**
	 * Create a customizable template from an example spread template
	 * @param exampleSpreadId - ID of the example spread (e.g., 'celtic-cross')
	 * @param targetSpreadId - ID of the target spread (e.g., 'my-custom-spread')
	 * @returns Path to the created template file
	 */
	async createSpreadTemplateFromExample(
		exampleSpreadId: string,
		targetSpreadId: string
	): Promise<string> {
		const paths = new TemplatePaths(this.settings);
		const templatePath = paths.getSpreadTemplatePath(targetSpreadId);
		
		// Get the example template content
		const content = getBuiltInSpreadTemplate(exampleSpreadId);
		
		// Create the template file
		await this.createTemplateFile(templatePath, content);
		
		return templatePath;
	}

	/**
	 * Create a template file at the specified path
	 * Creates parent folders if they don't exist
	 */
	private async createTemplateFile(path: string, content: string): Promise<void> {
		// Ensure parent folder exists
		const folderPath = path.substring(0, path.lastIndexOf('/'));
		await this.ensureFolderExists(folderPath);
		
		// Check if file already exists
		const existingFile = this.app.vault.getAbstractFileByPath(path);
		if (existingFile instanceof TFile) {
			// File exists - ask user if they want to overwrite
			// For now, just throw an error
			throw new Error(`Template already exists at ${path}`);
		}
		
		// Create the file
		await this.app.vault.create(path, content);
	}

	/**
	 * Ensure a folder exists, creating it and parent folders if needed
	 */
	private async ensureFolderExists(folderPath: string): Promise<void> {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		
		if (!folder) {
			// Folder doesn't exist - create it
			await this.app.vault.createFolder(folderPath);
		}
	}

	/**
	 * Get available example templates for spread creation
	 */
	getAvailableExamples(): Array<{ id: string; name: string }> {
		return [
			{ id: 'generic', name: 'Generic (works for any spread)' },
			{ id: 'single-card', name: 'Single Card' },
			{ id: 'three-card-ppf', name: 'Three Card - Past/Present/Future' },
			{ id: 'three-card-sao', name: 'Three Card - Situation/Action/Outcome' },
			{ id: 'five-card-week', name: 'Five Card - Week Ahead' },
			{ id: 'celtic-cross', name: 'Celtic Cross' }
		];
	}
}
