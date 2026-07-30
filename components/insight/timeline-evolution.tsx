"use client"

import { useState } from "react"
import { cx, Card, SectionLabel, Button } from "./ui"
import {
  IconChevronRight,
  IconAnalysis,
  IconSparkle,
  IconWarning,
  IconUsers,
} from "./icons"
import { formatDate, type Lang, type PiUpdate, UPDATES, relatedUpdates } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

export interface TimelineNode {
  id: string
  title: string
  date: string
  type: "milestone" | "update"
  importance: number
  isOfficial: boolean
  topic?: string
  description?: string
}

export interface TimelineEdge {
  from: string
  to: string
  relationship: string // "Enabled by", "Led to", "Related to", etc.
  explanation: string
}

/**
 * Build timeline graph for an update, showing connected milestones and dependencies.
 * Returns nodes (milestones + related updates) and edges (connections).
 */
function buildTimelineGraph(update: PiUpdate, lang: Lang): { nodes: TimelineNode[]; edges: TimelineEdge[] } {
  const nodes: TimelineNode[] = []
  const edges: TimelineEdge[] = []

  // Add the update's milestones as nodes
  for (const milestone of update.timeline) {
    nodes.push({
      id: `milestone-${milestone.date}`,
      title: milestone.title[lang],
      date: milestone.date,
      type: "milestone",
      importance: update.importance,
      isOfficial: true,
      topic: update.topic,
      description: update.summary[lang],
    })
  }

  // Find related updates and add them as nodes
  const relatedIds = relatedUpdates(update.id)
  for (const relId of relatedIds.slice(0, 3)) {
    // Limit to 3 related to avoid clutter
    const rel = UPDATES.find((u) => u.id === relId)
    if (rel) {
      nodes.push({
        id: `update-${rel.id}`,
        title: rel.title[lang],
        date: rel.date,
        type: "update",
        importance: rel.importance,
        isOfficial: true,
        topic: rel.topic,
        description: rel.summary[lang],
      })
    }
  }

  // Sort nodes by date
  nodes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Add edges between consecutive milestones
  for (let i = 0; i < update.timeline.length - 1; i++) {
    const from = update.timeline[i]
    const to = update.timeline[i + 1]
    edges.push({
      from: `milestone-${from.date}`,
      to: `milestone-${to.date}`,
      relationship: "Led to",
      explanation: `${from.title[lang]} enabled the subsequent milestone: ${to.title[lang]}`,
    })
  }

  return { nodes, edges }
}

export function TimelineEvolution({
  update,
  lang,
  t,
  onOpenUpdate,
}: {
  update: PiUpdate
  lang: Lang
  t: TFn
  onOpenUpdate?: (updateId: string) => void
}) {
  const { nodes, edges } = buildTimelineGraph(update, lang)
  const [expandedNode, setExpandedNode] = useState<string | null>(null)

  return (
    <section className="space-y-4 pi-fade-up">
      <SectionLabel tone="analysis">{t("timelineEvolution")}</SectionLabel>

      <Card className="bg-muted/50 p-4 space-y-4">
        {/* Timeline Visualization */}
        <div className="space-y-3">
          {nodes.map((node, idx) => {
            const isExpanded = expandedNode === node.id
            const edge = edges.find((e) => e.from === node.id)

            return (
              <div key={node.id} className="space-y-2">
                {/* Timeline node */}
                <div className="flex items-start gap-3 relative">
                  {/* Connector line (vertical) */}
                  {idx < nodes.length - 1 && (
                    <div className="absolute left-5 top-[2.5rem] h-6 w-0.5 bg-primary/20" />
                  )}

                  {/* Node marker */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={cx(
                        "h-4 w-4 rounded-full border-2 ring-2 ring-background",
                        node.type === "update"
                          ? "border-primary bg-primary/80 ring-primary/20"
                          : "border-primary/40 bg-background"
                      )}
                    />
                  </div>

                  {/* Node content */}
                  <button
                    onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                    className={cx(
                      "flex-1 pi-press text-left rounded-lg p-3 transition-colors",
                      isExpanded
                        ? "bg-card border border-primary/30 shadow-sm"
                        : "hover:bg-card/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Title and type */}
                        <div className="flex items-center gap-2 mb-1">
                          {node.type === "update" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                              <IconSparkle className="h-3 w-3" />
                              {t("update")}
                            </span>
                          )}
                          {node.type === "milestone" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
                              {t("milestone")}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-foreground text-balance leading-snug">
                          {node.title}
                        </h3>
                        <p className="text-xs text-muted-foreground pi-nums mt-0.5">
                          {formatDate(node.date, lang)}
                        </p>
                      </div>
                      <IconChevronRight
                        className={cx(
                          "h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                        {/* Official Information Section */}
                        {node.description && (
                          <div className="rounded-lg border border-green-200 bg-green-50/50 p-2.5 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600" />
                              <p className="text-xs font-semibold text-green-700">{lang === "en" ? "Official Information" : "Thông Tin Chính Thức"}</p>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">
                              {node.description}
                            </p>
                          </div>
                        )}

                        {/* AI Analysis - Why This Led to Next */}
                        {edge && (
                          <div className="flex gap-2 p-2.5 bg-blue-50/50 rounded-lg border border-blue-200">
                            <IconAnalysis className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1 flex-1">
                              <p className="text-xs font-semibold text-blue-600">{lang === "en" ? "AI Analysis: Evolution" : "Phân tích AI: Tiến Hóa"}</p>
                              <p className="text-xs text-foreground/90">
                                <strong>{edge.relationship}:</strong> {edge.explanation}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Open update button */}
                        {node.type === "update" && onOpenUpdate && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              const relId = node.id.replace("update-", "")
                              onOpenUpdate(relId)
                            }}
                            className="mt-2 w-full py-2"
                            variant="secondary"
                          >
                            <span>{t("viewFullUpdate")}</span>
                            <IconChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* AI Analysis of progression - Clearly separated from official info */}
        <div className="pt-3 mt-3 border-t border-border/50 space-y-3">
          <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-200">
            <IconAnalysis className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-semibold text-blue-600">{lang === "en" ? "AI Analysis: Why This Matters" : "Phân tích AI: Tại sao Điều Này Quan Trọng"}</p>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {lang === "vi"
                  ? `${update.title[lang]} đánh dấu một bước tiến quan trọng trong tiến trình phát triển của Pi. Những cột mốc này cho thấy cách các tính năng được xây dựng từng bước, mỗi bước tạo nền tảng cho những bước tiếp theo. Sự tiến hóa này không phải ngẫu nhiên - mỗi cập nhật được thiết kế để giải quyết những khách quan từ trước đó.`
                  : `${update.title[lang]} marks an important step in Pi's development journey. These milestones show how features were built progressively, each step laying the groundwork for what came next. This evolution is not random—each update was designed to address prior constraints and enable new possibilities.`}
              </p>
            </div>
          </div>
          
          {/* Evolution flow explanation */}
          <div className="bg-amber-50/50 rounded-lg border border-amber-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-amber-700">{lang === "en" ? "Evolution Pattern" : "Mô hình Tiến Hóa"}</p>
            <div className="space-y-1.5 text-xs text-foreground/80">
              <div className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0 mt-1.5" />
                <span>{lang === "en" ? "Official milestone establishes capability" : "Cột mốc chính thức thiết lập khả năng"}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                <span>{lang === "en" ? "AI analysis identifies dependencies and implications" : "Phân tích AI xác định phụ thuộc và hàm ý"}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0 mt-1.5" />
                <span>{lang === "en" ? "Following milestones become possible or necessary" : "Các cột mốc tiếp theo trở nên khả thi hoặc cần thiết"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}

export function TimelineEvolutionFull({
  lang,
  t,
  onOpenUpdate,
}: {
  lang: Lang
  t: TFn
  onOpenUpdate?: (updateId: string) => void
}) {
  // Create a master timeline showing all updates and their interconnections
  const allUpdates = UPDATES.slice(0, 5) // Show last 5 major updates
  const nodes: TimelineNode[] = []
  const edges: TimelineEdge[] = []

  // Add all updates as nodes
  for (const update of allUpdates) {
    nodes.push({
      id: `update-${update.id}`,
      title: update.title[lang],
      date: update.date,
      type: "update",
      importance: update.importance,
      isOfficial: true,
      topic: update.topic,
      description: update.summary[lang],
    })
  }

  // Sort by date
  nodes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Connect consecutive updates based on logical flow
  for (let i = 0; i < allUpdates.length - 1; i++) {
    const current = allUpdates[i]
    const next = allUpdates[i + 1]
    const relationship = current.related.includes(next.id) ? "Directly enabled" : "Supported"

    edges.push({
      from: `update-${current.id}`,
      to: `update-${next.id}`,
      relationship,
      explanation: `${current.title[lang]} created conditions for ${next.title[lang]}.`,
    })
  }

  const [expandedNode, setExpandedNode] = useState<string | null>(null)

  return (
    <div className="min-h-[100dvh] bg-background pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur pi-safe-top">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">{t("piEvolution")}</h1>
            <p className="text-xs text-muted-foreground">{t("timelineSubtitle")}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-6 px-4 py-5">
        <SectionLabel tone="official">{t("majorMilestones")}</SectionLabel>

        <div className="space-y-3">
          {nodes.map((node, idx) => {
            const isExpanded = expandedNode === node.id
            const edge = edges.find((e) => e.from === node.id)

            return (
              <div key={node.id} className="space-y-2 pi-fade-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                {/* Connector line */}
                {idx < nodes.length - 1 && (
                  <div className="ml-7 h-4 w-0.5 bg-primary/20" />
                )}

                <div className="flex items-start gap-3">
                  {/* Node marker with importance indicator */}
                  <div className="flex-shrink-0 mt-1 relative">
                    <div
                      className={cx(
                        "h-5 w-5 rounded-full border-2 ring-2 ring-background shadow-sm",
                        node.importance >= 8
                          ? "border-imp-high bg-imp-high/80 ring-imp-high/20"
                          : node.importance >= 5
                            ? "border-imp-mid bg-imp-mid/60 ring-imp-mid/20"
                            : "border-imp-low bg-imp-low/50 ring-imp-low/20"
                      )}
                    />
                  </div>

                  {/* Node card */}
                  <button
                    onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                    className={cx(
                      "flex-1 pi-press text-left rounded-lg p-3 transition-all",
                      isExpanded
                        ? "bg-card border border-primary/30 shadow-sm"
                        : "bg-muted/40 hover:bg-muted/60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            <IconSparkle className="h-3 w-3" />
                            {update?.topic || "Major"}
                          </span>
                          {node.importance >= 8 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-imp-high-soft text-imp-high">
                              Critical
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-foreground text-balance leading-snug">
                          {node.title}
                        </h3>
                        <p className="text-xs text-muted-foreground pi-nums mt-0.5">
                          {formatDate(node.date, lang)}
                        </p>
                      </div>
                      <IconChevronRight
                        className={cx(
                          "h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </div>

                    {/* Expanded view */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                        {node.description && (
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {node.description}
                          </p>
                        )}

                        {/* Progression explanation */}
                        {edge && (
                          <div className="flex gap-2 p-3 bg-analysis-soft/30 rounded border border-analysis/20">
                            <IconAnalysis className="h-4 w-4 text-analysis flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-foreground">
                                {edge.relationship}
                              </p>
                              <p className="text-xs text-foreground/75">
                                {edge.explanation}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* View update button */}
                        {onOpenUpdate && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              const updateId = node.id.replace("update-", "")
                              onOpenUpdate(updateId)
                            }}
                            className="w-full py-2 text-sm"
                            variant="secondary"
                          >
                            {t("viewFullUpdate")}
                            <IconChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Educational summary */}
        <Card className="bg-prediction-soft/50 border border-prediction/20 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <IconWarning className="h-4 w-4 text-prediction flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-semibold text-foreground">{t("understandingTheJourney")}</p>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {lang === "vi"
                  ? "Mỗi cập nhật không phải là sự kiện độc lập—chúng là các phần của một câu chuyện liên tục. Mỗi cột mốc tạo nền tảng cho những bước tiếp theo, cùng nhau hình thành sự phát triển của mạng Pi."
                  : "Each update is not a standalone event—they're all parts of one continuous story. Each milestone builds the foundation for what comes next, together shaping Pi Network's evolution."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
