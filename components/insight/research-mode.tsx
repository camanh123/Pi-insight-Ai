"use client"

import { useState, useMemo } from "react"
import { cx, Button } from "./ui"
import {
  IconChevronDown,
  IconCheckCircle,
  IconSparkle,
  IconAlertCircle,
  IconClock,
  IconBookmark,
  IconLink,
} from "./icons"
import type { ResearchResponse, Lang } from "@/lib/insight/data"

interface ResearchModeProps {
  research: ResearchResponse
  lang: Lang
}

interface ResearchSection {
  id: string
  title: string
  titleVi: string
  icon: string
  type: "official" | "analysis" | "conclusion"
  content: string
  contentVi: string
  technicalDetails?: string
  technicalDetailsVi?: string
  confidence?: number
  expandable?: boolean
}

export function ResearchMode({ research, lang }: ResearchModeProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["keyFindings"]))
  const [expandedTechnical, setExpandedTechnical] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleTechnical = (sectionId: string) => {
    const newExpanded = new Set(expandedTechnical)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedTechnical(newExpanded)
  }

  // Build sections from research data
  const sections: ResearchSection[] = useMemo(
    () => [
      {
        id: "keyFindings",
        title: "Key Findings",
        titleVi: "Những Phát Hiện Chính",
        icon: "🔍",
        type: "analysis",
        content: research.keyFindings.en,
        contentVi: research.keyFindings.vi,
        expandable: true,
      },
      {
        id: "officialEvidence",
        title: "Official Evidence",
        titleVi: "Bằng Chứng Chính Thức",
        icon: "📋",
        type: "official",
        content: `${research.officialEvidence.length} official update${research.officialEvidence.length > 1 ? "s" : ""} analyzed`,
        contentVi: `${research.officialEvidence.length} cập nhật chính thức được phân tích`,
        expandable: true,
      },
      {
        id: "aiAnalysis",
        title: "AI Analysis",
        titleVi: "Phân Tích AI",
        icon: "💡",
        type: "analysis",
        content: research.aiAnalysis.en,
        contentVi: research.aiAnalysis.vi,
        technicalDetails: research.technicalDetails.en,
        technicalDetailsVi: research.technicalDetails.vi,
        confidence: research.analysisConfidence,
        expandable: true,
      },
      {
        id: "conclusion",
        title: "Final Conclusion",
        titleVi: "Kết Luận Cuối Cùng",
        icon: "⭐",
        type: "conclusion",
        content: research.conclusion.en,
        contentVi: research.conclusion.vi,
        confidence: research.conclusionConfidence,
        expandable: false,
      },
    ],
    [research]
  )

  const getContentTypeBadge = (type: "official" | "analysis" | "conclusion") => {
    if (type === "official") {
      return {
        label: lang === "en" ? "Official Sources" : "Nguồn Chính Thức",
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      }
    }
    if (type === "analysis") {
      return {
        label: lang === "en" ? "AI Analysis" : "Phân Tích AI",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      }
    }
    if (type === "conclusion") {
      return {
        label: lang === "en" ? "Synthesis & Conclusion" : "Tổng Hợp & Kết Luận",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      }
    }
    return { label: "", bg: "", text: "", border: "" }
  }

  const confidenceColor = (conf: number) => {
    if (conf >= 85) return "text-emerald-600"
    if (conf >= 70) return "text-blue-600"
    if (conf >= 60) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-4 pi-fade-up">
      {/* Research Header */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-2xl">🔬</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {lang === "en" ? "Multi-Update Research Synthesis" : "Tổng Hợp Nghiên Cứu Nhiều Cập Nhật"}
            </p>
            <p className="text-sm leading-relaxed text-foreground mt-1 text-pretty">
              {lang === "en" ? "This analysis synthesizes" : "Phân tích này tổng hợp"} {research.officialEvidence.length}{" "}
              {lang === "en" ? "official Pi Network updates" : "cập nhật chính thức của Pi Network"} {lang === "en" ? "into one comprehensive conclusion." : "thành một kết luận toàn diện."}
            </p>
          </div>
        </div>

        {/* Information Type Legend */}
        <div className="border-t border-primary/20 pt-3 mt-3">
          <div className="grid grid-cols-3 gap-2 text-[9px]">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-700 font-medium">{lang === "en" ? "Official" : "Chính Thức"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-blue-700 font-medium">{lang === "en" ? "Analysis" : "Phân Tích"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-purple-700 font-medium">{lang === "en" ? "Synthesis" : "Tổng Hợp"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      {sections.map((section, idx) => {
        const badge = getContentTypeBadge(section.type)
        const isExpanded = expandedSections.has(section.id)
        const isTechExpanded = expandedTechnical.has(section.id)

        return (
          <div
            key={section.id}
            className="rounded-lg border border-border bg-card overflow-hidden pi-fade-up"
            style={{ animationDelay: `${idx * 0.03}s` }}
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className={cx(
                "w-full px-4 py-3 flex items-center justify-between transition-colors",
                isExpanded ? "bg-primary/5" : "hover:bg-background/50"
              )}
            >
              <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                <span className="text-xl flex-shrink-0">{section.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground">
                    {lang === "vi" ? section.titleVi : section.title}
                  </p>
                  <p className={cx("text-[10px] font-medium mt-0.5", badge.text)}>{badge.label}</p>
                </div>
              </div>
              {section.expandable && (
                <IconChevronDown
                  className={cx(
                    "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ml-2",
                    isExpanded ? "rotate-180" : ""
                  )}
                />
              )}
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="border-t border-border/50 px-4 py-3 bg-background/50 space-y-3">
                {section.id === "officialEvidence" ? (
                  <div className="space-y-2">
                    {research.officialEvidence.map((evidence, eIdx) => (
                      <div key={eIdx} className="rounded-lg bg-card/50 p-2.5 border border-green-200/50">
                        <div className="flex items-start gap-2">
                          <IconCheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">
                              {lang === "vi" ? evidence.title.vi : evidence.title.en}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                              {lang === "vi" ? evidence.excerpt.vi : evidence.excerpt.en}
                            </p>
                            <a
                              href={`#update-${evidence.updateId}`}
                              className="text-[10px] text-primary hover:underline mt-1 inline-block"
                            >
                              {lang === "en" ? "View update ↗" : "Xem cập nhật ↗"}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap text-pretty">
                      {lang === "vi" ? section.contentVi : section.content}
                    </p>

                    {/* Technical Details Expandable */}
                    {section.technicalDetails && (
                      <div className="border-t border-border/30 pt-3 mt-3">
                        <button
                          onClick={() => toggleTechnical(section.id)}
                          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <IconChevronDown
                            className={cx(
                              "h-3 w-3 transition-transform",
                              isTechExpanded ? "rotate-180" : ""
                            )}
                          />
                          {lang === "en" ? "Technical Details" : "Chi Tiết Kỹ Thuật"}
                        </button>

                        {isTechExpanded && (
                          <div className="mt-2 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                            <p className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap text-pretty font-mono">
                              {lang === "vi" ? section.technicalDetailsVi : section.technicalDetails}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Confidence Score for this section */}
                {section.confidence !== undefined && (
                  <div className="border-t border-border/30 pt-2 mt-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {lang === "en" ? "Confidence" : "Tin Cậy"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-16 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className={cx(
                              "h-full transition-all",
                              section.confidence >= 85
                                ? "bg-emerald-500"
                                : section.confidence >= 70
                                  ? "bg-blue-500"
                                  : section.confidence >= 60
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                            )}
                            style={{ width: `${section.confidence}%` }}
                          />
                        </div>
                        <span className={cx("text-[10px] font-bold", confidenceColor(section.confidence))}>
                          {section.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Related Updates Discovery */}
      {research.relatedUpdates.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3 pi-fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2">
            <IconLink className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === "en" ? "Related Updates to Explore" : "Cập Nhật Liên Quan Để Khám Phá"}
            </p>
          </div>
          <div className="space-y-2">
            {research.relatedUpdates.map((related, idx) => (
              <a
                key={idx}
                href={`#update-${related.id}`}
                className="block rounded-lg border border-border/40 bg-background/50 p-2.5 hover:bg-background/80 transition-colors"
              >
                <p className="text-xs font-medium text-foreground">{lang === "vi" ? related.title.vi : related.title.en}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{lang === "vi" ? related.reason.vi : related.reason.en}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-lg border border-border/50 bg-card p-4 space-y-2 pi-fade-up" style={{ animationDelay: "0.35s" }}>
        <div className="flex items-center gap-2 mb-2">
          <IconClock className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {lang === "en" ? "Analysis Timeline" : "Dòng Thời Gian Phân Tích"}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === "en"
            ? `Analyzed ${research.officialEvidence.length} official Pi updates spanning multiple months of development.`
            : `Đã phân tích ${research.officialEvidence.length} cập nhật chính thức của Pi trải dài nhiều tháng phát triển.`}
        </p>
      </div>

      {/* Overall Confidence Score */}
      <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3 pi-fade-up" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === "en" ? "Research Confidence Score" : "Điểm Tin Cậy Nghiên Cứu"}
            </span>
          </div>
          <span className={cx("text-sm font-bold", confidenceColor(research.conclusionConfidence))}>
            {research.conclusionConfidence}/100
          </span>
        </div>

        <div className="space-y-2">
          <div className="h-2.5 bg-border/40 rounded-full overflow-hidden">
            <div
              className={cx(
                "h-full transition-all duration-500",
                research.conclusionConfidence >= 85
                  ? "bg-emerald-500"
                  : research.conclusionConfidence >= 70
                    ? "bg-blue-500"
                    : research.conclusionConfidence >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
              )}
              style={{ width: `${research.conclusionConfidence}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {research.conclusionConfidence >= 85 &&
              (lang === "en"
                ? "Based on multiple high-importance official sources that align perfectly."
                : "Dựa trên nhiều nguồn chính thức quan trọng phù hợp với nhau.")}
            {research.conclusionConfidence >= 70 &&
              research.conclusionConfidence < 85 &&
              (lang === "en"
                ? "Official sources mostly align; synthesis is well-supported."
                : "Các nguồn chính thức phần lớn phù hợp; tổng hợp được hỗ trợ tốt.")}
            {research.conclusionConfidence >= 60 &&
              research.conclusionConfidence < 70 &&
              (lang === "en"
                ? "Some official support; interpretation and synthesis required."
                : "Có một số hỗ trợ chính thức; cần giải thích và tổng hợp.")}
            {research.conclusionConfidence < 60 &&
              (lang === "en"
                ? "Limited sources — conclusion involves significant synthesis and analysis."
                : "Nguồn hạn chế — kết luận liên quan đến tổng hợp và phân tích đáng kể.")}
          </p>
        </div>

        {/* Methodology Note */}
        <div className="border-t border-border/30 pt-3">
          <p className="text-[10px] text-muted-foreground italic">
            {lang === "en"
              ? "This research synthesizes multiple official Pi updates using AI analysis to identify patterns, connections, and implications. Never speculate beyond what official sources support."
              : "Nghiên cứu này tổng hợp nhiều cập nhật chính thức của Pi bằng cách sử dụng phân tích AI để xác định các mô hình, kết nối và hàm ý. Không bao giờ suy đoán vượt ra ngoài những gì các nguồn chính thức hỗ trợ."}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ResearchModeLoading() {
  return (
    <div className="space-y-4 pi-fade-up">
      {/* Header Skeleton */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 animate-pulse">
        <div className="flex items-start gap-3 mb-2">
          <div className="h-8 w-8 bg-muted rounded" />
          <div className="flex-1">
            <div className="h-3 w-32 bg-muted rounded mb-2" />
            <div className="space-y-1">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-5/6 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Section Skeletons */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card overflow-hidden animate-pulse">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="h-6 w-6 bg-muted rounded" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded mt-1.5" />
            </div>
            <div className="h-4 w-4 bg-muted rounded" />
          </div>
        </div>
      ))}

      {/* Confidence Skeleton */}
      <div className="rounded-lg border border-border/50 bg-card p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="h-2.5 w-full bg-muted rounded" />
      </div>
    </div>
  )
}
