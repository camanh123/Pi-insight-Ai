import { AIIntelligenceDashboard } from "./ai-intelligence-dashboard"
import type { Lang } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

export function Dashboard({ lang, t }: { lang: Lang; t: TFn }) {
  return <AIIntelligenceDashboard lang={lang} t={t} />
}
