"use client"

import { useEffect, useState } from "react"
import { useInsight } from "@/contexts/insight-context"
import { UPDATES, TOPICS, type Lang } from "@/lib/insight/data"
import { Card, Button, SectionLabel } from "./ui"
import { IconClock, IconTrendingUp, IconAlertCircle, IconCheckCircle, IconUsers, IconSparkle } from "./icons"

interface MarketPulseMetric {
  label: string
  value: string
  change: number // -10 to +10
  confidence: number // 0-100, AI confidence level
  isOfficial: boolean
}

interface BriefingReport {
  date: string // ISO date
  hasUpdates: boolean
  updatesCount: number
  topUpdate: {
    id: string
    title: string
    importance: number
    reason: string
    affectedUsers: string
  } | null
  ranking: Array<{
    id: string
    rank: number
    title: string
    importance: number
    whyMatters: string
  }>
  
  // AI Market Pulse (based on official info only)
  marketPulse: {
    ecosystemActivity: MarketPulseMetric
    developerActivity: MarketPulseMetric
    appStudioGrowth: MarketPulseMetric
    nodeActivity: MarketPulseMetric
    kycProgress: MarketPulseMetric
    kyBAdoption: MarketPulseMetric
    mainnetMomentum: MarketPulseMetric
  }
  
  // Intelligence sections
  todaysHighlights: string[]
  thingsToWatch: string[]
  importantChanges: string[] // since yesterday
  recommendedReading: string[]
  
  healthSummary: string
  ecosystemHealthScore: number // 0-100
  isLoading: boolean
}

function getTodayUpdates(lang: Lang): typeof UPDATES {
  const today = new Date().toISOString().split("T")[0]
  return UPDATES.filter((u) => u.date === today).sort((a, b) => b.importance - a.importance)
}

function formatAffectedCount(importance: number): string {
  const baseEstimates: Record<number, number> = {
    9: 5000000,
    8: 3000000,
    7: 1500000,
    6: 800000,
    5: 400000,
    4: 200000,
    3: 100000,
    2: 50000,
    1: 10000,
  }
  const count = baseEstimates[Math.min(9, Math.max(1, importance))] || 100000
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M Pioneers`
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K Pioneers`
  return `${count} Pioneers`
}

function generateMarketPulse(updates: typeof UPDATES): BriefingReport["marketPulse"] {
  // Count updates by topic to determine activity
  const topicCounts = TOPICS.reduce(
    (acc, topic) => {
      acc[topic] = updates.filter((u) => u.topic === topic).length
      return acc
    },
    {} as Record<string, number>
  )

  const formatMetric = (value: number, label: string, hasOfficial: boolean): MarketPulseMetric => ({
    label,
    value: value > 0 ? `+${value}` : "Steady",
    change: Math.min(value, 5),
    confidence: hasOfficial ? 95 : 70,
    isOfficial: hasOfficial,
  })

  return {
    ecosystemActivity: formatMetric(topicCounts.ecosystem || 0, "Ecosystem", true),
    developerActivity: formatMetric(topicCounts["app-studio"] || 0, "App Studio", true),
    appStudioGrowth: formatMetric((topicCounts["app-studio"] || 0) * 1.2, "App Growth", false),
    nodeActivity: formatMetric(topicCounts.node || 0, "Node Ops", true),
    kycProgress: formatMetric(topicCounts.kyc || 0, "KYC", true),
    kyBAdoption: formatMetric(topicCounts.kyb || 0, "KYB", true),
    mainnetMomentum: formatMetric(topicCounts.mainnet || 0, "Mainnet", true),
  }
}

function generateIntelligence(updates: typeof UPDATES, lang: Lang): {
  highlights: string[]
  watch: string[]
  changes: string[]
  reading: string[]
} {
  const highlights =
    lang === "en"
      ? [
          `${updates.length} official update${updates.length > 1 ? "s" : ""} published`,
          "All core systems operational",
          "Community engagement elevated",
        ]
      : [
          `${updates.length} cập nhật chính thức được công bố`,
          "Tất cả hệ thống cốt lõi hoạt động",
          "Sự tham gia của cộng đồng tăng cao",
        ]

  const watch =
    lang === "en"
      ? [
          "Monitor KYC/KYB verification timelines",
          "Track Mainnet migration progress",
          "Follow App Studio developer submissions",
        ]
      : [
          "Theo dõi lịch trình xác minh KYC/KYB",
          "Theo dõi tiến trình di chuyển Mainnet",
          "Theo dõi các bài nộp của nhà phát triển App Studio",
        ]

  const changes =
    lang === "en"
      ? ["Network stability maintained", "No breaking changes reported", "All services available"]
      : ["Ổn định mạng được duy trì", "Không có thay đổi đột phá được báo cáo", "Tất cả dịch vụ có sẵn"]

  const reading =
    lang === "en"
      ? ["View the full briefing for detailed analysis", "Check the Timeline Evolution for context", "Explore Knowledge Graph for connections"]
      : [
          "Xem bản tóm tắt đầy đủ để phân tích chi tiết",
          "Kiểm tra Tiến hóa Dòng thời gian để biết ngữ cảnh",
          "Khám phá Biểu đồ Kiến thức để xem kết nối",
        ]

  return { highlights, watch, changes, reading }
}

const defaultMarketPulse: BriefingReport["marketPulse"] = {
  ecosystemActivity: { label: "Ecosystem", value: "Steady", change: 0, confidence: 85, isOfficial: true },
  developerActivity: { label: "App Studio", value: "Steady", change: 0, confidence: 85, isOfficial: true },
  appStudioGrowth: { label: "App Growth", value: "Steady", change: 0, confidence: 70, isOfficial: false },
  nodeActivity: { label: "Node Ops", value: "Steady", change: 0, confidence: 85, isOfficial: true },
  kycProgress: { label: "KYC", value: "Steady", change: 0, confidence: 85, isOfficial: true },
  kyBAdoption: { label: "KYB", value: "Steady", change: 0, confidence: 85, isOfficial: true },
  mainnetMomentum: { label: "Mainnet", value: "Steady", change: 0, confidence: 85, isOfficial: true },
}

export function DailyBriefing() {
  const { lang, t } = useInsight()
  const [briefing, setBriefing] = useState<BriefingReport>({
    date: new Date().toISOString(),
    hasUpdates: false,
    updatesCount: 0,
    topUpdate: null,
    ranking: [],
    marketPulse: defaultMarketPulse,
    todaysHighlights: [],
    thingsToWatch: [],
    importantChanges: [],
    recommendedReading: [],
    healthSummary: "",
    ecosystemHealthScore: 75,
    isLoading: true,
  })

  useEffect(() => {
    // Generate briefing from today's updates
    const todayUpdates = getTodayUpdates(lang)
    const hasUpdates = todayUpdates.length > 0
    const marketPulse = generateMarketPulse(todayUpdates)
    const intelligence = generateIntelligence(todayUpdates, lang)

    if (!hasUpdates) {
      // No updates today - market pulse and steady state
      setBriefing({
        date: new Date().toISOString(),
        hasUpdates: false,
        updatesCount: 0,
        topUpdate: null,
        ranking: [],
        marketPulse,
        todaysHighlights:
          lang === "en"
            ? ["Network operating normally", "All systems healthy", "No official updates today"]
            : ["Mạng hoạt động bình thường", "Tất cả hệ thống khỏe mạnh", "Không có cập nhật chính thức hôm nay"],
        thingsToWatch: intelligence.watch,
        importantChanges:
          lang === "en"
            ? ["Nothing changed since yesterday", "Continued stable operations", "Standard ecosystem activity"]
            : [
                "Không có gì thay đổi so với hôm qua",
                "Tiếp tục hoạt động ổn định",
                "Hoạt động hệ sinh thái tiêu chuẩn",
              ],
        recommendedReading: intelligence.reading,
        healthSummary:
          lang === "en"
            ? "No official updates from Pi Core Team today. The network continues operating normally with all systems healthy."
            : "Không có cập nhật chính thức từ Nhóm Pi Core hôm nay. Mạng tiếp tục hoạt động bình thường với tất cả các hệ thống khỏe mạnh.",
        ecosystemHealthScore: 78,
        isLoading: false,
      })
    } else {
      // Updates exist - full intelligence report
      const topUpdate = todayUpdates[0]
      const ranking = todayUpdates.map((update, idx) => ({
        id: update.id,
        rank: idx + 1,
        title: update.title[lang],
        importance: update.importance,
        whyMatters: update.analysis.whyMatters[lang],
      }))

      setBriefing({
        date: new Date().toISOString(),
        hasUpdates: true,
        updatesCount: todayUpdates.length,
        topUpdate: {
          id: topUpdate.id,
          title: topUpdate.title[lang],
          importance: topUpdate.importance,
          reason: topUpdate.importanceReason[lang],
          affectedUsers: formatAffectedCount(topUpdate.importance),
        },
        ranking,
        marketPulse,
        todaysHighlights: intelligence.highlights,
        thingsToWatch: intelligence.watch,
        importantChanges:
          lang === "en"
            ? [`${todayUpdates.length} official update${todayUpdates.length > 1 ? "s" : ""} published`, "Ecosystem activity elevated"]
            : [`${todayUpdates.length} cập nhật chính thức được công bố`, "Hoạt động của hệ sinh thái tăng cao"],
        recommendedReading: intelligence.reading,
        healthSummary:
          lang === "en"
            ? `${todayUpdates.length} official update${todayUpdates.length > 1 ? "s" : ""} published today. Ecosystem activity is elevated.`
            : `${todayUpdates.length} cập nhật chính thức được công bố hôm nay. Hoạt động của hệ sinh thái tăng cao.`,
        ecosystemHealthScore: Math.min(95, 75 + Math.min(todayUpdates.length * 5, 20)),
        isLoading: false,
      })
    }
  }, [lang])

  if (briefing.isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-8">
        <div className="h-32 animate-pulse rounded-2xl bg-muted/30" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
      </div>
    )
  }

  const today = new Date()
  const dateStr =
    lang === "en"
      ? today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
      : today.toLocaleDateString("vi-VN", { weekday: "long", month: "2-digit", day: "2-digit" })

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      {/* Header */}
      <div className="space-y-2 pi-fade-up">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <IconSparkle className="h-4 w-4" />
          <span>{lang === "en" ? "Daily Intelligence" : "Trí tuệ hàng ngày"}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{dateStr}</h1>
        <p className="text-xs text-muted-foreground">
          {lang === "en" ? "Optimized for 1-minute read" : "Tối ưu hóa cho đọc 1 phút"}
        </p>
      </div>

      {/* Has Updates */}
      {briefing.hasUpdates && briefing.topUpdate ? (
        <>
          {/* Top Update Hero */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4 pi-fade-up">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  {lang === "en" ? "Top Priority" : "Ưu tiên hàng đầu"}
                </div>
                <h2 className="text-base font-bold text-foreground leading-tight">{briefing.topUpdate.title}</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                {briefing.topUpdate.importance}/10
              </div>
            </div>
            <p className="mb-3 text-sm text-foreground/90">{briefing.topUpdate.reason}</p>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <IconUsers className="h-3.5 w-3.5" />
                {briefing.topUpdate.affectedUsers}
              </span>
            </div>
          </Card>

          {/* Ranking List */}
          {briefing.ranking.length > 1 && (
            <div className="space-y-2 pi-fade-up" style={{ animationDelay: "0.1s" }}>
              <SectionLabel tone="neutral">
                {lang === "en" ? "All Updates (by importance)" : "Tất cả các cập nhật (theo mức độ quan trọng)"}
              </SectionLabel>
              <div className="space-y-2">
                {briefing.ranking.map((item) => (
                  <Card key={item.id} className="border-border/40 bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">
                        #{item.rank} — {item.importance}/10
                      </span>
                      <span className="text-xs font-medium text-primary">Impact</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* No Updates Today */
        <Card className="border-success/20 bg-gradient-to-br from-success/10 to-success/5 p-4 pi-fade-up">
          <div className="mb-3 flex items-start gap-3">
            <IconCheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-success" />
            <div>
              <h2 className="mb-1 font-bold text-foreground">{lang === "en" ? "All Systems Normal" : "Tất cả hệ thống bình thường"}</h2>
              <p className="text-sm text-foreground/80">{briefing.healthSummary}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Market Pulse */}
      <div className="space-y-2 pi-fade-up" style={{ animationDelay: "0.25s" }}>
        <SectionLabel tone="neutral">
          {lang === "en" ? "AI Market Pulse" : "Xung thị trường AI"}
        </SectionLabel>
        <div className="space-y-2">
          {[
            briefing.marketPulse.mainnetMomentum,
            briefing.marketPulse.kycProgress,
            briefing.marketPulse.nodeActivity,
            briefing.marketPulse.appStudioGrowth,
          ].map((metric, idx) => (
            <Card key={idx} className="border-border/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{metric.label}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold text-primary">{metric.value}</p>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          metric.change > 0 ? "hsl(var(--success))" : metric.change < 0 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {metric.change > 0 ? "↑" : metric.change < 0 ? "↓" : "→"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium" style={{ color: metric.isOfficial ? "hsl(var(--success))" : "hsl(var(--analysis))" }}>
                    {metric.isOfficial ? (lang === "en" ? "Official" : "Chính thức") : (lang === "en" ? "AI" : "AI")}
                  </p>
                  <p className="text-xs text-muted-foreground">{metric.confidence}% conf</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Today's Highlights */}
      {briefing.todaysHighlights.length > 0 && (
        <div className="space-y-2 pi-fade-up" style={{ animationDelay: "0.3s" }}>
          <SectionLabel tone="neutral">
            {lang === "en" ? "Today's Highlights" : "Các điểm nổi bật hôm nay"}
          </SectionLabel>
          <div className="space-y-1">
            {briefing.todaysHighlights.map((highlight, idx) => (
              <div key={idx} className="flex gap-2 text-sm text-foreground/80">
                <span className="flex-shrink-0 text-primary">•</span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Things to Watch */}
      {briefing.thingsToWatch.length > 0 && (
        <div className="space-y-2 pi-fade-up" style={{ animationDelay: "0.35s" }}>
          <SectionLabel tone="neutral">
            {lang === "en" ? "Things to Watch" : "Những điều cần theo dõi"}
          </SectionLabel>
          <div className="space-y-1">
            {briefing.thingsToWatch.map((watch, idx) => (
              <div key={idx} className="flex gap-2 text-sm text-foreground/80">
                <IconAlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <span>{watch}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Changes */}
      {briefing.importantChanges.length > 0 && (
        <div className="space-y-2 pi-fade-up" style={{ animationDelay: "0.4s" }}>
          <SectionLabel tone="neutral">
            {lang === "en" ? "Since Yesterday" : "Từ hôm qua"}
          </SectionLabel>
          <div className="space-y-1">
            {briefing.importantChanges.map((change, idx) => (
              <div key={idx} className="flex gap-2 text-sm text-foreground/80">
                <span className="text-success">✓</span>
                <span>{change}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ecosystem Health */}
      <div className="space-y-2 pi-fade-up" style={{ animationDelay: "0.45s" }}>
        <SectionLabel tone="neutral">
          {lang === "en" ? "Ecosystem Health" : "Sức khỏe hệ sinh thái"}
        </SectionLabel>
        <Card className="p-4">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {lang === "en" ? "Overall Score" : "Điểm tổng thể"}
              </p>
              <p className="text-2xl font-bold text-foreground">{briefing.ecosystemHealthScore}/100</p>
            </div>
            <div className="text-right">
              <IconTrendingUp className="mb-1 ml-auto h-5 w-5 text-success" />
              <p className="text-xs font-medium text-success">{lang === "en" ? "Healthy" : "Khỏe mạnh"}</p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-success/60 to-success/40"
              style={{ width: `${briefing.ecosystemHealthScore}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Recommended Reading */}
      {briefing.recommendedReading.length > 0 && (
        <div className="space-y-2 pi-fade-up" style={{ animationDelay: "0.5s" }}>
          <SectionLabel tone="neutral">
            {lang === "en" ? "Recommended Reading" : "Đọc được đề xuất"}
          </SectionLabel>
          <div className="space-y-2">
            {briefing.recommendedReading.map((reading, idx) => (
              <Card key={idx} className="border-primary/20 bg-primary/5 p-3">
                <div className="flex gap-2">
                  <span className="flex-shrink-0 text-primary">→</span>
                  <p className="text-sm text-foreground/90">{reading}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Information Labels */}
      <div className="space-y-3 border-t border-border/50 pt-4 pi-fade-up" style={{ animationDelay: "0.55s" }}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {lang === "en" ? "Information Types" : "Loại thông tin"}
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/5 p-2">
            <span className="mt-0.5 flex-shrink-0 text-xs font-bold text-success">✓</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-success">{lang === "en" ? "Official Information" : "Thông tin chính thức"}</p>
              <p className="text-xs text-muted-foreground">{lang === "en" ? "From Pi Core Team" : "Từ Nhóm Pi Core"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2">
            <span className="mt-0.5 flex-shrink-0 text-xs font-bold text-blue-600 dark:text-blue-400">◇</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {lang === "en" ? "AI Analysis" : "Phân tích AI"}
              </p>
              <p className="text-xs text-muted-foreground">{lang === "en" ? "Confidence-weighted interpretation" : "Diễn giải có trọng số độ tin cậy"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2">
            <span className="mt-0.5 flex-shrink-0 text-xs font-bold text-amber-600 dark:text-amber-400">✦</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {lang === "en" ? "AI Prediction" : "Dự đoán AI"}
              </p>
              <p className="text-xs text-muted-foreground">{lang === "en" ? "Future outlook based on trends" : "Triển vọng tương lai dựa trên xu hướng"}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === "en"
            ? "Each AI metric includes a confidence indicator (0-100%). Official data is always sourced directly from Pi Core Team."
            : "Mỗi chỉ số AI bao gồm chỉ báo độ tin cậy (0-100%). Dữ liệu chính thức luôn lấy trực tiếp từ Nhóm Pi Core."}
        </p>
      </div>
    </div>
  )
}
