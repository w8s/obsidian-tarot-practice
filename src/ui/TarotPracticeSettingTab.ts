/* eslint-disable @typescript-eslint/no-deprecated -- display() is deprecated since 1.13.0 in favour of getSettingDefinitions(); migration deferred pending full settings search API adoption. TODO: migrate when implementing settings search support */
import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import TarotPracticePlugin from '../main';
import { InsertLocation } from '../settings';
import { TemplateMigrator } from '../templates/TemplateMigrator';
import { TemplateFolderDetector } from '../templates/TemplateFolderDetector';
import { TemplateMigrationModal } from '../modals/TemplateMigrationModal';
import { TemplateViewModal } from '../modals/TemplateViewModal';
import { TemplateEditModal } from '../modals/TemplateEditModal';
import { TemplateResolver } from '../templates/TemplateResolver';
import { SpreadResolver } from '../spreads/SpreadResolver';
import { SpreadViewModal } from '../modals/SpreadViewModal';
import { SpreadEditModal } from '../modals/SpreadEditModal';
import { SpreadCreateModal } from '../modals/SpreadCreateModal';
import { DeckInstallModal } from '../modals/DeckInstallModal';
import { DeckDetailsModal } from '../modals/DeckDetailsModal';
import { DeckRemoveConfirmModal } from '../modals/DeckRemoveConfirmModal';
import { Spread } from '../core/spreads';
import type { DeckDefinition } from '../types/deck';
import { SpreadLoader } from '../core/SpreadLoader';
import { SpreadExportFormatModal } from '../modals/SpreadExportFormatModal';
import { DrawHistoryModal } from '../modals/DrawHistoryModal';

export class TarotPracticeSettingTab extends PluginSettingTab {
	plugin: TarotPracticePlugin;

	constructor(app: App, plugin: TarotPracticePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('tarot-practice-settings');

		// Check if migration is needed
		const migrator = new TemplateMigrator(this.app, this.plugin.settings);
		if (migrator.needsMigration()) {
			this.showMigrationPrompt(migrator);
			return; // Don't show settings until migration is handled
		}

		// ===== DECK MANAGEMENT SECTION =====
		this.displayDeckManagement(containerEl);

		// ===== DRAW HISTORY SECTION (v1.8.2) =====
		this.displayDrawHistory(containerEl);

		// ===== DECK PREPARATION SECTION =====
		new Setting(containerEl).setName('Deck preparation').setHeading();
		containerEl.createDiv('setting-item-description', el => {
			el.setText('These settings apply to all draws (daily and inline)');
		});

		// Shuffle count
		const shuffleCountSetting = new Setting(containerEl)
			.setName('Number of shuffles')
			.setDesc('How many times to shuffle the deck before drawing (1-7)')
			.addSlider(slider => slider
				.setLimits(1, 7, 1)
				.setValue(this.plugin.settings.shuffleCount)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.shuffleCount = value;
					await this.plugin.saveSettings();
					// Update the display value
					shuffleCountSetting.controlEl.querySelector('.tarot-shuffle-count-value')!.textContent = `${value}`;
				}));
		
		// Add count display to the right of slider
		shuffleCountSetting.controlEl.createSpan({ 
			text: `${this.plugin.settings.shuffleCount}`,
			cls: 'tarot-shuffle-count-value'
		});

		// Cut deck toggle
		new Setting(containerEl)
			.setName('Cut deck')
			.setDesc('Cut the deck after shuffling (cut position influenced by intention)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.cutDeck)
				.onChange(async (value) => {
					this.plugin.settings.cutDeck = value;
					await this.plugin.saveSettings();
				}));

		// ===== DAILY TAROT PRACTICE SECTION =====
		new Setting(containerEl).setName('Daily practice').setHeading();

		// Toggle for using daily notes
		new Setting(containerEl)
			.setName('Use daily note')
			.setDesc('Automatically open/create daily note when no file is active')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useDailyNote)
				.onChange(async (value) => {
					this.plugin.settings.useDailyNote = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		// Daily note path pattern
		if (this.plugin.settings.useDailyNote) {
			new Setting(containerEl)
				.setName('Daily note path pattern')
				.setDesc('pattern for daily notes (e.g., YYYY-MM-DD.md or daily notes/YYYY-MM-DD.md)')
				.addText(text => text
					// eslint-disable-next-line obsidianmd/ui/sentence-case -- placeholder is a format pattern, not a sentence
					.setPlaceholder('YYYY-MM-DD.md')
					.setValue(this.plugin.settings.dailyNotePathPattern)
					.onChange(async (value) => {
						this.plugin.settings.dailyNotePathPattern = value;
						await this.plugin.saveSettings();
					}));
		}

		// Insert location settings
		new Setting(containerEl)
			.setName('Insert location')
			.setDesc('Where to insert the tarot draw in the file')
			.addDropdown(dropdown => dropdown
				.addOption('append', 'Append to end')
				.addOption('prepend', 'Prepend to beginning')
				.addOption('heading', 'Under heading')
				.setValue(this.plugin.settings.insertLocation)
				.onChange(async (value) => {
					this.plugin.settings.insertLocation = value as InsertLocation;
					await this.plugin.saveSettings();
					this.display();
				}));

		// Heading name if needed
		if (this.plugin.settings.insertLocation === 'heading') {
			new Setting(containerEl)
				.setName('Heading name')
				.setDesc('The heading to insert under (will be created if it doesn\'t exist)')
				.addText(text => text
					.setPlaceholder('## tarot')
					.setValue(this.plugin.settings.headingName)
					.onChange(async (value) => {
						this.plugin.settings.headingName = value;
						await this.plugin.saveSettings();
					}));
		}

		// ===== REVERSALS SECTION =====
		new Setting(containerEl).setName('Reversals').setHeading();

		// Enable reversals toggle
		new Setting(containerEl)
			.setName('Enable reversals')
			.setDesc('Allow cards to appear reversed in readings')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableReversals)
				.onChange(async (value) => {
					this.plugin.settings.enableReversals = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		// Only show reversal settings if enabled
		if (this.plugin.settings.enableReversals) {
			const reversalChanceSetting = new Setting(containerEl)
				.setName('Reversal chance')
				.setDesc('Probability of a card appearing reversed (0-100%)')
				.addSlider(slider => slider
					.setLimits(0, 100, 5)
					.setValue(this.plugin.settings.reversalChance)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.reversalChance = value;
						await this.plugin.saveSettings();
						// Update the display value
						reversalChanceSetting.controlEl.querySelector('.tarot-reversal-value')!.textContent = `${value}%`;
					}));
			
			// Add percentage display to the right of slider
			reversalChanceSetting.controlEl.createSpan({ 
				text: `${this.plugin.settings.reversalChance}%`,
				cls: 'tarot-reversal-value'
			});

			new Setting(containerEl)
				.setName('Upright indicator')
				// eslint-disable-next-line obsidianmd/ui/sentence-case -- intentional lowercase per Obsidian UI style for short descriptive phrases
				.setDesc('text to append for upright cards (leave empty for none)')
				.addText(text => text
					.setPlaceholder('')
					.setValue(this.plugin.settings.uprightIndicator)
					.onChange(async (value) => {
						this.plugin.settings.uprightIndicator = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Reversed indicator')
				// eslint-disable-next-line obsidianmd/ui/sentence-case -- intentional lowercase per Obsidian UI style for short descriptive phrases
				.setDesc('text to append for reversed cards')
				.addText(text => text
					// eslint-disable-next-line obsidianmd/ui/sentence-case -- placeholder mirrors the setting description style
					.setPlaceholder('reversed')
					.setValue(this.plugin.settings.reversedIndicator)
					.onChange(async (value) => {
						this.plugin.settings.reversedIndicator = value;
						await this.plugin.saveSettings();
					}));
		}

		// ===== TEMPLATE ORGANIZATION SECTION =====
		new Setting(containerEl).setName('Template organization').setHeading();
		containerEl.createDiv('setting-item-description', el => {
			el.setText('Configure where template files are stored in your vault');
		});

		// Show auto-detected folder if user hasn't set one
		const detector = new TemplateFolderDetector(this.app, this.plugin.settings);
		const autoDetected = detector.autoDetect();
		const isUsingDefault = !this.plugin.settings.templateBaseFolder;
		
		new Setting(containerEl)
			.setName('Template base folder')
			.setDesc('Base folder for all template files (leave empty to use auto-detection)')
			.addText(text => text
				.setPlaceholder(autoDetected || 'Templates/Tarot')
				.setValue(this.plugin.settings.templateBaseFolder)
				.onChange(async (value) => {
					this.plugin.settings.templateBaseFolder = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to update auto-detected folder display
				}));

		// Show what folder is actually being used
		if (isUsingDefault && autoDetected) {
			containerEl.createDiv('setting-item-description tarot-auto-detect-info', el => {
				el.setText(`🔍 Auto-detected: ${autoDetected}`);
			});
		}

		// ===== SPREADS SECTION =====
		new Setting(containerEl).setName('Spreads').setHeading();
		containerEl.createDiv('setting-item-description', el => {
			el.setText('Manage spread layouts for structured readings');
		});

		// Get all spreads (built-in + custom)
		const spreadResolver = new SpreadResolver(this.app);
		const allSpreads = spreadResolver.getAllSpreads(
			this.plugin.settings.customSpreads,
			this.plugin.settings.builtInSpreadOverrides
		);

		// Add spreads list
		allSpreads.forEach(spread => {
			this.addSpreadListItem(containerEl, spread);
		});

		// Spread action buttons
		new Setting(containerEl)
			.addButton(button => button
				.setButtonText('Create spread')
				.setCta()
				.onClick(() => {
					void new SpreadCreateModal(this.app, this.plugin.settings, (newSpread) => {
						void (async () => {
							// Add to custom spreads
							this.plugin.settings.customSpreads.push(newSpread);
							await this.plugin.saveSettings();
							this.display(); // Refresh UI
						})();
					}).open();
				}))
			.addButton(button => button
				.setButtonText('Import spread')
				.onClick(() => {
					void this.importSpread();
				}))
			.addButton(button => button
				.setButtonText('Export example spread')
				.onClick(() => {
					void this.exportExampleSpread();
				}));
	}

	/**
	 * Add a template list item with view/edit/reset actions
	 */
	addTemplateListItem(
		containerEl: HTMLElement,
		name: string,
		useCustomKey: 'useCustomDailyTemplate' | 'useCustomInlineTemplate' | 'useCustomMultipleTemplate',
		pathKey: 'customDailyTemplatePath' | 'customInlineTemplatePath' | 'customMultipleTemplatePath'
	): void {
		const isCustom = this.plugin.settings[useCustomKey];
		const customPath = this.plugin.settings[pathKey];
		const description = isCustom && customPath ? customPath : 'Built-in template';

		new Setting(containerEl)
			.setName(name)
			.setDesc(description)
			.addExtraButton(button => button
				.setIcon('document')
				.setTooltip('View template')
				.onClick(() => {
					void (async () => {
						// Get template content
						const resolver = new TemplateResolver(this.app, this.plugin.settings);
						let content: string;

						// Determine template type and get content
						if (useCustomKey === 'useCustomDailyTemplate') {
							content = await resolver.getDailyTemplate();
						} else if (useCustomKey === 'useCustomInlineTemplate') {
							content = await resolver.getInlineTemplate();
						} else {
							content = await resolver.getMultipleTemplate();
						}
						
						new TemplateViewModal(this.app, name, content).open();
					})();
				}))
			.addExtraButton(button => button
				.setIcon('pencil')
				.setTooltip('Edit template')
				.onClick(() => {
					new TemplateEditModal(
						this.app,
						name,
						customPath || '',
						(newPath) => {
							void (async () => {
								// Save the new path
								this.plugin.settings[useCustomKey] = newPath !== '';
								this.plugin.settings[pathKey] = newPath;
								await this.plugin.saveSettings();
								this.display(); // Refresh UI
							})();
						}
					).open();
				}))
			.addExtraButton(button => button
				.setIcon('reset')
				.setTooltip('Reset to built-in')
				.setDisabled(!isCustom) // Disable if already using built-in
				.onClick(() => {
					void (async () => {
						this.plugin.settings[useCustomKey] = false;
						this.plugin.settings[pathKey] = '';
						await this.plugin.saveSettings();
						this.display(); // Refresh UI
					})();
				}));
	}

	/**
	 * Add a spread list item with view/edit/delete actions
	 */
	addSpreadListItem(containerEl: HTMLElement, spread: Spread): void {
		// Build description with insert mode
		const insertModeLabel = spread.insertMode === 'daily-note' ? 'daily note' : 
		                        spread.insertMode === 'inline' ? 'inline' : 'new note';
		const description = `${spread.positions.length} card${spread.positions.length === 1 ? '' : 's'} • ${insertModeLabel}`;

		const setting = new Setting(containerEl)
			.setName(spread.name)
			.setDesc(description);

		// View button
		setting.addExtraButton(button => button
			.setIcon('document')
			.setTooltip('View spread details')
			.onClick(() => {
				new SpreadViewModal(this.app, spread).open();
			}));

		// Edit button
		setting.addExtraButton(button => button
			.setIcon('pencil')
			.setTooltip('Edit spread settings')
			.onClick(() => {
				new SpreadEditModal(this.app, spread, this.plugin.settings, (updatedSpread, isReset) => {
					void (async () => {
						if (spread.isBuiltIn) {
							if (isReset) {
								// Remove override to reset to default
								delete this.plugin.settings.builtInSpreadOverrides[spread.id];
							} else {
								// Store full spread override
								this.plugin.settings.builtInSpreadOverrides[spread.id] = {
									description: updatedSpread.description,
									positions: updatedSpread.positions,
									insertMode: updatedSpread.insertMode,
									shuffleCount: updatedSpread.shuffleCount,
									cutDeck: updatedSpread.cutDeck,
									templatePath: updatedSpread.templatePath
								};
							}
							await this.plugin.saveSettings();
							this.display(); // Refresh UI
						} else {
							// Update custom spread
							const index = this.plugin.settings.customSpreads.findIndex(s => s.id === spread.id);
							if (index !== -1) {
								this.plugin.settings.customSpreads[index] = updatedSpread;
								await this.plugin.saveSettings();
								this.display(); // Refresh UI
							}
						}
					})();
				}).open();
			}));

		// Export button (only for custom spreads)
		if (!spread.isBuiltIn) {
			setting.addExtraButton(button => button
				.setIcon('download')
				.setTooltip('Export spread')
				.onClick(() => {
					void this.exportSpread(spread);
				}));
		}

		// Delete button (only for custom spreads)
		if (!spread.isBuiltIn) {
			setting.addExtraButton(button => button
				.setIcon('trash')
				.setTooltip('Delete custom spread')
				.onClick(() => {
					void (async () => {
						// Remove from custom spreads
						this.plugin.settings.customSpreads = this.plugin.settings.customSpreads.filter(s => s.id !== spread.id);
						await this.plugin.saveSettings();
						this.display(); // Refresh UI
					})();
				}));
		}
	}

	/**
	 * Show migration prompt to user
	 */
	private showMigrationPrompt(migrator: TemplateMigrator): void {
		const { containerEl } = this;
		
		// Show explanation
		new Setting(containerEl).setName('Template system update').setHeading();
		containerEl.createEl('p', {
			text: 'The tarot practice plugin now uses file-based templates. Would you like to migrate your customized templates?'
		});

		new Setting(containerEl)
			.setName('Migrate templates')
			.setDesc('Convert your inline templates to files in your vault')
			.addButton(button => button
				.setButtonText('Migrate now')
				.setCta()
				.onClick(async () => {
					const detector = new TemplateFolderDetector(this.app, this.plugin.settings);
					const detectedFolder = detector.detectTemplateFolder();
					const templates = migrator.getExistingTemplates();

					new TemplateMigrationModal(
						this.app,
						detectedFolder,
						templates,
						async (folderPath) => {
							await migrator.migrate(folderPath);
							await this.plugin.saveSettings();
							this.display(); // Refresh settings
						}
					).open();
				}));

		new Setting(containerEl)
			.setName('Skip migration')
			.setDesc('Use built-in templates and mark migration as complete')
			.addButton(button => button
				.setButtonText('Skip')
				.onClick(async () => {
					this.plugin.settings.hasTemplatesMigrated = true;
					await this.plugin.saveSettings();
					this.display(); // Refresh settings
				}));
	}

	private displayDeckManagement(containerEl: HTMLElement): void {
		new Setting(containerEl).setName('Deck management').setHeading();
		
		// Default deck dropdown
		const deckRegistry = this.plugin.deckRegistry;
		const allDecks = deckRegistry.getAllDecks();
		
		const deckOptions: Record<string, string> = {};
		for (const deck of allDecks) {
			deckOptions[deck.id] = deck.name;
		}

		new Setting(containerEl)
			.setName('Default deck')
			.setDesc('Deck to use when no spread-specific deck is set')
			.addDropdown(dropdown => dropdown
				.addOptions(deckOptions)
				.setValue(this.plugin.settings.defaultDeckId)
				.onChange(async (value) => {
					this.plugin.settings.defaultDeckId = value;
					await this.plugin.saveSettings();
				}));

		// Remember deck per spread toggle
		new Setting(containerEl)
			.setName('Remember last deck per spread')
			.setDesc('Each spread remembers the last deck used. When disabled, always use default deck.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.rememberDeckPerSpread)
				.onChange(async (value) => {
					this.plugin.settings.rememberDeckPerSpread = value;
					await this.plugin.saveSettings();
				}));

		// Deck list
		new Setting(containerEl).setName('Available decks').setHeading();

		for (const deck of allDecks) {
			this.addDeckListItem(containerEl, deck);
		}

		// Add Deck button
		new Setting(containerEl)
			.addButton(button => button
				.setButtonText('Add deck')
				.setCta()
				.onClick(() => {
					new DeckInstallModal(
						this.app,
						this.plugin,
						() => this.display() // Refresh settings after installation
					).open();
				}))
			.addButton(button => button
				.setButtonText('Export example deck')
				.onClick(() => {
					void this.exportExampleDeck();
				}));
	}

	/**
	 * Add a deck list item (similar to spread list items)
	 */
	private addDeckListItem(containerEl: HTMLElement, deck: DeckDefinition): void {
		// Build description
		const builtInLabel = deck.isBuiltIn ? ' (Built-in)' : '';
		const reversalsText = deck.supportsReversals ? 'supports reversals' : 'no reversals';
		const description = `${deck.cardCount} cards, ${reversalsText}`;

		const setting = new Setting(containerEl)
			.setName(deck.name + builtInLabel)
			.setDesc(description);

		// View details button
		setting.addExtraButton(button => button
			.setIcon('document')
			.setTooltip('View deck details')
			.onClick(() => {
				new DeckDetailsModal(this.app, deck, this.plugin).open();
			}));

		// Remove button (only for custom decks)
		if (!deck.isBuiltIn) {
			setting.addExtraButton(button => button
				.setIcon('trash')
				.setTooltip('Remove deck')
				.onClick(() => {
					new DeckRemoveConfirmModal(
						this.app,
						this.plugin,
						deck,
						() => this.display() // Refresh after removal
					).open();
				}));
		}
	}

	private async exportExampleDeck(): Promise<void> {
		const exampleDeck = {
			id: "example-oracle",
			name: "Example Oracle Deck",
			description: "A simple example deck to demonstrate the JSON format",
			cards: [
				{
					index: 0,
					name: "New Beginnings",
					category: "Oracle",
					suit: null,
					rank: null,
					value: null
				},
				{
					index: 1,
					name: "Inner Wisdom",
					category: "Oracle",
					suit: null,
					rank: null,
					value: null
				},
				{
					index: 2,
					name: "Transformation",
					category: "Oracle",
					suit: null,
					rank: null,
					value: null
				}
			],
			cardCount: 3,
			supportsReversals: false,
			isBuiltIn: false,
			metadata: {
				author: "Your Name",
				year: 2025,
				publisher: "Self Published",
				tradition: "oracle"
			}
		};

		const json = JSON.stringify(exampleDeck, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		
		const a = activeDocument.createElement('a');
		a.href = url;
		a.download = 'example-deck.json';
		a.click();
		
		URL.revokeObjectURL(url);
		
		new Notice('Example deck exported! Edit and install via "add deck".');
	}

	/**
	 * Import spread from file (JSON or ZIP)
	 */
	private async importSpread(): Promise<void> {
		// Create file input
		const input = activeDocument.createElement('input');
		input.type = 'file';
		input.accept = '.json,.zip';
		
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;

			try {
				const loader = new SpreadLoader(this.plugin);
				
				// Install based on file type
				if (file.name.endsWith('.zip')) {
					await loader.installFromZIP(file);
				} else {
					await loader.installFromJSON(file);
				}
				
				// Refresh settings UI
				this.display();
			} catch (error) {
				const msg = error instanceof Error ? error.message : String(error);
				new Notice(`Failed to import spread: ${msg}`);
				console.error('Spread import error:', error);
			}
		};
		
		input.click();
	}

	/**
	 * Export a spread (prompt for format: JSON or ZIP with template)
	 */
	private async exportSpread(spread: Spread): Promise<void> {
		try {
			const loader = new SpreadLoader(this.plugin);
			
			// Check if spread has a template
			const hasTemplate = spread.templatePath && spread.templatePath.trim() !== '';
			
			// If no template, just export JSON
			if (!hasTemplate) {
				const { blob, filename } = await loader.exportSpread(spread, false);
				this.downloadBlob(blob, filename);
				new Notice(`Spread "${spread.name}" exported as JSON`);
				return;
			}
			
			// Ask user if they want to include template
			const includeTemplate = await this.confirmIncludeTemplate(spread);
			const { blob, filename } = await loader.exportSpread(spread, includeTemplate);
			this.downloadBlob(blob, filename);
			
			const format = includeTemplate ? 'ZIP with template' : 'JSON only';
			new Notice(`Spread "${spread.name}" exported as ${format}`);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to export spread: ${msg}`);
			console.error('Spread export error:', error);
		}
	}

	/**
	 * Ask user if they want to include template in export
	 */
	private async confirmIncludeTemplate(spread: Spread): Promise<boolean> {
		return new Promise((resolve) => {
			new SpreadExportFormatModal(this.app, spread.name, resolve).open();
		});
	}

	/**
	 * Download blob as file
	 */
	private downloadBlob(blob: Blob, filename: string): void {
		const url = URL.createObjectURL(blob);
		const a = activeDocument.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	/**
	 * Export an example spread for users to learn the format
	 */
	private async exportExampleSpread(): Promise<void> {
		const exampleSpread: Spread = {
			id: "example-three-card",
			name: "Example Three Card Spread",
			description: "A simple three card spread for demonstration",
			isBuiltIn: false,
			positions: [
				{
					label: "Past",
					description: "Influences from the past"
				},
				{
					label: "Present",
					description: "Current situation"
				},
				{
					label: "Future",
					description: "Potential outcome"
				}
			],
			shuffleCount: 3,
			cutDeck: true,
			templatePath: "",
			insertMode: "inline"
		};

		const json = JSON.stringify(exampleSpread, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		this.downloadBlob(blob, 'example-three-card.json');
		// eslint-disable-next-line obsidianmd/ui/sentence-case -- Notice text uses mid-sentence reference to a UI label; capitalising would be inconsistent
		new Notice('Example spread exported! Edit and import via "Import spread".');
	}

	/**
	 * Display draw history section (v1.8.2)
	 */
	private displayDrawHistory(containerEl: HTMLElement): void {
		new Setting(containerEl).setName('Draw history').setHeading();

		const totalDraws = this.plugin.drawHistory.getTotalDraws();
		
		containerEl.createDiv('setting-item-description', el => {
			el.setText(`${totalDraws} draw${totalDraws !== 1 ? 's' : ''} recorded`);
		});

		// View History button
		new Setting(containerEl)
			.setName('View draw history')
			.setDesc('View recent draws and statistics')
			.addButton(button => button
				.setButtonText('View history')
				.setCta()
				.onClick(() => {
					new DrawHistoryModal(this.app, this.plugin).open();
				}));
	}
}

