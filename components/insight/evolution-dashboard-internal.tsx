"use client"

/**
 * INTERNAL ONLY - Evolution Dashboard for Developers
 * 
 * This component is strictly internal and should NEVER be accessible to end users.
 * It provides visualization and tools for tracking Pi platform evolution.
 */

import { useState, useEffect } from "react"
import {
  type EvolutionReport,
  type EvolutionEvent,
  type ModuleImpact,
  type FeatureSuggestion,
  calculateCriticalityScore,
  MOCK_EVOLUTION_EVENTS,
  MOCK_MODULE_IMPACTS,
  MOCK_FEATURE_SUGGESTIONS,
} from "@/lib/insight/evolution-engine"

interface Props {
  // Internal component, no user-facing props
}

export function EvolutionDashboardInternal({}: Props) {
  const [report, setReport] = useState<EvolutionReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    return monday.toISOString().split("T")[0]
  })
  const [weekEnd, setWeekEnd] = useState(() => {
    const start = new Date(weekStart || new Date())
    const sunday = new Date(start)
    sunday.setDate(start.getDate() + 6)
    return sunday.toISOString().split("T")[0]
  })

  const generateReport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/evolution-engine/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_EVOLUTION_TOKEN || ""}`,
        },
        body: JSON.stringify({ weekStart, weekEnd }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate report")
      }
      
      const data = await response.json()
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const criticalityScore = report ? calculateCriticalityScore(report) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 p-8">
      {/* Admin Notice */}
      <div className="mb-8 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
        <p className="text-sm text-yellow-200">
          ⚠️ INTERNAL ONLY - Pi Insight Evolution Dashboard for Developers
        </p>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">Evolution Engine</h1>
        <p className="text-gray-400">Monitor Pi platform updates and plan Pi Insight development</p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Week Start</label>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="rounded bg-slate-800 px-4 py-2 text-white border border-purple-500/30"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Week End</label>
          <input
            type="date"
            value={weekEnd}
            onChange={(e) => setWeekEnd(e.target.value)}
            className="rounded bg-slate-800 px-4 py-2 text-white border border-purple-500/30"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={generateReport}
            disabled={loading}
            className="rounded bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {report && (
        <div className="space-y-8">
          {/* Criticality Score */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-slate-800 p-6 border border-purple-500/20">
              <p className="text-gray-400 text-sm mb-2">Criticality Score</p>
              <p className={`text-3xl font-bold ${
                criticalityScore > 70 ? "text-red-400" :
                criticalityScore > 40 ? "text-yellow-400" :
                "text-green-400"
              }`}>
                {criticalityScore}/100
              </p>
            </div>
            <div className="rounded-lg bg-slate-800 p-6 border border-purple-500/20">
              <p className="text-gray-400 text-sm mb-2">Total Effort Estimated</p>
              <p className="text-3xl font-bold text-blue-400">{report.summary.totalEstimatedEffort}h</p>
            </div>
            <div className="rounded-lg bg-slate-800 p-6 border border-purple-500/20">
              <p className="text-gray-400 text-sm mb-2">Platform Changes</p>
              <p className="text-3xl font-bold text-cyan-400">{report.summary.totalNewCapabilities}</p>
            </div>
            <div className="rounded-lg bg-slate-800 p-6 border border-purple-500/20">
              <p className="text-gray-400 text-sm mb-2">Critical Items</p>
              <p className="text-3xl font-bold text-orange-400">{report.summary.criticalPriority}</p>
            </div>
          </div>

          {/* Evolution Events */}
          <div className="rounded-lg bg-slate-800 p-6 border border-purple-500/20">
            <h2 className="mb-4 text-xl font-bold text-white">Platform Updates ({report.evolutionEvents.length})</h2>
            <div className="space-y-3">
              {report.evolutionEvents.map((event) => (
                <div key={event.id} className="rounded bg-slate-700/50 p-4 border border-slate-600">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">{event.title}</p>
                      <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                      {event.url && (
                        <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-2">
                          View Documentation →
                        </a>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                      event.source === "app-studio" ? "bg-cyan-500/20 text-cyan-300" :
                      event.source === "pi-sdk" ? "bg-purple-500/20 text-purple-300" :
                      event.source === "wallet" ? "bg-blue-500/20 text-blue-300" :
                      event.source === "node" ? "bg-orange-500/20 text-orange-300" :
                      "bg-gray-500/20 text-gray-300"
                    }`}>
                      {event.source}
                    </span>
                  </div>
                  {event.breakingChanges && (
                    <p className="mt-2 text-xs text-red-300">🚨 Breaking Changes Detected</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Module Impacts */}
          <div className="rounded-lg bg-slate-800 p-6 border border-purple-500/20">
            <h2 className="mb-4 text-xl font-bold text-white">Affected Modules ({report.moduleImpacts.length})</h2>
            <div className="space-y-3">
              {report.moduleImpacts.map((impact) => (
                <div key={impact.moduleName} className="rounded bg-slate-700/50 p-4 border border-slate-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{impact.moduleName}</p>
                      <p className="text-xs text-gray-400 mt-1">{impact.filePath}</p>
                      <div className="mt-3 space-y-2">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Changes Required:</p>
                          <ul className="text-xs text-gray-300 space-y-1">
                            {impact.requiredChanges.map((change, i) => (
                              <li key={i}>• {change}</li>
                            ))}
                          </ul>
                        </div>
                        {impact.riskFactors.length > 0 && (
                          <div>
                            <p className="text-xs text-red-400 mb-1">Risks:</p>
                            <ul className="text-xs text-red-300 space-y-1">
                              {impact.riskFactors.map((risk, i) => (
                                <li key={i}>⚠️ {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        impact.impactLevel === "critical" ? "bg-red-500/20 text-red-300" :
                        impact.impactLevel === "high" ? "bg-orange-500/20 text-orange-300" :
                        impact.impactLevel === "medium" ? "bg-yellow-500/20 text-yellow-300" :
                        "bg-green-500/20 text-green-300"
                      }`}>
                        {impact.impactLevel}
                      </span>
                      <p className="text-sm font-bold text-gray-300 mt-2">{impact.estimatedEffort}h</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Suggestions */}
          <div className="rounded-lg bg-slate-800 p-6 border border-purple-500/20">
            <h2 className="mb-4 text-xl font-bold text-white">Suggested Features ({report.suggestedFeatures.length})</h2>
            <div className="space-y-3">
              {report.suggestedFeatures.map((feature) => (
                <div key={feature.id} className="rounded bg-slate-700/50 p-4 border border-slate-600">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-white">{feature.title}</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      feature.priority === "critical" ? "bg-red-500/20 text-red-300" :
                      feature.priority === "high" ? "bg-orange-500/20 text-orange-300" :
                      feature.priority === "medium" ? "bg-yellow-500/20 text-yellow-300" :
                      "bg-green-500/20 text-green-300"
                    }`}>
                      {feature.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{feature.description}</p>
                  <p className="text-sm text-gray-400 mb-2"><strong>Benefit:</strong> {feature.userBenefit}</p>
                  <p className="text-sm text-gray-400"><strong>Effort:</strong> {feature.estimatedEffort}h | <strong>Phase:</strong> {feature.phase}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Effort Allocation */}
          <div className="rounded-lg bg-slate-800 p-6 border border-purple-500/20">
            <h2 className="mb-4 text-xl font-bold text-white">Implementation Effort by Phase</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { phase: "Phase 1", effort: report.effortAllocation.phase1, color: "bg-blue-500" },
                { phase: "Phase 2", effort: report.effortAllocation.phase2, color: "bg-purple-500" },
                { phase: "Phase 3", effort: report.effortAllocation.phase3, color: "bg-cyan-500" },
                { phase: "Phase 4", effort: report.effortAllocation.phase4, color: "bg-pink-500" },
              ].map(({ phase, effort, color }) => (
                <div key={phase} className="rounded bg-slate-700 p-4 border border-slate-600">
                  <p className="text-xs text-gray-400 mb-2">{phase}</p>
                  <div className="w-full bg-slate-600 rounded h-8 flex items-center justify-center">
                    <span className={`${color} text-white font-bold text-sm px-2 py-1 rounded w-full text-center`}>
                      {effort}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-lg bg-slate-800 p-6 border border-purple-500/20">
            <h2 className="mb-4 text-xl font-bold text-white">Development Recommendations</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-red-300 mb-2">🔴 Immediate Actions:</p>
                <ul className="space-y-1">
                  {report.recommendations.immediateActions.map((action, i) => (
                    <li key={i} className="text-sm text-gray-300">• {action}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-300 mb-2">🟡 Next Quarter Focus:</p>
                <ul className="space-y-1">
                  {report.recommendations.nextQuarterFocus.map((action, i) => (
                    <li key={i} className="text-sm text-gray-300">• {action}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-300 mb-2">🟢 Long-Term Vision:</p>
                <ul className="space-y-1">
                  {report.recommendations.longTermVision.map((action, i) => (
                    <li key={i} className="text-sm text-gray-300">• {action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                const json = JSON.stringify(report, null, 2)
                const blob = new Blob([json], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `evolution-report-${report.id}.json`
                a.click()
              }}
              className="rounded bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
            >
              Export JSON
            </button>
            <button
              onClick={() => window.print()}
              className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Print Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
