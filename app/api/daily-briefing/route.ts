import { streamText } from "ai"
import { UPDATES } from "@/lib/insight/data"

export const maxDuration = 30

function getTodayUpdates(lang: "en" | "vi") {
  const today = new Date().toISOString().split("T")[0]
  return UPDATES.filter((u) => u.date === today).sort((a, b) => b.importance - a.importance)
}

function buildBriefingPrompt(lang: "en" | "vi"): string {
  const updates = getTodayUpdates(lang)
  const langLine = lang === "vi" ? "Reply in Vietnamese (Tiếng Việt)." : "Reply in English."

  if (updates.length === 0) {
    return `${langLine}

Generate a health summary of the Pi Network ecosystem for today (when no official updates were published).

Structure your response as:

## 📊 ECOSYSTEM HEALTH REPORT
**Today's Status**: No official updates published.

**Overall Health Score**: 7-8/10 (Stable)

**Network Status** (Official Information):
- Mainnet continues operating with normal activity
- KYC/KYB processing ongoing
- App Studio ecosystem active with developer submissions

**What This Means** (AI Analysis):
Brief explanation of ecosystem stability and what users should monitor.

**Recommendations** (AI Analysis):
- Key action for Pioneers to take today
- What to watch for

**Disclaimer**: This summary is based only on official Pi Network data. When no updates are published, stability is positive.`
  }

  const updatesList = updates
    .map((u) => {
      const affected = u.analysis.affected.map((a) => a[lang]).join("; ")
      return `- **${u.title[lang]}** (Importance: ${u.importance}/10)
  ${u.summary[lang]}
  Impact: ${affected}
  Why it matters: ${u.analysis.whyMatters[lang]}`
    })
    .join("\n\n")

  return `${langLine}

Generate a comprehensive daily briefing for Pi Network pioneers. Today, ${updates.length} official update${updates.length > 1 ? "s" : ""} ${updates.length === 1 ? "was" : "were"} published.

OFFICIAL UPDATES TODAY:
${updatesList}

Create a briefing with this structure:

## 📰 TODAY'S BRIEFING - ${new Date().toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US")}

**Top Priority** (Importance Ranking):
List the #1 most important update and why Pioneers should focus on it.

**Ranking All Updates**:
Brief 1-sentence summary of each update by importance.

**Estimated Impact**:
- Pioneers Affected: [number estimate based on importance]
- Short-term Effect: [1-2 sentences on immediate impact]
- Long-term Effect: [1-2 sentences on lasting implications]

**What You Should Do Today** (AI Recommendations):
- Action 1
- Action 2
- Action 3

**Ecosystem Health Score**: ${Math.min(95, 75 + updates.length * 5)}/100 (Active)

**Official Information vs AI Analysis**:
Clearly mark which parts are directly from official Pi sources and which are AI interpretation.

Be concise, actionable, and always separate Official Information from AI Analysis. Provide clear recommendations Pioneers can act on immediately.`
}

export async function POST(req: Request) {
  try {
    const { lang = "en" } = await req.json()

    const prompt = buildBriefingPrompt(lang as "en" | "vi")

    const { stream } = await streamText({
      model: "openai/gpt-4-turbo",
      system: `You are the Pi Daily Briefing Generator. Your role is to synthesize official Pi Network updates into actionable daily briefings for Pioneers.

KEY RESPONSIBILITIES:
1. Always clearly separate Official Information (from Pi Core Team), AI Analysis (your interpretation), and Predictions
2. Rank updates by real-world impact on Pioneers, developers, and the ecosystem
3. Estimate affected user counts based on update importance
4. Provide specific, actionable recommendations
5. Keep the briefing concise and mobile-friendly (2-3 min read)
6. When no updates exist, provide ecosystem health assessment using only official data
7. Highlight turning points or critical changes in Pi's development

OUTPUT REQUIREMENTS:
- Use markdown formatting for clarity
- Include emoji for visual hierarchy
- Keep sentences short and direct
- Explain technical concepts for beginners
- Always end with clear next-steps for Pioneers`,
      prompt,
      maxTokens: 1000,
    })

    return new Response(stream.toReadableStream(), {
      headers: { "Content-Type": "text/event-stream" },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error generating briefing"
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
