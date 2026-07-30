"use client"

import { useInsight } from "@/contexts/insight-context"
import { cx } from "./ui"
import { IconCheck } from "./icons"

export function NextActions() {
  const { nextActions, completeAction, lang, t } = useInsight()

  if (nextActions.length === 0) {
    return null
  }

  const incomplete = nextActions.filter((a) => !a.completed)
  const completed = nextActions.filter((a) => a.completed)
  const completionRate = Math.round((completed.length / nextActions.length) * 100)

  const getPriorityColor = (priority: string) => {
    return priority === "high"
      ? "bg-red-50 text-red-900 border-red-200"
      : priority === "medium"
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : "bg-blue-50 text-blue-900 border-blue-200"
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("nextActions")}</h2>
        <p className="text-sm text-muted-foreground">
          {incomplete.length} {incomplete.length === 1 ? t("action") || "action" : t("actions") || "actions"} remaining
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <div className="text-sm font-medium text-foreground mb-2">{completionRate}% Complete</div>
        <div className="h-2 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Incomplete Actions */}
      {incomplete.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("actionChecklist")}
          </p>
          {incomplete.map((action) => (
            <div
              key={action.id}
              className="rounded-lg border border-border bg-card p-3 space-y-2"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => completeAction(action.id)}
                  className="mt-0.5 flex-shrink-0 rounded-full border-2 border-border hover:border-primary transition-colors"
                >
                  <div className="h-4 w-4 rounded-full" />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground">
                    {action.title[lang]}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {action.description[lang]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-7">
                <span
                  className={cx(
                    "inline-block px-2 py-0.5 text-xs font-medium rounded border",
                    getPriorityColor(action.priority)
                  )}
                >
                  {t(action.priority) || action.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Actions */}
      {completed.length > 0 && (
        <details className="rounded-lg border border-border bg-card/30 p-3">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            ✓ {completed.length} Completed
          </summary>
          <div className="mt-3 space-y-2">
            {completed.map((action) => (
              <div key={action.id} className="flex items-start gap-3 opacity-60">
                <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <IconCheck className="h-3 w-3 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground line-through">
                    {action.title[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
