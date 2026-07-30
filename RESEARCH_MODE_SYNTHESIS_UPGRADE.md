# AI Research Mode: Multi-Update Synthesis Upgrade

## Overview

Research Mode has been upgraded to synthesize multiple official Pi Network updates into comprehensive, structured research reports. Instead of analyzing single articles, the system now intelligently combines 2-5 related official sources to generate deeper insights with proper confidence scoring and timeline analysis.

## Core Features

### 1. Multi-Update Synthesis
- **Intelligent Update Selection**: Uses topic detection and keyword matching to find the 5 most relevant official Pi updates for any question
- **Thematic Analysis**: Identifies common patterns, connections, and themes across multiple sources
- **Evidence Aggregation**: Combines evidence from all sources into a unified analysis
- **Confidence Weighting**: Confidence increases with more corroborating sources

### 2. Structured Report Sections

#### Key Findings (AI Analysis)
- High-level summary of what the synthesized updates collectively show
- Identifies the most consistent themes across sources
- Shows how individual initiatives interconnect

#### Official Evidence (Official Sources)
- Expandable list of all official Pi updates analyzed
- Each evidence item shows:
  - Official source title
  - Brief excerpt (truncated to 150 chars)
  - Link to full update
- Green badge indicating "Official Sources"

#### AI Analysis (Analysis)
- Deep synthesis explaining connections between updates
- Identifies patterns visible only when sources are combined
- Includes optional technical details in expandable section
- Blue badge indicating "AI Analysis"

#### Related Updates (Discovery)
- 3 suggested additional updates for deeper exploration
- Explains why each update is relevant (e.g., "Explores governance in more detail")
- Helps users follow research threads further

#### Timeline
- Chronological ordering of all analyzed updates
- Shows significance level (critical/high/medium)
- Visual representation of how updates connect over time

#### Final Conclusion (Synthesis & Conclusion)
- Clear, direct conclusion based on synthesized evidence
- Explains what the multi-source analysis reveals
- Always grounded in official sources
- Purple badge indicating "Synthesis & Conclusion"

### 3. Information Type Separation

Every section is clearly labeled with its information type:

- **Official Sources** (Green dot)
  - Direct quotes and excerpts from official Pi announcements
  - Publication dates always included
  - Source attribution visible

- **AI Analysis** (Blue dot)
  - Synthesis of multiple official sources
  - Pattern recognition and connection identification
  - Expert interpretation of what sources collectively mean
  - Marked as analysis, not fact

- **AI Prediction** (Amber dot)
  - Speculative only when clearly marked
  - Never presented as fact
  - Explicitly labeled as "This is speculation based on current trends"

### 4. Expandable Technical Details

Each section can optionally expand to show:
- **For Beginners**: Simple, jargon-free explanation
- **Technical Details**: In-depth analysis for technical users
- Implementation details remain collapsed by default, keeping initial view concise

### 5. Confidence Scoring System

#### Overall Research Confidence (0-100)
- **85-100**: Multiple high-importance official sources that align perfectly
  - "Based on multiple high-importance official sources that align perfectly"
- **70-84**: Official sources mostly align; synthesis is well-supported
  - "Official sources mostly align; synthesis is well-supported"
- **60-69**: Some official support; interpretation required
  - "Some official support; interpretation and synthesis required"
- **Below 60**: Limited sources; conclusion involves significant synthesis
  - "Limited sources — conclusion involves significant synthesis and analysis"

#### Section-Level Confidence
Each analysis section (AI Analysis, Conclusion) shows its own confidence percentage, allowing users to understand reliability at each level.

### 6. Bilingual Support

All content fully supports English and Vietnamese:
- Section titles in both languages
- Evidence excerpts in both languages
- Timeline events localized
- Information type badges in both languages
- Confidence explanations translated

## Implementation Details

### Key Functions

#### `generateEnhancedResearchResponse(question, updates, lang)`
Generates complete research report with timeline and all sections.

```typescript
const research = generateEnhancedResearchResponse(
  "What are Pi's mainnet plans?",
  [], // Leave empty to auto-detect relevant updates
  "en"
)
```

Returns `EnhancedResearchResponse` with:
- keyFindings
- officialEvidence[]
- aiAnalysis
- relatedUpdates[]
- conclusion
- technicalDetails
- timeline[]
- synthesisMethod
- sourceCredibility (0-100)

#### `findRelevantUpdates(question, limit)`
Finds up to `limit` official Pi updates most relevant to the question.
Uses topic detection and keyword matching.

#### `calculateConfidenceScore(updates)`
Calculates 0-100 confidence based on:
- Number of sources (multi-source bonus)
- Individual source importance (0-10 scale)
- Average importance weighted formula

#### `generateTimelineFromUpdates(updates, lang)`
Creates chronological timeline of all analyzed updates with significance levels.

### Data Types

```typescript
interface EnhancedResearchResponse extends ResearchResponse {
  timeline: TimelineEvent[]           // Chronological events
  synthesisMethod: string             // How many updates analyzed
  sourceCredibility: number           // 0-100, based on official nature
}

interface TimelineEvent {
  date: string                        // ISO date format
  title: Loc                          // Bilingual title
  significance: "critical" | "high" | "medium"
  relatedUpdateId: string             // Link back to update
}
```

## Usage Example

### In Advisor View
```tsx
import { ResearchMode, ResearchModeLoading } from "@/components/insight/research-mode"
import { generateEnhancedResearchResponse } from "@/lib/insight/data"

// When user asks for research synthesis
const research = generateEnhancedResearchResponse(
  userQuestion,
  [],
  lang
)

if (isLoading) {
  return <ResearchModeLoading />
}

return <ResearchMode research={research} lang={lang} />
```

### Response Format in API
When the API detects a research question, it returns:
```typescript
{
  type: "research",
  keyFindings: { en: "...", vi: "..." },
  officialEvidence: [
    {
      updateId: "update-001",
      title: { en: "...", vi: "..." },
      excerpt: { en: "...", vi: "..." }
    }
  ],
  // ... full research response
}
```

## Visual Design

### Layout Structure
- **Header**: Research mode indicator with icon (🔬)
- **Sections**: Card-based expandable sections
- **Color Coding**: 
  - Green borders/badges for official sources
  - Blue for analysis sections
  - Purple for conclusions
  - Amber for predictions
- **Confidence Bar**: Visual progress bar (emerald/blue/amber/red)
- **Icons**: Section icons (🔍 findings, 📋 evidence, 💡 analysis, etc.)

### Mobile Optimization
- Touch-friendly expandable sections
- Readable font sizes (12px minimum for body text)
- Proper spacing and padding
- Smooth animations on expand/collapse
- Works on all screen sizes

### Animations
- Fade-in on page load
- Staggered fade-up for sections (40ms delay between each)
- Smooth rotate transitions for chevron icons
- 300ms transition timing

## Bilingual Implementation

### Language Detection
- Auto-detects from `lang` parameter passed to component
- Falls back to English if not specified
- Users can toggle language in UI

### Translation Structure
- All dynamic content bilingual (Loc type: `{ en: string, vi: string }`)
- UI labels from i18n dictionary
- Consistent key naming: `researchMode`, `keyFindings`, etc.

### Content Generation
All helper functions accept `lang` parameter and generate bilingual `Loc` objects:
```typescript
function generateKeyFindings(updates: PiUpdate[], lang: Lang): Loc {
  return {
    en: "English version...",
    vi: "Vietnamese version..."
  }
}
```

## Quality Assurance

### Never Speculate as Fact
- All predictions clearly marked with amber "AI Prediction" badge
- Confidence scores warn when sources are limited
- Methodology note explains synthesis process
- Code detects prediction keywords and warns users

### Official Source Attribution
- Every piece of evidence shows source update title
- Publication dates always visible
- Links to full updates provided
- Separate "Official Evidence" section highlighting official content

### Confidence Transparency
- 0-100 confidence score always visible
- Color-coded bar shows confidence level at a glance
- Written explanation of confidence calculation
- Each section can have different confidence levels

## Future Enhancements

Possible future additions:
- Export research reports as PDF
- Share specific research syntheses via links
- Save research reports to user library
- Compare multiple research syntheses side-by-side
- Trend analysis across multiple months of updates
- Automated research for common questions

## File Structure

```
components/insight/
├── research-mode.tsx          # Main Research Mode component
├── advisor-view.tsx           # Integrates Research Mode

lib/insight/
├── data.ts                    # Research synthesis functions
├── i18n.ts                    # Bilingual translations

/RESEARCH_MODE_SYNTHESIS_UPGRADE.md    # This file
```

## Performance Considerations

- Research synthesis runs on-demand (not cached)
- Timeline generation is O(n) where n = update count
- Confidence calculation is O(n)
- Component rendering optimized with useMemo for sections
- Expandable sections don't re-render when collapsed

## Accessibility

- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels on expandable sections
- Color not sole indicator of information type (also uses badges/icons)
- Sufficient contrast ratios maintained
- Keyboard navigation support for expand/collapse
