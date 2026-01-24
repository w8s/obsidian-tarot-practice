import { App } from 'obsidian';
import { TarotPracticeSettings } from './settings';

/**
 * Type definitions for accessing private Obsidian APIs
 * These interfaces match the internal structure of Obsidian's plugin system
 */

/**
 * Settings structure for the Templater plugin
 */
interface TemplaterSettings {
	templates_folder?: string;
}

/**
 * Templater plugin structure
 */
interface TemplaterPlugin {
	settings?: TemplaterSettings;
}

/**
 * Extended App interface with access to community plugins
 */
interface AppWithPlugins extends App {
	plugins: {
		plugins: Record<string, TemplaterPlugin>;
	};
}

/**
 * Core Templates plugin configuration
 */
interface CoreTemplatesConfig {
	enabled: boolean;
	instance?: {
		options?: {
			folder?: string;
		};
	};
}

/**
 * Extended App interface with access to internal plugins
 */
interface AppWithInternalPlugins extends App {
	internalPlugins: {
		getPluginById(id: string): CoreTemplatesConfig | undefined;
	};
}

/**
 * Detects the best folder location for storing template files.
 * Checks user settings first, then falls back to auto-detection from
 * Templater, Core Templates, and common conventions.
 */
export class TemplateFolderDetector {
	constructor(
		private app: App,
		private settings: TarotPracticeSettings
	) {}

	/**
	 * Detect the best template folder location using a hybrid approach:
	 * 1. User setting (highest priority - explicit user choice)
	 * 2. Auto-detection (convenience - check other plugins)
	 * 3. Default fallback (always have a valid path)
	 * 
	 * @returns Folder path (never null - always returns a valid path)
	 */
	detectTemplateFolder(): string {
		// 1. User has explicitly set a template folder - respect their choice
		if (this.settings.templateBaseFolder) {
			return this.settings.templateBaseFolder;
		}

		// 2. Try auto-detection from other plugins and conventions
		const autoDetected = this.autoDetect();
		if (autoDetected) {
			return autoDetected;
		}

		// 3. Fallback to sensible default
		return 'Templates/Tarot';
	}

	/**
	 * Auto-detect template folder from other plugins and conventions
	 * Public for display in settings UI
	 * @returns Detected folder path, or null if nothing found
	 */
	public autoDetect(): string | null {
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

		// 4. No template folder found
		return null;
	}

	/**
	 * Get Templater plugin's template folder setting
	 */
	private getTemplaterFolder(): string | null {
		try {
			// Access community plugins through typed interface
			const appWithPlugins = this.app as AppWithPlugins;
			const templater = appWithPlugins.plugins.plugins['templater-obsidian'];
			
			if (templater?.settings?.templates_folder) {
				return templater.settings.templates_folder;
			}
		} catch {
			// Templater not installed or accessible
		}
		return null;
	}

	/**
	 * Get Core Templates plugin's template folder setting
	 */
	private getCoreTemplatesFolder(): string | null {
		try {
			// Access internal plugins through typed interface
			const appWithInternalPlugins = this.app as AppWithInternalPlugins;
			const config = appWithInternalPlugins.internalPlugins.getPluginById('templates');
			
			if (config?.enabled && config.instance?.options?.folder) {
				return config.instance.options.folder;
			}
		} catch {
			// Core Templates not enabled or accessible
		}
		return null;
	}
}
