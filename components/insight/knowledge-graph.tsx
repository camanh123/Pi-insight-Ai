"use client"

import { useState } from "react"
import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_EDGES, type Topic } from "@/lib/insight/data"
import { UPDATES } from "@/lib/insight/data"
import type { Lang } from "@/lib/insight/data"
import { GraphNodeDetail } from "./graph-node-detail"
import { GraphPathExplorer } from "./graph-path-explorer"

interface KnowledgeGraphProps {
  lang: Lang
  onSelectTopic: (topic: Topic) => void
  selectedTopic?: Topic
}

export function KnowledgeGraph({ lang, onSelectTopic, selectedTopic }: KnowledgeGraphProps) {
  const [hoveredTopic, setHoveredTopic] = useState<Topic | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [highlightedPath, setHighlightedPath] = useState<Topic[] | null>(null)

  // Simple circular layout for nodes
  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI
    const radius = 120
    const x = 160 + radius * Math.cos(angle)
    const y = 160 + radius * Math.sin(angle)
    return { x, y }
  }

  // Center point
  const centerX = 160
  const centerY = 160

  return (
    <div className="w-full space-y-4">
      {/* Visual Graph */}
      <div className="rounded-2xl border border-border bg-card/50 p-4">
        <div className="relative w-full" style={{ paddingBottom: "100%" }}>
          <svg
            viewBox="0 0 320 320"
            className="absolute inset-0 h-full w-full"
            style={{ touchAction: "auto" }}
          >
            {/* Draw edges first (so they appear behind nodes) */}
            {KNOWLEDGE_GRAPH_EDGES.map((edge, i) => {
              const fromNode = KNOWLEDGE_GRAPH_NODES.find((n) => n.id === edge.from)
              const toNode = KNOWLEDGE_GRAPH_NODES.find((n) => n.id === edge.to)
              if (!fromNode || !toNode) return null

              const fromIndex = KNOWLEDGE_GRAPH_NODES.indexOf(fromNode)
              const toIndex = KNOWLEDGE_GRAPH_NODES.indexOf(toNode)
              const fromPos = getNodePosition(fromIndex, KNOWLEDGE_GRAPH_NODES.length)
              const toPos = getNodePosition(toIndex, KNOWLEDGE_GRAPH_NODES.length)

              const isSelected = selectedTopic === edge.from || selectedTopic === edge.to
              const isHovered = hoveredTopic === edge.from || hoveredTopic === edge.to
              const isRelated = hoveredTopic && (hoveredTopic === edge.from || hoveredTopic === edge.to)

              // Calculate midpoint for label
              const midX = (fromPos.x + toPos.x) / 2
              const midY = (fromPos.y + toPos.y) / 2

              return (
                <g key={i}>
                  {/* Edge line */}
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={
                      isSelected
                        ? "#7c3aed"
                        : isRelated
                          ? "#a78bfa"
                          : edge.strength === "strong"
                            ? "#d1d5db"
                            : "#e5e7eb"
                    }
                    strokeWidth={isSelected ? 2.5 : isRelated ? 2 : 1.5}
                    opacity={isHovered ? 1 : 0.6}
                    className="transition-all duration-200"
                  />
                  
                  {/* Edge label */}
                  <text
                    x={midX}
                    y={midY - 2}
                    textAnchor="middle"
                    fontSize="9"
                    fill="currentColor"
                    className="text-muted-foreground pointer-events-none"
                    opacity={isHovered ? 0.8 : 0.4}
                  >
                    {edge.label[lang]}
                  </text>
                </g>
              )
            })}

            {/* Draw nodes */}
            {KNOWLEDGE_GRAPH_NODES.map((node, index) => {
              const pos = getNodePosition(index, KNOWLEDGE_GRAPH_NODES.length)
              const isSelected = selectedTopic === node.id
              const isHovered = hoveredTopic === node.id
              const isRelated = hoveredTopic && KNOWLEDGE_GRAPH_EDGES.some(
                (e) => (e.from === hoveredTopic && e.to === node.id) || (e.to === hoveredTopic && e.from === node.id)
              )

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredTopic(node.id)}
                  onMouseLeave={() => setHoveredTopic(null)}
                  onTouchStart={() => setHoveredTopic(node.id)}
                  onTouchEnd={() => setHoveredTopic(null)}
                  onClick={() => onSelectTopic(node.id)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Node circle with importance score ring */}
                  {/* Background ring showing importance (1-10) */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={18 + (node.importanceScore * 1.5)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity={0.1}
                    className="text-primary"
                  />
                  
                  {/* Main node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 22 : isHovered || isRelated ? 20 : 18}
                    fill="currentColor"
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "fill-primary"
                        : isHovered
                          ? node.color.includes("blue")
                            ? "fill-blue-400"
                            : "fill-purple-400"
                          : "fill-muted-foreground opacity-60"
                    }`}
                  />

                  {/* Node icon */}
                  <text
                    x={pos.x}
                    y={pos.y + 6}
                    textAnchor="middle"
                    className="pointer-events-none text-sm"
                    style={{
                      fontSize: isSelected ? "20px" : isHovered ? "18px" : "16px",
                      transition: "font-size 200ms",
                    }}
                  >
                    {node.icon}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Topic Labels and Info */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {KNOWLEDGE_GRAPH_NODES.map((node) => {
          const isSelected = selectedTopic === node.id
          const isHovered = hoveredTopic === node.id

          return (
            <button
              key={node.id}
              onClick={() => {
                onSelectTopic(node.id)
                setShowDetail(true)
              }}
              onMouseEnter={() => setHoveredTopic(node.id)}
              onMouseLeave={() => setHoveredTopic(null)}
              className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-all duration-200 border ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md border-primary"
                  : isHovered
                    ? "bg-muted text-foreground border-primary/50"
                    : "bg-card text-foreground/70 hover:bg-muted border-border"
              }`}
            >
              <div className="text-sm">{node.icon}</div>
              <div className="text-xs font-semibold">{node.label[lang]}</div>
              <div className="text-[10px] opacity-70 mt-0.5">
                {lang === "en" ? "Score:" : "Điểm:"} {node.importanceScore}/10
              </div>
              <div className="text-[10px] opacity-70">
                {node.updateCount} {lang === "en" ? "updates" : "cập nhật"}
              </div>
            </button>
          )
        })}
      </div>

      {/* AI Path Explorer */}
      <div className="rounded-2xl border border-border bg-card/50 p-4">
        <GraphPathExplorer lang={lang} onSelectPath={setHighlightedPath} />
      </div>

      {/* Node Detail Modal */}
      {selectedTopic && showDetail && (
        <GraphNodeDetail
          topicId={selectedTopic}
          lang={lang}
          onClose={() => setShowDetail(false)}
          onRelatedTopic={(topic) => {
            onSelectTopic(topic)
          }}
        />
      )}
    </div>
  )
}
