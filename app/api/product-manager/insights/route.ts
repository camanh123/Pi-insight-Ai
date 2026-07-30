import { NextRequest, NextResponse } from 'next/server';
import { ProductManagerOrchestrator } from '@/lib/insight/pm-orchestrator';

// Developer-only API for product insights
const DEV_TOKEN = process.env.EVOLUTION_ENGINE_DEV_TOKEN;

function validateAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  return token === DEV_TOKEN && !!DEV_TOKEN;
}

export async function POST(request: NextRequest) {
  // Validate developer authentication
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      userProfiles = [],
      behaviorData = [],
      feedback = [],
      platformUpdates = []
    } = body;

    const pm = new ProductManagerOrchestrator();
    const insights = await pm.generateProductInsights(
      userProfiles,
      behaviorData,
      feedback,
      platformUpdates
    );

    return NextResponse.json({
      success: true,
      insights,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate insights',
        status: 'error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Validate developer authentication
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    api: 'Product Manager Insights API',
    version: '1.0.0',
    endpoints: {
      POST: {
        path: '/api/product-manager/insights',
        description: 'Generate comprehensive product insights',
        requestBody: {
          userProfiles: 'Array of user profile objects',
          behaviorData: 'Array of user behavior records',
          feedback: 'Array of user feedback',
          platformUpdates: 'Array of Pi platform updates',
        },
        response: {
          insights: {
            behaviorAnalysis: 'User behavior metrics',
            prioritizedFeatures: 'Feature prioritization results',
            painPoints: 'User pain point analysis',
            adoptionPredictions: 'Feature adoption forecasts',
            roadmap: 'Product roadmap phases',
            metrics: 'Product health metrics',
            recommendations: 'Strategic recommendations',
            nextActions: 'Immediate action items',
          },
        },
      },
    },
    authentication: 'Bearer token required in Authorization header',
    internalOnly: 'This API is for developers only - not exposed to end users',
  });
}
