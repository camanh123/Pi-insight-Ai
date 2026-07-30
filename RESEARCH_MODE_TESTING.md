# Pi Insight AI Research Mode — Testing Guide

## Quick Start
1. Open the app in preview
2. Click the **Advisor** tab
3. Ask a Pi Network question
4. Observe the research mode response

## Test Scenarios

### Test 1: Multi-Topic Synthesis
**Question:** "What's the connection between KYC and the Open Network?"

**Expected Behavior:**
- ✅ Response combines 2-3 official updates
- ✅ Shows "KEY FINDINGS" that links the concepts
- ✅ "OFFICIAL EVIDENCE" cites multiple updates
- ✅ Includes confidence score (typically 80-90%)
- ✅ "FOR BEGINNERS" explains simply
- ✅ "RELATED OFFICIAL UPDATES" suggests next learning topics

### Test 2: Beginner-Friendly Explanation
**Question:** "Explain Nodes like I'm new to Pi Network"

**Expected Behavior:**
- ✅ First section is "FOR BEGINNERS" (or very clear)
- ✅ No jargon like "consensus mechanism" without explanation
- ✅ Uses simple analogies
- ✅ "TECHNICAL DETAILS" available for advanced users
- ✅ Mobile layout doesn't overflow

### Test 3: Information Type Distinction
**Question:** "When will Pi open to public markets?"

**Expected Behavior:**
- ✅ Sections marked "Official" (green badge) — facts from updates
- ✅ Sections marked "Analysis" (blue badge) — AI interpretation
- ✅ Sections marked "Prediction" (amber badge) — forward-looking
- ✅ PREDICTION clearly labeled as "not fact"
- ✅ No confusion between official and speculative

### Test 4: Confidence Scoring
**Question:** "What is KYC and why do I need it?"

**Expected Behavior:**
- ✅ "AI ANALYSIS" section shows "Confidence Score: X/100"
- ✅ "CONCLUSION" section shows confidence bar + percentage
- ✅ Confidence bar color: 85-100 green, 70-84 blue, 60-69 amber
- ✅ High confidence (85+) for well-supported topics
- ✅ Lower confidence (60-70) for interpretive content

### Test 5: Bilingual Support
**Language Toggle Test:**

**In English:**
- ✅ Question: "What is the Open Network?"
- ✅ Response shows all sections in English
- ✅ Badges say "Official", "Analysis", "Prediction"
- ✅ Confidence text says "X% confident"

**Switch to Vietnamese (click language toggle):**
- ✅ Advisor welcomes in Vietnamese
- ✅ Ask question in Vietnamese: "Mạng Mở là gì?"
- ✅ Response shows all sections in Vietnamese
- ✅ Badges say "Chính thức", "Phân tích", "Dự đoán"
- ✅ Confidence text says "X% tin tưởng"

### Test 6: Mobile Responsiveness
**On Mobile Device or Resized Browser:**

- ✅ Content doesn't overflow width
- ✅ Badges stack nicely (Official, Analysis, Prediction)
- ✅ Confidence bar displays without clipping
- ✅ Section labels readable
- ✅ Smooth scrolling between sections
- ✅ Compose textarea works without issues

### Test 7: Welcome Screen Information Types
**First Time Opening Advisor:**

- ✅ Shows 3 badges: Official (green), Analysis (blue), Prediction (amber)
- ✅ Explains what these mean
- ✅ Suggested questions appear
- ✅ User understands different information types

### Test 8: Extended Conversation
**Multi-turn Conversation:**

**Turn 1:** "What is KYC?"
- ✅ Gets comprehensive answer with research mode

**Turn 2:** "How long does KYC take?"
- ✅ Advisor remembers context
- ✅ New question synthesizes relevant updates
- ✅ Different evidence than first answer (if applicable)

**Turn 3:** "What if I get rejected?"
- ✅ Research mode doesn't break with follow-ups
- ✅ Maintains quality across multiple turns
- ✅ Confidence scores consistent

### Test 9: Edge Cases

**Question about undefined topic:**
"When will the price hit $1?"

**Expected:**
- ✅ Politely declines speculation
- ✅ Redirects to Pi Network topics
- ✅ Doesn't make up unofficial information

**Question about external topic:**
"Tell me about Bitcoin"

**Expected:**
- ✅ Says outside scope of Pi Network
- ✅ Suggests related Pi topics
- ✅ No misinformation generated

## Verification Checklist

### Response Quality
- [ ] Multiple official updates synthesized
- [ ] Facts cited to specific updates
- [ ] Beginner-friendly language used
- [ ] Technical details available (optional)
- [ ] No hallucinated information
- [ ] Information types clearly labeled

### Visual Design
- [ ] Badges display correctly (Official, Analysis, Prediction)
- [ ] Color coding matches: green=official, blue=analysis, amber=prediction
- [ ] Confidence bar shows and colors correctly
- [ ] Section headers readable and distinct
- [ ] Mobile layout works on small screens
- [ ] No text overflow or clipping

### Functionality
- [ ] Research mode works with English questions
- [ ] Research mode works with Vietnamese questions
- [ ] Language toggle updates response language
- [ ] Confidence scores reasonable (85+ for strong support, 60-70 for interpretation)
- [ ] Follow-up suggestions help learning progression
- [ ] Chat history saves correctly

### Bilingual
- [ ] English terms accurate and clear
- [ ] Vietnamese terms accurately translated
- [ ] Both languages maintain quality
- [ ] No mixing of languages in single response
- [ ] RTL/LTR handling correct (if applicable)

## Performance Notes

### Expected Performance
- First answer: 2-4 seconds (API calls + streaming)
- Follow-up answers: 1-2 seconds
- Streaming should start within 1-2 seconds
- No UI freezing during response

### Optimization Indicators
- Page stays responsive during streaming
- Confidence bar animates smoothly
- Color transitions are instant
- Mobile scrolling is smooth

## Known Limitations & Future Work

### Current Limitations
1. Confidence score is deterministic (not ML-based)
2. Follow-up suggestions limited to current topics
3. No interactive citation expansion yet
4. Related updates list is static (not dynamic)

### Future Enhancements
1. AI-calculated confidence based on semantic similarity
2. Dynamic related updates based on latest data
3. Clickable citations to expand evidence
4. Trending research mode questions dashboard
5. User feedback on answer quality
6. Export answers with sources

## Troubleshooting

### Response Doesn't Show Research Mode Formatting
**Possible Causes:**
- API might be returning streaming response slower than expected
- Try refreshing or asking again
- Check browser console for errors

**Fix:**
- Verify `app/api/advisor/route.ts` is updated
- Clear browser cache
- Check network tab in DevTools

### Confidence Scores Not Appearing
**Possible Causes:**
- Response parsing might not detect "Confidence Score: X/100" pattern
- Response text might have different formatting

**Fix:**
- Check advisor-view.tsx parseAdvisorResponse function
- Verify system prompt outputs confidence scores
- Test with simple question first

### Bilingual Not Switching
**Possible Causes:**
- Language state not persisting
- API not receiving language parameter

**Fix:**
- Check context lang state is updating
- Verify POST body includes `{ lang: "vi" | "en" }`
- Check browser console for errors

### Mobile Layout Issues
**Possible Causes:**
- CSS max-width constraints not applied
- Tailwind not compiling properly

**Fix:**
- Clear Tailwind cache
- Check `max-w-[85%]` on message bubble
- Verify mobile viewport meta tag

## Contact & Support

For research mode upgrade support, check:
1. `/RESEARCH_MODE_UPGRADE.md` — Full feature documentation
2. `/components/insight/advisor-view.tsx` — UI implementation
3. `/app/api/advisor/route.ts` — Backend logic
4. `/lib/insight/data.ts` — Types and utilities
