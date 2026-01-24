# Source Code Organization

## Directory Structure

```
src/
├── main.ts                          # Plugin entry point
├── settings.ts                      # Settings interface & defaults
│
├── core/                            # Core domain logic (4 files)
│   ├── Deck.ts                      # Deck type definitions
│   ├── CardDatabase.ts              # Card data & lookup functions
│   ├── DeckPreparation.ts           # Shuffle, cut, and draw logic
│   └── spreads.ts                   # Spread type definitions
│
├── modals/                          # UI modal dialogs (9 files)
│   ├── ConfirmModal.ts              # Reusable confirmation dialog
│   ├── TarotDrawModal.ts            # Basic card draw interface
│   ├── SpreadDrawModal.ts           # Spread selection & intention
│   ├── SpreadCreateModal.ts         # Create new custom spread
│   ├── SpreadEditModal.ts           # Edit spread configuration
│   ├── SpreadViewModal.ts           # View spread details
│   ├── TemplateEditModal.ts         # Template file picker
│   ├── TemplateViewModal.ts         # View template content
│   └── TemplateMigrationModal.ts    # v1.3.0 migration UI
│
├── templates/                       # Template system (8 files)
│   ├── BuiltInTemplates.ts          # Default templates for draws
│   ├── BuiltInSpreadTemplates.ts    # Default spread templates
│   ├── TemplateResolver.ts          # Load templates (file or built-in)
│   ├── TemplateExporter.ts          # Export templates to files
│   ├── TemplateFolderDetector.ts    # Auto-detect template folders
│   ├── TemplatePaths.ts             # Path utilities
│   ├── TemplateMigrator.ts          # v1.3.0 migration logic
│   └── SpreadFormatter.ts           # Handlebars template rendering
│
├── spreads/                         # Spread system (2 files)
│   ├── BuiltInSpreads.ts            # Default spread definitions
│   └── SpreadResolver.ts            # Load spreads (custom + built-in)
│
├── ui/                              # UI components (2 files)
│   ├── TarotPracticeSettingTab.ts   # Plugin settings interface
│   └── FileSuggest.ts               # File path autocomplete
│
└── types/                           # Type definitions (1 file)
    └── rng-with-intention.d.ts      # External library types
```

## File Count by Category

| Category | Files | Purpose |
|----------|-------|---------|
| **Core** | 4 | Domain logic & data |
| **Modals** | 9 | User interface dialogs |
| **Templates** | 8 | Template system |
| **Spreads** | 2 | Spread management |
| **UI** | 2 | Settings & components |
| **Types** | 1 | Type definitions |
| **Root** | 2 | Entry point & settings |
| **Total** | 28 | All source files |

## Import Patterns

### From Root Files (main.ts, settings.ts)
```typescript
import { ... } from './core/Deck';
import { ... } from './modals/SpreadDrawModal';
import { ... } from './templates/TemplateResolver';
```

### From Subdirectory Files
```typescript
// Within same directory
import { ... } from './BuiltInSpreads';

// To parent directory
import { ... } from '../settings';

// To sibling directory
import { ... } from '../core/spreads';
import { ... } from '../modals/ConfirmModal';
```

## Benefits of This Organization

### ✅ Maintainability
- Related files grouped together
- Clear responsibility boundaries
- Easier to navigate codebase

### ✅ Scalability
- Room to grow within each category
- Easy to add new modals, templates, etc.
- Won't become cluttered as features added

### ✅ Onboarding
- New contributors can quickly orient
- Clear where to add new functionality
- Self-documenting structure

### ✅ IDE Support
- Better autocomplete
- Easier refactoring
- Clearer import paths

## Migration Notes

This refactor was purely organizational - no functionality changed. All imports were automatically updated to use correct relative paths. Verified with:
- ✅ TypeScript compilation (0 errors)
- ✅ ESLint (0 errors)
- ✅ Build process (successful)
