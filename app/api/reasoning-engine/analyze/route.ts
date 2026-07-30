import { NextRequest, NextResponse } from 'next/server';
import ReasoningEngine from '@/lib/insight/reasoning-engine';
import EvidenceAggregator from '@/lib/insight/evidence-aggregator';
import ReasoningFormatter from '@/lib/insight/reasoning-formatter';
import ReasoningModuleBridge from '@/lib/insight/reasoning-module-bridge';
import DecisionQualityTracker from '@/lib/insight/decision-quality-tracker';

/**
 * Reasoning Engine Analysis API
 * Internal-only endpoint for AI reasoning analysis
 * Requires: Bearer token authentication
 */

export async function POST(request: NextRequest) {
  try {
    // Verify developer authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (token !== process.env.EVOLUTION_ENGINE_DEV_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      userId,
      query,
      userContext,
      officialSources,
      historicalContext,
      relatedUpdates,
      platformCapabilities,
      shareWithModules = true,
    } = body;

    // Validate required fields
    if (!query || !userContext) {
      return NextResponse.json(
        { error: 'Missing required fields: query, userContext' },
        { status: 400 }
      );
    }

    // Step 1: Perform core reasoning analysis
    const reasoningResult = await ReasoningEngine.analyze(
      userId,
      query,
      userContext,
      officialSources || [],
      historicalContext || [],
      relatedUpdates || []
    );

    // Step 2: Aggregate evidence
    const evidenceCollection = await EvidenceAggregator.aggregateEvidence(
      query,
      officialSources || [],
      reasoningResult.verifiedKnowledge,
      historicalContext || [],
      relatedUpdates || [],
      platformCapabilities || []
    );

    // Step 3: Synthesize evidence
    const evidenceSynthesis = EvidenceAggregator.synthesizeEvidence(evidenceCollection);

    // Step 4: Format reasoning result
    const formattedReasoning = ReasoningFormatter.formatReasoning(reasoningResult);

    // Step 5: Record decision for quality tracking
    const decisionRecord = DecisionQualityTracker.recordDecision(
      reasoningResult.recommendedPath.alternative.id,
      query,
      reasoningResult.recommendedPath.alternative.title,
      reasoningResult.confidenceScore
    );

    // Step 6: Share with AI modules (if enabled)
    let moduleOutputs = [];
    if (shareWithModules) {
      moduleOutputs = await ReasoningModuleBridge.shareReasoning(
        reasoningResult,
        formattedReasoning,
        query
      );
    }

    // Build response
    const response = {
      success: true,
      requestId: `req-${Date.now()}`,
      timestamp: new Date(),
      reasoning: {
        query,
        userGoals: reasoningResult.userGoals,
        confidenceScore: reasoningResult.confidenceScore,
        riskFactors: reasoningResult.riskFactors,
        limitations: reasoningResult.limitations,
      },
      evidence: {
        totalConfidence: evidenceCollection.totalConfidence,
        officialSourceCount: evidenceCollection.officialEvidence.length,
        verifiedCount: evidenceCollection.verifiedEvidence.length,
        conflictCount: evidenceCollection.conflictingEvidence.length,
        supportingCount: evidenceCollection.supportingEvidence.length,
        synthesis: evidenceSynthesis,
      },
      formatted: {
        sections: {
          officialCount: formattedReasoning.officialInformation.length,
          analysisCount: formattedReasoning.aiAnalysis.length,
          suggestionsCount: formattedReasoning.aiSuggestions.length,
        },
        confidence: formattedReasoning.confidence,
        disclaimers: formattedReasoning.disclaimers,
        markdownAvailable: true,
      },
      recommendation: {
        alternative: reasoningResult.recommendedPath.alternative.title,
        rationale: reasoningResult.recommendedPath.rationale,
        effort: reasoningResult.recommendedPath.alternative.effort,
        timeline: reasoningResult.recommendedPath.alternative.timeToComplete,
        impactScore: reasoningResult.recommendedPath.alternative.impactScore,
        nextSteps: reasoningResult.recommendedPath.nextSteps,
      },
      alternatives: reasoningResult.alternatives.map(a => ({
        id: a.id,
        title: a.title,
        overallScore: a.overallScore,
        effort: a.effort,
      })),
      modules: {
        shared: shareWithModules,
        recipients: moduleOutputs.map(m => m.moduleName),
        count: moduleOutputs.length,
      },
      decision: {
        decisionId: decisionRecord.id,
        reasoningId: decisionRecord.reasoningId,
        status: 'recorded',
      },
      metrics: {
        engineVersion: reasoningResult.version,
        processingTime: `${Date.now() - new Date(reasoningResult.generatedAt).getTime()}ms`,
        sourcesAnalyzed: officialSources?.length || 0,
        alternativesGenerated: reasoningResult.alternatives.length,
        reasoningStepsCompleted: reasoningResult.reasoningSteps.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[v0] Reasoning API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // API documentation endpoint
  const authHeader = request.headers.get('Authorization');
  const isAuthenticated = authHeader?.startsWith('Bearer ') &&
    authHeader.substring(7) === process.env.EVOLUTION_ENGINE_DEV_TOKEN;

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    endpoint: '/api/reasoning-engine/analyze',
    description: 'Performs multi-step AI reasoning analysis with evidence aggregation and formatting',
    method: 'POST',
    authentication: 'Bearer token (EVOLUTION_ENGINE_DEV_TOKEN)',
    requestBody: {
      userId: 'string (required)',
      query: 'string (required)',
      userContext: {
        experience: 'beginner | intermediate | advanced',
        learningStyle: 'visual | textual | kinesthetic | auditory',
        goals: 'string[]',
        completedTopics: 'string[]',
        interests: 'string[]',
      },
      officialSources: 'object[] (optional)',
      historicalContext: 'string[] (optional)',
      relatedUpdates: 'string[] (optional)',
      platformCapabilities: 'object[] (optional)',
      shareWithModules: 'boolean (default: true)',
    },
    responseFields: {
      reasoning: 'Core reasoning analysis',
      evidence: 'Evidence aggregation results',
      formatted: 'Formatted reasoning with Official/Analysis/Suggestions separation',
      recommendation: 'Recommended path with details',
      alternatives: 'Alternative options considered',
      modules: 'Module sharing results',
      decision: 'Quality tracking record',
      metrics: 'Performance metrics',
    },
    modules: [
      'ai-advisor',
      'compare-engine',
      'timeline-explorer',
      'daily-intelligence',
      'personal-copilot',
    ],
    internalOnly: true,
    developed: '2026',
  });
}
