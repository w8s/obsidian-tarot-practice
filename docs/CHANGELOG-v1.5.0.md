# Changelog for v1.5.0

## Deck Metadata Feature

### Added
- **Deck metadata system** - Foundation for custom deck support
  - New `Deck` interface with `id`, `name`, `type`, `cardCount`, `supportsReversals`, `isBuiltIn`
  - New `DeckType` type: `'tarot' | 'oracle' | 'lenormand' | 'playing-cards' | 'other'`
  - Default `DEFAULT_DECK` for Rider-Waite-Smith tarot
  
- **Template variables**
  - `{{deck_name}}` - e.g., "Rider-Waite-Smith"
  - `{{deck_type}}` - e.g., "tarot"
  - Available in all draw types (daily, inline, multiple, spreads)

### Changed
- **DrawResult** interface now includes `deck: Deck` field
- **MultipleDrawResult** interface now includes `deck: Deck` field
- **SpreadDrawResult** interface now includes `deck: Deck` field
- All draw operations now record which deck was used

### Fixed
- **HTML escaping in templates** - Intention field now uses triple braces `{{{intention}}}` to prevent apostrophes and quotes from being escaped as HTML entities
  - Before: "peppa's back" → "peppa&#x27;s back"
  - After: "peppa's back" → "peppa's back"

### Documentation
- Updated `TEMPLATE-VARIABLES.md` with:
  - New deck metadata variables
  - HTML escaping section explaining double vs triple braces
  - Corrected variable names (`{{name}}` instead of deprecated `{{card}}`)
  - Updated all examples to use triple braces for `{{{intention}}}`
  - Clarified `{{cards}}` as array for loops, not pre-formatted string
  - Fixed spread variables to use `{{positions}}` array correctly

## Future Expansion

This release provides the foundation for:
- Custom deck loading from JSON files
- Deck selector UI in settings
- Multiple deck management
- Support for Oracle decks, Lenormand, playing cards, etc.

## Migration Notes

No migration needed - all existing templates continue to work. The new `deck_name` and `deck_type` variables are purely additive.

Users with custom templates containing user input should consider updating to use triple braces for better handling of special characters:
- Change `{{intention}}` to `{{{intention}}}`
- Keep `{{name}}`, `{{orientation}}`, etc. as double braces

## Technical Details

**New Files:**
- `src/Deck.ts` - Deck type definitions and default deck

**Modified Files:**
- `src/TarotDrawModal.ts` - DrawResult and MultipleDrawResult interfaces, added deck field
- `src/spreads.ts` - SpreadDrawResult interface, added deck field
- `src/main.ts` - Spread drawing includes deck metadata
- `src/SpreadFormatter.ts` - Template data includes deck_name and deck_type
- `src/BuiltInTemplates.ts` - Updated to use triple braces for intention
- `src/BuiltInSpreadTemplates.ts` - Updated to use triple braces for intention

**Branch:** `feature/deck-metadata`
