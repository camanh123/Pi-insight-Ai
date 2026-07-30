"use client"

import { useState } from "react"
import { cx, Button } from "./ui"
import { IconChevronDown, IconCheckCircle, IconAlertCircle } from "./icons"

interface AnswerSection {
  title: string
  titleVi?: string
  content: string
  contentType: "official" | "analysis" | "prediction" | "normal"
  expanded?: boolean
  icon?: string
}

interface AnswerEngineProps {
  answer: string
  confidence?: number
  lang?: "en" | "vi"
}

function parseAnswerSections(text: string, lang: "en" | "vi" = "en"): AnswerSection[] {
  const sections: AnswerSection[] = []
  const lines = text.split("\n")
  let currentSection: Partial<AnswerSection> | null = null
  let currentContent: string[] = []

  const sectionTitles: Record<string, { title: string; titleVi: string; icon: string; type: "official" | "analysis" | "prediction" | "normal" }> = {
    "OFFICIAL ANSWER": { title: "Official Answer", titleVi: "Câu Trả Lời Chính Thức", icon: "🔵", type: "official" },
    "AI EXPLANATION": { title: "AI Explanation", titleVi: "Giải Thích AI", icon: "💡", type: "analysis" },
    "SUPPORTING EVIDENCE": { title: "Supporting Evidence", titleVi: "Bằng Chứng Hỗ Trợ", icon: "📋", type: "official" },
    "RELATED OFFICIAL UPDATES": { title: "Related Official Updates", titleVi: "Cập Nhật Chính Thức Liên Quan", icon: "🔗", type: "official" },
    "PRACTICAL IMPACT": { title: "Practical Impact", titleVi: "Tác Động Thực Tế", icon: "🎯", type: "analysis" },
    "COMMON MISUNDERSTANDINGS": { title: "Common Misunderstandings", titleVi: "Những Hiểu Lầm Thường Gặp", icon: "⚠️", type: "analysis" },
    "KEY TAKEAWAYS": { title: "Key Takeaways", titleVi: "Các Điểm Chính Cần Nhớ", icon: "⭐", type: "normal" },
    "RECOMMENDED NEXT READING": { title: "Recommended Reading", titleVi: "Đọc Tiếp Được Khuyến Nghị", icon: "📚", type: "normal" },
    "SUGGESTED FOLLOW-UP QUESTIONS": { title: "Suggested Questions", titleVi: "Câu Hỏi Gợi Ý", icon: "❓", type: "normal" },
    "AI CONFIDENCE SCORE": { title: "AI Confidence Score", titleVi: "Điểm Tin Cậy AI", icon: "📊", type: "normal" },
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Check for section headers
    let foundSection = false
    for (const [key, { title, titleVi, icon, type }] of Object.entries(sectionTitles)) {
      if (trimmed.startsWith("→") && trimmed.includes(key)) {
        // Save previous section
        if (currentSection) {
          sections.push({
            title: currentSection.title || "",
            titleVi: currentSection.titleVi,
            icon: currentSection.icon,
            contentType: currentSection.contentType || "normal",
            content: currentContent.join("\n").trim(),
            expanded: sections.length === 0, // Only first section expanded
          })
        }

        // Start new section
        currentSection = { title, titleVi, icon, contentType: type }
        currentContent = []
        foundSection = true
        break
      }
    }

    if (!foundSection && currentSection && trimmed) {
      currentContent.push(line)
    }
  }

  // Add last section
  if (currentSection) {
    sections.push({
      title: currentSection.title || "",
      titleVi: currentSection.titleVi,
      icon: currentSection.icon,
      contentType: currentSection.contentType || "normal",
      content: currentContent.join("\n").trim(),
      expanded: sections.length === 0,
    })
  }

  return sections.length > 0 ? sections : [{ title: "Answer", titleVi: "Câu trả lời", icon: "💬", contentType: "normal", content: text, expanded: true }]
}

export function AnswerEngine({ answer, confidence, lang = "en" }: AnswerEngineProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])) // Expand first section

  const sections = parseAnswerSections(answer, lang)

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSections(newExpanded)
  }

  const getContentTypeBadge = (type: "official" | "analysis" | "prediction" | "normal") => {
    if (type === "official") {
      return { label: lang === "en" ? "Official" : "Chính Thức", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" }
    }
    if (type === "analysis") {
      return { label: lang === "en" ? "AI Analysis" : "Phân Tích AI", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
    }
    if (type === "prediction") {
      return { label: lang === "en" ? "AI Prediction" : "Dự Đoán AI", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" }
    }
    return { label: "", bg: "", text: "", border: "" }
  }

  return (
    <div className="space-y-3 pi-fade-up">
      {/* Concise Summary First */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1.5">
          {lang === "en" ? "Quick Answer" : "Trả Lời Nhanh"}
        </p>
        {sections.length > 0 && (
          <p className="text-sm leading-relaxed text-foreground text-pretty line-clamp-3">
            {sections[0].content}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2 italic">
          {lang === "en" ? "Tap sections below to explore in depth" : "Nhấn các phần dưới để khám phá chi tiết"}
        </p>
      </div>

      {/* Expandable Sections */}
      {sections.map((section, idx) => {
        const badge = getContentTypeBadge(section.contentType)
        return (
          <div key={idx} className="rounded-lg border border-border bg-card overflow-hidden pi-fade-up" style={{ animationDelay: `${idx * 0.02}s` }}>
            {/* Section Header */}
            <button
              onClick={() => toggleSection(idx)}
              className={cx(
                "w-full px-4 py-3 flex items-center justify-between transition-colors",
                expandedSections.has(idx) ? "bg-primary/5" : "hover:bg-background/50"
              )}
            >
              <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                <span className="text-xl flex-shrink-0">{section.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground">
                    {lang === "vi" && section.titleVi ? section.titleVi : section.title}
                  </p>
                  {badge.label && (
                    <p className={cx("text-[10px] font-medium mt-0.5", badge.text)}>
                      {badge.label}
                    </p>
                  )}
                </div>
              </div>
              <IconChevronDown
                className={cx(
                  "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ml-2",
                  expandedSections.has(idx) ? "rotate-180" : ""
                )}
              />
            </button>

            {/* Section Content */}
            {expandedSections.has(idx) && (
              <div className="border-t border-border/50 px-4 py-3 bg-background/50 space-y-2">
                <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap text-pretty">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Confidence Score */}
      {confidence !== undefined && (
        <div className="rounded-lg border border-border/50 bg-card p-4 mt-4 space-y-3 pi-fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {lang === "en" ? "AI Confidence Score" : "Điểm Tin Cậy AI"}
              </span>
            </div>
            <span className={cx(
              "text-sm font-bold",
              confidence >= 85 ? "text-emerald-600" :
              confidence >= 70 ? "text-blue-600" :
              confidence >= 60 ? "text-amber-600" :
              "text-red-600"
            )}>
              {confidence}/100
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 bg-border/40 rounded-full overflow-hidden">
              <div
                className={cx(
                  "h-full transition-all duration-500",
                  confidence >= 85 ? "bg-emerald-500" :
                  confidence >= 70 ? "bg-blue-500" :
                  confidence >= 60 ? "bg-amber-500" :
                  "bg-red-500"
                )}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {confidence >= 85 && (lang === "en" ? "Based on multiple high-importance official sources that align perfectly." : "Dựa trên nhiều nguồn chính thức quan trọng phù hợp với nhau.")}
              {confidence >= 70 && confidence < 85 && (lang === "en" ? "Official sources mostly align; some synthesis required." : "Các nguồn chính thức phần lớn phù hợp; cần một số tổng hợp.")}
              {confidence >= 60 && confidence < 70 && (lang === "en" ? "Some official support; interpretation needed." : "Có một số hỗ trợ chính thức; cần giải thích.")}
              {confidence < 60 && (lang === "en" ? "Limited official sources — treat as analysis/prediction." : "Nguồn chính thức hạn chế — coi là phân tích/dự đoán.")}
            </p>
          </div>

          {/* Information Type Legend */}
          <div className="border-t border-border/30 pt-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {lang === "en" ? "Information Types" : "Loại Thông Tin"}
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                <span className={lang === "en" ? "text-green-700" : "text-green-700"}>{lang === "en" ? "Official" : "Chính Thức"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-blue-700">{lang === "en" ? "Analysis" : "Phân Tích"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-700">{lang === "en" ? "Prediction" : "Dự Đoán"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AnswerEngineLoading() {
  return (
    <div className="space-y-3 pi-fade-up">
      {/* Quick Answer Skeleton */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-3 animate-pulse">
        <div className="h-3 w-20 bg-muted rounded mb-2" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-4/5 bg-muted rounded" />
        </div>
      </div>

      {/* Section Skeletons */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card overflow-hidden animate-pulse">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="h-6 w-6 bg-muted rounded" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded mt-1.5" />
            </div>
            <div className="h-4 w-4 bg-muted rounded" />
          </div>
        </div>
      ))}

      {/* Confidence Score Skeleton */}
      <div className="rounded-lg border border-border/50 bg-card p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="h-2.5 w-full bg-muted rounded mb-3" />
        <div className="space-y-1">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-4/5 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}
