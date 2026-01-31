/**
 * Mock implementation of Obsidian API for testing
 */

export class App {
	vault: Vault;
	workspace: Workspace;

	constructor() {
		this.vault = new Vault();
		this.workspace = new Workspace();
	}
}

export class Vault {
	files: Map<string, string> = new Map();

	async read(file: TFile): Promise<string> {
		const content = this.files.get(file.path);
		if (!content) throw new Error(`File not found: ${file.path}`);
		return content;
	}

	async modify(file: TFile, content: string): Promise<void> {
		this.files.set(file.path, content);
	}

	async create(path: string, content: string): Promise<TFile> {
		this.files.set(path, content);
		return new TFile(path);
	}

	getAbstractFileByPath(path: string): TAbstractFile | null {
		return this.files.has(path) ? new TFile(path) : null;
	}
}

export class Workspace {
	activeFile: TFile | null = null;

	getActiveFile(): TFile | null {
		return this.activeFile;
	}
}

export class TFile {
	path: string;
	basename: string;
	extension: string;

	constructor(path: string) {
		this.path = path;
		const parts = path.split('/');
		const filename = parts[parts.length - 1];
		const [base, ...ext] = filename.split('.');
		this.basename = base;
		this.extension = ext.join('.');
	}
}

export abstract class TAbstractFile {
	path: string;
	constructor(path: string) {
		this.path = path;
	}
}

export class Modal {
	app: App;
	contentEl: HTMLElement;

	constructor(app: App) {
		this.app = app;
		this.contentEl = document.createElement('div');
	}

	open(): void {}
	close(): void {}
	onOpen(): void {}
	onClose(): void {}
}

export class Notice {
	constructor(message: string) {
		console.log(`Notice: ${message}`);
	}
}

export class Setting {
	constructor(containerEl: HTMLElement) {}
	setName(name: string): this { return this; }
	setDesc(desc: string): this { return this; }
	addText(cb: (component: any) => void): this { return this; }
	addToggle(cb: (component: any) => void): this { return this; }
	addDropdown(cb: (component: any) => void): this { return this; }
	addButton(cb: (component: any) => void): this { return this; }
}

export abstract class Plugin {
	app: App;
	manifest: any;

	constructor(app: App, manifest: any) {
		this.app = app;
		this.manifest = manifest;
	}

	async loadData(): Promise<any> {
		return {};
	}

	async saveData(data: any): Promise<void> {}

	addCommand(command: any): void {}
	addRibbonIcon(icon: string, title: string, callback: () => void): void {}
	addSettingTab(tab: any): void {}
}

export abstract class PluginSettingTab {
	app: App;
	plugin: Plugin;
	containerEl: HTMLElement;

	constructor(app: App, plugin: Plugin) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = document.createElement('div');
	}

	display(): void {}
	hide(): void {}
}
