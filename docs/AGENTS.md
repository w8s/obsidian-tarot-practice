# Development Notes for AI Agents

This document provides context for AI agents working on the Tarot Practice plugin.

## Project Context

**Purpose**: Obsidian plugin for tarot practice with intention-seeded randomness
**Current Version**: 1.3.1
**Tech Stack**: TypeScript, Obsidian API, rng-with-intention library

## Key Design Principles

1. **Intention-Driven Randomness**: Uses user intention + timestamp to seed RNG
2. **Traditional Deck Preparation**: Configurable shuffles (1-7) and optional cutting
3. **Mobile Compatibility**: All async RNG operations for cross-platform crypto support
4. **Template Flexibility**: File-based templates for maximum customization
5. **Backward Compatibility**: Keep deprecated fields for smooth migrations

## Architecture Overview

### Core Components

**Data Flow**: User Intention → Modal → Deck Preparation → RNG Draw → Template Formatting → Note Insertion

**Key Files**:
- `main.ts` - Plugin lifecycle, command registration
- `TarotDrawModal.ts` - Unified modal for all draw types
- `DeckPreparation.ts` - Shuffle and cut logic using rng-with-intention
- `TemplateResolver.ts` - Load templates from files or built-ins
- `TemplateMigrator.ts` - Migrate v1.2.0 inline templates to files
- `settings.ts` - Settings interface and defaults
- `BuiltInTemplates.ts` - Default template constants
- **Spreads (in progress)**:
  - `spreads.ts` - Spread interfaces and types
  - `BuiltInSpreads.ts` - 5 built-in spread definitions
  - `BuiltInSpreadTemplates.ts` - Default Handlebars templates
  - `SpreadResolver.ts` - Load spreads and templates (separate from TemplateResolver for now)

### Important Patterns

**Async RNG**:
```typescript
import RngWithIntention from 'rng-with-intention';
const rngi = new RngWithIntention(seed);
const index = await rngi.draw(maxValue);  // Always await!
```

**Template Resolution**:
```typescript
const resolver = new TemplateResolver(this.app, this.settings);
const template = await resolver.getDailyTemplate();  // Falls back to built-in
```

**Settings with Fallbacks**:
```typescript
this.settings.shuffleCount ?? 3  // Use ?? for deprecated optional fields
```

## Version History Summary

**In Progress - v1.4.0** - Spreads feature
- Adding support for structured spreads (Celtic Cross, 3-card, etc.)
- Handlebars template engine for advanced templating
- 5 built-in spreads with customizable templates
- Per-spread deck preparation settings
- SpreadResolver for spread and template management
- Example templates in docs/spread-templates/

**v1.3.1** (2025-01-20) - List-based template UI
- Redesigned template settings with list interface
- Added TemplateViewModal and TemplateEditModal
- Action buttons for view/edit/reset templates
- Grouped section styling for cleaner UI
- Inspired by Obsidian Hotkeys/Bindings interface

**v1.3.0** (2025-01-19) - File-based templates
- Replaced inline template editors with file pickers
- Added migration system for existing templates
- Unified modal for single/multiple cards
- Removed `useSharedTemplate` toggle

**v1.2.0** (2025-01-19) - Multiple cards & mobile support
- Multiple card draws (1-78 cards)
- Mobile compatibility via rng-with-intention@0.2.2
- Deck preparation metadata variables
- Dedicated multiple cards template

**v1.1.0** (2025-01-18) - Inline draws
- Inline draw commands
- Reversal support
- Separate inline template
- Date/time template variables

**v1.0.0** (2025-01-10) - Initial release
- Daily tarot draws with intention
- Customizable templates
- Daily note integration

## Common Development Tasks

### Adding a New Template Variable

1. Add to `DrawResult`, `MultipleDrawResult`, or `SpreadDrawResult` interface
2. Populate in draw method (e.g., `drawCards()` or spread draw)
3. Add to template data preparation in `SpreadFormatter.ts` (all draws now use Handlebars)
4. Update built-in templates in `BuiltInTemplates.ts` or `BuiltInSpreadTemplates.ts`
5. Document in `TEMPLATE-VARIABLES.md` and update examples

### Modifying Settings

1. Update interface in `settings.ts`
2. Add default in `DEFAULT_SETTINGS`
3. Add UI in `TarotPracticeSettingTab.ts`
4. Use in relevant code with null-safety (`??` operator)
5. Consider migration if changing existing fields

### Testing Checklist

- [ ] Build succeeds (`npm run build`)
- [ ] Deploy works (`npm run deploy`)
- [ ] Plugin reloads without errors
- [ ] Desktop functionality works
- [ ] Mobile functionality works (if applicable)
- [ ] Settings save/load correctly
- [ ] All template variables render
- [ ] Migration works for existing users (if settings changed)

## Known Gotchas

1. **Mobile Crypto**: All RNG must be async - mobile uses different crypto API
2. **Template Files**: Always check file exists and provide fallback to built-in
3. **Settings Migration**: Compare against OLD defaults, not new built-ins
4. **Modal Reuse**: TarotDrawModal handles both single and multiple cards
5. **Deprecated Fields**: Keep for 2-3 versions, use optional (`?`) type

## Build & Release Process

See main README.md for branch strategy and release process.

**Quick Commands**:
```bash
npm run build      # Build for production
npm run deploy     # Build + copy to Obsidian vault
npm run dev        # Watch mode for development
```

**Release Checklist**:
1. Test thoroughly (desktop + mobile if possible)
2. Update CHANGELOG.md
3. Bump versions (manifest.json, package.json, versions.json)
4. Update README.md if needed
5. Merge to master with `--no-ff`
6. Tag release
7. Push to GitHub
8. Create GitHub release with artifacts

## External Dependencies

- **rng-with-intention**: ^0.2.2 (our own library, cross-platform RNG)
- **obsidian**: latest (Obsidian API types)
- **moment**: Available via Obsidian API for date formatting

## Useful Resources

- [Obsidian API Docs](https://docs.obsidian.md/)
- [rng-with-intention](https://github.com/w8s/rng-with-intention)
- [Main README](../README.md)
- [Template Examples](TEMPLATE-EXAMPLES.md)

## Contact

Created by Todd Waits ([@w8s](https://github.com/w8s))
