# AI Compare Updates Feature

## Overview

The Compare Updates feature allows Pi Insight users to select any two official Pi Network updates and view them side-by-side with comprehensive comparison analysis. This helps Pioneers understand how different updates relate to each other, their relative importance, and ecosystem impact.

## Key Features

### Selection Interface
- **Easy Update Picker**: Browse all available updates and select two to compare
- **Disabled States**: Already selected updates are disabled/dimmed to prevent duplicates
- **Swap Function**: Quickly swap left/right updates without reselecting

### Comprehensive Comparison Table

The comparison displays 8 key dimensions:

1. **Title** - Official update titles side-by-side
2. **Date** - Publication dates with timeline gap calculation
3. **Timeline Gap** - Days between the two updates (clearly highlighted)
4. **Topic** - Category badges color-coded for similarity
5. **Importance** - 1-10 score for each update with gap indicator
6. **Affected Users** - Key user groups impacted by each update
7. **Short Term** - 1-2 line impact preview for immediate effects
8. **Long Term** - 1-2 line impact preview for future effects

### Information Type Badge

Clear separation of information sources:
- All data based on official Pi Network sources
- AI analysis overlay clearly marked
- Confidence indicators where applicable

### Mobile-First Design

- Clean, responsive table layout that works on small screens
- Horizontal scrolling for side-by-side comparison on mobile
- Touch-friendly buttons and interactions
- Safe area awareness for notched devices

## Technical Implementation

### Component Structure

```typescript
// Main compare component
<CompareUpdates>
  - Header with title and close button
  - Update selection interface (conditional)
  - Comparison table with metrics
  - Swap and reset buttons
  - Information type badge
</CompareUpdates>
```

### Data Extraction

The component calculates:
- Time difference between updates in days
- Importance score gap (positive/negative)
- Topic similarity (same topic = highlighted)
- Affected user group overlap

### UI States

1. **Selection Mode**: User picks two updates
2. **Comparison Mode**: Full table displayed
3. **Result Mode**: Compare/Reset buttons available

## Bilingual Support

- **English**: Complete titles, descriptions, and labels
- **Vietnamese**: Full Vietnamese translations for all UI elements
- Language context from `useInsight()` hook
- All metrics display in user's selected language

## Integration Points

### Home View
- New "Compare Updates" button with gradient styling
- Opens modal when clicked
- Maintains visual consistency with existing UI

### Update Data Structure
- Uses existing `PiUpdate` interface
- Accesses: title, date, topic, importance, analysis.affected, analysis.shortTerm, analysis.longTerm, analysis.whyMatters
- No additional data needed

## User Experience Flow

1. User clicks "Compare Updates" button on home page
2. Modal opens with scrollable update list
3. User taps first update (highlighted as "left")
4. User taps second update (highlighted as "right")
5. Comparison table appears
6. User can:
   - Swap left/right with button
   - Select different updates to compare
   - Close modal

## Design Considerations

- **Accessibility**: Semantic table structure with proper headers
- **Performance**: Uses memoization for comparison metrics
- **Mobile**: Responsive table that scrolls horizontally on small screens
- **Clarity**: Color coding helps identify patterns (green for same, red for different)

## Translation Keys Added

- compareUpdates
- selectTwoUpdates
- swapUpdates
- timelineGap
- daysApart
- topic
- importanceGap
- affected
- shortTermImpact
- longTermImpact
- whyMattersCompare
- compareDifferentUpdates
- comparisonInformation

All keys available in both English and Vietnamese.
