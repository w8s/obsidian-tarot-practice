# Tarot Practice v1.8.2 - Draw History Tracking

**Release Date:** January 26, 2025

## Overview

v1.8.2 adds comprehensive draw history tracking to help you understand your tarot practice patterns. Every spread draw is now automatically recorded with full details, enabling you to view statistics, export data, and analyze your divination practice over time.

## New Features

### Automatic Draw History

All spread draws are now tracked automatically with:
- **Spread information**: Name and layout used
- **Deck information**: Which deck was used
- **Cards drawn**: All cards with positions and orientations
- **Context**: Your intention and querent (if specified)
- **Metadata**: Shuffle count, cut status, and cut position
- **Timestamp**: Exact date and time of the draw

History is stored in your plugin data file and syncs seamlessly with Obsidian Sync. The plugin automatically maintains up to 1,000 draws, pruning oldest entries when the limit is reached.

### History Viewer Modal

Access via **Settings → Tarot Practice → Draw History → View history**

#### Recent Draws Tab
- Browse your last 20 draws
- See full details: spread name, deck used, intention, cards
- Organized chronologically (newest first)
- Includes querent information if tracked

#### Statistics Tab
View aggregated insights about your practice:
- **Most used decks** - Top 5 decks with draw counts
- **Most used spreads** - Top 5 spreads with draw counts  
- **Most frequent cards** - Top 10 cards across all draws
- **Readings by querent** - Breakdown if querent tracking used

### Export Functionality

Download your complete draw history for external analysis:

**Export as JSON**
- Complete structured data with all fields
- Perfect for programming/data analysis
- Can be re-imported or processed with code
- Includes nested card arrays and metadata

**Export as CSV**
- Spreadsheet-friendly format
- Opens in Excel, Google Sheets, Numbers
- Timestamps in both Unix and ISO formats
- Proper escaping for complex text fields
- Columns: ID, Timestamp, Date, Spread, Deck, Intention, Cards, Querent, Shuffle Count, Was Cut

### Clear History

Remove all tracked draws with confirmation dialog:
- **Settings → Tarot Practice → Draw History → Clear all history**
- Permanent deletion with safety confirmation
- Fresh start while keeping all other settings

## Technical Details

### SQL-Powered Queries

History tracking uses [AlaSQL](https://github.com/AlaSQL/alasql), a JavaScript SQL database, for powerful querying capabilities:
- **Aggregation**: GROUP BY, COUNT, DISTINCT operations
- **Filtering**: Date ranges, specific decks/spreads
- **Performance**: Fast queries even with hundreds of draws
- **Export**: CSV generation using SQL queries

### Data Storage

- **Location**: Plugin data.json file
- **Sync**: Automatic with Obsidian Sync
- **Limit**: 1,000 draws maximum (configurable)
- **Format**: JSON array of draw entries
- **Size**: ~500 bytes per draw (~500KB for 1,000 draws)

### Architecture

New files added:
- `src/core/DrawHistory.ts` - Main history management class
- `src/types/history.ts` - TypeScript interfaces  
- `src/modals/DrawHistoryModal.ts` - UI modal
- `src/ui/TarotPracticeSettingTab.ts` - Settings integration

## Use Cases

### Personal Insights
- Track which cards appear most frequently
- Identify your go-to spreads and decks
- Notice patterns in your readings over time
- Review past intentions and reflections

### Data Analysis
- Export to CSV for spreadsheet analysis
- Create visualizations of card frequencies
- Compare deck and spread usage over time
- Analyze seasonal or cyclical patterns

### Record Keeping
- Maintain a log of readings for clients
- Track querent reading history
- Document your divination practice
- Create backup copies of your history

## Migration Notes

**For existing users:**
- No migration required
- History tracking starts automatically after update
- Previous draws not retroactively tracked
- No impact on existing settings or data

## What's Next

Future enhancements being considered:
- Date range filters in history viewer
- Search by intention keywords
- Card appearance calendar/heatmap
- Reading journal integration
- Advanced statistics (time of day patterns, etc.)

## Documentation

- See [USAGE.md](docs/USAGE.md) for detailed usage instructions
- See [SETTINGS.md](docs/SETTINGS.md) for settings reference
- See [CHANGELOG.md](CHANGELOG.md) for complete version history

## Credits

- **AlaSQL** - SQL database library for JavaScript ([GitHub](https://github.com/AlaSQL/alasql))

---

**Full Changelog**: [1.8.1...1.8.2](https://github.com/w8s/obsidian-tarot-practice/compare/1.8.1...1.8.2)
