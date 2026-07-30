"use client"

import { useState, useMemo } from "react"
import { cx, Card, Button, IconButton } from "./ui"
import {
  IconChevronRight,
  IconSearch,
  IconBack,
  IconSparkle,
  IconAnalysis,
  IconWarning,
  IconUsers,
  IconClock,
} from "./icons"
import { useInsight } from "@/contexts/insight-context"
import { UPDATES, TOPICS, topicLabel, sortedUpdates, type Topic, type PiUpdate } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

type ViewMode = "chronological" | "dependency"

interface TimelineNode {
  id: string
  title: string
  date: string
  type: "milestone" | "update"
  importance: number
  topic: string
  description: string
  prerequisites: string[]
  dependents: string[]
  aiExplanation: string
}

interface TimelineContext {
  nodes: TimelineNode[]
  eventsBy: Record<string, TimelineNode[]>
  summary: {
    official: string
    analysis: string
    turning_points: string[]
  }
}

function buildTimelineContext(topic: Topic | null, lang: "en" | "vi"): TimelineContext {
  const filteredUpdates = topic ? sortedUpdates().filter(u => u.topic === topic) : sortedUpdates()
  const nodes: TimelineNode[] = []

  for (const update of filteredUpdates) {
    nodes.push({
      id: update.id,
      title: update.title[lang],
      date: update.date,
      type: "update",
      importance: update.importance,
      topic: update.topic,
      description: update.summary[lang],
      prerequisites: update.relatedUpdates?.slice(0, 2) || [],
      dependents: UPDATES.filter(u => 
        u.relatedUpdates?.includes(update.id) && u.date > update.date
      ).map(u => u.id),
      aiExplanation: update.impact?.why?.[lang] || "",
    })
  }

  // Sort by date
  nodes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Group by year
  const eventsBy: Record<string, TimelineNode[]> = {}
  for (const node of nodes) {
    const year = new Date(node.date).getFullYear().toString()
    if (!eventsBy[year]) eventsBy[year] = []
    eventsBy[year].push(node)
  }

  // Generate summary
  const officialCount = nodes.length
  const importantNodes = nodes.filter(n => n.importance >= 8)
  const majorTurningPoints: string[] = []

  if (nodes.length > 0) {
    majorTurningPoints.push(nodes[0].title) // First milestone
    if (importantNodes.length > 0) {
      majorTurningPoints.push(importantNodes[0].title) // Most important
    }
    if (nodes.length > 1) {
      majorTurningPoints.push(nodes[nodes.length - 1].title) // Latest
    }
  }

  const officialText = lang === "en"
    ? `${officialCount} official updates tracked${topic ? ` for ${topicLabel(topic, lang)}` : ""}`
    : `${officialCount} cập nhật chính thức được theo dõi${topic ? ` cho ${topicLabel(topic, lang)}` : ""}`

  const analysisText = lang === "en"
    ? `AI identified ${importantNodes.length} high-impact events and ${majorTurningPoints.length} major turning points in the timeline`
    : `AI xác định ${importantNodes.length} sự kiện có tác động cao và ${majorTurningPoints.length} điểm quay cuộc lớn trong dòng thời gian`

  return {
    nodes,
    eventsBy,
    summary: {
      official: officialText,
      analysis: analysisText,
      turning_points: majorTurningPoints,
    },
  }
}

interface TimelineNodeCardProps {
  node: TimelineNode
  lang: "en" | "vi"
  t: TFn
  onOpen?: () => void
  isExpanded?: boolean
  onToggle?: () => void
}

function TimelineNodeCard({ node, lang, t, onOpen, isExpanded, onToggle }: TimelineNodeCardProps) {
  const isHighImpact = node.importance >= 8

  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className={cx(
          "pi-press w-full rounded-lg p-3 text-left transition-colors",
          isExpanded ? "bg-card border border-primary/30" : "hover:bg-card/50"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Timeline marker */}
          <div className="mt-1 flex-shrink-0">
            <div
              className={cx(
                "h-3 w-3 rounded-full ring-2 ring-background",
                isHighImpact ? "bg-primary border-2 border-primary" : "bg-primary/40 border border-primary/40"
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-semibold">
                    {lang === "en" ? "Official" : "Chính Thức"}
                  </span>
                  {isHighImpact && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">
                      {lang === "en" ? "Priority" : "Ưu tiên"}
                    </span>
                  )}
                </div>
                <p className="font-medium text-foreground leading-snug">{node.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{node.date}</p>
              </div>
            </div>
          </div>

          <IconChevronRight className={cx("h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform", isExpanded && "rotate-90")} />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="ml-7 space-y-3 pl-3 pb-2 border-l-2 border-primary/20">
          {/* Official Information - Before */}
          {node.prerequisites.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-600" />
                <p className="text-xs font-semibold text-green-700">
                  {lang === "en" ? "Before This Milestone" : "Trước Cột Mốc Này"}
                </p>
              </div>
              <p className="text-xs text-foreground/80">{lang === "en" ? "Required prerequisites and earlier updates" : "Các điều kiện tiên quyết và cập nhật trước đó"}</p>
              <div className="flex flex-wrap gap-1">
                {node.prerequisites.map(id => (
                  <span key={id} className="text-xs bg-white px-2 py-1 rounded border border-green-200">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description - Official Information */}
          {node.description && (
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-600" />
                <p className="text-xs font-semibold text-green-700">
                  {lang === "en" ? "Official Information" : "Thông Tin Chính Thức"}
                </p>
              </div>
              <p className="text-sm text-foreground/90">{node.description}</p>
            </div>
          )}

          {/* AI Analysis - Why it led to what came next */}
          {node.aiExplanation && (
            <Card className="border-blue-200 bg-blue-50/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <IconSparkle className="h-3.5 w-3.5 text-blue-600" />
                <p className="text-xs font-semibold text-blue-600">
                  {lang === "en" ? "AI Analysis: Why This Mattered" : "Phân tích AI: Tại sao Điều Này Quan Trọng"}
                </p>
              </div>
              <p className="text-sm text-foreground/80">{node.aiExplanation}</p>
            </Card>
          )}

          {/* Dependents - After */}
          {node.dependents.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-600" />
                <p className="text-xs font-semibold text-amber-700">
                  {lang === "en" ? "After This Milestone" : "Sau Cột Mốc Này"}
                </p>
              </div>
              <p className="text-xs text-foreground/80">{lang === "en" ? "Updates and features that were made possible" : "Các cập nhật và tính năng trở nên khả thi"}</p>
              <div className="flex flex-wrap gap-1">
                {node.dependents.map(id => (
                  <span key={id} className="text-xs bg-white px-2 py-1 rounded border border-amber-200">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Open action */}
          <Button
            onClick={onOpen}
            variant="ghost"
            className="w-full h-auto py-2 text-xs"
          >
            {lang === "en" ? "View Full Update →" : "Xem Cập nhật Đầy đủ →"}
          </Button>
        </div>
      )}
    </div>
  )
}

export function TimelineExplorer({
  onBack,
  onOpenUpdate,
  lang,
  t,
}: {
  onBack: () => void
  onOpenUpdate?: (updateId: string) => void
  lang: "en" | "vi"
  t: TFn
}) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("chronological")
  const [expandedNode, setExpandedNode] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)

  const context = useMemo(() => buildTimelineContext(selectedTopic, lang), [selectedTopic, lang])

  // Filter nodes by search
  const filteredNodes = useMemo(() => {
    return context.nodes.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [context.nodes, searchQuery])

  // Sort for dependency view (by importance then date)
  const displayNodes = viewMode === "dependency"
    ? [...filteredNodes].sort((a, b) => b.importance - a.importance || new Date(b.date).getTime() - new Date(a.date).getTime())
    : filteredNodes

  const yearsWithEvents = Object.keys(context.eventsBy).sort().reverse()

  return (
    <div className="space-y-4">
      {/* Evolution Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <IconSparkle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-bold text-foreground">
              {lang === "en" ? "Evolution Summary" : "Tóm tắt tiến hóa"}
            </h3>
            <p className="text-xs text-foreground/80">{context.summary.official}</p>
            <p className="text-xs text-foreground/70 italic">{context.summary.analysis}</p>
            
            {/* Turning points */}
            {context.summary.turning_points.length > 0 && (
              <div className="pt-2 border-t border-primary/10">
                <p className="text-xs font-semibold text-foreground/70 mb-1">
                  {lang === "en" ? "Major Turning Points:" : "Điểm quay cuộc lớn:"}
                </p>
                <ul className="space-y-1">
                  {context.summary.turning_points.map((point, i) => (
                    <li key={i} className="text-xs text-foreground/60 flex items-start gap-2">
                      <span className="text-primary flex-shrink-0 mt-0.5">▸</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="space-y-3">
        {/* View mode toggle */}
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={() => setViewMode("chronological")}
            className={cx(
              "pi-press flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors",
              viewMode === "chronological"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {lang === "en" ? "Timeline" : "Dòng thời gian"}
          </button>
          <button
            onClick={() => setViewMode("dependency")}
            className={cx(
              "pi-press flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors",
              viewMode === "dependency"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {lang === "en" ? "Dependencies" : "Phụ thuộc"}
          </button>
        </div>

        {/* Topic filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedTopic(null)}
            className={cx(
              "pi-press flex-shrink-0 py-2 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              !selectedTopic
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {lang === "en" ? "All" : "Tất cả"}
          </button>
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={cx(
                "pi-press flex-shrink-0 py-2 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                selectedTopic === topic.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {topic.label[lang]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder={lang === "en" ? "Search updates..." : "Tìm kiếm cập nhật..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pi-press w-full pl-9 pr-3 py-2 rounded-lg bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Timeline content */}
      {viewMode === "chronological" ? (
        // Chronological view grouped by year
        <div className="space-y-6">
          {yearsWithEvents.map(year => {
            const yearEvents = context.eventsBy[year]
            const visibleEvents = searchQuery
              ? yearEvents.filter(e => displayNodes.some(n => n.id === e.id))
              : yearEvents

            if (visibleEvents.length === 0) return null

            return (
              <div key={year} className="space-y-3">
                <button
                  onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80"
                >
                  <span>{year}</span>
                  <div className="flex-1 h-px bg-primary/20" />
                  <IconChevronRight
                    className={cx(
                      "h-4 w-4 transition-transform",
                      selectedYear === year && "rotate-90"
                    )}
                  />
                </button>

                {(selectedYear === null || selectedYear === year) && (
                  <div className="space-y-3 pl-2">
                    {visibleEvents.map(node => (
                      <TimelineNodeCard
                        key={node.id}
                        node={node}
                        lang={lang}
                        t={t}
                        isExpanded={expandedNode === node.id}
                        onToggle={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                        onOpen={() => onOpenUpdate?.(node.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        // Dependency view sorted by importance
        <div className="space-y-2">
          {displayNodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                {lang === "en" ? "No updates found" : "Không tìm thấy cập nhật"}
              </p>
            </div>
          ) : (
            displayNodes.map(node => (
              <TimelineNodeCard
                key={node.id}
                node={node}
                lang={lang}
                t={t}
                isExpanded={expandedNode === node.id}
                onToggle={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                onOpen={() => onOpenUpdate?.(node.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Empty state */}
      {filteredNodes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {lang === "en"
              ? "No updates match your search"
              : "Không có cập nhật nào phù hợp với tìm kiếm của bạn"}
          </p>
        </div>
      )}
    </div>
  )
}
