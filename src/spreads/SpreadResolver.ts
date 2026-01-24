import { App, TFile, Notice } from 'obsidian';
import { Spread } from '../core/spreads';
import { getBuiltInSpreadTemplate } from '../templates/BuiltInSpreadTemplates';
import { BUILTIN_SPREADS } from './BuiltInSpreads';

/**
 * Resolves spread definitions and their templates.
 * Handles loading custom spread templates from files or falling back to built-in defaults.
 * 
 * NOTE: This is separate from TemplateResolver for now, but could be unified in the future
 * if patterns emerge. Keeping separate makes it easier to maintain focused responsibilities.
 */
export class SpreadResolver {
	constructor(
		private app: App
	) {}

	/**
	 * Get a spread definition by ID
	 * First checks built-in spreads, then custom spreads from settings
	 */
	getSpread(spreadId: string, customSpreads: Spread[] = []): Spread | null {
		// Check built-in spreads first
		const builtIn = BUILTIN_SPREADS.find(s => s.id === spreadId);
		if (builtIn) {
			return builtIn;
		}

		// Check custom spreads
		const custom = customSpreads.find(s => s.id === spreadId);
		return custom || null;
	}

	/**
	 * Get all available spreads (built-in + custom)
	 * Applies any overrides to built-in spreads
	 */
	getAllSpreads(
		customSpreads: Spread[] = [], 
		builtInOverrides: Record<string, Partial<Spread>> = {}
	): Spread[] {
		// Apply overrides to built-in spreads
		const builtInWithOverrides = BUILTIN_SPREADS.map(spread => {
			const override = builtInOverrides[spread.id];
			if (override) {
				return { ...spread, ...override };
			}
			return spread;
		});
		
		return [...builtInWithOverrides, ...customSpreads];
	}

	/**
	 * Get template for a spread
	 * Loads from file if custom template specified, otherwise uses built-in template
	 */
	async getSpreadTemplate(spread: Spread): Promise<string> {
		// If custom template path specified, try to load it
		if (spread.templatePath && spread.templatePath.trim() !== '') {
			const template = await this.loadTemplateFile(spread.templatePath);
			if (template !== null) {
				return template;
			}
			// Fall through to built-in if file load failed
		}

		// Use built-in template
		return getBuiltInSpreadTemplate(spread.id);
	}

	/**
	 * Load a template file from the vault
	 * @returns Template content, or null if file doesn't exist or can't be read
	 */
	private async loadTemplateFile(path: string): Promise<string | null> {
		try {
			const file = this.app.vault.getAbstractFileByPath(path);
			
			if (!file) {
				new Notice(`Spread template file not found: ${path}\nUsing built-in template.`);
				return null;
			}
			
			if (!(file instanceof TFile)) {
				new Notice(`Path is not a file: ${path}\nUsing built-in template.`);
				return null;
			}
			
			const content = await this.app.vault.read(file);
			return content;
			
		} catch (error) {
			console.error('Failed to load spread template file:', path, error);
			new Notice(`Failed to load spread template: ${path}\nUsing built-in template.`);
			return null;
		}
	}
}
