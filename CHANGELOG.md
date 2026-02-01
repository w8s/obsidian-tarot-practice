# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.8.6] - 2025-01-31

### Added
- Comprehensive test suite with 28 tests covering deck validation, template rendering, and card drawing
- Automated CI/CD workflows - tests run on every push and before releases
- Security documentation with inclusive, fact-based language
- Development workflow documentation for contributors
- Test status badge in README

### Changed
- Updated rng-with-intention to v0.3.2 (improved RNG implementation)
- GitHub Actions workflows now use explicit least-privilege permissions
- Organized documentation into docs/ directory

### Infrastructure
- Added Vitest testing framework with UI and coverage reporting
- Configured Dependabot, CodeQL, and Secret Scanning for security monitoring
- All releases now require passing tests before publishing

## [1.8.5] - 2025-01-29

### Fixed
- Corrected manifest.json description to match current plugin capabilities

## [1.8.4] - 2025-01-28

### Improved
- **Template Selection UI** - Completely redesigned template picker in spread editor
  - Replaced confusing dropdown with clear toggle switch ("Use built-in template")
  - Added direct file input with autocomplete for custom templates (FileSuggest)
  - "Create from example..." is now a dedicated button (easier to discover)
  - Better visual hierarchy showing current template status
  - More intuitive workflow for both casual and advanced users

## [1.8.3] - 2025-01-27

### Fixed
- Template file picker now correctly stores full file paths with `.md` extension
- Custom spread templates can now be loaded from files (previously fell back to built-in templates)
- Reduced console logging noise - only warnings and errors are logged now

## [1.8.2] - 2025-01-26

### Added
- **Draw History Tracking** - Automatic tracking of all spread draws
  - Records spread name, deck used, cards drawn, intention, and querent
  - Tracks shuffle metadata (shuffle count, cut status, cut position)
  - Stores up to 1,000 draws with automatic pruning
  - Data syncs seamlessly via Obsidian Sync (stored in plugin data.json)
  
- **History Statistics** - SQL-powered analytics with AlaSQL
  - Most used decks (with draw counts)
  - Most used spreads (with draw counts)
  - Most frequent cards (across all draws)
  - Readings by querent (if querent tracking enabled)
  - Date range statistics (draws per day, unique decks/spreads)
  
- **History Viewer Modal** - Browse and analyze your draw history
  - Recent draws tab: View last 20 draws with full details
  - Statistics tab: Aggregated insights about your practice
  - Clear history button with confirmation dialog
  - Access via Settings → Tarot Practice → Draw History section
  
- **Export Functionality** - Download history for external analysis
  - Export as JSON: Complete structured data with all fields
  - Export as CSV: Spreadsheet-friendly format for Excel/Google Sheets
  - Timestamps in both Unix and ISO formats for flexibility
  - Proper CSV escaping for complex text fields

### Technical
- Integrated AlaSQL library for SQL-like queries on JSON data
- Uses native JavaScript filtering/sorting for simple queries
- AlaSQL aggregation for GROUP BY, COUNT, and DISTINCT operations
- DrawHistory class with comprehensive query methods
- Type-safe interfaces for history entries and statistics

## [1.8.1] - 2025-01-25

### Added
- **Spread Import/Export** - Share custom spreads with the community
  - Import spreads from JSON or ZIP files
  - Export spreads as JSON (definition only) or ZIP (with template)
  - File picker for easy spread installation
  - Settings UI with Import/Export buttons matching deck section
  - Export button on custom spreads for quick sharing
  - Export example spread template for learning format

- **SpreadValidator** - Validates spread structure before import
  - Required fields: id, name, positions array
  - Position validation: labels required, order preserved
  - ID format checking (lowercase, hyphens only)
  - Metadata completeness recommendations
  - Clear error messages for troubleshooting

- **SpreadLoader** - Handles import/export operations
  - `installFromJSON()` - Import spread definition
  - `installFromZIP()` - Import spread with bundled template
  - `exportSpread()` - Export as JSON or ZIP with template
  - Template extraction to `{templateBaseFolder}/Spreads/{spread-id}/`
  - Automatic templatePath updating for vault paths

- **SpreadExportFormatModal** - Choose export format
  - "ZIP with template" - Bundles spread.json + template.md
  - "JSON only" - Lightweight spread definition

### Changed
- Settings UI now matches deck management pattern
  - Three action buttons: Create | Import | Export Example
  - Individual spread export buttons (download icon)
  - Consistent button styling across sections

### Technical
- Zero ESLint errors
- Clean separation: SpreadValidator (validation), SpreadLoader (I/O)
- Spreads remain in settings.customSpreads (no migration needed)
- File-based system is additive, not replacing settings storage
- Template bundling works with existing vault-based templates

### Notes
- **No migration needed** - Zero users exist, no backward compat issues
- Settings-based spreads continue working via SpreadResolver
- File-based import/export enables community sharing
- Can deprecate settings-based spreads in v2.0 if needed

## [1.8.0] - 2025-01-25

### Added
- **ZIP Deck Support** - Import complete deck packages with card images
  - One-click installation from ZIP files containing deck.json + images
  - Auto-extracts card images to vault (`{templateBaseFolder}/Decks/{deck-id}/cards/`)
  - Images stored in vault for Obsidian wikilink compatibility
  - Maintains backward compatibility with JSON-only deck imports
  - File picker accepts both `.json` and `.zip` files
  - Integrated with [obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks) repository releases
  
- **Vault-Based Image Storage**
  - Images extracted to vault location (default: `Templates/Tarot/Decks/`)
  - Works with Obsidian's `![[image]]` wikilink syntax
  - Respects user's template base folder setting
  - Portable deck.json files with relative image paths
  - Path resolution at render time for flexibility

- **sourceUrl Support** - Restore deleted deck images
  - Optional `sourceUrl` field in deck.json
  - "Restore images" button in deck details modal
  - Re-downloads and extracts images from GitHub releases
  - No duplicate storage - images recoverable on demand
  - Future-proof for deck updates and community sharing

- **Image Path Template Variables**
  - `{{card.imageUrl}}` - Vault path to card image
  - `{{card.image}}` - Formatted wikilink `![[path]]`
  - `{{deck_back_image_url}}` - Vault path to deck back
  - `{{deck_back_image}}` - Formatted wikilink for deck back

### Changed
- **UI Consistency Improvements**
  - Deck display now matches Spreads section pattern (Setting components with icon buttons)
  - "Create custom spread" button styling matches "Add deck" button
  - Cleaner, more consistent settings interface

- **Deck Removal** - Now cleans up both config and images
  - Removes deck.json from plugin directory
  - Removes images from vault directory
  - No orphaned files after deck removal

### Technical
- DRY refactoring: shared `installDeck()` helper eliminates duplication between JSON and ZIP installers
- Added JSZip library for ZIP extraction
- Uses Obsidian's `requestUrl()` for downloading decks (not `fetch()`)
- Proper error handling with cleanup on failed installations
- Validates ZIP structure before extraction (requires deck.json in root)
- Type-safe plugin access (TarotPracticePlugin instead of Plugin)
- Zero ESLint errors with proper async/await patterns

### Fixed
- Type safety issues with settings access
- Async event handler warnings in modals
- Duplicate code in deck installation paths

## [1.7.1] - 2025-01-25

### Changed
- **Moved example decks to separate repository** - Plugin now ships with RWS tarot only
  - Example decks (Elder Futhark, Lenormand, Playing Cards, I Ching) moved to [obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks)
  - Smaller plugin bundle size (~50KB lighter)
  - Decks available as free downloads with complete documentation
  - Foundation for community deck sharing and contributions

### Updated
- README now points to deck repository for additional decks
- Deck creation documentation moved to external repository
- Updated roadmap to reflect deck repository milestone

## [1.7.0] - 2025-01-25

### Added
- **Multi-Deck Support** - Use any divination deck, not just tarot!
  - Install custom decks via JSON files
  - Deck validation with helpful error messages
  - Deck registry manages built-in and custom decks
  - Per-spread deck persistence (remembers your choice)
  - Deck selection dropdown in spread draw modal
  - Works with any card count (24 runes, 36 Lenormand, 52 playing cards, etc.)

- **Deck Management UI** (Settings → Deck Management)
  - View all installed decks with card counts and reversal support
  - Install decks from JSON files
  - View detailed deck information (metadata, card list)
  - Remove custom decks (built-in decks protected)
  - Export example deck as template
  - Set default deck for all spreads
  - Toggle "Remember deck per spread" setting

- **Five Public Domain Example Decks** (`/example-decks/`)
  - **Elder Futhark Runes** (24 runes) - Norse divination, 2nd-8th century CE
  - **Petit Lenormand** (36 cards) - French cartomancy, early 1800s
  - **Playing Cards** (52 cards) - Standard deck divination, medieval Europe
  - **I Ching** (64 hexagrams) - Ancient Chinese oracle, 3000+ years old
  - **Example Oracle** (3 cards) - Simple template (via Export button)

- **New Template Variables**
  - `{{deck_name}}`, `{{deck_id}}`, `{{deck_type}}`
  - `{{deck_card_count}}`, `{{deck_supports_reversals}}`
  - `{{card.imageUrl}}`, `{{card.image}}` - Card image support
  - `{{deck_back_image_url}}`, `{{deck_back_image}}` - Deck back image support

- **Image Path Support** - Display card and deck images in readings
  - Works with relative paths (deck directory) or vault paths
  - Auto-formatted as Obsidian wikilinks `![[path]]`
  - Empty string when images not defined (template-safe)
  - Full documentation in TEMPLATE-VARIABLES.md

- **New Core Components**
  - `DeckValidator` - Validates deck structure, card indices, duplicates
  - `DeckLoader` - Loads decks from plugin directory
  - `DeckRegistry` - Manages all available decks
  - `DeckInstallModal` - Install wizard for new decks
  - `DeckDetailsModal` - View deck information
  - `DeckRemoveConfirmModal` - Safe deck removal

### Changed
- **Spread Drawing** - Now uses selected deck instead of hardcoded RWS
  - `prepareDeck()` accepts any card count
  - Card names pulled from selected deck
  - Works with decks from 3 to 100+ cards
- **Settings Structure** - New deck-related settings
  - `defaultDeckId` - Default deck for new readings
  - `rememberDeckPerSpread` - Persist deck choice per spread type
  - `perSpreadDeckIds` - Stores deck selections
  - `ignoredDeckWarnings` - Suppresses duplicate warnings
- **DeckType** - Added `"runes"` to supported deck types
- **Deck Interface** - Added optional `definition` field with full DeckDefinition

### Technical
- Zero ESLint errors across all new code
- TypeScript strict mode compliance
- Cross-platform compatibility (desktop + mobile)
- Comprehensive validation with helpful error messages
- Backward compatible - existing RWS deck still works
- Example decks included in repository

### Notes
- All example decks are public domain and freely usable
- Deck JSON format documented in `/example-decks/README.md`
- ZIP deck installation planned for future release
- Users can create custom decks for any divination system
  - **Elder Futhark Runes** (24 runes) - Norse divination, 2nd-8th century CE
  - **Petit Lenormand** (36 cards) - French cartomancy, early 1800s
  - **Playing Cards** (52 cards) - Standard deck divination, medieval Europe
  - **I Ching** (64 hexagrams) - Ancient Chinese oracle, 3000+ years old
  - **Example Oracle** (3 cards) - Simple template (via Export button)

- **New Template Variables**
  - `{{deck_name}}` - Display name (e.g., "Elder Futhark Runes")
  - `{{deck_id}}` - Unique identifier
  - `{{deck_type}}` - Deck tradition (tarot, oracle, lenormand, runes, etc.)
  - `{{deck_card_count}}` - Total cards in deck
  - `{{deck_supports_reversals}}` - true/false

- **New Core Components**
  - `DeckValidator` - Validates deck structure, card indices, duplicates
  - `DeckLoader` - Loads decks from plugin directory
  - `DeckRegistry` - Manages all available decks
  - `DeckInstallModal` - Install wizard for new decks
  - `DeckDetailsModal` - View deck information
  - `DeckRemoveConfirmModal` - Safe deck removal

### Changed
- **Spread Drawing** - Now uses selected deck instead of hardcoded RWS
  - `prepareDeck()` accepts any card count
  - Card names pulled from selected deck
  - Works with decks from 3 to 100+ cards
- **Settings Structure** - New deck-related settings
  - `defaultDeckId` - Default deck for new readings
  - `rememberDeckPerSpread` - Persist deck choice per spread type
  - `perSpreadDeckIds` - Stores deck selections
  - `ignoredDeckWarnings` - Suppresses duplicate warnings

### Technical
- Zero ESLint errors across all new code
- TypeScript strict mode compliance
- Cross-platform compatibility (desktop + mobile)
- Comprehensive validation with helpful error messages
- Backward compatible - existing RWS deck still works
- Example decks included in repository

### Notes
- All example decks are public domain and freely usable
- Deck JSON format documented in `/example-decks/README.md`
- ZIP deck installation planned for future release
- Users can create custom decks for any divination system

## [1.6.1] - 2025-01-24

### Added
- **DeckDefinition Interface** - Infrastructure for future multi-deck support
  - New `DeckDefinition` type in `src/types/deck.ts`
  - Includes deck metadata: id, name, description, card count, reversal support
  - Deck metadata fields: author, year, publisher, tradition
- **RWS_DECK Constant** - Complete Rider-Waite-Smith deck definition
  - All 78 cards now use structured `CardDefinition` objects
  - Full metadata for every card: index, name, category, suit, rank, value
  - Helper functions: `createMajorCard()`, `createMinorCard()`, `createSuit()`
- **New Utility Functions**
  - `getCard(index)` - Returns full CardDefinition with metadata
  - `getDeck()` - Returns complete DeckDefinition

### Changed
- **CardDatabase.ts** - Converted from string array to structured deck
  - Major Arcana: All 22 cards with category="Major", value=0-21
  - Minor Arcana: All 56 cards with category="Minor", suit, rank, value
  - Programmatic suit generation for consistency

### Technical
- 100% backward compatible - `RWS_CARDS` still exported (points to `RWS_DECK.cards`)
- `getCardName()` function unchanged - existing code works without modification
- Zero breaking changes - purely additive infrastructure
- Zero ESLint errors
- Sets foundation for v1.7.0 deck switching feature

### Notes
- This is internal infrastructure only - no user-facing changes
- Prepares for future multi-deck support (v1.7.0+)
- All existing templates and functionality work unchanged

## [1.6.0] - 2025-01-24

### Added
- **Querent Tracking** - Optional feature to track who a reading is for
  - Toggle checkbox in draw modal: "Reading for someone else?"
  - Name field (required when enabled)
  - Note path field (optional) with file autocomplete suggester
  - Template variables: `{{querent.name}}`, `{{querent.notePath}}`, `{{querent.hasPath}}`
  - Automatic wikilink formatting in templates when note path is provided
  - Querent info added to `SpreadDrawResult` interface
  - Example: `{{#if querent}}**Querent:** [[{{querent.notePath}}|{{querent.name}}]]{{/if}}`

### Changed
- **FileSuggest Component** - Now displays file paths without `.md` extension for cleaner UI
- **README Templates Section** - Updated with correct Handlebars loop syntax and querent examples
  - Removed outdated Basic Example
  - Updated Spread Example to show proper `{{#each cards}}` structure
  - Added querent variables to Quick Reference

### Removed
- **Dead Code Cleanup** - Removed 200+ lines of unused legacy code
  - Deleted unused `DrawResult` interface (legacy single-card draw)
  - Deleted unused `MultipleDrawResult` interface (legacy multi-card draw)
  - Deleted unused `TarotDrawModal` class (never instantiated)
  - Removed `formatSingle()` and `formatMultiple()` methods from SpreadFormatter
  - Removed `prepareSingleDrawData()` and `prepareMultipleDrawData()` helper methods
  - Consolidated to single `SpreadDrawResult` interface for all draws

### Technical
- All draws now use unified `SpreadDrawResult` interface
- SpreadFormatter simplified to single `format()` method
- ESLint: Zero errors across entire codebase

## [1.5.0] - 2025-01-24

### Added
- **Deck Metadata System** - Foundation for custom deck support
  - New `Deck` interface with `id`, `name`, `type`, `cardCount`, `supportsReversals`, `isBuiltIn`
  - New `DeckType` type: `'tarot' | 'oracle' | 'lenormand' | 'playing-cards' | 'other'`
  - Default `DEFAULT_DECK` for Rider-Waite-Smith tarot
  - Template variables: `{{deck_name}}` and `{{deck_type}}`
- **Hybrid Template Folder Detection**
  - User setting for template folder (highest priority)
  - Auto-detection from Templater and Core Templates plugins
  - Sensible default fallback (Templates/Tarot)
  - Settings UI shows auto-detected folder when using defaults
- **ConfirmModal Component** - Reusable confirmation dialog for destructive actions

### Fixed
- **HTML Escaping in Templates** - Intention field now uses triple braces `{{{intention}}}` to prevent apostrophes and quotes from being escaped as HTML entities
  - Before: "peppa's back" → "peppa&#x27;s back"
  - After: "peppa's back" → "peppa's back"
- **Daily Note Path Bug** - Fixed moment.js interpreting `.md` extension as format codes
  - Properly separates filename pattern from extension before formatting
  - Creates parent directories before file creation
- **ESLint Cleanup** - Reduced from 57 errors to 0
  - Replaced type-unsafe private API access with type-safe interfaces
  - Eliminated 89% of eslint-disable comments (57 → 6)
  - All remaining suppressions are justified (external library limitations and technical syntax)

### Changed
- **Code Organization** - Reorganized flat src/ directory into logical subdirectories
  - `core/` - Domain logic (Deck, cards, preparation, spreads)
  - `modals/` - UI dialogs (9 files)
  - `templates/` - Template system (8 files)
  - `spreads/` - Spread management (2 files)
  - `ui/` - Settings & components (2 files)
  - `types/` - Type definitions (1 file)
- All draw operations now record which deck was used
- DrawResult, MultipleDrawResult, and SpreadDrawResult interfaces include `deck: Deck` field

### Documentation
- Updated `TEMPLATE-VARIABLES.md` with deck metadata variables and HTML escaping guidance
- Added `ESLINT-ANALYSIS.md` documenting code quality improvements
- Added `CODE-ORGANIZATION.md` documenting new folder structure
- Corrected variable names (`{{name}}` instead of deprecated `{{card}}`)
- Updated all examples to use triple braces for `{{{intention}}}`

### Technical
- Zero ESLint errors with justified suppressions only
- Type-safe interfaces for Obsidian private API access
- Improved maintainability and scalability
- Better code navigation and onboarding

### Future Expansion
This release provides the foundation for:
- Custom deck loading from JSON files
- Deck selector UI in settings
- Multiple deck management
- Support for Oracle decks, Lenormand, playing cards, etc.

### Migration Notes
No migration needed - all existing templates continue to work. The new `deck_name` and `deck_type` variables are purely additive.

Users with custom templates containing user input should consider updating to use triple braces for better handling of special characters:
- Change `{{intention}}` to `{{{intention}}}`
- Keep `{{name}}`, `{{orientation}}`, etc. as double braces

## [1.4.0] - 2025-01-21

### Added - Spreads Feature
- **5 Built-in Spreads**: Single Card, Three Card - Past/Present/Future, Three Card - Situation/Action/Outcome, Five Card - Week Ahead, Celtic Cross (10 cards)
- **Handlebars Template Engine**: Advanced templating with loops, conditionals, and helpers
- **Spread Management UI**: List-based interface in settings with View/Edit/Delete actions
- **SpreadDrawModal**: Select spread and enter intention before drawing
- **SpreadResolver**: Handles loading spread definitions and templates
- **SpreadFormatter**: Formats draw results using Handlebars templates
- **Built-in Templates**: Default templates for each spread type
- **Example Templates**: Comprehensive examples in docs/spread-templates/ with README
- **"Draw tarot spread" Command**: New command palette entry for spread draws

### Added - Template Organization
- **Template Base Folder Setting**: Customize where templates are stored (default: Templates/Tarot)
- **TemplatePaths Utility**: Standardized folder structure (Spreads/, Daily/, Inline/, Multiple/)
- **TemplateExporter**: Copy templates from built-in examples to vault
- **"Create from Example" Feature**: 
  - Built-in spreads can have customized templates via dropdown
  - Custom spreads can start with example templates
  - Templates auto-created in proper folders with parent directory creation
- **Built-in Spread Overrides**: Customize shuffle count, cut deck, and templates for built-in spreads

### Changed
- Spread draw results now use Handlebars for formatting instead of simple variable replacement
- Built-in spreads are now extensible with custom templates and settings

### Fixed
- TypeScript errors with array access safety in SpreadCreateModal
- Moment.js timestamp handling in SpreadFormatter
- Built-in spread customizations now persist correctly via override system

## [1.3.1] - 2025-01-20

### Added
- List-based template UI with action buttons (View, Edit, Reset)
- TemplateViewModal to preview template content
- TemplateEditModal for selecting custom templates
- Visual indication of template source (Built-in or file path)

### Changed
- Templates section now uses intuitive list interface (inspired by Obsidian Hotkeys UI)
- Settings UI with grouped section styling for better visual hierarchy

### Improved
- Much cleaner and more intuitive template management
- Action buttons provide immediate access to view and edit templates
- Reset button disabled when already using built-in template

## [1.3.0] - 2025-01-19

### Added
- File-based template system with built-in defaults
- Template file selection UI with autocomplete
- Automatic migration from inline templates to files
- Three separate templates: Daily, Inline, and Multiple cards
- Custom modal titles for each draw context
- Template folder auto-detection (Templater/Core Templates/common conventions)

### Changed
- Templates now use file paths instead of inline text editors
- Simplified settings UI with show/hide toggles for file pickers
- Unified modal component for single and multiple card draws
- Modal titles now reflect draw context ("Daily tarot draw", "Inline tarot draw", etc.)

### Removed
- "Use shared template" toggle (users can point templates to same file instead)
- Inline template text editors from settings (use file-based templates)

### Fixed
- Inline draws now correctly use inline template instead of daily template

### Deprecated
- `outputTemplate`, `inlineOutputTemplate`, `multipleCardsTemplate` settings (kept for migration)
- `useSharedTemplate` setting (kept for backward compatibility)

## [1.2.0] - 2025-01-19

### Added
- Multiple card draw support (1-78 cards)
- New command: "Inline draw multiple tarot cards"
- Mobile support for iOS and Android
- Configurable shuffle count (1-7 shuffles)
- Optional deck cutting with intention influence
- Six new metadata template variables:
  - `{{shuffle_count}}` - Number of shuffles performed
  - `{{was_cut}}` - Whether deck was cut
  - `{{cut_position}}` - Cut position as percentage
  - `{{cut_position_cards}}` - Cut position in card count
  - `{{cut_base}}` - Base cut percentage from intention
  - `{{cut_variance}}` - Variance applied to cut
- Dedicated template for multiple card output
- Template examples documentation

### Changed
- Updated `rng-with-intention` to v0.2.2 for mobile compatibility
- Reorganized settings with dedicated "Deck Preparation" section
- Consolidated all templates into single "Templates" section
- Simplified command structure to 3 total commands
- All RNG methods now async for cross-platform support

### Fixed
- Mobile draw button not working (iOS/Android)
- NaN values in cut metadata
- Cross-platform crypto compatibility

## [1.1.0] - 2025-01-18

### Added
- Inline tarot draw command for drawing cards in any note
- Separate template for inline draws
- Toggle to share daily practice template with inline draws
- Reversal support with configurable probability
- Customizable upright/reversed indicators
- Six date/time template variables
- Card database path configuration

### Changed
- Updated to `rng-with-intention` v0.1.0
- Improved template system with more variables
- Enhanced documentation

## [1.0.0] - 2025-01-10

### Added
- Initial release
- Daily tarot card drawing with intention
- Intention-seeded randomness using `rng-with-intention`
- Customizable output templates
- Daily note integration
- Configurable insert location (append/prepend/heading)
- Full 78-card Rider-Waite-Smith deck
- Template variables for card, intention, date/time

[1.3.0]: https://github.com/w8s/obsidian-tarot-practice/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/w8s/obsidian-tarot-practice/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/w8s/obsidian-tarot-practice/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/w8s/obsidian-tarot-practice/releases/tag/1.0.0
