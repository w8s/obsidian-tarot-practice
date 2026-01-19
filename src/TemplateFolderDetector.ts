import { App } from 'obsidian';

/**
 * Detects the best folder location for storing template files.
 * Checks Templater, Core Templates, and common conventions.
 */
export class TemplateFolderDetector {
	constructor(private app: App) {}

	/**
	 * Detect the best template folder location
	 * @returns Folder path, or null if no suitable folder found (use vault root)
	 */
	detectTemplateFolder(): string | null {
		// 1. Check Templater plugin settings
		const templaterFolder = this.getTemplaterFolder();
		if (templaterFolder) {
			return templaterFolder;
		}

		// 2. Check Core Templates plugin settings
		const coreTemplatesFolder = this.getCoreTemplatesFolder();
		if (coreTemplatesFolder) {
			return coreTemplatesFolder;
		}

		// 3. Check common convention folders
		if (this.app.vault.getAbstractFileByPath('Templates')) {
			return 'Templates';
		}
		if (this.app.vault.getAbstractFileByPath('templates')) {
			return 'templates';
		}

		// 4. No template folder found - will ask user or use vault root
		return null;
	}

	/**
	 * Get Templater plugin's template folder setting
	 */
	private getTemplaterFolder(): string | null {
		try {
			// @ts-ignore - accessing plugin settings
			const templater = this.app.plugins.plugins['templater-obsidian'];
			if (templater && templater.settings?.templates_folder) {
				return templater.settings.templates_folder;
			}
		} catch (error) {
			// Templater not installed or accessible
		}
		return null;
	}

	/**
	 * Get Core Templates plugin's template folder setting
	 */
	private getCoreTemplatesFolder(): string | null {
		try {
			// @ts-ignore - accessing internal config
			const config = this.app.internalPlugins.getPluginById('templates');
			if (config && config.enabled) {
				// @ts-ignore
				const folder = config.instance?.options?.folder;
				if (folder) {
					return folder;
				}
			}
		} catch (error) {
			// Core Templates not enabled or accessible
		}
		return null;
	}
}
