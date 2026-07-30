"use client"

import { useInsight } from "@/contexts/insight-context"
import { cx } from "./ui"
import { IconGlobe } from "./icons"

export function LangToggle() {
  const { lang, setLang } = useInsight()
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5">
      <IconGlobe className="ml-1.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      {(["en", "vi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cx(
            "pi-press rounded-full px-2.5 py-1 text-xs font-semibold uppercase",
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
