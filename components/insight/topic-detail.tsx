"use client"

import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_EDGES, UPDATES, type Topic } from "@/lib/insight/data"
import type { Lang } from "@/lib/insight/data"
import { IconArrowRight, IconBook, IconChain, IconClose, IconSparkle } from "./icons"

interface TopicDetailProps {
  topicId: Topic
  lang: Lang
  onClose: () => void
  onSelectUpdate: (updateId: string) => void
}

export function TopicDetail({ topicId, lang, onClose, onSelectUpdate }: TopicDetailProps) {
  const node = KNOWLEDGE_GRAPH_NODES.find((n) => n.id === topicId)
  if (!node) return null

  // Find related updates
  const relatedUpdates = UPDATES.filter((u) => node.relatedUpdates.includes(u.id))

  // Find dependencies (prerequisites)
  const dependencyNodes = KNOWLEDGE_GRAPH_NODES.filter((n) =>
    node.dependencies.includes(n.id)
  )

  // Find topics that depend on this one (what this enables)
  const enablesTopics = KNOWLEDGE_GRAPH_NODES.filter((n) =>
    n.dependencies.includes(topicId)
  )

  // Find connected topics (edges)
  const connectedEdges = KNOWLEDGE_GRAPH_EDGES.filter(
    (e) => e.from === topicId || e.to === topicId
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/20 sm:items-center">
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-background sm:rounded-2xl sm:max-w-2xl shadow-lg border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{node.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{node.label[lang]}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{node.description[lang]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-4 py-4 sm:px-6">
          {/* Prerequisites */}
          {dependencyNodes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <IconBook className="h-4 w-4 text-blue-500" />
                Prerequisites
              </div>
              <div className="space-y-2">
                {dependencyNodes.map((dep) => (
                  <div
                    key={dep.id}
                    className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900 border border-blue-200"
                  >
                    <div className="font-semibold">{dep.icon} {dep.label[lang]}</div>
                    <p className="text-xs mt-1 opacity-90">{dep.description[lang]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What This Enables */}
          {enablesTopics.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <IconArrowRight className="h-4 w-4 text-green-500" />
                {lang === "en" ? "Enables" : "Cho phép"}
              </div>
              <div className="flex flex-wrap gap-2">
                {enablesTopics.map((topic) => (
                  <button
                    key={topic.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-900 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    {topic.icon}
                    {topic.label[lang]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Related Topics */}
          {connectedEdges.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <IconChain className="h-4 w-4 text-purple-500" />
                {lang === "en" ? "Related Topics" : "Các chủ đề liên quan"}
              </div>
              <div className="space-y-2">
                {connectedEdges.map((edge) => {
                  const relatedNode = KNOWLEDGE_GRAPH_NODES.find(
                    (n) => n.id === (edge.from === topicId ? edge.to : edge.from)
                  )
                  if (!relatedNode) return null

                  return (
                    <button
                      key={relatedNode.id}
                      onClick={() => {}} // Navigate to related topic
                      className="block w-full rounded-lg bg-muted p-3 text-left hover:bg-muted/80 transition-colors text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{relatedNode.icon}</span>
                          <div>
                            <div className="font-semibold text-foreground">{relatedNode.label[lang]}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {edge.relationship[lang]}
                            </div>
                          </div>
                        </div>
                        <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Related Official Updates */}
          {relatedUpdates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <IconSparkle className="h-4 w-4 text-amber-500" />
                {lang === "en" ? "Official Updates" : "Cập nhật chính thức"}
              </div>
              <div className="space-y-2">
                {relatedUpdates.map((update) => (
                  <button
                    key={update.id}
                    onClick={() => onSelectUpdate(update.id)}
                    className="block w-full rounded-lg border border-border bg-card p-3 text-left hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1 text-lg">📰</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground line-clamp-2">{update.title[lang]}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {update.summary[lang]}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span className="text-xs font-medium text-primary">{update.source}</span>
                          <span>•</span>
                          <span>{update.date}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {relatedUpdates.length === 0 && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground text-center">
              {lang === "en"
                ? "No official updates yet for this topic"
                : "Chưa có cập nhật chính thức cho chủ đề này"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
