"use client"

import { useEffect, useRef, useState } from "react"
import { useInsight } from "@/contexts/insight-context"
import { cx, IconButton } from "./ui"
import { ConfirmDialog } from "./feedback"
import { IconSend, IconSparkle, IconRefresh, IconShieldNote, IconArrowRight } from "./icons"
import { formatTime, detectTopics, getRecommendedTopics, TOPICS } from "@/lib/insight/data"
import { AnswerEngine, AnswerEngineLoading } from "./answer-engine"

const STARTER_KEYS = [
  { en: "What is the Open Network?", vi: "Mạng Mở là gì?" },
  { en: "How do I complete KYC?", vi: "Làm sao để hoàn tất KYC?" },
  { en: "What is the difference between KYC and KYB?", vi: "KYC và KYB khác nhau thế nào?" },
  { en: "Explain Nodes like I'm new to Pi", vi: "Giải thích Node cho người mới" },
  { en: "What makes the Mainnet launch important?", vi: "Tại sao Mainnet lại quan trọng?" },
]

export function AdvisorView({ pending, onPendingConsumed }: { pending: string | null; onPendingConsumed: () => void }) {
  const { lang, t, messages, isStreaming, streamingText, sendMessage, clearChat } = useInsight()
  const [input, setInput] = useState("")
  const [confirmClear, setConfirmClear] = useState(false)
  const [recommendedTopics, setRecommendedTopics] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Update recommendations based on conversation
  useEffect(() => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter((m) => m.role === "user").pop()
      if (lastUserMessage) {
        const detected = detectTopics(lastUserMessage.content)
        const recommended = getRecommendedTopics(detected)
        setRecommendedTopics(recommended)
      }
    }
  }, [messages])

  // Consume a pending question passed in from an update's suggested questions.
  useEffect(() => {
    if (pending) {
      sendMessage(pending)
      onPendingConsumed()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, streamingText])

  const submit = () => {
    const text = input.trim()
    if (!text || isStreaming) return
    sendMessage(text)
    setInput("")
    if (taRef.current) taRef.current.style.height = "auto"
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing || (e as unknown as { keyCode: number }).keyCode === 229) return
      e.preventDefault()
      submit()
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col">
      {/* header */}
      <div className="border-b border-border bg-background/90 backdrop-blur pi-safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <IconSparkle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold leading-none text-foreground">{t("advisorTitle")}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t("advisorSub")}</p>
            </div>
          </div>
          {hasMessages ? (
            <IconButton label={t("newChat")} onClick={() => setConfirmClear(true)}>
              <IconRefresh className="h-5 w-5" />
            </IconButton>
          ) : null}
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 pi-no-scrollbar">
        {!hasMessages && !isStreaming ? (
          <div className="space-y-4">
            {/* Enhanced Welcome Section */}
            <div className="pi-fade-up rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <IconSparkle className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">{t("advisorTitle")}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground text-pretty">{t("advisorWelcome")}</p>
              
              {/* Answer Engine Features */}
              <div className="mt-4 space-y-3 border-t border-primary/30 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {lang === "en" ? "AI Answer Engine Features" : "Tính Năng Công Cụ Trả Lời AI"}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-lg bg-green-50/50 p-2 text-green-700">
                    <span className="font-semibold">{lang === "en" ? "✓ Official Answer" : "✓ Câu Trả Lời Chính Thức"}</span>
                  </div>
                  <div className="rounded-lg bg-blue-50/50 p-2 text-blue-700">
                    <span className="font-semibold">{lang === "en" ? "💡 AI Explanation" : "💡 Giải Thích AI"}</span>
                  </div>
                  <div className="rounded-lg bg-purple-50/50 p-2 text-purple-700">
                    <span className="font-semibold">{lang === "en" ? "📋 Evidence" : "📋 Bằng Chứng"}</span>
                  </div>
                  <div className="rounded-lg bg-amber-50/50 p-2 text-amber-700">
                    <span className="font-semibold">{lang === "en" ? "🎯 Practical Impact" : "🎯 Tác Động Thực Tế"}</span>
                  </div>
                  <div className="rounded-lg bg-red-50/50 p-2 text-red-700">
                    <span className="font-semibold">{lang === "en" ? "⚠️ Myths" : "⚠️ Những Lầm Tưởng"}</span>
                  </div>
                  <div className="rounded-lg bg-indigo-50/50 p-2 text-indigo-700">
                    <span className="font-semibold">{lang === "en" ? "⭐ Key Takeaways" : "⭐ Điểm Chính"}</span>
                  </div>
                </div>
                
                {/* Information Types */}
                <div className="border-t border-primary/20 pt-3">
                  <p className="text-xs text-muted-foreground mb-2">{lang === "en" ? "Information types used:" : "Các loại thông tin được sử dụng:"}</p>
                  <div className="flex gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-green-50 text-[9px] font-semibold text-green-700">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600" />
                      {lang === "en" ? "Official" : "Chính Thức"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-blue-50 text-[9px] font-semibold text-blue-700">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
                      {lang === "en" ? "Analysis" : "Phân Tích"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-amber-50 text-[9px] font-semibold text-amber-700">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-600" />
                      {lang === "en" ? "Prediction" : "Dự Đoán"}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground italic mt-3">{t("advisorTeachingHint")}</p>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("suggestedForYou")}
              </p>
              {STARTER_KEYS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q[lang])}
                  className="pi-press flex w-full items-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 p-3 text-left text-sm text-primary hover:bg-primary/10 transition-all pi-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <IconSparkle className="h-4 w-4 shrink-0" />
                  <span className="text-pretty">{q[lang]}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, idx) => (
              <div key={m.id}>
                <Bubble role={m.role} content={m.content} at={m.at} lang={lang} />
                {m.role === "assistant" && idx === messages.length - 1 && recommendedTopics.length > 0 && !isStreaming && (
                  <TopicRecommendations topics={recommendedTopics} lang={lang} t={t} onSelectTopic={sendMessage} />
                )}
              </div>
            ))}
            {isStreaming && (
              <div className="pi-fade-up flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3">
                  {streamingText ? (
                    <p className="pi-prose text-sm leading-relaxed text-foreground">{streamingText}</p>
                  ) : (
                    <AnswerEngineLoading />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="border-t border-border bg-background px-3 py-2.5 pi-safe-bottom">
        <div className="mb-1.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <IconShieldNote className="h-3 w-3" />
          <span>{t("advisorSourcesOnly")}</span>
        </div>
        <div className="flex items-end gap-2">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
            }}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={t("advisorPlaceholder")}
            className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || isStreaming}
            aria-label={t("send")}
            className={cx(
              "pi-press flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              !input.trim() || isStreaming
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground",
            )}
          >
            <IconSend className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        message={t("clearChatConfirm")}
        confirmLabel={t("confirm")}
        cancelLabel={t("cancel")}
        onConfirm={() => {
          clearChat()
          setConfirmClear(false)
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}

function Bubble({
  role,
  content,
  at,
  lang,
}: {
  role: "user" | "assistant"
  content: string
  at: number
  lang: "en" | "vi"
}) {
  const isUser = role === "user"
  
  // Extract confidence score from content
  const confidenceMatch = content.match(/AI CONFIDENCE SCORE[:—].*?(\d+)\/100/)
  const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) : undefined
  
  // Check if this is a comprehensive answer engine response
  const isAnswerEngineResponse = /OFFICIAL ANSWER|AI EXPLANATION|SUPPORTING EVIDENCE|PRACTICAL IMPACT|COMMON MISUNDERSTANDINGS|KEY TAKEAWAYS/i.test(content)
  
  return (
    <div className={cx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[85%] rounded-2xl",
          isUser
            ? "rounded-tr-md bg-primary text-primary-foreground px-4 py-3"
            : "rounded-tl-md",
        )}
      >
        {!isUser && isAnswerEngineResponse ? (
          <div className="space-y-3 min-w-0">
            <AnswerEngine answer={content} confidence={confidenceScore} lang={lang} />
          </div>
        ) : (
          <p className={cx(
            "pi-prose text-sm leading-relaxed whitespace-pre-wrap",
            isUser ? "" : "text-foreground"
          )}>
            {content}
          </p>
        )}
        <p className={cx("mt-2 text-[10px]", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {formatTime(at, lang)}
        </p>
      </div>
    </div>
  )
}

interface ResponseSection {
  label: string
  content: string
}

function parseAdvisorResponse(text: string): ResponseSection[] {
  const sections: ResponseSection[] = []
  
  // Match research mode and standard response patterns
  const sectionRegex = /(?:→|^|\n)(KEY FINDINGS|Key Findings|OFFICIAL EVIDENCE|Official Evidence|FOR BEGINNERS|For Beginners|AI ANALYSIS|AI Analysis|TECHNICAL DETAILS|Technical Details|RELATED OFFICIAL UPDATES|Related Official Updates|CONCLUSION|Conclusion|FOLLOW-UP SUGGESTIONS|Follow-Up Suggestions|DIRECT ANSWER|Direct Answer|BEGINNER EXPLANATION|Beginner Explanation|WHY IT MATTERS|Why It Matters|REAL-LIFE ANALOGY|Real-Life Analogy|SOURCE & DATE|Source & Date|This is not covered)[:—]/gi
  
  let lastMatch: RegExpExecArray | null = null
  let lastIndex = 0
  
  const regex = new RegExp(sectionRegex)
  while ((lastMatch = regex.exec(text)) !== null) {
    // Save previous section if exists
    if (sections.length > 0) {
      const prevContent = text.substring(lastIndex, lastMatch.index).trim()
      if (prevContent) {
        sections[sections.length - 1].content = prevContent
      }
    }
    
    const label = lastMatch[1]?.trim() || ""
    sections.push({ label, content: "" })
    lastIndex = lastMatch.index + lastMatch[0].length
  }
  
  // Add last section content
  if (sections.length > 0) {
    const lastContent = text.substring(lastIndex).trim()
    sections[sections.length - 1].content = lastContent
  }
  
  // If no sections found, return full text as one
  if (sections.length === 0) {
    return [{ label: "Answer", content: text }]
  }
  
  return sections.filter((s) => s.content.trim().length > 0)
}

function TopicRecommendations({
  topics,
  lang,
  t,
  onSelectTopic,
}: {
  topics: string[]
  lang: "en" | "vi"
  t: (key: string) => string
  onSelectTopic: (text: string) => void
}) {
  if (topics.length === 0) return null

  const topicLabels = TOPICS.reduce(
    (acc, topic) => {
      acc[topic.id] = topic.label[lang]
      return acc
    },
    {} as Record<string, string>,
  )

  const suggestedQuestions: Record<string, { en: string; vi: string }> = {
    mainnet: { en: "Tell me more about Mainnet launch", vi: "Hãy kể thêm về lần phát hành Mainnet" },
    kyc: { en: "What are the KYC requirements?", vi: "Yêu cầu KYC là gì?" },
    kyb: { en: "Explain KYB for businesses", vi: "Giải thích KYB cho các doanh nghiệp" },
    nodes: { en: "How do I run a Pi Node?", vi: "Tôi chạy Node Pi như thế nào?" },
    appstudio: { en: "What can I build with App Studio?", vi: "Tôi có thể xây dựng gì với App Studio?" },
    roadmap: { en: "What's next for Pi Network?", vi: "Tiếp theo là gì cho Pi Network?" },
    ecosystem: { en: "How can I participate in the ecosystem?", vi: "Tôi có thể tham gia hệ sinh thái như thế nào?" },
  }

  return (
    <div className="pi-fade-up mt-3 flex justify-start">
      <div className="max-w-[85%] space-y-2 rounded-2xl rounded-tl-md border border-border/50 bg-card/50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("relatedTopic")}</p>
        <div className="flex flex-wrap gap-2">
          {topics.slice(0, 2).map((topic) => (
            <button
              key={topic}
              onClick={() => {
                const question = suggestedQuestions[topic]?.[lang] || `Tell me about ${topicLabels[topic]}`
                onSelectTopic(question)
              }}
              className="pi-press flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
            >
              <span className="text-pretty">{topicLabels[topic]}</span>
              <IconArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
