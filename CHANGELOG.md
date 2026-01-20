# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
