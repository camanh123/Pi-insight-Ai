# AI Answer Engine Upgrade - Pi Insight

**Date**: July 2026  
**Status**: ✅ Complete  
**Component**: `/components/insight/answer-engine.tsx`

## Overview

The AI Advisor has been upgraded into a comprehensive **AI Answer Engine** that provides structured, expandable answers across 10 distinct sections. Every answer is now decomposed into Official Information, AI Analysis, and AI Predictions with clear confidence scoring.

## Key Features

### 1. **10-Section Answer Structure**
Each answer includes:

- **🔵 Official Answer** - Direct answer from official sources (concise, then expandable)
- **💡 AI Explanation** - Beginner-friendly explanation without jargon
- **📋 Supporting Evidence** - 2-5 facts from official Pi updates with source citations
- **🔗 Related Official Updates** - 2-3 other updates that deepen understanding
- **🎯 Practical Impact** - What this means for Pioneers (real-world effects)
- **❌ Common Misunderstandings** - Myths vs. truths about the topic
- **✓ Key Takeaways** - 3-4 main points to remember (bullet format)
- **📚 Recommended Next Reading** - 3 suggested follow-up topics
- **❓ Suggested Follow-up Questions** - 3-4 natural follow-up questions
- **📊 AI Confidence Score** - 0-100 with reasoning

### 2. **Expandable Sections**
- Official Answer expands by default
- All other sections collapse/expand via tap
- Mobile-first: Easy one-handed navigation
- Smooth animations and clear visual hierarchy

### 3. **Confidence Scoring**
```
85-100  → Green     → Multiple official sources align perfectly
70-84   → Blue      → Official sources mostly align
60-69   → Amber     → Some interpretation required
<60     → Red       → Limited official support (treat as analysis)
```

### 4. **Information Type Distinction**
The API response clearly labels each piece of information:

- **🔵 Official Information** - Cited from official Pi updates (green badge)
- **🟡 AI Analysis** - Interpretation of official facts (blue badge)
- **🔴 AI Prediction** - Forward-looking speculation (amber badge)

Never presents speculation as fact. Always cites sources.

## Technical Implementation

### API Enhancement (`/app/api/advisor/route.ts`)

Updated system prompt now instructs the AI to generate comprehensive answers with:

1. Clear section headers (→ prefix for visual parsing)
2. Confidence scores for every answer and analysis
3. Proper formatting for expandable sections
4. Bilingual support (English + Vietnamese)
5. Emoji icons for quick visual scanning

**Key system instructions:**
- Start with concise Official Answer
- Provide expandable depth sections
- Use emojis (🔵🟡🔴) to distinguish info types
- Keep sections scannable (max 3-4 lines before expand)
- Always cite official sources with update IDs

### Component: AnswerEngine (`/components/insight/answer-engine.tsx`)

**Features:**

```typescript
interface AnswerEngine {
  answer: string          // Full answer text with section markers
  confidence?: number     // 0-100 confidence score
  lang?: "en" | "vi"      // Language
}
```

**Functionality:**

1. **Parse answer text** - Extracts 10 sections using regex patterns
2. **Render expandable UI** - Each section is a collapsible card
3. **Visual confidence meter** - Color-coded bar showing confidence level
4. **Mobile responsive** - Touch-friendly expandable sections
5. **Icon mapping** - Each section has a unique icon for quick scanning

### Loading State

`AnswerEngineLoading` component shows:
- 4 animated skeleton cards
- Pulsing effect during streaming
- Smooth transition to fully rendered answer

### Integration with AdvisorView

The advisor automatically detects Answer Engine responses by checking for section markers:

```typescript
const isAnswerEngineResponse = /OFFICIAL ANSWER|AI EXPLANATION|SUPPORTING EVIDENCE/i.test(content)
```

If detected, renders via `<AnswerEngine>` component instead of plain text.

## Bilingual Support

Both English and Vietnamese translations added to `/lib/insight/i18n.ts`:

**English:**
- answerEngineTitle: "AI Answer Engine"
- officialAnswer: "Official Answer"
- aiConfidenceScore: "AI Confidence Score"
- (and all 10 section translations)

**Vietnamese (Tiếng Việt):**
- answerEngineTitle: "Công cụ Trả lời AI"
- officialAnswer: "Câu trả lời chính thức"
- aiConfidenceScore: "Điểm tin tưởng AI"
- (complete Vietnamese translations)

## UI Components

### IconChevronDown
New icon added to `/components/insight/icons.tsx`:

```typescript
export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
```

Used for section expand/collapse triggers.

## User Experience Flow

1. **Pioneer asks question** → Sent to `/api/advisor/route.ts`
2. **AI generates 10-section answer** → Formatted with section headers
3. **Answer Engine parses response** → Extracts sections
4. **Displays expandable UI** → Official Answer expanded by default
5. **Pioneer taps sections** → Smooth expand/collapse
6. **Confidence bar visible** → Shows answer reliability at-a-glance

## Benefits

✅ **Structured learning** - Clear 10-section format teaches comprehensively  
✅ **Transparent** - Always cites sources, never hides where info comes from  
✅ **Actionable** - Includes key takeaways, follow-up questions, practical impact  
✅ **Mobile-first** - Expandable sections easy to navigate on any phone  
✅ **Bilingual** - Full support for English and Vietnamese Pioneers  
✅ **Confident** - Confidence scores prevent misleading certainty  
✅ **Accessible** - Clear visual hierarchy, emoji icons, semantic HTML  

## Testing Checklist

- ✅ Parse accuracy: All 10 sections correctly identified
- ✅ Expand/collapse: Smooth animations on tap
- ✅ Confidence meter: Color transitions at score thresholds
- ✅ Mobile responsiveness: Touch-friendly on all screen sizes
- ✅ Bilingual: Both EN and VI render correctly
- ✅ Loading state: Animation plays during streaming
- ✅ Integration: Advisor view auto-detects and renders Answer Engine
- ✅ Fallback: Non-Answer-Engine responses still render as plain text

## Related Files

- `/components/insight/answer-engine.tsx` - Main component
- `/app/api/advisor/route.ts` - Updated API system prompt
- `/components/insight/advisor-view.tsx` - Integration point
- `/components/insight/icons.tsx` - IconChevronDown
- `/lib/insight/i18n.ts` - Bilingual translations
- `/components/insight/ui.tsx` - Shared UI utilities

## Future Enhancements

- Export answers to PDF with full formatting
- Share answers via deep links with pre-selected sections
- Audio narration of sections (text-to-speech)
- Bookmark specific sections within an answer
- Add "Was this helpful?" feedback mechanism
- ML-powered section relevance ranking
