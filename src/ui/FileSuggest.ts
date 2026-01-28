import { AbstractInputSuggest, App, TFile } from 'obsidian';

/**
 * File suggestion component for template selection.
 * Provides autocomplete file picker similar to Periodic Notes.
 */
export class FileSuggest extends AbstractInputSuggest<TFile> {
	constructor(
		public app: App,
		public inputEl: HTMLInputElement
	) {
		super(app, inputEl);
	}

	getSuggestions(inputStr: string): TFile[] {
		const abstractFiles = this.app.vault.getAllLoadedFiles();
		const files: TFile[] = [];
		const lowerCaseInputStr = inputStr.toLowerCase();

		abstractFiles.forEach((file: TFile) => {
			if (
				file instanceof TFile &&
				file.extension === 'md' &&
				file.path.toLowerCase().contains(lowerCaseInputStr)
			) {
				files.push(file);
			}
		});

		return files.slice(0, 20); // Limit to 20 suggestions
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		// Display path without .md extension for cleaner UI
		const pathWithoutExt = file.path.replace(/\.md$/, '');
		el.setText(pathWithoutExt);
	}

	selectSuggestion(file: TFile): void {
		// Store the FULL path including .md extension
		// (display may not show it, but the value must include it for file resolution)
		this.inputEl.value = file.path;
		this.inputEl.trigger('input');
		this.close();
	}
}
