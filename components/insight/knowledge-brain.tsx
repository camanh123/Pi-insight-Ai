"use client"

import { useState, useMemo } from "react"
import { cx } from "./ui"
import { 
  KNOWLEDGE_GRAPH_NODES, 
  KNOWLEDGE_GRAPH_EDGES,
  type Lang,
  type Topic,
  type KnowledgeGraphNode
} from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"
import { 
  IconSearch, 
  IconChevronDown, 
  IconX,
  IconSparkle,
  IconTrendingUp,
  IconCheckCircle,
  IconAlertCircle,
  IconUsers,
  IconZoomIn,
  IconZoomOut,
  IconFilter
} from "./icons"

interface KnowledgeBrainProps {
  lang: Lang
  t: TFn
}

type FilterType = "all" | "importance-high" | "updated-recent" | "affected-pioneers" | "affected-developers"

export function KnowledgeBrain({ lang, t }: KnowledgeBrainProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview"]))

  // Filter and search topics
  const filteredTopics = useMemo(() => {
    let topics = KNOWLEDGE_GRAPH_NODES

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      topics = topics.filter(
        (t) =>
          t.label[lang].toLowerCase().includes(query) ||
          t.description[lang].toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (activeFilter === "importance-high") {
      topics = topics.filter((t) => t.importanceScore >= 8)
    } else if (activeFilter === "updated-recent") {
      topics = topics.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    } else if (activeFilter === "affected-pioneers") {
      topics = topics.filter((t) => t.affectedGroups.includes("pioneers"))
    } else if (activeFilter === "affected-developers") {
      topics = topics.filter((t) => t.affectedGroups.includes("developers"))
    }

    return topics
  }, [searchQuery, activeFilter, lang])

  // Calculate topic health (0-100)
  const getTopicHealth = (node: KnowledgeGraphNode): number => {
    return Math.min(100, (node.updateCount * 15) + (node.importanceScore * 8))
  }

  // Get health color
  const getHealthColor = (health: number): string => {
    if (health >= 80) return "text-emerald-600"
    if (health >= 60) return "text-blue-600"
    if (health >= 40) return "text-amber-600"
    return "text-red-600"
  }

  // Get dependencies names
  const getDependencyNames = (deps: Topic[]): KnowledgeGraphNode[] => {
    return deps.map(id => KNOWLEDGE_GRAPH_NODES.find(n => n.id === id)).filter(Boolean) as KnowledgeGraphNode[]
  }

  // Get related topics
  const getRelatedTopics = (topicId: Topic): KnowledgeGraphNode[] => {
    const edges = KNOWLEDGE_GRAPH_EDGES.filter(e => e.from === topicId || e.to === topicId)
    const relatedIds = new Set<Topic>()
    edges.forEach(e => {
      if (e.from === topicId) relatedIds.add(e.to)
      if (e.to === topicId) relatedIds.add(e.from)
    })
    return Array.from(relatedIds)
      .map(id => KNOWLEDGE_GRAPH_NODES.find(n => n.id === id))
      .filter(Boolean) as KnowledgeGraphNode[]
  }

  // Toggle section expand
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const selectedNode = selectedTopic ? KNOWLEDGE_GRAPH_NODES.find(n => n.id === selectedTopic) : null
  const topicHealth = selectedNode ? getTopicHealth(selectedNode) : 0
  const dependencyNodes = selectedNode ? getDependencyNames(selectedNode.dependencies) : []
  const relatedTopics = selectedNode ? getRelatedTopics(selectedNode.id) : []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <IconSparkle className="h-5 w-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">
          {lang === "en" ? "AI Knowledge Brain" : "Bộ Não Kiến Thức AI"}
        </h2>
      </div>

      {/* Search and Controls */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={lang === "en" ? "Search topics..." : "Tìm kiếm chủ đề..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: lang === "en" ? "All Topics" : "Tất cả chủ đề" },
            { id: "importance-high", label: lang === "en" ? "High Priority" : "Ưu tiên cao" },
            { id: "updated-recent", label: lang === "en" ? "Recently Updated" : "Cập nhật gần đây" },
            { id: "affected-pioneers", label: lang === "en" ? "For Pioneers" : "Cho Pioneers" },
            { id: "affected-developers", label: lang === "en" ? "For Developers" : "Cho Nhà phát triển" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as FilterType)}
              className={cx(
                "pi-press shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all",
                activeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/40 bg-card/50 text-muted-foreground hover:bg-card"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Zoom and Controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {lang === "en" ? `${filteredTopics.length} topics` : `${filteredTopics.length} chủ đề`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
              className="pi-press rounded-lg border border-border/40 bg-card/50 p-2 hover:bg-card"
            >
              <IconZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(1.6, zoomLevel + 0.2))}
              className="pi-press rounded-lg border border-border/40 bg-card/50 p-2 hover:bg-card"
            >
              <IconZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredTopics.map((node) => {
          const health = getTopicHealth(node)
          const isSelected = selectedTopic === node.id
          return (
            <button
              key={node.id}
              onClick={() => setSelectedTopic(node.id)}
              className={cx(
                "pi-press rounded-lg border-2 p-3 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-card/50 hover:border-primary/50"
              )}
              style={{ transform: `scale(${isSelected ? 1 : zoomLevel})`, transformOrigin: "center" }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xl">{node.icon}</span>
                <div className="text-right flex-1">
                  <div className={cx("text-xs font-bold", getHealthColor(health))}>
                    {health}%
                  </div>
                  <div className="text-[9px] text-muted-foreground">{lang === "en" ? "Health" : "Sức khỏe"}</div>
                </div>
              </div>
              <p className="text-xs font-semibold text-foreground mb-1 line-clamp-2">{node.label[lang]}</p>
              <div className="space-y-1">
                <div className="text-[9px] text-muted-foreground">
                  <span className="font-medium">{lang === "en" ? "Updates:" : "Cập nhật:"}</span> {node.updateCount}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  <span className="font-medium">{lang === "en" ? "Importance:" : "Tầm quan trọng:"}</span> {node.importanceScore}/10
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Topic Detail Panel */}
      {selectedNode && (
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 space-y-3 pi-fade-up">
          {/* Topic Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                {lang === "en" ? "Topic Overview" : "Tổng quan chủ đề"}
              </p>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-2xl">{selectedNode.icon}</span>
                {selectedNode.label[lang]}
              </h3>
              <p className="text-sm text-foreground/80 mt-1">{selectedNode.description[lang]}</p>
            </div>
            <button
              onClick={() => setSelectedTopic(null)}
              className="pi-press rounded-lg border border-border/40 bg-card/50 p-2 hover:bg-card"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-primary/20">
            <div className="rounded-lg bg-background/50 p-2">
              <div className="text-xs font-bold text-primary">{topicHealth}%</div>
              <div className="text-[9px] text-muted-foreground">{lang === "en" ? "Health" : "Sức khỏe"}</div>
            </div>
            <div className="rounded-lg bg-background/50 p-2">
              <div className="text-xs font-bold text-blue-600">{selectedNode.updateCount}</div>
              <div className="text-[9px] text-muted-foreground">{lang === "en" ? "Updates" : "Cập nhật"}</div>
            </div>
            <div className="rounded-lg bg-background/50 p-2">
              <div className="text-xs font-bold text-amber-600">{selectedNode.importanceScore}/10</div>
              <div className="text-[9px] text-muted-foreground">{lang === "en" ? "Importance" : "Quan trọng"}</div>
            </div>
            <div className="rounded-lg bg-background/50 p-2">
              <div className="text-xs font-bold text-emerald-600">
                {new Date(selectedNode.lastUpdated).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="text-[9px] text-muted-foreground">{lang === "en" ? "Updated" : "Cập nhật"}</div>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-2 pt-2 border-t border-primary/20">
            {/* Why Matters - Always Official */}
            <DetailSection
              title={lang === "en" ? "Why It Matters" : "Tại sao nó quan trọng"}
              icon="🔵"
              label={lang === "en" ? "Official" : "Chính Thức"}
              expanded={expandedSections.has("why")}
              onToggle={() => toggleSection("why")}
            >
              <p className="text-sm text-foreground">{selectedNode.whyMatters[lang]}</p>
            </DetailSection>

            {/* Affected Users */}
            <DetailSection
              title={lang === "en" ? "Affected Users" : "Người dùng bị ảnh hưởng"}
              icon="👥"
              label={lang === "en" ? "Official" : "Chính Thức"}
              expanded={expandedSections.has("affected")}
              onToggle={() => toggleSection("affected")}
            >
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.affectedGroups.map((group) => {
                  const groupLabels: Record<string, { en: string; vi: string }> = {
                    pioneers: { en: "Pioneers", vi: "Pioneers" },
                    developers: { en: "Developers", vi: "Nhà phát triển" },
                    businesses: { en: "Businesses", vi: "Doanh nghiệp" },
                    "node-operators": { en: "Node Operators", vi: "Nhà điều hành nút" },
                  }
                  const label = groupLabels[group]
                  return (
                    <span key={group} className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-xs font-medium text-primary">
                      {label[lang]}
                    </span>
                  )
                })}
              </div>
            </DetailSection>

            {/* Dependencies */}
            {dependencyNodes.length > 0 && (
              <DetailSection
                title={lang === "en" ? "Prerequisites" : "Điều kiện tiên quyết"}
                icon="🔗"
                label={lang === "en" ? "Official" : "Chính Thức"}
                expanded={expandedSections.has("deps")}
                onToggle={() => toggleSection("deps")}
              >
                <div className="space-y-2">
                  {dependencyNodes.map((dep) => (
                    <div key={dep.id} className="rounded-lg bg-background/50 p-2 text-sm">
                      <span className="text-lg mr-2">{dep.icon}</span>
                      {dep.label[lang]}
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
              <DetailSection
                title={lang === "en" ? "Related Topics" : "Chủ đề liên quan"}
                icon="🌐"
                label={lang === "en" ? "Official" : "Chính Thức"}
                expanded={expandedSections.has("related")}
                onToggle={() => toggleSection("related")}
              >
                <div className="space-y-2">
                  {relatedTopics.slice(0, 3).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className="block w-full rounded-lg bg-background/50 p-2 text-left text-sm hover:bg-background transition-colors"
                    >
                      <span className="text-lg mr-2">{topic.icon}</span>
                      {topic.label[lang]}
                    </button>
                  ))}
                </div>
              </DetailSection>
            )}

            {/* AI Analysis - Clearly Separated */}
            <DetailSection
              title={lang === "en" ? "AI Analysis" : "Phân tích AI"}
              icon="💡"
              label={lang === "en" ? "AI Analysis" : "Phân tích AI"}
              labelColor="bg-blue-50 text-blue-700"
              expanded={expandedSections.has("analysis")}
              onToggle={() => toggleSection("analysis")}
            >
              <p className="text-sm text-foreground">{selectedNode.aiAnalysis[lang]}</p>
            </DetailSection>

            {/* AI Predictions - Clearly Separated */}
            <DetailSection
              title={lang === "en" ? "AI Predictions" : "Dự đoán AI"}
              icon="🔮"
              label={lang === "en" ? "AI Prediction (Speculative)" : "Dự đoán AI (Suy đoán)"}
              labelColor="bg-amber-50 text-amber-700"
              expanded={expandedSections.has("prediction")}
              onToggle={() => toggleSection("prediction")}
            >
              <p className="text-sm text-foreground italic">{selectedNode.aiPredictions[lang]}</p>
            </DetailSection>

            {/* Recommended Actions */}
            {selectedNode.recommendedActions.length > 0 && (
              <DetailSection
                title={lang === "en" ? "Recommended Reading Order" : "Thứ tự đọc được khuyến nghị"}
                icon="📚"
                label={lang === "en" ? "Official" : "Chính Thức"}
                expanded={expandedSections.has("actions")}
                onToggle={() => toggleSection("actions")}
              >
                <ol className="space-y-2">
                  {selectedNode.recommendedActions.map((action, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="font-bold text-primary shrink-0">{idx + 1}.</span>
                      <span className="text-foreground">{action[lang]}</span>
                    </li>
                  ))}
                </ol>
              </DetailSection>
            )}

            {/* AI Confidence */}
            <div className="rounded-lg bg-background/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {lang === "en" ? "AI Confidence Score" : "Điểm tin cậy AI"}
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {Math.round((selectedNode.importanceScore * 10) + (selectedNode.updateCount * 5))}%
                </span>
              </div>
              <div className="h-2 bg-border/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${Math.round((selectedNode.importanceScore * 10) + (selectedNode.updateCount * 5))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailSection({
  title,
  icon,
  label,
  labelColor = "bg-green-50 text-green-700",
  expanded,
  onToggle,
  children,
}: {
  title: string
  icon: string
  label: string
  labelColor?: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full rounded-lg border border-border/50 bg-card/50 p-2.5 text-left transition-all hover:border-primary/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <div>
              <p className="text-xs font-semibold text-foreground">{title}</p>
              <span className={cx("text-[9px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5", labelColor)}>
                {label}
              </span>
            </div>
          </div>
        </div>
        <IconChevronDown
          className={cx("h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-0.5", expanded ? "rotate-180" : "")}
        />
      </div>
      {expanded && <div className="mt-2.5 pt-2.5 border-t border-border/30">{children}</div>}
    </button>
  )
}
