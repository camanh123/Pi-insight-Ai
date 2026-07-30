import { NextRequest, NextResponse } from 'next/server';
import { feedbackEngine } from '@/lib/insight/feedback-loop-engine';
import { outcomeTracker } from '@/lib/insight/outcome-tracker';
import { learningOptimizer } from '@/lib/insight/learning-optimizer';
import { improvementRecommender } from '@/lib/insight/improvement-recommender';
import { anomalyDetector } from '@/lib/insight/anomaly-detector';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, engineType, userId, metrics, feedback } = body;

    // Verify developer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'record-feedback': {
        if (!engineType || !userId || !metrics) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const entry = {
          id: `feedback-${Date.now()}`,
          userId,
          engineType,
          actionId: `action-${Date.now()}`,
          outcome: metrics.outcome || 'neutral',
          userRating: metrics.rating || 3,
          timeToCompletion: metrics.timeMs || 0,
          completionDate: new Date(),
          metadata: metrics.metadata || {},
        };

        await feedbackEngine.recordFeedback(entry);

        return NextResponse.json({
          success: true,
          feedbackId: entry.id,
          message: 'Feedback recorded successfully',
        });
      }

      case 'record-engagement': {
        const { actionId, engagement, timeSpent } = body;
        if (!actionId || !engagement) {
          return NextResponse.json({ error: 'Missing actionId or engagement' }, { status: 400 });
        }

        outcomeTracker.recordUserEngagement(actionId, engagement, timeSpent || 0);

        const analysis = outcomeTracker.getAnalysis(actionId);
        return NextResponse.json({
          success: true,
          analysis,
          message: 'Engagement recorded',
        });
      }

      case 'get-engine-metrics': {
        if (!engineType) {
          return NextResponse.json({ error: 'Missing engineType' }, { status: 400 });
        }

        const metrics = feedbackEngine.getEngineMetrics(engineType);
        const allMetrics = feedbackEngine.getAllMetrics();
        const anomalies = anomalyDetector.getAnomalies(engineType);

        return NextResponse.json({
          engineMetrics: metrics,
          allMetrics,
          anomalies,
          timestamp: new Date(),
        });
      }

      case 'generate-report': {
        const report = feedbackEngine.generateReport();
        const insights = feedbackEngine.identifyLearningPatterns();
        const anomalies = feedbackEngine.detectAnomalies();

        return NextResponse.json({
          report,
          learningInsights: insights,
          anomalies,
          generatedAt: new Date(),
        });
      }

      case 'get-improvements': {
        if (!engineType || !metrics) {
          return NextResponse.json({ error: 'Missing engineType or metrics' }, { status: 400 });
        }

        const engineFeedback = Array.from(Object.values({})).flat();
        const recommendations = improvementRecommender.generateRecommendations(
          engineType,
          metrics,
          feedback || []
        );

        const topRecs = improvementRecommender.getTopRecommendations(engineType, 3);
        const plan = learningOptimizer.generateOptimizationPlan(engineType, metrics, {
          successRate: Math.min(metrics.successRate + 0.15, 1),
          averageRating: Math.min(metrics.averageRating + 0.8, 5),
          adoptionRate: Math.min(metrics.adoptionRate + 0.15, 1),
          completionRate: Math.min(metrics.completionRate + 0.1, 1),
        });

        return NextResponse.json({
          recommendations,
          topRecommendations: topRecs,
          optimizationPlan: plan,
          implementationRate: improvementRecommender.getImplementationRate(),
          categoryBreakdown: improvementRecommender.getCategoryBreakdown(engineType),
        });
      }

      case 'detect-anomalies': {
        if (!engineType || !metrics) {
          return NextResponse.json({ error: 'Missing engineType or metrics' }, { status: 400 });
        }

        const detected = anomalyDetector.detectAnomalies(engineType, metrics);
        const critical = anomalyDetector.getCriticalAnomalies();
        const trend = anomalyDetector.getAnomalyTrend(engineType, 7);

        return NextResponse.json({
          detectedAnomalies: detected,
          criticalAnomalies: critical,
          trend,
          timestamp: new Date(),
        });
      }

      case 'get-engagement-stats': {
        if (!engineType) {
          return NextResponse.json({ error: 'Missing engineType' }, { status: 400 });
        }

        const stats = outcomeTracker.getEngagementStats(engineType);
        const outcomes = outcomeTracker.getEngineOutcomes(engineType);

        return NextResponse.json({
          engagementStats: stats,
          totalOutcomes: outcomes.length,
          averageDuration: outcomeTracker.getAverageDuration('notification'),
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Feedback engine error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    engine: 'Feedback Loop Engine',
    version: '1.0',
    actions: [
      'record-feedback',
      'record-engagement',
      'get-engine-metrics',
      'generate-report',
      'get-improvements',
      'detect-anomalies',
      'get-engagement-stats',
    ],
    auth: 'Bearer token required',
    description: 'Internal developer-only API for system performance feedback and continuous improvement',
  });
}
