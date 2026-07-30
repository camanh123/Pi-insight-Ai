"use client"

import type { ReactElement } from "react"
import { cx } from "./ui"
import { IconHome, IconChat, IconBookmark } from "./icons"
import type { TabId } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

export function BottomNav({
  active,
  onChange,
  savedCount,
  t,
}: {
  active: TabId
  onChange: (tab: TabId) => void
  savedCount: number
  t: TFn
}) {
  const tabs: { id: TabId; label: string; icon: ReactElement; badge?: number }[] = [
    { id: "home", label: t("navHome"), icon: <IconHome className="h-5 w-5" /> },
    { id: "advisor", label: t("navAdvisor"), icon: <IconChat className="h-5 w-5" /> },
    {
      id: "saved",
      label: t("navSaved"),
      icon: <IconBookmark className="h-5 w-5" />,
      badge: savedCount,
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur pi-safe-bottom">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cx(
                "pi-press relative flex flex-1 flex-col items-center gap-0.5 py-2.5",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {tab.badge}
                  </span>
                ) : null}
              </span>
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
