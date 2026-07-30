import { fetchOfficialUpdates, deduplicateUpdates } from "@/lib/insight/sync"
import type { PiUpdate } from "@/lib/insight/data"

export const maxDuration = 45
export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = (searchParams.get("lang") as "en" | "vi") || "en"
    const forceRefresh = searchParams.get("force") === "true"

    // Fetch from official sources
    const { updates: partialUpdates, errors } = await fetchOfficialUpdates(lang)

    // Deduplicate fetched updates
    const deduped = deduplicateUpdates(partialUpdates)

    // Enrich updates with required fields
    const enrichedUpdates: Partial<PiUpdate>[] = deduped.map((update) => ({
      ...update,
      importance: Math.floor(Math.random() * 5) + 6, // 6-10 for fetched updates
      importanceReason: {
        en: "Official Pi Network announcement",
        vi: "Thông báo chính thức từ Pi Network",
      },
      analysis: {
        whyMatters: {
          en: update.summary?.en || "Important Pi Network update",
          vi: update.summary?.vi || "Cập nhật quan trọng của Pi Network",
        },
        affected: [
          { en: "All Pioneers", vi: "Tất cả những người khai thác Pi" },
        ],
        shortTerm: {
          en: "Increases engagement in Pi Network community",
          vi: "Tăng sự tham gia của cộng đồng Pi Network",
        },
        longTerm: {
          en: "Contributes to Pi Network ecosystem development",
          vi: "Góp phần phát triển hệ sinh thái Pi Network",
        },
      },
      timeline: [],
      related: [],
      prediction: {
        en: "This update will shape Pi Network's future direction",
        vi: "Bản cập nhật này sẽ định hình hướng phát triển của Pi Network",
      },
      suggestedQuestions: [
        {
          en: "What are the next steps for implementation?",
          vi: "Các bước tiếp theo triển khai là gì?",
        },
        { en: "How will this affect me?", vi: "Điều này sẽ ảnh hưởng đến tôi như thế nào?" },
      ],
      impactScores: {
        overall: {
          score: 7,
          reason: { en: "Significant update", vi: "Cập nhật quan trọng" },
        },
        pioneers: {
          score: 8,
          reason: { en: "Directly affects Pioneers", vi: "Ảnh hưởng trực tiếp đến những người khai thác Pi" },
        },
        developers: {
          score: 7,
          reason: { en: "Relevant to developers", vi: "Liên quan đến nhà phát triển" },
        },
        businesses: {
          score: 6,
          reason: { en: "Important for businesses", vi: "Quan trọng cho các doanh nghiệp" },
        },
        ecosystem: {
          score: 8,
          reason: { en: "Strengthens ecosystem", vi: "Tăng cường hệ sinh thái" },
        },
      },
      insightReport: {
        keyTakeaway: {
          en: update.summary?.en || "New Pi Network announcement",
          vi: update.summary?.vi || "Thông báo mới từ Pi Network",
        },
        whyMatters: {
          en: "Official Pi announcements shape the future direction of the network",
          vi: "Các thông báo chính thức của Pi định hình hướng phát triển tương lai của mạng",
        },
        beforeVsAfter: {
          before: {
            en: "Previous state",
            vi: "Trạng thái trước đó",
          },
          after: {
            en: "New developments",
            vi: "Phát triển mới",
          },
        },
        whoIsAffected: {
          en: "All Pi Network participants",
          vi: "Tất cả những người tham gia Pi Network",
        },
        aiInsight: {
          en: "This is an official announcement that impacts the Pi ecosystem",
          vi: "Đây là một thông báo chính thức ảnh hưởng đến hệ sinh thái Pi",
        },
        relatedUpdates: [],
        suggestedQuestions: [
          {
            en: "What specific changes does this introduce?",
            vi: "Những thay đổi cụ thể mà điều này đưa ra là gì?",
          },
        ],
      },
    }))

    return Response.json(
      {
        ok: true,
        updates: enrichedUpdates,
        count: enrichedUpdates.length,
        errors: errors.length > 0 ? errors : undefined,
        syncedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": forceRefresh ? "no-cache" : "public, max-age=3600",
        },
      }
    )
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to synchronize official updates",
        syncedAt: null,
      },
      { status: 500 }
    )
  }
}
