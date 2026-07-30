/**
 * INTERNAL ONLY - Evolution Engine Report Generator
 * 
 * POST /api/evolution-engine/generate-report
 * 
 * Generates weekly Evolution Reports analyzing Pi platform updates.
 * This endpoint is STRICTLY internal and requires developer authentication.
 * 
 * NEVER expose this to end users.
 */

import {
  generateEvolutionReport,
  calculateCriticalityScore,
  prioritizeActions,
  type EvolutionReport,
} from "@/lib/insight/evolution-engine"

// Internal developer authentication (in production, use proper API keys)
const INTERNAL_DEVELOPER_TOKEN = process.env.EVOLUTION_ENGINE_DEV_TOKEN || "dev-only-unsafe"

function verifyDeveloperAuth(authHeader: string | null): boolean {
  if (!authHeader) return false
  
  const token = authHeader.replace("Bearer ", "")
  
  // In production, verify against secure key management system
  if (process.env.NODE_ENV === "production") {
    return token === process.env.EVOLUTION_ENGINE_DEV_TOKEN
  }
  
  // Development: allow with warning
  return true
}

interface GenerateReportRequest {
  weekStart: string // ISO date YYYY-MM-DD
  weekEnd: string   // ISO date YYYY-MM-DD
}

export async function POST(req: Request) {
  // Verify internal developer authentication
  const authHeader = req.headers.get("Authorization")
  
  if (!verifyDeveloperAuth(authHeader)) {
    return new Response(
      JSON.stringify({
        error: "UNAUTHORIZED",
        message: "This is an internal-only API endpoint for developers.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    )
  }
  
  try {
    const body = (await req.json()) as Partial<GenerateReportRequest>
    
    // Validate date inputs
    if (!body.weekStart || !body.weekEnd) {
      return new Response(
        JSON.stringify({
          error: "INVALID_INPUT",
          message: "weekStart and weekEnd (ISO dates) are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }
    
    // Generate the report
    const report = generateEvolutionReport(body.weekStart, body.weekEnd)
    
    // Calculate criticality
    const criticalityScore = calculateCriticalityScore(report)
    
    // Get prioritized actions
    const prioritizedActions = prioritizeActions(report)
    
    // Enhance report with analytics
    const enhancedReport = {
      ...report,
      analytics: {
        criticalityScore,
        prioritizedActions,
        averageEffortPerItem: report.summary.totalEstimatedEffort / (
          report.suggestedFeatures.length + 
          report.architectureChanges.length + 
          report.moduleImpacts.length
        ),
      },
    }
    
    return new Response(JSON.stringify(enhancedReport, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[Evolution Engine] Error generating report:", error)
    return new Response(
      JSON.stringify({
        error: "INTERNAL_ERROR",
        message: "Failed to generate evolution report",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function GET(req: Request) {
  // GET returns schema/documentation only
  const authHeader = req.headers.get("Authorization")
  
  if (!verifyDeveloperAuth(authHeader)) {
    return new Response(
      JSON.stringify({
        error: "UNAUTHORIZED",
        message: "This is an internal-only API endpoint for developers.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    )
  }
  
  return new Response(
    JSON.stringify({
      endpoint: "POST /api/evolution-engine/generate-report",
      description: "INTERNAL ONLY - Generate weekly Evolution Report",
      authentication: "Bearer token (EVOLUTION_ENGINE_DEV_TOKEN)",
      requestBody: {
        weekStart: "ISO date (YYYY-MM-DD) - week start date",
        weekEnd: "ISO date (YYYY-MM-DD) - week end date",
      },
      responseFormat: {
        id: "Report ID (evo-report-YYYY-MM-DD)",
        weekStart: "string",
        weekEnd: "string",
        generatedAt: "ISO timestamp",
        version: "string",
        summary: {
          totalNewCapabilities: "number",
          affectedModules: "number",
          suggestedFeatures: "number",
          architectureChanges: "number",
          totalEstimatedEffort: "number (hours)",
          criticalPriority: "number",
        },
        evolutionEvents: "EvolutionEvent[]",
        moduleImpacts: "ModuleImpact[]",
        suggestedFeatures: "FeatureSuggestion[]",
        architectureChanges: "ArchitectureChange[]",
        recommendations: {
          immediateActions: "string[]",
          nextQuarterFocus: "string[]",
          longTermVision: "string[]",
        },
        riskAssessment: {
          highestRisks: "string[]",
          mitigationStrategies: "string[]",
          dependenciesOnOtherTeams: "string[]",
        },
        effortAllocation: {
          phase1: "number (hours)",
          phase2: "number",
          phase3: "number",
          phase4: "number",
        },
        analytics: {
          criticalityScore: "0-100",
          prioritizedActions: "string[]",
          averageEffortPerItem: "number",
        },
      },
      example: {
        weekStart: "2025-02-17",
        weekEnd: "2025-02-23",
      },
    }, null, 2),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  )
}
