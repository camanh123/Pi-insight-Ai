# Research Mode Developer Quick Start

## Quick Integration

### Step 1: Import the Component
```tsx
import { ResearchMode, ResearchModeLoading } from "@/components/insight/research-mode"
import { generateEnhancedResearchResponse, findRelevantUpdates } from "@/lib/insight/data"
import type { Lang } from "@/lib/insight/data"
```

### Step 2: Generate Research Data
```tsx
// Auto-detect relevant updates
const research = generateEnhancedResearchResponse(
  "What is Pi's mainnet launch plan?",
  [], // empty array = auto-find updates
  "en" // language
)

// OR provide specific updates
const customResearch = generateEnhancedResearchResponse(
  question,
  selectedUpdates,
  lang
)
```

### Step 3: Render the Component
```tsx
if (isLoading) {
  return <ResearchModeLoading />
}

return <ResearchMode research={research} lang={lang} />
```

## API Response Handling

When API returns research-mode response:
```typescript
if (response.type === "research") {
  // It's a research synthesis
  const research = response as ResearchResponse
  return <ResearchMode research={research} lang={lang} />
}
```

## Helper Functions

### Find Relevant Updates
```typescript
import { findRelevantUpdates } from "@/lib/insight/data"

const updates = findRelevantUpdates("How does KYC work?", 5)
// Returns: PiUpdate[] (up to 5 most relevant updates)
```

### Extract Evidence
```typescript
import { extractEvidenceExcerpts } from "@/lib/insight/data"

const evidence = extractEvidenceExcerpts(updates, "en")
// Returns: Array<{ updateId, title, excerpt }>
```

### Calculate Confidence
```typescript
import { calculateConfidenceScore } from "@/lib/insight/data"

const confidence = calculateConfidenceScore(updates)
// Returns: number 0-100
```

### Get Related Updates
```typescript
import { getRelatedDiscoveryUpdates } from "@/lib/insight/data"

const related = getRelatedDiscoveryUpdates(
  usedUpdateIds,
  3 // limit
)
// Returns: Array<{ id, title, reason }>
```

## Component Props

### ResearchMode
```typescript
interface ResearchModeProps {
  research: ResearchResponse
  lang: Lang // "en" | "vi"
}
```

### ResearchResponse Structure
```typescript
interface ResearchResponse {
  type: "research"
  keyFindings: Loc                    // AI-synthesized key points
  officialEvidence: [{
    updateId: string
    title: Loc
    excerpt: Loc
  }]
  aiAnalysis: Loc                     // Deep synthesis
  analysisConfidence: number          // 0-100
  relatedUpdates: [{
    id: string
    title: Loc
    reason: Loc
  }]
  conclusion: Loc                     // Final synthesis
  conclusionConfidence: number        // 0-100
  technicalDetails: Loc               // Expandable
  forBeginners: Loc                   // Beginner explanation
}
```

## Data Types

```typescript
// Bilingual content
type Loc = {
  en: string
  vi: string
}

// Language
type Lang = "en" | "vi"

// Update object
interface PiUpdate {
  id: string
  title: Loc
  summary: Loc
  topic: string
  importance: number // 0-10
  date: string
  // ... other fields
}
```

## Integration Patterns

### Pattern 1: Auto-Detect Research
```tsx
function AdvisorBubble({ message, lang }) {
  const [research, setResearch] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleResearchMode = async (question) => {
    setLoading(true)
    const result = generateEnhancedResearchResponse(question, [], lang)
    setResearch(result)
    setLoading(false)
  }

  if (loading) return <ResearchModeLoading />
  if (research) return <ResearchMode research={research} lang={lang} />
  // ... regular message rendering
}
```

### Pattern 2: Manual Update Selection
```tsx
function SelectUpdatesForResearch({ lang }) {
  const [selected, setSelected] = useState<string[]>([])

  const handleGenerateResearch = () => {
    const updates = UPDATES.filter(u => selected.includes(u.id))
    const research = generateEnhancedResearchResponse(
      "Custom research",
      updates,
      lang
    )
    // Display research...
  }

  // Checkbox list to select updates...
}
```

### Pattern 3: Smart API Integration
```typescript
// API route that detects research questions
export async function POST(req: Request) {
  const { question, lang } = await req.json()

  // Determine if research mode is needed
  if (isResearchQuestion(question)) {
    const updates = findRelevantUpdates(question)
    const research = generateEnhancedResearchResponse(question, updates, lang)
    return Response.json({ type: "research", ...research })
  }

  // Otherwise use Answer Engine
  const answer = await generateAnswerEngineResponse(question, lang)
  return Response.json({ type: "answer", ...answer })
}
```

## Styling & Customization

### Component Classes
- `pi-fade-up`: Fade and slide up animation
- `pi-fade-in`: Simple fade in
- `pi-press`: Hover/active button interaction
- `pi-clamp-1`: Line clamp to 1 line
- `pi-clamp-2`: Line clamp to 2 lines
- `pi-no-scrollbar`: Hide scrollbar while keeping scroll

### Color Scheme
- Official sources: Green (bg-green-50, text-green-700)
- AI Analysis: Blue (bg-blue-50, text-blue-700)
- Conclusions: Purple (bg-purple-50, text-purple-700)
- Predictions: Amber (bg-amber-50, text-amber-700)

### Confidence Bar Colors
- 85-100: Emerald (bg-emerald-500)
- 70-84: Blue (bg-blue-500)
- 60-69: Amber (bg-amber-500)
- Below 60: Red (bg-red-500)

## Bilingual Patterns

### Access Bilingual Content
```typescript
const content = research.keyFindings
const english = content.en
const vietnamese = content.vi

// Component already handles this:
const text = lang === "vi" ? content.vi : content.en
```

### Add Bilingual Strings
```typescript
// In data.ts
function generateMyContent(lang: Lang): Loc {
  return {
    en: "English text here",
    vi: "Vietnamese text here"
  }
}

// In i18n.ts
const en: Dict = {
  myKey: "English label"
}

const vi: Dict = {
  myKey: "Vietnamese label"
}
```

## Common Issues & Solutions

### Issue: Updates not found
**Solution**: Check `findRelevantUpdates` limit and topic detection
```typescript
const updates = findRelevantUpdates(question, 10) // Increase limit
```

### Issue: Low confidence score
**Solution**: Provide more relevant updates or check if question is well-supported
```typescript
// Add more updates manually if auto-detect doesn't find enough
const updates = [...autoFound, ...manuallyAdded]
const research = generateEnhancedResearchResponse(question, updates, lang)
```

### Issue: Missing translations
**Solution**: Add to both `en` and `vi` dicts in i18n.ts
```typescript
// Both must be present
const en: Dict = { myKey: "English" }
const vi: Dict = { myKey: "Vietnamese" }
```

## Performance Tips

1. **Memoize Research Generation**
   ```tsx
   const research = useMemo(
     () => generateEnhancedResearchResponse(question, updates, lang),
     [question, updates, lang]
   )
   ```

2. **Lazy Load Related Updates**
   ```tsx
   const [related, setRelated] = useState([])
   useEffect(() => {
     setRelated(getRelatedDiscoveryUpdates(usedIds))
   }, [usedIds])
   ```

3. **Batch Multiple Requests**
   ```tsx
   // Instead of multiple calls, collect all questions first
   const researches = questions.map(q => 
     generateEnhancedResearchResponse(q, [], lang)
   )
   ```

## Testing

### Test with Mock Data
```typescript
import { UPDATES, generateEnhancedResearchResponse } from "@/lib/insight/data"

const research = generateEnhancedResearchResponse(
  "What about mainnet?",
  UPDATES.slice(0, 3),
  "en"
)

console.log(research.conclusionConfidence) // 70-95 range
console.log(research.officialEvidence.length) // Should be 3
```

### Verify Bilingual Output
```typescript
const researchEN = generateEnhancedResearchResponse(q, updates, "en")
const researchVI = generateEnhancedResearchResponse(q, updates, "vi")

expect(researchEN.keyFindings.en).toBeTruthy()
expect(researchVI.keyFindings.vi).toBeTruthy()
```

## Debugging

Enable debug logs:
```typescript
// In data.ts functions
console.log("[v0] Found updates:", updates.length)
console.log("[v0] Calculated confidence:", confidence)
console.log("[v0] Research complete:", research.conclusionConfidence)
```

## API Route Example

```typescript
// app/api/research/route.ts
import { generateEnhancedResearchResponse } from "@/lib/insight/data"
import type { Lang } from "@/lib/insight/data"

export async function POST(req: Request) {
  try {
    const { question, lang = "en" } = await req.json()

    if (!question) {
      return Response.json({ error: "Question required" }, { status: 400 })
    }

    const research = generateEnhancedResearchResponse(
      question,
      [],
      lang as Lang
    )

    return Response.json({
      success: true,
      research
    })
  } catch (error) {
    return Response.json({ error: "Failed to generate research" }, { status: 500 })
  }
}
```

## Resources

- Full documentation: `/RESEARCH_MODE_SYNTHESIS_UPGRADE.md`
- Component: `/components/insight/research-mode.tsx`
- Data functions: `/lib/insight/data.ts`
- Translations: `/lib/insight/i18n.ts`
