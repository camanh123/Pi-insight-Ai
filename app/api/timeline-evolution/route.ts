import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  const { topic, lang, updates } = await req.json()

  if (!updates || updates.length === 0) {
    return Response.json(
      { error: "No updates provided" },
      { status: 400 }
    )
  }

  const topicName = topic ? `for ${topic}` : "for Pi Network"
  const language = lang === "vi" ? "Vietnamese" : "English"

  const systemPrompt = `You are an AI analyst specializing in Pi Network's evolution and development.
Your task is to generate concise evolution summaries that help Pioneers understand how Pi Network has developed over time.

When given a list of updates, you must:
1. Identify the major milestones and turning points
2. Explain how each milestone contributed to the next
3. Highlight the most significant events
4. Provide clear separation between Official Information, AI Analysis, and AI Predictions

Keep your response concise and mobile-friendly (under 150 words).`

  const userPrompt = `Generate an evolution summary ${topicName} based on these ${updates.length} updates:

${updates
  .map(
    (u: any) =>
      `- ${u.date}: ${u.title} (Importance: ${u.importance}/10, Official)`
  )
  .join("\n")}

Structure your response in ${language} as:
1. [OFFICIAL] Brief overview of the timeline
2. [ANALYSIS] Key turning points and their significance
3. [PREDICTION] Potential future developments (clearly marked as speculation)

Be concise and clear. Focus on connections between events, not just listing them.`

  return streamText({
    model: openai("gpt-4-turbo"),
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.7,
    maxTokens: 500,
  }).toTextStreamResponse()
}
