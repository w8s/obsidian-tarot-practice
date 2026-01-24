# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
