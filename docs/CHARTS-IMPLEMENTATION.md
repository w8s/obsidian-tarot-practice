# Draw History Charts Implementation Plan

## Goal
Add visual charts to the Statistics tab in Draw History modal:
1. **Bar chart** for deck usage (top 5)
2. **Bar chart** for spread usage (top 5)
3. **Pie chart** for suit distribution in card frequency

## Library Choice: Chart.js
- **Why**: Lightweight (~200KB), TypeScript support, no jQuery dependency
- **Version**: 4.4.x (latest stable)
- **Package**: `chart.js`
- **Types**: Included in main package

## Implementation Steps

### 1. Install Dependencies
```bash
npm install chart.js --save
```

### 2. Create Chart Utilities
**File**: `src/utils/charts.ts`
- Helper functions for creating charts
- Color palettes for consistent theming
- Chart.js configuration defaults for dark mode compatibility

### 3. Update DrawHistoryModal
**File**: `src/modals/DrawHistoryModal.ts`
- Import Chart.js
- Add canvas elements for charts
- Create charts in `showStatistics()` method
- Store chart instances to clean up on tab switch

### 4. Add Styling
**File**: `styles.css`
- Chart container sizing
- Responsive layout (side-by-side on desktop, stacked on mobile)
- Dark mode compatible colors

## Chart Specifications

### Bar Chart: Deck Usage
- **Data**: Top 5 decks by draw count
- **X-axis**: Deck names
- **Y-axis**: Number of draws
- **Color**: Single color (tarot theme - purple/gold)

### Bar Chart: Spread Usage
- **Data**: Top 5 spreads by draw count
- **X-axis**: Spread names
- **Y-axis**: Number of draws
- **Color**: Complementary to deck chart

### Pie Chart: Suit Distribution
- **Data**: Card frequency grouped by suit
- **Suits**: Major Arcana, Wands, Cups, Swords, Pentacles
- **Colors**: Traditional tarot suit colors
  - Major Arcana: Gold/yellow
  - Wands: Red/orange
  - Cups: Blue
  - Swords: Gray/silver
  - Pentacles: Green

## Layout
```
┌─────────────────────────────────────┐
│  Most Used Decks (Bar Chart)        │
├─────────────────────────────────────┤
│  Most Used Spreads (Bar Chart)      │
├─────────────────────────────────────┤
│  Suit Distribution (Pie Chart)      │
└─────────────────────────────────────┘
```

## Accessibility
- Maintain text list fallback below charts
- Ensure charts are readable in both light/dark modes
- Add proper ARIA labels

## Performance
- Create charts only when Statistics tab is active
- Destroy previous chart instances when switching tabs
- Limit data points to avoid canvas performance issues

## Testing Checklist
- [ ] Charts render correctly with sample data
- [ ] Charts update when history changes
- [ ] Charts clean up properly on tab switch
- [ ] Charts work in both light and dark mode
- [ ] Charts are responsive (desktop & mobile)
- [ ] Empty state handling (no data yet)
