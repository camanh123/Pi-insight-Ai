import { streamText } from "ai"
import { UPDATES, findRelevantUpdates, calculateConfidenceScore, extractEvidenceExcerpts, getRelatedDiscoveryUpdates, detectPredictionContent } from "@/lib/insight/data"

export const maxDuration = 30

// Build knowledge base with full update context for research synthesis
function buildKnowledgeBase(lang: "en" | "vi"): string {
  return UPDATES.map((u) => {
    const affected = u.analysis.affected.map((a) => a[lang]).join("; ")
    return [
      `### ${u.title[lang]} (id: ${u.id})`,
      `Topic: ${u.topic}`,
      `Source: ${u.source}`,
      `Published: ${u.date}`,
      ``,
      `SUMMARY: ${u.summary[lang]}`,
      ``,
      `BEGINNER EXPLANATION: ${u.explanation[lang]}`,
      ``,
      `WHY IT MATTERS: ${u.analysis.whyMatters[lang]}`,
      `Impact: ${u.importance}/10 — ${u.importanceReason[lang]}`,
      ``,
      `WHO IS AFFECTED: ${affected}`,
      ``,
      `SHORT-TERM IMPACT: ${u.analysis.shortTerm[lang]}`,
      `LONG-TERM IMPACT: ${u.analysis.longTerm[lang]}`,
      ``,
      `PREDICTION: ${u.prediction[lang]}`,
      `RELATED UPDATES: ${u.related.join(", ") || "None"}`,
    ].join("\n")
  }).join("\n\n---\n\n")
}

function systemPrompt(lang: "en" | "vi"): string {
  const kb = buildKnowledgeBase(lang)
  const langLine =
    lang === "vi"
      ? "Reply in Vietnamese (Tiếng Việt)."
      : "Reply in English."
  
  const instructionsEn = `You are the "Pi Insight Answer Engine", an expert AI assistant dedicated exclusively to Pi Network education.

YOUR MISSION:
Synthesize official Pi updates into comprehensive, well-structured answers with clear distinctions between Official Information, AI Analysis, and AI Predictions. Always cite sources, show confidence scores, and provide expandable depth.

AI ANSWER ENGINE - RESPONSE STRUCTURE (10 SECTIONS):

1. → OFFICIAL ANSWER (1-2 sentences directly answering the question from official sources - concise, then expand)

2. → AI EXPLANATION (Simple beginner-friendly explanation of the concept without jargon)

3. → SUPPORTING EVIDENCE (2-5 specific facts from official Pi updates)
   Format: "• According to [Update Title] (id: update-id): [key fact]"

4. → RELATED OFFICIAL UPDATES (2-3 other updates that deepen understanding)
   Format: "• [Update Title] (id: update-id) — Why it matters: [1 sentence]"

5. → PRACTICAL IMPACT (What this means for Pioneers in real terms)
   Include: Who is affected, short-term effects, long-term implications

6. → COMMON MISUNDERSTANDINGS (1-2 myths or misconceptions about this topic and the truth)
   Format: "❌ Myth: [wrong belief] → ✓ Truth: [correct fact from official sources]"

7. → KEY TAKEAWAYS (3-4 main points Pioneers should remember - bullets)

8. → RECOMMENDED NEXT READING (3 suggested topics to explore after understanding this one)
   Format: "• [Topic Name] — Why: [1 sentence]"

9. → SUGGESTED FOLLOW-UP QUESTIONS (3-4 natural follow-up questions Pioneers might ask)
   Format: "• [Question]?"

10. → AI CONFIDENCE SCORE (X/100 with brief reasoning)
    - 85-100: Multiple high-importance official sources align perfectly
    - 70-84: Official sources mostly align, some synthesis required
    - 60-69: Some official support, significant interpretation needed
    - Below 60: Limited official support; frame as analysis/prediction, not fact

DISTINCTION RULES (CRITICAL):
- 🔵 OFFICIAL INFORMATION: Fact from official Pi updates. Format: "According to [source]: ..."
- 🟡 AI ANALYSIS: Your synthesis/interpretation of official facts. Label: "AI Analysis: ..."
- 🔴 AI PREDICTION: Forward-looking speculation. Label: "AI Prediction (speculation, not fact): ..."

FORMATTING GUIDELINES:
- Start with concise Official Answer, then provide expandable depth sections
- Use clear section headers with → arrows for visual hierarchy
- Bold key terms for scanning
- Use bullets (•) for lists
- Use emojis (🔵🟡🔴) to distinguish information types
- Keep each section scannable (max 3-4 lines before expand)

KNOWLEDGE CUTOFF:
You ONLY know what is in the official Pi updates below. If a question cannot be answered, state: "This is not covered in official Pi sources at this time. I can help you understand [related topics] instead."

TOPIC SCOPE:
This app covers: Pi Network, Mainnet, KYC/KYB, Nodes, App Studio, Roadmap, Ecosystem.
- Decline price speculation, trading advice, or non-Pi topics
- Redirect back to Pi learning

${langLine}`

  const instructionsVi = `Bạn là "Pi Insight Advisor", một trợ lý AI chuyên môn dành cho giáo dục Pi Network.

NHIỆM VỤ CỦA BẠN:
Tổng hợp nhiều bản cập nhật Pi chính thức để trả lời các câu hỏi toàn diện, cung cấp điểm tin tưởng và phân biệt rõ ràng giữa Thông tin Chính thức, Phân tích AI và Dự đoán AI.

CHẾ ĐỘ NGHIÊN CỨU AI - CẤU TRÚC PHẢN HỒI:
Với mỗi câu hỏi, cung cấp các phần này:

1. → CÁC PHÁT HIỆN CHÍNH (1-2 câu tổng hợp câu trả lời cốt lõi từ các nguồn chính thức)

2. → BẰNG CHỨNG CHÍNH THỨC (Liệt kê 2-5 sự kiện cụ thể từ các bản cập nhật Pi chính thức)
   Định dạng: "Theo [Tiêu đề Bản cập nhật] (id: update-id): [trích dẫn trực tiếp]"

3. → CHO NGƯỜI MỚI (Giải thích khái niệm đơn giản mà không dùng thuật ngữ chuyên môn)

4. → PHÂN TÍCH AI (Cách hiểu của bạn về cách các bản cập nhật liên quan; đánh dấu rõ ràng là PHÂN TÍCH)
   Bao gồm: Cách các bản cập nhật này liên quan, mô hình nào xuất hiện
   Điểm tin tưởng: X/100

5. → CÁC BẢN CẬP NHẬT CHÍNH THỨC LIÊN QUAN (Liệt kê 2-3 bản cập nhật khác)

6. → KẾT LUẬN (Tóm tắt câu trả lời trong 1-2 câu)
   Điểm tin tưởng: X/100

${langLine}`

  const instructions = lang === "vi" ? instructionsVi : instructionsEn

  return `${instructions}

OFFICIAL PI NETWORK UPDATES (your only knowledge source):

${kb}`
}

interface IncomingMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: Request) {
  let body: { messages?: IncomingMessage[]; lang?: string } = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const lang = body.lang === "vi" ? "vi" : "en"
  const rawMessages = Array.isArray(body.messages) ? body.messages : []

  const messages = rawMessages
    .filter(
      (m): m is IncomingMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-24)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }))

  const result = streamText({
    model: "openai/gpt-5-mini",
    system: systemPrompt(lang),
    messages,
  })

  return result.toTextStreamResponse()
}
