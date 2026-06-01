# v1.8.7 - Visual Statistics & Bug Fixes

## 🎉 Highlights

### Visual Statistics Charts
Draw History now includes professional data visualizations:
- **Combined Usage Chart**: See your most-used decks and spreads side-by-side in a horizontal bar chart
- **Suit Distribution**: Beautiful pie chart showing card suit breakdown with percentages
- **Dark Mode Compatible**: Tarot-themed colors designed for comfortable viewing

### Critical Bug Fix
Fixed statistics display that was completely broken in v1.8.6. Statistics were showing empty headers due to AlaSQL query parsing errors. Now uses reliable native JavaScript for all data aggregation.

---

## ✨ What's New

### Chart Visualizations
- Horizontal grouped bar chart for deck and spread usage
- Pie chart with suit distribution (Major Arcana, Wands, Cups, Swords, Pentacles)
- Percentages shown directly in pie chart legend (e.g., "Major Arcana: 33.3%")
- Responsive design works on desktop and mobile
- Custom tarot-themed color palette (purple for decks, gold for spreads)

### Improved Readability
- Larger, bolder legend text (13px, weight 500)
- Brighter text color for better contrast on dark backgrounds
- Increased padding between legend items
- Horizontal bars make long deck/spread names easier to read

---

## 🐛 Bug Fixes

### Statistics Display (Critical)
**Problem**: Statistics tab showed empty content despite having draw history
**Cause**: AlaSQL couldn't parse `COUNT(*)` syntax in SQL queries
**Solution**: Replaced all SQL queries with native JavaScript Map aggregation
- More reliable and maintainable
- No external SQL dependency
- Easier to debug
- Better TypeScript integration

### Type Safety
- Fixed all TypeScript strict mode errors in chart code
- Added proper null safety checks for Chart.js options
- Fixed ESLint warnings about unnecessary type assertions
- Added explicit types to array operations

---

## 🛠️ Technical Details

### Added
- Chart.js 4.4.7 for data visualization
- `src/utils/charts.ts` - Chart utilities with tarot color palette
- Chart cleanup logic to prevent memory leaks
- Comprehensive null safety in chart generation

### Changed
- Statistics aggregation: AlaSQL → Native JavaScript (Map-based)
- Chart orientation: Vertical → Horizontal bars
- Legend format: "Suit Name" → "Suit Name: XX.X%"
- Text color: rgb(229,231,235) → rgb(243,244,246) for better contrast

### Infrastructure
- All statistics queries now use reliable JavaScript
- Proper chart instance management with cleanup
- ESLint excludes test files and coverage reports

---

## 📊 Statistics Now Work!

If you saw empty statistics in v1.8.6, they're fixed now! You'll see:
- ✅ Most used decks (with counts)
- ✅ Most used spreads (with counts)
- ✅ Suit distribution (with percentages)
- ✅ Most frequent cards (top 10)
- ✅ Readings by querent (if tracked)

---

## 📦 Installation

### For New Users
1. Download `main.js` and `manifest.json` from this release
2. Create folder: `<vault>/.obsidian/plugins/tarot-practice/`
3. Copy both files into the folder
4. Enable in Settings → Community Plugins

### For Existing Users
The plugin will auto-update through Obsidian, or you can manually replace `main.js` and `manifest.json`

---

## 🎴 Want More Decks?

Check out the [obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks) repository for additional public domain decks you can import!

---

## 📝 Full Changelog

See [CHANGELOG.md](https://github.com/w8s/obsidian-tarot-practice/blob/master/CHANGELOG.md) for complete version history.

## 🙏 Feedback

Found a bug? Have a feature request? [Open an issue](https://github.com/w8s/obsidian-tarot-practice/issues)!
