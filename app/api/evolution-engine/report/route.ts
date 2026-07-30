// Evolution Engine Report API - Internal Only
// Generates weekly platform evolution reports for developers
// Requires authentication - NOT exposed to end users

import { NextRequest, NextResponse } from 'next/server'
import { monitorPlatformUpdates, calculateMonitoringMetrics, filterChangesBySeverity, getRecentChanges, identifyAffectedModules } from '@/lib/insight/platform-monitor'
import { analyzeImpact, generateExecutiveSummary, type EvolutionReport, type ImplementationRecommendation } from '@/lib/insight/impact-analyzer'
import { validateDeveloperToken, hasPermission, extractAuthToken, EvolutionAuthError, createDevAccessLog } from '@/lib/insight/evolution-auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate developer authentication
    const authHeader = request.headers.get('authorization')
    const token = extractAuthToken(authHeader)
    const credentials = validateDeveloperToken(token || '')

    if (!credentials) {
      createDevAccessLog(token || 'none', 'unauthorized_access', {
        endpoint: '/api/evolution-engine/report',
        method: 'GET'
      })
      throw new EvolutionAuthError('Unauthorized: Invalid or missing developer token', 401)
    }

    if (!hasPermission(credentials, 'view-reports')) {
      throw new EvolutionAuthError('Forbidden: Insufficient permissions', 403)
    }

    // Get schema information
    createDevAccessLog(token || '', 'schema_request', { team: credentials.teamName })

    return NextResponse.json({
      schema: {
        endpoint: '/api/evolution-engine/report',
        methods: ['GET', 'POST'],
        authentication: 'Bearer token required',
        permissions_required: ['view-reports'],
        response_format: 'EvolutionReport',
        examples: {
          generate: {
            method: 'POST',
            url: '/api/evolution-engine/report',
            headers: { 'Authorization': 'Bearer YOUR_DEV_TOKEN' },
            body: {
              weekStart: '2025-02-17',
              weekEnd: '2025-02-23',
              minSeverity: 'medium',
              includeRiskAssessment: true
            }
          }
        }
      }
    })
  } catch (error) {
    if (error instanceof EvolutionAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate developer authentication
    const authHeader = request.headers.get('authorization')
    const token = extractAuthToken(authHeader)
    const credentials = validateDeveloperToken(token || '')

    if (!credentials) {
      throw new EvolutionAuthError('Unauthorized: Invalid or missing developer token', 401)
    }

    if (!hasPermission(credentials, 'generate-reports')) {
      throw new EvolutionAuthError('Forbidden: Missing generate-reports permission', 403)
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { weekStart, weekEnd, minSeverity = 'low', includeRiskAssessment = true } = body

    createDevAccessLog(token || '', 'report_generation', {
      team: credentials.teamName,
      weekStart,
      weekEnd,
      minSeverity
    })

    // Validate date range
    const start = weekStart ? new Date(weekStart) : getWeekStart(new Date())
    const end = weekEnd ? new Date(weekEnd) : getWeekEnd(start)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD')
    }

    // Monitor platform updates
    const feeds = await monitorPlatformUpdates()
    const allChanges = feeds.flatMap(f => f.updates)

    // Filter by date range and severity
    const recentChanges = getRecentChanges(allChanges, Math.ceil((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    const filteredChanges = filterChangesBySeverity(recentChanges, minSeverity as any)

    // Analyze impacts
    const recommendations = analyzeImpact(filteredChanges)

    // Calculate metrics
    const metrics = calculateMonitoringMetrics(feeds)
    const affectedModules = identifyAffectedModules(filteredChanges)

    // Build risk assessment
    const moduleRiskAssessment = includeRiskAssessment ? buildRiskAssessment(recommendations) : {}

    // Calculate resource allocation by phase
    const resourceAllocation = calculateResourceAllocation(recommendations)

    // Identify architecture changes
    const architectureChanges = identifyArchitectureChanges(recommendations)

    // Generate predictions for next week
    const predictions = generatePredictions(filteredChanges)

    // Generate report
    const report: EvolutionReport = {
      reportId: generateReportId(),
      generatedAt: new Date(),
      weekStart: start,
      weekEnd: end,
      totalChanges: filteredChanges.length,
      criticalChanges: filteredChanges.filter(c => c.severity === 'critical').length,
      recommendations,
      moduleRiskAssessment,
      resourceAllocation,
      architectureChanges,
      newFeatureOpportunities: extractNewFeatures(recommendations),
      technicalDebt: identifyTechnicalDebt(recommendations),
      nextWeekPredictions: predictions,
      executiveSummary: generateExecutiveSummary(recommendations)
    }

    // Log successful generation
    createDevAccessLog(token || '', 'report_generated', {
      team: credentials.teamName,
      reportId: report.reportId,
      totalChanges: report.totalChanges,
      criticalChanges: report.criticalChanges,
      recommendations: report.recommendations.length
    })

    // Add rate limiting info to response headers
    const response = NextResponse.json(report, { status: 200 })
    response.headers.set('X-Report-ID', report.reportId)
    response.headers.set('X-Generated-By', credentials.teamName)
    response.headers.set('Cache-Control', 'no-store, private')

    return response
  } catch (error) {
    if (error instanceof EvolutionAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[EVOLUTION_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Report generation failed' },
      { status: 500 }
    )
  }
}

// Helper functions

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function getWeekEnd(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + 6)
  return d
}

function generateReportId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return `evo-${timestamp}-${random}`.toUpperCase()
}

function buildRiskAssessment(recommendations: ImplementationRecommendation[]): Record<string, { riskLevel: string; vulnerabilities: string[] }> {
  const assessment: Record<string, { riskLevel: string; vulnerabilities: string[] }> = {}

  recommendations.forEach(rec => {
    if (!assessment[rec.affectedModule]) {
      assessment[rec.affectedModule] = {
        riskLevel: rec.priority === 'p0-critical' ? 'critical' : rec.priority === 'p1-high' ? 'high' : 'medium',
        vulnerabilities: rec.riskFactors
      }
    } else {
      const current = assessment[rec.affectedModule]
      const priorities = { 'p0-critical': 3, 'p1-high': 2, 'p2-medium': 1, 'p3-low': 0 }
      const recPriority = { 'p0-critical': 3, 'p1-high': 2, 'p2-medium': 1, 'p3-low': 0 }
      
      if (recPriority[rec.priority] > priorities[current.riskLevel as any]) {
        current.riskLevel = rec.priority === 'p0-critical' ? 'critical' : rec.priority === 'p1-high' ? 'high' : 'medium'
      }
      current.vulnerabilities.push(...rec.riskFactors)
    }
  })

  return assessment
}

function calculateResourceAllocation(recommendations: ImplementationRecommendation[]): Record<'q1' | 'q2' | 'q3' | 'q4', number> {
  const allocation = { q1: 0, q2: 0, q3: 0, q4: 0 }

  recommendations.forEach(rec => {
    allocation[rec.phaseAllocation] += rec.estimatedHours
  })

  return allocation
}

function identifyArchitectureChanges(recommendations: ImplementationRecommendation[]): string[] {
  const changes: string[] = []

  recommendations
    .filter(r => r.priority === 'p0-critical' || r.priority === 'p1-high')
    .forEach(rec => {
      if (rec.title.toLowerCase().includes('breaking')) {
        changes.push(`${rec.affectedModule}: Refactoring required - ${rec.title}`)
      }
      if (rec.title.toLowerCase().includes('multi-chain') || rec.title.toLowerCase().includes('architecture')) {
        changes.push(`${rec.affectedModule}: Architecture review needed - ${rec.title}`)
      }
    })

  return changes.length > 0 ? changes : []
}

function extractNewFeatures(recommendations: ImplementationRecommendation[]): string[] {
  const features: string[] = []

  recommendations
    .filter(r => r.recommendedAction === 'adopt')
    .forEach(rec => {
      features.push(...rec.newCapabilities)
      features.push(...rec.suggestedFeatures)
    })

  return [...new Set(features)].slice(0, 20)
}

function identifyTechnicalDebt(recommendations: ImplementationRecommendation[]): string[] {
  const debt: string[] = []

  recommendations
    .filter(r => r.priority === 'p3-low' || r.recommendedAction === 'defer')
    .forEach(rec => {
      debt.push(`${rec.affectedModule}: ${rec.title}`)
    })

  return debt
}

function generatePredictions(changes: any[]): string[] {
  const predictions: string[] = []

  const criticalCount = changes.filter(c => c.severity === 'critical').length
  if (criticalCount > 0) {
    predictions.push(`${criticalCount} critical changes expected next week - prepare team for rapid implementation`)
  }

  const securityCount = changes.filter(c => c.category === 'security').length
  if (securityCount > 0) {
    predictions.push(`Security updates likely next week - schedule security audit and testing`)
  }

  const featureCount = changes.filter(c => c.category === 'feature').length
  if (featureCount > 2) {
    predictions.push(`High feature velocity expected - prioritize backlog grooming for feature integration`)
  }

  if (predictions.length === 0) {
    predictions.push(`Expect continued evolution at current pace - maintain current monitoring and planning cadence`)
  }

  return predictions
}
