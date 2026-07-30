// Pi Insight — Live Data Synchronization Service
// Automatically fetches official Pi Network announcements and manages sync state

import { PiUpdate, Lang } from "./data"

export interface SyncState {
  lastSyncAt: string | null // ISO timestamp
  lastSyncStatus: "idle" | "syncing" | "success" | "error"
  lastSyncError: string | null
  newUpdateCount: number
  readUpdates: string[] // update IDs already marked as read
}

export interface OfficialSource {
  id: string
  name: string
  url: string
  parser: (html: string, lang: Lang) => Partial<PiUpdate>[]
}

// Approved official Pi Network sources
export const OFFICIAL_SOURCES: OfficialSource[] = [
  {
    id: "pi-blog",
    name: "Pi Core Team Blog",
    url: "https://minepi.com/blog",
    parser: parsePiBlog,
  },
  {
    id: "pi-announcements",
    name: "Pi Network Announcements",
    url: "https://minepi.com/announcements",
    parser: parsePiAnnouncements,
  },
  {
    id: "app-studio-updates",
    name: "App Studio Updates",
    url: "https://appstudio.pi.network/updates",
    parser: parseAppStudioUpdates,
  },
]

// Parser for Pi Blog (extract official announcements)
function parsePiBlog(html: string, lang: Lang): Partial<PiUpdate>[] {
  const updates: Partial<PiUpdate>[] = []

  // Extract blog posts with Pi-specific keywords
  const postRegex =
    /<article[^>]*>.*?<h[2-3][^>]*>([^<]+)<\/h[2-3]>.*?<p[^>]*>([^<]+)<\/p>.*?<a[^>]*href="([^"]+)"[^>]*>.*?<\/article>/gis

  let match
  while ((match = postRegex.exec(html)) !== null) {
    const [, title, excerpt, url] = match
    const updateId = `pi-blog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    updates.push({
      id: updateId,
      source: "Pi Core Team Blog",
      sourceUrl: url.startsWith("http") ? url : `https://minepi.com${url}`,
      date: new Date().toISOString().split("T")[0],
      title: {
        en: title?.trim() || "New Pi Network Update",
        vi: title?.trim() || "Cập nhật mới từ Pi Network",
      },
      summary: {
        en: excerpt?.slice(0, 200) || "Official Pi Network announcement",
        vi: excerpt?.slice(0, 200) || "Thông báo chính thức từ Pi Network",
      },
      topic: detectTopicFromContent(title + " " + excerpt),
    })
  }

  return updates
}

// Parser for Pi Announcements page
function parsePiAnnouncements(html: string, lang: Lang): Partial<PiUpdate>[] {
  const updates: Partial<PiUpdate>[] = []

  // Extract announcement blocks
  const announcementRegex = /<div[^>]*class="[^"]*announcement[^"]*"[^>]*>.*?<h[2-3][^>]*>([^<]+)<\/h[2-3]>.*?<time[^>]*>([^<]+)<\/time>.*?<p[^>]*>([^<]+)<\/p>.*?<\/div>/gis

  let match
  while ((match = announcementRegex.exec(html)) !== null) {
    const [, title, date, content] = match
    const updateId = `pi-ann-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    updates.push({
      id: updateId,
      source: "Pi Network Announcements",
      sourceUrl: "https://minepi.com/announcements",
      date: parseDate(date),
      title: {
        en: title?.trim() || "New Announcement",
        vi: title?.trim() || "Thông báo mới",
      },
      summary: {
        en: content?.slice(0, 200) || "Official announcement from Pi Core Team",
        vi: content?.slice(0, 200) || "Thông báo chính thức từ Pi Core Team",
      },
      topic: detectTopicFromContent(title + " " + content),
    })
  }

  return updates
}

// Parser for App Studio updates
function parseAppStudioUpdates(html: string, lang: Lang): Partial<PiUpdate>[] {
  const updates: Partial<PiUpdate>[] = []

  // Extract App Studio release notes and updates
  const releaseRegex =
    /<div[^>]*class="[^"]*release[^"]*"[^>]*>.*?<h[2-3][^>]*>([^<]+)<\/h[2-3]>.*?<p[^>]*>([^<]+)<\/p>.*?<\/div>/gis

  let match
  while ((match = releaseRegex.exec(html)) !== null) {
    const [, title, description] = match
    const updateId = `app-studio-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    updates.push({
      id: updateId,
      source: "App Studio Updates",
      sourceUrl: "https://appstudio.pi.network/updates",
      date: new Date().toISOString().split("T")[0],
      title: {
        en: title?.trim() || "App Studio Update",
        vi: title?.trim() || "Cập nhật App Studio",
      },
      summary: {
        en: description?.slice(0, 200) || "New App Studio features and improvements",
        vi: description?.slice(0, 200) || "Các tính năng và cải tiến mới của App Studio",
      },
      topic: "appstudio",
    })
  }

  return updates
}

// Detect topic from announcement content
function detectTopicFromContent(text: string): string {
  const lower = text.toLowerCase()

  if (lower.includes("mainnet") || lower.includes("open network"))
    return "mainnet"
  if (lower.includes("kyc") || lower.includes("verification"))
    return "kyc"
  if (lower.includes("kyb") || lower.includes("business"))
    return "kyb"
  if (lower.includes("node") || lower.includes("validator"))
    return "nodes"
  if (lower.includes("app studio") || lower.includes("developer"))
    return "appstudio"
  if (lower.includes("roadmap") || lower.includes("future"))
    return "roadmap"
  if (lower.includes("ecosystem") || lower.includes("partnership"))
    return "ecosystem"

  return "ecosystem"
}

// Parse various date formats to ISO date string
function parseDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split("T")[0]
    }
    return date.toISOString().split("T")[0]
  } catch {
    return new Date().toISOString().split("T")[0]
  }
}

// Fetch data from official sources (server-side only)
export async function fetchOfficialUpdates(
  lang: Lang = "en"
): Promise<{ updates: Partial<PiUpdate>[]; errors: string[] }> {
  const updates: Partial<PiUpdate>[] = []
  const errors: string[] = []

  for (const source of OFFICIAL_SOURCES) {
    try {
      // Add no-cache to ensure fresh data
      const response = await fetch(source.url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Pi-Insight-Official-Data-Fetcher/1.0",
        },
      })

      if (!response.ok) {
        errors.push(
          `Failed to fetch from ${source.name} (HTTP ${response.status})`
        )
        continue
      }

      const html = await response.text()
      const parsed = source.parser(html, lang)
      updates.push(...parsed)
    } catch (error) {
      errors.push(
        `Error fetching from ${source.name}: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  return { updates, errors }
}

// Deduplicate updates based on title and content similarity
export function deduplicateUpdates(
  updates: Partial<PiUpdate>[]
): Partial<PiUpdate>[] {
  const seen = new Set<string>()
  const deduplicated: Partial<PiUpdate>[] = []

  for (const update of updates) {
    // Use title and source as dedup key
    const key = `${update.title?.en || ""}-${update.source}`
    if (!seen.has(key)) {
      seen.add(key)
      deduplicated.push(update)
    }
  }

  return deduplicated
}

// Default sync state
export const DEFAULT_SYNC_STATE: SyncState = {
  lastSyncAt: null,
  lastSyncStatus: "idle",
  lastSyncError: null,
  newUpdateCount: 0,
  readUpdates: [],
}

// Calculate human-readable last sync time
export function formatLastSync(lastSyncAt: string | null, lang: Lang): string {
  if (!lastSyncAt) return lang === "vi" ? "Chưa đồng bộ" : "Never synced"

  const now = new Date()
  const last = new Date(lastSyncAt)
  const diffMs = now.getTime() - last.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (lang === "vi") {
    if (diffMins < 1) return "Vừa đồng bộ"
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    return `${diffDays} ngày trước`
  }

  if (diffMins < 1) return "Just synced"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}
