# Answer Engine - Quick Start Guide

## For End Users (Pioneers)

### How to Use the AI Answer Engine

1. **Open the Advisor tab** - Find the sparkle icon in bottom navigation
2. **Ask your question** - Type anything about Pi Network
3. **Wait for the answer** - AI synthesizes from official sources
4. **Read the Official Answer** - Expanded by default at top
5. **Expand sections you want** - Tap any section to read more
6. **Check confidence** - Look at the colored meter at bottom
7. **Follow up** - Suggested follow-up questions help you go deeper

### What the Colors Mean

- 🔵 **Blue dots** = Official facts from Pi sources (trustworthy)
- 🟡 **Yellow dots** = AI's interpretation of those facts (analysis)
- 🔴 **Red dots** = AI's predictions or speculation (not fact)

### Confidence Score

- 🟢 **85-100** = Based on multiple official sources (high trust)
- 🔵 **70-84** = Official sources mostly align (good)
- 🟡 **60-69** = Mix of facts and interpretation (proceed carefully)
- 🔴 **<60** = Limited official support (treat as speculation)

---

## For Developers

### Adding to a Project

The Answer Engine is automatically integrated into the Advisor view. No extra configuration needed!

### How It Works

```
User Question
    ↓
API Route (/api/advisor/route.ts)
    ↓
AI generates 10-section response
    ↓
AnswerEngine component parses it
    ↓
Renders expandable sections
    ↓
Pioneer sees structured answer
```

### Component Usage

```tsx
import { AnswerEngine, AnswerEngineLoading } from "@/components/insight/answer-engine"

// Display an answer
<AnswerEngine 
  answer={fullAnswerText}
  confidence={85}
  lang="en"
/>

// Show while loading
<AnswerEngineLoading />
```

### Expected Answer Format

The API should return a response with these markers:

```
→ OFFICIAL ANSWER
[1-2 sentences from official sources]

→ AI EXPLANATION  
[Beginner-friendly explanation]

→ SUPPORTING EVIDENCE
[2-5 facts with sources]

→ RELATED OFFICIAL UPDATES
[2-3 related topics]

→ PRACTICAL IMPACT
[Real-world effects]

→ COMMON MISUNDERSTANDINGS
[Myths vs truths]

→ KEY TAKEAWAYS
[3-4 main points]

→ RECOMMENDED NEXT READING
[3 suggested topics]

→ SUGGESTED FOLLOW-UP QUESTIONS
[3-4 questions]

→ AI CONFIDENCE SCORE
X/100 - [Reasoning]
```

### System Prompt Key Instructions

The API route at `/app/api/advisor/route.ts` includes instructions that tell the AI to:

1. Generate 10 distinct sections with `→` prefix markers
2. Include confidence scores (0-100) for each answer
3. Clearly label information type (Official/Analysis/Prediction)
4. Cite sources with update IDs: `(id: update-id)`
5. Use emoji icons for visual hierarchy
6. Keep each section scannable (3-4 lines max before expand)

### Confidence Scoring Logic

```typescript
// Confidence ranges
85-100  // Multiple official sources align → Green
70-84   // Official sources mostly align → Blue
60-69   // Some official support + interpretation → Amber
<60     // Limited official support → Red

// Always include reasoning like:
"Confidence: 88/100 - Multiple official updates align on this point"
```

### Styling & Mobile

The component automatically handles:
- ✅ Mobile-first responsive design
- ✅ Touch-friendly expand/collapse
- ✅ Smooth animations
- ✅ Proper spacing for readability
- ✅ Dark/light mode support
- ✅ Bilingual layout support (EN/VI)

### i18n Keys

For bilingual support, these keys are available:

```javascript
t("answerEngineTitle")            // "AI Answer Engine"
t("officialAnswer")               // "Official Answer"
t("aiExplanation")                // "AI Explanation"
t("supportingEvidence")           // "Supporting Evidence"
t("practicalImpact")              // "Practical Impact"
t("commonMisunderstandings")      // "Common Misunderstandings"
t("keyTakeaways")                 // "Key Takeaways"
t("recommendedNextReading")       // "Recommended Next Reading"
t("suggestedFollowUpQuestions")   // "Suggested Follow-up Questions"
t("aiConfidenceScore")            // "AI Confidence Score"
```

---

## Example Question & Answer

### Pioneer Asks:
> "What is the difference between KYC and KYB?"

### Answer Engine Returns:

```
→ OFFICIAL ANSWER
KYC (Know Your Customer) verifies individual Pioneers, 
while KYB (Know Your Business) verifies businesses and 
organizations in the Pi ecosystem.

→ AI EXPLANATION
Think of KYC like showing your ID at a bank - it's for 
individuals. KYB is like a company registering with a 
business bureau - it's for organizations.

→ SUPPORTING EVIDENCE
• According to "KYC Rollout Guidelines" (id: kyc-guide-2024): 
  KYC establishes individual identity verification...
• According to "Business Onboarding" (id: kyb-business-2024):
  KYB enables corporate participation in Pi services...

→ RELATED OFFICIAL UPDATES
• KYC Safety First (id: kyc-safety): Why it matters - 
  Protects Pioneer accounts from fraud
• Business Integration Phase (id: business-phase-2024): 
  Why it matters - Opens Pi ecosystem to enterprises

→ PRACTICAL IMPACT
For Pioneers: You need KYC to access Mainnet and services.
For Businesses: KYB unlocks commercial participation rights.
Short-term: Faster verification = quicker access.
Long-term: Enables trusted cross-border transactions.

→ COMMON MISUNDERSTANDINGS
❌ Myth: KYC is only for suspicious people
✓ Truth: KYC protects ALL Pioneers from fraud and enables services

❌ Myth: KYB means Pi charges businesses money
✓ Truth: KYB is identity verification, not a fee

→ KEY TAKEAWAYS
• KYC = Individual verification, KYB = Business verification
• Both required for respective participants to unlock features
• Process is standard across crypto/fintech (not Pi-specific)
• Protects ecosystem security and enables regulated services

→ RECOMMENDED NEXT READING
• "Mainnet Activation Requirements" - Why it matters: 
  Understand what opens after KYC
• "Pi Browser Security" - Why it matters: 
  How KYC protects your account
• "Ecosystem Partners" - Why it matters: 
  KYB enables business integrations

→ SUGGESTED FOLLOW-UP QUESTIONS
• How long does KYC verification take?
• What documents do I need for KYC?
• Can my business do KYB if I'm not the founder?
• What happens if KYC is rejected?

→ AI CONFIDENCE SCORE
Confidence: 92/100
Based on: 3 official KYC/KYB updates, multiple admin posts, 
official guidelines document. Information types clearly separated. 
High confidence because these are core, well-documented features.
```

### How It Displays

```
┌─────────────────────────────────┐
│ 🔵 Official Answer       ▼       │
├─────────────────────────────────┤
│ KYC (Know Your Customer)...     │
│ [Full text visible]             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💡 AI Explanation        >       │  ← Tap to expand
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 📋 Supporting Evidence   >       │  ← Tap to expand
└─────────────────────────────────┘

[...more expandable sections...]

┌─────────────────────────────────┐
│ 📊 Confidence: 92/100          │
│ ████████████████░░             │
│ Based on multiple sources      │
└─────────────────────────────────┘
```

---

## Testing Your Answers

When testing the Answer Engine, check:

1. **Parsing** - Do all 10 sections get recognized?
2. **Expand/collapse** - Do sections open and close smoothly?
3. **Confidence bar** - Does color match the score?
4. **Mobile** - Can you tap and expand on a phone?
5. **Citations** - Are sources cited with IDs?
6. **Distinction** - Are info types clearly labeled?
7. **Bilingual** - Does Vietnamese display correctly?

---

## Troubleshooting

**Problem**: Sections not expanding
- **Solution**: Check that answer contains `→ SECTION_NAME` markers

**Problem**: Confidence bar not showing
- **Solution**: Ensure answer includes `AI CONFIDENCE SCORE: X/100`

**Problem**: Wrong language displayed
- **Solution**: Pass correct `lang` prop ("en" or "vi")

**Problem**: Loading spinner not showing
- **Solution**: Use `<AnswerEngineLoading />` while streaming

---

## Performance Notes

- ✅ Fast rendering - Minimal DOM nodes
- ✅ Smooth animations - GPU-accelerated
- ✅ Mobile optimized - Works on slow 3G
- ✅ Accessible - Full keyboard navigation
- ✅ Dark mode - Automatic contrast adjustment

---

## Files Changed

- `/components/insight/answer-engine.tsx` - New component (188 lines)
- `/app/api/advisor/route.ts` - Updated prompt (41→79 lines)
- `/components/insight/advisor-view.tsx` - Integration (220→240 lines)
- `/components/insight/icons.tsx` - Added IconChevronDown (+8 lines)
- `/lib/insight/i18n.ts` - Added 17 i18n keys per language (+34 lines)

**Total additions**: ~320 lines of production code  
**No breaking changes** - Fully backward compatible

---

Happy exploring! The Answer Engine makes Pi learning more structured, transparent, and trustworthy. 🚀
