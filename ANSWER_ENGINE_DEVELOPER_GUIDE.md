# Answer Engine Developer Guide

## Quick Start

The AI Answer Engine is fully integrated and requires no setup. When a user asks a question in the Advisor view, the system automatically:

1. **Receives** the question via the Advisor chat interface
2. **Sends** it to `/app/api/advisor/route.ts` with the user's language preference
3. **Generates** a comprehensive answer with all 10 sections
4. **Parses** the response in the `AnswerEngine` component
5. **Displays** with proper formatting, confidence score, and bilingual support

## Component Architecture

### Answer Engine Component
**File**: `/components/insight/answer-engine.tsx`

```tsx
export function AnswerEngine({ 
  answer: string,      // Full answer text with 10 sections
  confidence?: number, // 0-100 confidence score
  lang?: "en" | "vi"   // Language preference
}: AnswerEngineProps)
```

**Features**:
- Automatically parses 10 standard sections
- Expands first section (Official Answer) by default
- Shows content-type badge for each section
- Displays confidence score with color coding
- Supports bilingual section titles

### Answer Section Interface
```tsx
interface AnswerSection {
  title: string                                    // English title
  titleVi?: string                                 // Vietnamese title
  content: string                                  // Section content
  contentType: "official" | "analysis" | "prediction" | "normal"
  expanded?: boolean                               // Expanded state
  icon?: string                                    // Section emoji icon
}
```

### Usage in Components
```tsx
import { AnswerEngine } from "@/components/insight/answer-engine"

// In your component
<AnswerEngine 
  answer={responseText}
  confidence={85}
  lang="en"
/>
```

## Response Format

The API returns properly formatted answers with this structure:

```
→ OFFICIAL ANSWER
Direct, 1-2 sentence answer from official sources.

→ AI EXPLANATION
Beginner-friendly explanation...

→ SUPPORTING EVIDENCE
• According to [Update] (id: update-id): [fact]
• [fact 2]

→ RELATED OFFICIAL UPDATES
• [Update Title] (id: update-id) — Why: [1 sentence]

→ PRACTICAL IMPACT
Who is affected... Short-term... Long-term...

→ COMMON MISUNDERSTANDINGS
❌ Myth: [misconception] → ✓ Truth: [fact]

→ KEY TAKEAWAYS
• [Point 1]
• [Point 2]
• [Point 3]

→ RECOMMENDED NEXT READING
• [Topic] — Why: [1 sentence]
• [Topic] — Why: [1 sentence]

→ SUGGESTED FOLLOW-UP QUESTIONS
• [Question 1]?
• [Question 2]?
• [Question 3]?

→ AI CONFIDENCE SCORE
85/100 — Based on multiple official sources that align perfectly.
```

## Section Parsing

The engine automatically detects sections using:
- Arrow prefix: `→ SECTION_TITLE`
- Known section titles in `sectionTitles` object
- Content between arrows becomes section content

**How to add a new section type**:
1. Add to `sectionTitles` in `parseAnswerSections()`:
```tsx
"SECTION_NAME": { 
  title: "English Title", 
  titleVi: "Tiêu đề Tiếng Việt", 
  icon: "📍", 
  type: "normal" 
}
```

2. Update API prompt to include new section

## Content Type Badges

Each section has a content type that determines its badge:

```tsx
const badge = getContentTypeBadge(section.contentType)
// Returns: { label: string, bg: string, text: string, border: string }

// Types:
// "official" → Green background, official label
// "analysis" → Blue background, AI Analysis label
// "prediction" → Amber background, AI Prediction label
// "normal" → No badge
```

## Bilingual Support

### Language Detection
```tsx
// Current language from useInsight()
const { lang } = useInsight() // "en" or "vi"

// Section titles automatically use Vietnamese if available
{lang === "vi" && section.titleVi ? section.titleVi : section.title}
```

### Adding Translations
All section titles support Vietnamese via `titleVi` property. Add Vietnamese versions in `sectionTitles` object:

```tsx
"SECTION_NAME": { 
  title: "English Title",
  titleVi: "Tiêu đề Tiếng Việt",  // Add this
  icon: "📍",
  type: "normal"
}
```

## Confidence Scoring

The confidence score (0-100) determines:
- Progress bar color
- Interpretation text
- Visual appearance

```tsx
const getConfidenceColor = (score: number) => {
  if (score >= 85) return "emerald-500"    // Green
  if (score >= 70) return "blue-500"       // Blue
  if (score >= 60) return "amber-500"      // Amber
  return "red-500"                          // Red
}

const getConfidenceText = (score: number) => {
  if (score >= 85) return "Based on multiple high-importance official sources..."
  if (score >= 70) return "Official sources mostly align..."
  if (score >= 60) return "Some official support..."
  return "Limited official sources..."
}
```

## Loading State

The `AnswerEngineLoading` component shows skeleton screens while answer is generating:

```tsx
<AnswerEngineLoading />
```

Shows:
- Quick answer skeleton
- 5 section skeleton cards
- Confidence score skeleton
- Maintains layout consistency

## Integration in Advisor View

The answer engine automatically activates in the Bubble component:

```tsx
function Bubble({ role, content, lang }) {
  const isAnswerEngineResponse = /OFFICIAL ANSWER|AI EXPLANATION|SUPPORTING EVIDENCE/i.test(content)
  
  return (
    {isAnswerEngineResponse ? (
      <AnswerEngine answer={content} confidence={confidenceScore} lang={lang} />
    ) : (
      // Regular message display
    )}
  )
}
```

## API System Prompt

**File**: `/app/api/advisor/route.ts`

The system prompt includes:
- Full 10-section Answer Engine structure
- Distinction rules for Official/Analysis/Prediction
- Formatting guidelines (emojis, arrows, bullets)
- Vietnamese version of instructions
- Knowledge cutoff warning

To modify Answer Engine behavior, edit `systemPrompt()` function in this file.

## Testing

### Test Questions
```
"What is the Open Network?"
"How do I complete KYC?"
"Explain Nodes like I'm new to Pi"
"What makes Mainnet important?"
```

### Expected Output
Each answer should:
1. ✅ Include all 10 sections
2. ✅ Start with official answer
3. ✅ Include confidence score
4. ✅ Cite sources with IDs
5. ✅ Mark analysis vs official
6. ✅ Have proper section formatting

### Debugging

Add console.log to trace parsing:
```tsx
const sections = parseAnswerSections(answer, lang)
console.log("[v0] Parsed sections:", sections)
console.log("[v0] Section count:", sections.length)
console.log("[v0] First section expanded:", sections[0]?.expanded)
```

## Common Patterns

### Detecting Official Info
```tsx
if (content.includes("According to") || content.includes("Source:")) {
  // This is official information
}
```

### Extracting Confidence
```tsx
const confidenceMatch = content.match(/AI CONFIDENCE SCORE[:—].*?(\d+)\/100/)
const score = confidenceMatch ? parseInt(confidenceMatch[1]) : undefined
```

### Section Detection
```tsx
const hasAllSections = /OFFICIAL ANSWER|AI EXPLANATION|SUPPORTING EVIDENCE|PRACTICAL IMPACT/.test(content)
```

## Performance Tips

1. **Parsing is fast** - Handles answers up to 6000 characters
2. **Animations are smooth** - Uses CSS transitions, not JS
3. **Bilingual switching** - No re-render, just language selection
4. **Expandable sections** - Only renders content when needed
5. **Skeleton loading** - Placeholder shown while streaming

## Troubleshooting

### Sections not parsing
- ✅ Check for `→` prefix before section title
- ✅ Verify section title matches `sectionTitles` keys exactly
- ✅ Check for typos in uppercase section names

### Confidence score not showing
- ✅ Include `→ AI CONFIDENCE SCORE` section
- ✅ Format: "→ AI CONFIDENCE SCORE\n85/100 — explanation"
- ✅ Pass `confidence` prop to AnswerEngine

### Vietnamese not showing
- ✅ Set `lang="vi"` when rendering AnswerEngine
- ✅ Add `titleVi` property to section titles
- ✅ Check useInsight() returns correct lang

### Animations not working
- ✅ Check `prefers-reduced-motion` setting
- ✅ Verify CSS classes like `pi-fade-up` are defined
- ✅ Ensure animation delays are correct

## Future Extensions

### Possible improvements:
1. Copy section to clipboard button
2. Section-specific confidence scores
3. Source link expansion
4. Audio narration per section
5. Export to PDF/Markdown
6. Deep-linking to specific sections
7. Section bookmarking
8. Sidebar navigation for long answers

---

**Last Updated**: 2026-07-22
**Status**: Production-Ready ✅
