# Test Suite for Obsidian Tarot Practice

## Overview

This test suite covers the most critical functionality of the plugin:
1. **Deck Validation** - Ensures deck files are properly structured
2. **Template Rendering** - Verifies Handlebars template formatting
3. **Card Drawing** - Tests RNG-based deck preparation and shuffling

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
tests/
├── unit/                          # Unit tests
│   ├── deck-validator.test.ts    # Deck structure validation
│   ├── spread-formatter.test.ts  # Template rendering
│   └── deck-preparation.test.ts  # RNG card drawing
├── fixtures/                      # Test data
│   └── test-deck.json            # 5-card test deck
└── mocks/                         # Mock implementations
    └── obsidian.ts               # Obsidian API mocks
```

## What's Tested

### ✅ Deck Validator
- Valid deck structure
- Required fields (id, name, cards)
- Card count validation (minimum 1)
- Card structure validation (index, name)
- Graceful handling of invalid data

### ✅ Spread Formatter (Template Rendering)
- Basic variable substitution (`{{intention}}`, `{{spread_name}}`)
- Multiple variables in one template
- Card loops (`{{#each cards}}`)
- Conditional rendering (`{{#if isReversed}}`)
- Position information (`{{position.number}}`)
- Orientation (`{{orientation}}`)
- Missing variables (should not break)

### ✅ Deck Preparation (RNG Integration)
- Correct card count
- All unique indices (no duplicates)
- Valid index range (0 to cardCount-1)
- Different intentions → different shuffles
- Same intention + timestamp → identical shuffles (deterministic)
- Metadata tracking (shuffle count, cut status)
- Cut mechanics (when enabled)
- Various deck sizes (5, 78, 150+ cards)

## What's NOT Tested (Yet)

- ❌ Draw history persistence
- ❌ Spread system logic
- ❌ File-based template loading
- ❌ Settings save/load
- ❌ UI modals
- ❌ ZIP deck import
- ❌ Image handling

## Philosophy

These tests focus on **core functionality** that would be most painful to debug if broken:
1. The math (RNG, shuffling, uniqueness)
2. The data structures (deck validation)
3. The template system (Handlebars rendering)

UI tests and integration tests can be added later as needed.

## Adding New Tests

1. Create test file in `tests/unit/`
2. Import from `../../src/...`
3. Use Vitest syntax (`describe`, `test`, `expect`)
4. Run `npm test` to verify

See existing tests for patterns and examples.

## Notes

- Tests use mocked Obsidian API (see `tests/mocks/obsidian.ts`)
- Test fixture deck has 5 cards (fast tests)
- RNG tests verify both randomness AND determinism
- Template tests cover Handlebars helpers (`each`, `if`, `unless`)
