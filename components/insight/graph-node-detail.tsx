"use client"

import { useState } from "react"
import { type Topic, getKnowledgeGraphNode, UPDATES, getAILearningPath } from "@/lib/insight/data"
import type { Lang } from "@/lib/insight/data"
import { cx } from "./ui"
import { IconChevronRight, IconBook, IconChain, IconSparkle } from "./icons"

interface GraphNodeDetailProps {
  topicId: Topic
  lang: Lang
  onClose: () => void
  onRelatedTopic?: (topic: Topic) => void
}

export function GraphNodeDetail({ topicId, lang, onClose, onRelatedTopic }: GraphNodeDetailProps) {
  const node = getKnowledgeGraphNode(topicId)
  if (!node) return null

  const relatedUpdates = UPDATES.filter((u) => node.relatedUpdates.includes(u.id))
  const affectedGroupLabels = {
    pioneers: lang === "en" ? "Pioneers" : "Pioneer",
    developers: lang === "en" ? "Developers" : "Nhà phát triển",
    businesses: lang === "en" ? "Businesses" : "Doanh nghiệp",
    "node-operators": lang === "en" ? "Node Operators" : "Nhà điều hành nút",
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{node.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{node.label[lang]}</h1>
              <p className="text-xs text-muted-foreground mt-1">Importance Score: {node.importanceScore}/10</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">✕</button>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground font-medium">Official Updates</p>
            <p className="text-xl font-bold text-primary mt-1">{node.updateCount}</p>
          </div>
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground font-medium">Importance</p>
            <p className="text-xl font-bold text-purple-600 mt-1">{node.importanceScore}/10</p>
          </div>
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground font-medium">Last Updated</p>
            <p className="text-xs font-bold text-foreground mt-1">{node.lastUpdated}</p>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Why It Matters</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{node.whyMatters[lang]}</p>
        </div>

        {/* Affected Groups */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Affected Groups</h3>
          <div className="flex flex-wrap gap-2">
            {node.affectedGroups.map((group) => (
              <span key={group} className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {affectedGroupLabels[group as keyof typeof affectedGroupLabels]}
              </span>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="flex items-start gap-2">
            <span className="inline-block px-2 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded uppercase">AI Analysis</span>
          </div>
          <p className="text-sm text-foreground mt-2 leading-relaxed">{node.aiAnalysis[lang]}</p>
        </div>

        {/* AI Predictions */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-start gap-2">
            <span className="inline-block px-2 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 rounded uppercase">Prediction (Speculation)</span>
          </div>
          <p className="text-sm text-foreground mt-2 leading-relaxed">{node.aiPredictions[lang]}</p>
        </div>

        {/* Recommended Actions */}
        {node.recommendedActions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Recommended Actions</h3>
            <ul className="space-y-2">
              {node.recommendedActions.map((action, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{action[lang]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dependencies */}
        {node.dependencies.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Prerequisites</h3>
            <div className="space-y-2">
              {node.dependencies.map((dep) => (
                <button
                  key={dep}
                  onClick={() => onRelatedTopic?.(dep)}
                  className="w-full text-left flex items-center justify-between rounded-lg bg-card border border-border p-3 hover:border-primary/50 transition group"
                >
                  <span className="text-sm font-medium text-foreground">{dep}</span>
                  <IconChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related Updates */}
        {relatedUpdates.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Official Announcements</h3>
            <div className="space-y-2">
              {relatedUpdates.map((update) => (
                <div key={update.id} className="rounded-lg bg-card border border-emerald-200 dark:border-emerald-900 p-3">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Official</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{update.title[lang]}</p>
                  <p className="text-xs text-muted-foreground mt-1">{update.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose} className="w-full rounded-lg bg-primary text-white py-3 font-medium hover:bg-primary/90 transition">
          {lang === "en" ? "Close" : "Đóng"}
        </button>
      </div>
    </div>
  )
}
