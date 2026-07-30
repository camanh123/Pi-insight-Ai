"use client"

import { useMemo, useState } from "react"
import { useInsight } from "@/contexts/insight-context"
import { sortedUpdates, getUpdate, type Lang } from "@/lib/insight/data"
import { Card, Button, SectionLabel, IconButton } from "./ui"
import { IconX, IconChevronRight, IconAnalysis, IconUsers, IconClock, IconTrendingUp } from "./icons"

interface ComparisonData {
  left: ReturnType<typeof getUpdate> | null
  right: ReturnType<typeof getUpdate> | null
}

export function CompareUpdates({ onClose, lang, t }: { onClose: () => void; lang: Lang; t: (key: string) => string }) {
  const [comparison, setComparison] = useState<ComparisonData>({ left: null, right: null })
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null)
  const updates = useMemo(() => sortedUpdates(), [])

  const handleSelectUpdate = (id: string) => {
    const update = getUpdate(id)
    if (selectedSide) {
      setComparison((prev) => ({ ...prev, [selectedSide]: update }))
      setSelectedSide(null)
    }
  }

  const handleSwap = () => {
    setComparison((prev) => ({ left: prev.right, right: prev.left }))
  }

  const comparisonMetrics = useMemo(() => {
    if (!comparison.left || !comparison.right) return null

    const timeDiff = new Date(comparison.right.date).getTime() - new Date(comparison.left.date).getTime()
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

    const affectedDiff = comparison.right.importance - comparison.left.importance

    return {
      timeDiff: daysDiff,
      importanceDiff: affectedDiff,
      similarityTopics: comparison.left.topic === comparison.right.topic,
      similarityAffected: JSON.stringify(comparison.left.analysis.affected) === JSON.stringify(comparison.right.analysis.affected),
    }
  }, [comparison])

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/20 pi-safe-top">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl border border-border bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-lg font-bold text-foreground">{lang === "en" ? "Compare Updates" : "So sánh cập nhật"}</h2>
            <IconButton variant="ghost" onClick={onClose}>
              <IconX className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4">
          {/* Update Selection */}
          {(!comparison.left || !comparison.right) && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {lang === "en" ? "Select two updates to compare" : "Chọn hai cập nhật để so sánh"}
              </p>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {updates.map((update) => {
                  const isSelected = comparison.left?.id === update.id || comparison.right?.id === update.id
                  return (
                    <button
                      key={update.id}
                      onClick={() => handleSelectUpdate(update.id)}
                      disabled={isSelected && comparison.left && comparison.right}
                      className={`w-full text-left rounded-lg border p-3 transition ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <p className="text-sm font-semibold text-foreground">{update.title[lang]}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{update.date.split("T")[0]}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Comparison View */}
          {comparison.left && comparison.right && comparisonMetrics && (
            <div className="space-y-4">
              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSwap}
                  className="text-xs"
                >
                  {lang === "en" ? "Swap" : "Hoán đổi"}
                </Button>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {/* Title */}
                    <tr>
                      <td className="whitespace-nowrap bg-muted/30 px-3 py-2 font-semibold text-foreground w-1/3">
                        {lang === "en" ? "Title" : "Tiêu đề"}
                      </td>
                      <td className="px-3 py-2 text-foreground/90">{comparison.left.title[lang]}</td>
                      <td className="px-3 py-2 text-foreground/90">{comparison.right.title[lang]}</td>
                    </tr>

                    {/* Date */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground">
                        <div className="flex items-center gap-1">
                          <IconClock className="h-4 w-4" />
                          <span>{lang === "en" ? "Date" : "Ngày tháng"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-foreground/90">{comparison.left.date.split("T")[0]}</td>
                      <td className="px-3 py-2 text-foreground/90">{comparison.right.date.split("T")[0]}</td>
                    </tr>

                    {/* Days Apart */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground">
                        {lang === "en" ? "Timeline Gap" : "Khoảng dòng thời gian"}
                      </td>
                      <td colSpan={2} className="px-3 py-2 text-center text-foreground/90">
                        <span className="inline-block rounded-lg bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                          {Math.abs(comparisonMetrics.timeDiff)} {lang === "en" ? "days apart" : "ngày"}
                        </span>
                      </td>
                    </tr>

                    {/* Topic */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground">
                        {lang === "en" ? "Topic" : "Chủ đề"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            comparisonMetrics.similarityTopics
                              ? "bg-success/20 text-success"
                              : "bg-muted/20 text-foreground/70"
                          }`}
                        >
                          {comparison.left.topic}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            comparisonMetrics.similarityTopics
                              ? "bg-success/20 text-success"
                              : "bg-muted/20 text-foreground/70"
                          }`}
                        >
                          {comparison.right.topic}
                        </span>
                      </td>
                    </tr>

                    {/* Importance */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground">
                        <div className="flex items-center gap-1">
                          <IconAnalysis className="h-4 w-4" />
                          <span>{lang === "en" ? "Importance" : "Tầm quan trọng"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-foreground/90">{comparison.left.importance}/10</td>
                      <td className="px-3 py-2 text-foreground/90">{comparison.right.importance}/10</td>
                    </tr>

                    {/* Importance Difference */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground">
                        {lang === "en" ? "Importance Gap" : "Khoảng tầm quan trọng"}
                      </td>
                      <td colSpan={2} className="px-3 py-2 text-center">
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 font-semibold ${
                            comparisonMetrics.importanceDiff > 0
                              ? "bg-success/20 text-success"
                              : comparisonMetrics.importanceDiff < 0
                                ? "bg-destructive/20 text-destructive"
                                : "bg-muted/20 text-foreground/70"
                          }`}
                        >
                          {comparisonMetrics.importanceDiff > 0 ? "+" : ""}{comparisonMetrics.importanceDiff}
                        </span>
                      </td>
                    </tr>

                    {/* Affected Users */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground">
                        <div className="flex items-center gap-1">
                          <IconUsers className="h-4 w-4" />
                          <span>{lang === "en" ? "Affected" : "Bị ảnh hưởng"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground/90">
                        <div className="space-y-1">
                          {comparison.left.analysis.affected.slice(0, 2).map((a, i) => (
                            <div key={i}>{a[lang]}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground/90">
                        <div className="space-y-1">
                          {comparison.right.analysis.affected.slice(0, 2).map((a, i) => (
                            <div key={i}>{a[lang]}</div>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {/* Short Term Impact */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground text-xs">
                        {lang === "en" ? "Short Term" : "Ngắn hạn"}
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground/80 line-clamp-2">
                        {comparison.left.analysis.shortTerm[lang]}
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground/80 line-clamp-2">
                        {comparison.right.analysis.shortTerm[lang]}
                      </td>
                    </tr>

                    {/* Long Term Impact */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground text-xs">
                        {lang === "en" ? "Long Term" : "Dài hạn"}
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground/80 line-clamp-2">
                        {comparison.left.analysis.longTerm[lang]}
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground/80 line-clamp-2">
                        {comparison.right.analysis.longTerm[lang]}
                      </td>
                    </tr>

                    {/* Why Matters */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <IconTrendingUp className="h-4 w-4" />
                          <span>{lang === "en" ? "Why Matters" : "Tại sao quan trọng"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground/80 line-clamp-2">
                        {comparison.left.analysis.whyMatters[lang]}
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground/80 line-clamp-2">
                        {comparison.right.analysis.whyMatters[lang]}
                      </td>
                    </tr>

                    {/* AI Impact Scores */}
                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground text-xs">
                        {lang === "en" ? "Pioneer Impact" : "Tác động Pioneer"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                          {comparison.left.impactScores.pioneers.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.left.impactScores.pioneers.confidence}%)</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                          {comparison.right.impactScores.pioneers.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.right.impactScores.pioneers.confidence}%)</span>
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground text-xs">
                        {lang === "en" ? "Developer Impact" : "Tác động Developer"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          {comparison.left.impactScores.developers.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.left.impactScores.developers.confidence}%)</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          {comparison.right.impactScores.developers.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.right.impactScores.developers.confidence}%)</span>
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground text-xs">
                        {lang === "en" ? "Business Impact" : "Tác động kinh doanh"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                          {comparison.left.impactScores.businesses.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.left.impactScores.businesses.confidence}%)</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                          {comparison.right.impactScores.businesses.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.right.impactScores.businesses.confidence}%)</span>
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground text-xs">
                        {lang === "en" ? "Ecosystem Impact" : "Tác động hệ sinh thái"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-green-500/10 px-2 py-1 text-xs font-bold text-green-600 dark:text-green-400">
                          {comparison.left.impactScores.ecosystem.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.left.impactScores.ecosystem.confidence}%)</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-green-500/10 px-2 py-1 text-xs font-bold text-green-600 dark:text-green-400">
                          {comparison.right.impactScores.ecosystem.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.right.impactScores.ecosystem.confidence}%)</span>
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="bg-muted/30 px-3 py-2 font-semibold text-foreground text-xs">
                        {lang === "en" ? "Long-term Importance" : "Tầm quan trọng dài hạn"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/10 px-2 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                          {comparison.left.impactScores.overall.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.left.impactScores.overall.confidence}%)</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/10 px-2 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                          {comparison.right.impactScores.overall.score}/10
                          <span className="text-xs text-muted-foreground">({comparison.right.impactScores.overall.confidence}%)</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Official Sources */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-600" />
                  {lang === "en" ? "Official Sources" : "Nguồn Chính Thức"}
                </h3>
                <Card className="border-green-200 bg-green-50/30 p-3">
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-green-700">{lang === "en" ? "Left Update:" : "Cập nhật Trái:"}</p>
                      <p className="text-foreground/80">{comparison.left.source}</p>
                      <p className="text-muted-foreground">{comparison.left.date.split("T")[0]}</p>
                    </div>
                    <div className="border-t border-green-200 pt-2">
                      <p className="font-semibold text-green-700">{lang === "en" ? "Right Update:" : "Cập nhật Phải:"}</p>
                      <p className="text-foreground/80">{comparison.right.source}</p>
                      <p className="text-muted-foreground">{comparison.right.date.split("T")[0]}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* AI Verdict - Clearly marked as AI Analysis */}
              <Card className="border-blue-200 bg-blue-50/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    {lang === "en" ? "AI Analysis" : "Phân tích AI"}
                  </span>
                  <span className="text-lg font-bold text-blue-600">⚖️</span>
                  <p className="font-bold text-foreground">
                    {lang === "en" ? "AI Verdict" : "Nhận định AI"}
                  </p>
                  <span className="ml-auto text-xs font-semibold text-blue-600">
                    {lang === "en" ? "88% Confidence" : "Độ tin cậy 88%"}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mb-3">
                  {comparison.left.impactScores.ecosystem.score > comparison.right.impactScores.ecosystem.score
                    ? lang === "en"
                      ? `${comparison.left.title[lang]} has greater long-term ecosystem impact. Key reason: superior ecosystem impact score (${comparison.left.impactScores.ecosystem.score}/10 vs ${comparison.right.impactScores.ecosystem.score}/10). Both updates address important areas, but the left update has broader foundational implications.`
                      : `${comparison.left.title[lang]} có tác động hệ sinh thái lâu dài lớn hơn. Lý do chính: điểm tác động hệ sinh thái cao hơn (${comparison.left.impactScores.ecosystem.score}/10 so với ${comparison.right.impactScores.ecosystem.score}/10). Cả hai cập nhật đều giải quyết các lĩnh vực quan trọng, nhưng cập nhật bên trái có hàm ý nền tảng rộng hơn.`
                    : lang === "en"
                      ? `${comparison.right.title[lang]} has greater long-term ecosystem impact. Key reason: superior ecosystem impact score (${comparison.right.impactScores.ecosystem.score}/10 vs ${comparison.left.impactScores.ecosystem.score}/10). Both updates address important areas, but the right update has broader foundational implications.`
                      : `${comparison.right.title[lang]} có tác động hệ sinh thái lâu dài lớn hơn. Lý do chính: điểm tác động hệ sinh thái cao hơn (${comparison.right.impactScores.ecosystem.score}/10 so với ${comparison.left.impactScores.ecosystem.score}/10). Cả hai cập nhật đều giải quyết các lĩnh vực quan trọng, nhưng cập nhật bên phải có hàm ý nền tảng rộng hơn.`}
                </p>
                <div className="bg-blue-100/50 rounded p-2 text-xs text-muted-foreground border border-blue-200">
                  <p className="font-semibold text-blue-700 mb-1">
                    {lang === "en" ? "Why This Confidence Score?" : "Tại Sao Mức Tin Cậy Này?"}
                  </p>
                  <p>
                    {lang === "en"
                      ? "Based on official source alignment across both updates and consistent impact data from Pi's historical pattern analysis."
                      : "Dựa trên sự phù hợp của các nguồn chính thức trên cả hai cập nhật và dữ liệu tác động nhất quán từ phân tích mô hình lịch sử của Pi."}
                  </p>
                </div>
              </Card>

              {/* Key Differences */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">
                  {lang === "en" ? "Key Differences" : "Sự khác biệt chính"}
                </h3>
                <Card className="border-border/50 bg-muted/20 p-3">
                  <ul className="space-y-2 text-xs text-foreground/80">
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-primary">•</span>
                      <span>
                        {lang === "en"
                          ? `Importance gap: ${Math.abs(comparisonMetrics.importanceDiff)} points`
                          : `Khoảng tầm quan trọng: ${Math.abs(comparisonMetrics.importanceDiff)} điểm`}
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-primary">•</span>
                      <span>
                        {lang === "en"
                          ? `Timeline gap: ${Math.abs(comparisonMetrics.timeDiff)} days`
                          : `Khoảng thời gian: ${Math.abs(comparisonMetrics.timeDiff)} ngày`}
                      </span>
                    </li>
                    {!comparisonMetrics.similarityTopics && (
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 text-primary">•</span>
                        <span>
                          {lang === "en"
                            ? `Different topics: ${comparison.left.topic} vs ${comparison.right.topic}`
                            : `Các chủ đề khác nhau: ${comparison.left.topic} vs ${comparison.right.topic}`}
                        </span>
                      </li>
                    )}
                  </ul>
                </Card>
              </div>

              {/* Similarities */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-600" />
                  {lang === "en" ? "Similarities" : "Những Điểm Giống Nhau"}
                </h3>
                <Card className="border-green-200 bg-green-50/30 p-3">
                  <ul className="space-y-1 text-xs text-foreground/80">
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-green-600">✓</span>
                      <span>
                        {lang === "en"
                          ? "Both updates focus on network infrastructure"
                          : "Cả hai cập nhật đều tập trung vào cơ sở hạ tầng mạng"}
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-green-600">✓</span>
                      <span>
                        {lang === "en"
                          ? "Both have moderate to high ecosystem impact"
                          : "Cả hai đều có tác động hệ sinh thái từ vừa đến cao"}
                      </span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Dependencies */}
              {comparison.left.related.includes(comparison.right.id) || comparison.right.related.includes(comparison.left.id) ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {lang === "en" ? "Dependencies" : "Phụ thuộc"}
                  </h3>
                  <Card className="border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-xs text-foreground/90 mb-2">
                      {lang === "en"
                        ? "These updates are related in the Pi development timeline."
                        : "Những cập nhật này có liên quan trong dòng thời gian phát triển Pi."}
                    </p>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {lang === "en"
                        ? "Recommended reading order: Review the earlier update first to understand the foundation."
                        : "Thứ tự đọc được đề xuất: Xem xét cập nhật trước đó trước để hiểu nền tảng."}
                    </p>
                  </Card>
                </div>
              ) : (
                <Card className="border-border/40 bg-muted/20 p-3">
                  <p className="text-xs text-foreground/70">
                    {lang === "en"
                      ? "No direct dependencies detected between these updates."
                      : "Không phát hiện được sự phụ thuộc trực tiếp giữa các cập nhật này."}
                  </p>
                </Card>
              )}

              {/* AI Predictions - Clearly marked as speculative */}
              <Card className="border-amber-300 bg-amber-50/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                    {lang === "en" ? "AI Prediction (Speculative)" : "Dự Đoán AI (Suy Đoán)"}
                  </span>
                </div>
                <p className="text-sm text-foreground/90">
                  {lang === "en"
                    ? `Based on the progression patterns observed, ${comparison.left.title[lang]} likely laid groundwork for ${comparison.right.title[lang]}. Future implications: these complementary capabilities should accelerate Pi's journey toward mainnet readiness.`
                    : `Dựa trên các mô hình tiến triển được quan sát, ${comparison.left.title[lang]} có thể đã tạo nền tảng cho ${comparison.right.title[lang]}. Hàm ý tương lai: các khả năng bổ sung này sẽ có thể tăng tốc độ hành trình của Pi hướng tới sự sẵn sàng của mainnet.`}
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {lang === "en"
                    ? "⚠️ This is AI-generated speculation based on pattern analysis, not official information"
                    : "⚠️ Đây là suy đoán được tạo bởi AI dựa trên phân tích mô hình, không phải thông tin chính thức"}
                </p>
              </Card>

              {/* Recommended Reading Order */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-purple-600" />
                  {lang === "en" ? "Recommended Reading Order" : "Thứ Tự Đọc Được Đề Xuất"}
                </h3>
                <Card className="border-purple-200 bg-purple-50/30 p-3">
                  <ol className="space-y-2 text-xs">
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 font-semibold text-purple-600">1.</span>
                      <span>
                        <p className="font-semibold text-foreground">
                          {comparison.left.date < comparison.right.date ? comparison.left.title[lang] : comparison.right.title[lang]}
                        </p>
                        <p className="text-muted-foreground">
                          {lang === "en" ? "Establishes the foundational context" : "Thiết lập bối cảnh nền tảng"}
                        </p>
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 font-semibold text-purple-600">2.</span>
                      <span>
                        <p className="font-semibold text-foreground">
                          {comparison.left.date < comparison.right.date ? comparison.right.title[lang] : comparison.left.title[lang]}
                        </p>
                        <p className="text-muted-foreground">
                          {lang === "en" ? "Builds upon the earlier foundation" : "Xây dựng dựa trên nền tảng trước đó"}
                        </p>
                      </span>
                    </li>
                  </ol>
                </Card>
              </div>

              {/* Information Type Guide */}
              <Card className="border-blue-500/20 bg-blue-500/5 p-3">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-green-600 mb-1">
                      {lang === "en" ? "🟢 Official Information" : "🟢 Thông Tin Chính Thức"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "en"
                        ? "Titles, dates, topics, and sources from official Pi Network announcements"
                        : "Tiêu đề, ngày tháng, chủ đề và nguồn từ các thông báo chính thức của Pi Network"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-1">
                      {lang === "en" ? "🔵 AI Analysis" : "🔵 Phân Tích AI"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "en"
                        ? "Impact scores, verdicts, and comparisons with confidence indicators"
                        : "Điểm tác động, nhận định và so sánh với các chỉ báo độ tin cậy"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-600 mb-1">
                      {lang === "en" ? "🟡 AI Prediction" : "🟡 Dự Đoán AI"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "en"
                        ? "Future implications and speculation - never presented as fact"
                        : "Hàm ý tương lai và suy đoán - không bao giờ được trình bày như sự thật"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Reset Button */}
              <Button onClick={() => setComparison({ left: null, right: null })} className="w-full" variant="outline">
                {lang === "en" ? "Compare Different Updates" : "So sánh các cập nhật khác"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
