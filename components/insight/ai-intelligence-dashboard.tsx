"use client"

import { useMemo, useState } from "react"
import { useInsight } from "@/contexts/insight-context"
import { cx } from "./ui"
import {
  generateIntelligenceScores,
  getAIBriefing,
  getDashboardMetadata,
  getStatusColor,
  getStatusLabel,
  formatDate,
  sortedUpdates,
  TOPICS,
  topicLabel,
  type Lang,
  type IntelligenceScore,
  type Topic,
} from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"
import { 
  IconChevronRight, 
  IconClock, 
  IconSparkle, 
  IconCheckCircle,
  IconTrendingUp,
  IconAlertCircle,
  IconUsers,
  IconSearch,
  IconHistory,
  IconBookmark,
  IconNetwork
} from "./icons"

export function AIIntelligenceDashboard({
  lang,
  t,
}: {
  lang: Lang
  t: TFn
}) {
  const { syncStatus } = useInsight()
  const scores = useMemo(() => generateIntelligenceScores(lang), [lang])
  const briefing = useMemo(() => getAIBriefing(lang), [lang])
  const metadata = useMemo(() => getDashboardMetadata(), [])
  const [selectedScore, setSelectedScore] = useState<IntelligenceScore | null>(null)

  // Generate AI Watchlist (Top 5 topics by importance)
  const watchlist = useMemo(() => {
    const allUpdates = sortedUpdates()
    const topicScores = TOPICS.map((topic) => {
      const topicUpdates = allUpdates.filter((u) => u.topic === topic.id)
      const avgImportance = topicUpdates.length > 0
        ? topicUpdates.reduce((sum, u) => sum + u.importance, 0) / topicUpdates.length
        : 0
      return {
        topicId: topic.id as Topic,
        label: topic.label,
        importance: avgImportance,
        updateCount: topicUpdates.length,
        latestUpdate: topicUpdates[0],
      }
    })
    return topicScores
      .filter((t) => t.updateCount > 0)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
  }, [])

  // Format last sync time
  const lastSyncDisplay = useMemo(() => {
    if (!syncStatus.lastSyncAt) return lang === "en" ? "Never" : "Chưa bao giờ"
    const date = new Date(syncStatus.lastSyncAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return lang === "en" ? "Just now" : "Vừa xong"
    if (diffMins < 60) return `${diffMins}m ${lang === "en" ? "ago" : "trước"}`
    if (diffHours < 24) return `${diffHours}h ${lang === "en" ? "ago" : "trước"}`
    return `${diffDays}d ${lang === "en" ? "ago" : "trước"}`
  }, [syncStatus.lastSyncAt, lang])

  return (
    <div className="space-y-4 pi-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <IconSparkle className="h-5 w-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">
          {lang === "en" ? "AI Intelligence Dashboard" : "Bảng Điều Khiển Trí Tuệ AI"}
        </h2>
      </div>

      {/* AI Daily Briefing */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 pi-fade-up">
        <div className="flex items-start gap-3 mb-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-lg flex-shrink-0">
            📢
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {lang === "en" ? "AI Daily Briefing" : "Tóm tắt hàng ngày"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground text-pretty">
              {briefing.summary[lang]}
            </p>
          </div>
        </div>
        {/* Separate sections for Official Info, AI Analysis, AI Predictions */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <IconCheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {lang === "en" ? "Official Information" : "Thông tin chính thức"}
          </div>
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <IconSparkle className="h-3.5 w-3.5 flex-shrink-0" />
            {lang === "en" ? "AI Analysis" : "Phân tích AI"}
          </div>
          <div className="flex items-center gap-2 text-amber-600 font-medium">
            <IconTrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
            {lang === "en" ? "AI Prediction (speculative)" : "Dự đoán AI (suy đoán)"}
          </div>
        </div>
      </div>

      {/* AI Watchlist - Top 5 Topics */}
      {watchlist.length > 0 && (
        <div className="space-y-3 pi-fade-up" style={{ animationDelay: "0.05s" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <IconNetwork className="h-4 w-4" />
            {lang === "en" ? "AI Watchlist (Top 5 Topics)" : "Danh Sách Theo Dõi AI (5 Chủ Đề Hàng Đầu)"}
          </h3>
          <div className="space-y-2">
            {watchlist.map((item, idx) => (
              <div key={item.topicId} className="rounded-lg border border-border/60 bg-card/50 p-3 pi-fade-up" style={{ animationDelay: `${0.08 + idx * 0.02}s` }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label[lang]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lang === "en" ? `${item.updateCount} update${item.updateCount > 1 ? "s" : ""}` : `${item.updateCount} cập nhật`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-right">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {Math.round(item.importance)}
                    </div>
                  </div>
                </div>
                {item.latestUpdate && (
                  <p className="text-xs text-foreground/70 line-clamp-1">
                    {item.latestUpdate.title[lang]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 pi-fade-up" style={{ animationDelay: "0.15s" }}>
        <QuickActionButton icon={<IconSearch className="h-4 w-4" />} label={lang === "en" ? "Ask AI" : "Hỏi AI"} tone="primary" />
        <QuickActionButton icon={<IconHistory className="h-4 w-4" />} label={lang === "en" ? "Timeline" : "Dòng thời gian"} tone="secondary" />
        <QuickActionButton icon={<IconBookmark className="h-4 w-4" />} label={lang === "en" ? "Saved" : "Đã lưu"} tone="secondary" />
        <QuickActionButton icon={<IconNetwork className="h-4 w-4" />} label={lang === "en" ? "Graph" : "Biểu đồ"} tone="secondary" />
      </div>

      {/* Sync Status & Data Confidence */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3 pi-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconClock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {lang === "en" ? "Last Sync" : "Lần đồng bộ cuối"}
            </span>
          </div>
          <span className="text-xs font-semibold text-foreground">{lastSyncDisplay}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{lang === "en" ? "Data Confidence" : "Độ tin cậy dữ liệu"}</span>
            <span className="text-xs font-semibold text-foreground">{metadata.dataConfidence}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${metadata.dataConfidence}%` }} />
          </div>
        </div>

        <div className="border-t border-border/30 pt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            {lang === "en" ? "Official Sources Used" : "Nguồn Chính Thức Được Sử Dụng"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {metadata.sourcesUsed.map((source, idx) => (
              <div key={idx} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {source}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Report Modal */}
      {selectedScore && (
        <AIScoreDetailReport score={selectedScore} lang={lang} t={t} onClose={() => setSelectedScore(null)} />
      )}
    </div>
  )
}

function QuickActionButton({
  icon,
  label,
  tone = "secondary",
}: {
  icon: React.ReactNode
  label: string
  tone?: "primary" | "secondary"
}) {
  return (
    <button
      className={cx(
        "pi-press flex flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 transition-all text-center",
        tone === "primary"
          ? "border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/15"
          : "border border-border/40 bg-card/50 hover:bg-card"
      )}
    >
      <div className={tone === "primary" ? "text-primary" : "text-muted-foreground"}>{icon}</div>
      <span className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">{label}</span>
    </button>
  )
}

function AIScoreDetailReport({
  score,
  lang,
  t,
  onClose,
}: {
  score: IntelligenceScore
  lang: Lang
  t: TFn
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div className="w-full rounded-t-3xl border-t border-border bg-background p-4 pb-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{lang === "en" ? "Detailed Report" : "Báo cáo chi tiết"}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{score.label[lang]}</p>
          </div>
          <button onClick={onClose} className="pi-press rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Score */}
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">
              {lang === "en" ? "Current Score" : "Điểm hiện tại"}
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-foreground">{score.score}</p>
                <p className="mt-2 text-xs text-muted-foreground">{lang === "en" ? "out of 100" : "trên 100"}</p>
              </div>
              <div className="text-right">
                <p className={cx("inline-block rounded-lg border px-3 py-1.5 text-xs font-semibold", getStatusColor(score.status))}>
                  {getStatusLabel(score.status, lang)}
                </p>
              </div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold uppercase text-primary pt-0.5">AI</span>
              <div>
                <p className="text-xs font-semibold uppercase text-primary mb-1">{lang === "en" ? "AI Analysis" : "Phân tích AI"}</p>
                <p className="text-sm text-foreground">{score.aiExplanation[lang]}</p>
              </div>
            </div>
          </div>

          {/* Score Trend */}
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">
              {lang === "en" ? "Trend & Change" : "Xu hướng & Thay đổi"}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className={cx("text-2xl font-bold", score.trend === "up" ? "text-emerald-600" : score.trend === "down" ? "text-red-600" : "text-amber-600")}>
                  {score.trend === "up" ? "↑" : score.trend === "down" ? "↓" : "→"}
                </span>
                <span className={cx("text-sm font-semibold", score.trend === "up" ? "text-emerald-600" : score.trend === "down" ? "text-red-600" : "text-amber-600")}>
                  {score.changePercent}% {lang === "en" ? "change" : "thay đổi"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {score.trend === "up"
                  ? lang === "en"
                    ? "Score increasing"
                    : "Điểm tăng"
                  : score.trend === "down"
                    ? lang === "en"
                      ? "Score decreasing"
                      : "Điểm giảm"
                    : lang === "en"
                      ? "Score stable"
                      : "Điểm ổn định"}
              </span>
            </div>
          </div>

          {/* Reasons for Changes */}
          {score.reasons.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">
                {lang === "en" ? "Reasons for Changes" : "Lý do thay đổi"}
              </p>
              <ul className="space-y-2">
                {score.reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-foreground">{reason[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Confidence */}
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">
              {lang === "en" ? "Analysis Confidence" : "Độ tin cậy phân tích"}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${score.dataConfidence}%` }} />
              </div>
              <span className="text-sm font-semibold text-foreground">{score.dataConfidence}%</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {lang === "en" ? "Based on official Pi updates and historical data analysis" : "Dựa trên các cập nhật Pi chính thức và phân tích dữ liệu lịch sử"}
            </p>
          </div>

          {/* Official Note */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <span>✓</span>
              {lang === "en" ? "Official Information" : "Thông tin chính thức"}
            </p>
            <p className="text-xs">
              {lang === "en"
                ? "This score is calculated from official Pi Network updates and community data. All AI-generated insights are clearly labeled as AI Analysis."
                : "Điểm này được tính từ các cập nhật chính thức của Mạng Pi. Tất cả các phân tích do AI tạo đều được dán nhãn rõ ràng."}
            </p>
          </div>

          {/* Close Button */}
          <button onClick={onClose} className="w-full rounded-xl border border-border bg-card py-3 font-semibold text-foreground hover:bg-muted pi-press mt-4">
            {lang === "en" ? "Close" : "Đóng"}
          </button>
        </div>
      </div>
    </div>
  )
}
