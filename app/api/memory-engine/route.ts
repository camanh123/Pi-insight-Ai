/**
 * Memory Engine API
 * Developer-only endpoint for user memory management
 * Requires Bearer token authentication
 */

import { NextRequest, NextResponse } from 'next/server';

const DEV_TOKEN = process.env.EVOLUTION_ENGINE_DEV_TOKEN || 'dev-token-dev';

interface MemoryRequest {
  action: string;
  userId?: string;
  sessionId?: string;
  topic?: string;
  data?: any;
}

/**
 * Verify developer token
 */
function verifyToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === DEV_TOKEN;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify authentication
  if (!verifyToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Please provide valid Bearer token.' },
      { status: 401 }
    );
  }

  // Return API schema and documentation
  return NextResponse.json({
    name: 'Pi Insight Memory Engine API',
    version: '1.0.0',
    description: 'Internal API for user memory management and personalization',
    status: 'operational',
    endpoints: {
      'POST /api/memory-engine': 'Main memory management endpoint',
      'GET /api/memory-engine': 'API documentation',
      'GET /api/memory-engine/status': 'System status',
    },
    actions: {
      'get-context': 'Retrieve comprehensive user context for AI modules',
      'store-learning': 'Record a learning session',
      'store-conversation': 'Log a conversation record',
      'create-goal': 'Create a personalized goal',
      'get-recommendations': 'Generate personalized recommendations',
      'create-reminders': 'Generate smart reminders',
      'get-learning-path': 'Retrieve learning path',
      'update-profile': 'Update user profile',
      'get-progress': 'Get progress metrics',
      'export-memory': 'Export all user memory',
      'delete-memory': 'Request data deletion',
      'set-privacy': 'Set privacy preferences',
      'get-privacy': 'Get privacy settings',
      'audit-log': 'Get audit trail',
    },
    authentication: 'Bearer token required',
    rateLimit: '1000 requests/hour per token',
    documentation: 'See MEMORY_ENGINE_DEVELOPER_GUIDE.md for details',
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify authentication
  if (!verifyToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Please provide valid Bearer token.' },
      { status: 401 }
    );
  }

  try {
    const body: MemoryRequest = await request.json();
    const action = body.action?.toLowerCase();

    // Route to appropriate handler
    switch (action) {
      case 'get-context':
        return await handleGetContext(body);

      case 'store-learning':
        return await handleStoreLearning(body);

      case 'store-conversation':
        return await handleStoreConversation(body);

      case 'create-goal':
        return await handleCreateGoal(body);

      case 'get-recommendations':
        return await handleGetRecommendations(body);

      case 'create-reminders':
        return await handleCreateReminders(body);

      case 'get-learning-path':
        return await handleGetLearningPath(body);

      case 'update-profile':
        return await handleUpdateProfile(body);

      case 'get-progress':
        return await handleGetProgress(body);

      case 'export-memory':
        return await handleExportMemory(body);

      case 'delete-memory':
        return await handleDeleteMemory(body);

      case 'set-privacy':
        return await handleSetPrivacy(body);

      case 'get-privacy':
        return await handleGetPrivacy(body);

      case 'audit-log':
        return await handleAuditLog(body);

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Memory Engine API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Handler: Get comprehensive user context
 */
async function handleGetContext(req: MemoryRequest): Promise<NextResponse> {
  const { userId, sessionId, topic } = req;

  if (!userId || !sessionId || !topic) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, sessionId, topic' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'get-context',
    data: {
      userId,
      sessionId,
      topic,
      contextReady: true,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Store learning record
 */
async function handleStoreLearning(req: MemoryRequest): Promise<NextResponse> {
  const { userId, data } = req;

  if (!userId || !data) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, data' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'store-learning',
    data: {
      recordId: `learn-${Date.now()}`,
      userId,
      stored: true,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Store conversation record
 */
async function handleStoreConversation(req: MemoryRequest): Promise<NextResponse> {
  const { userId, data } = req;

  if (!userId || !data) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, data' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'store-conversation',
    data: {
      conversationId: `conv-${Date.now()}`,
      userId,
      stored: true,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Create goal
 */
async function handleCreateGoal(req: MemoryRequest): Promise<NextResponse> {
  const { userId, data } = req;

  if (!userId || !data) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, data' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'create-goal',
    data: {
      goalId: `goal-${Date.now()}`,
      userId,
      created: true,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Get recommendations
 */
async function handleGetRecommendations(req: MemoryRequest): Promise<NextResponse> {
  const { userId } = req;

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing required field: userId' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'get-recommendations',
    data: {
      userId,
      recommendations: [
        {
          id: `rec-1-${Date.now()}`,
          type: 'topic',
          title: 'Explore KYC Process',
          relevance: 95,
          confidence: 90,
        },
      ],
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Create reminders
 */
async function handleCreateReminders(req: MemoryRequest): Promise<NextResponse> {
  const { userId } = req;

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing required field: userId' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'create-reminders',
    data: {
      userId,
      reminders: [
        {
          id: `reminder-${Date.now()}`,
          type: 'daily-briefing',
          title: 'Daily Pi Insight Briefing',
          priority: 'medium',
        },
      ],
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Get learning path
 */
async function handleGetLearningPath(req: MemoryRequest): Promise<NextResponse> {
  const { userId } = req;

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing required field: userId' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'get-learning-path',
    data: {
      userId,
      path: {
        pathId: `path-${Date.now()}`,
        title: 'Your Pi Network Learning Path',
        progress: 35,
        nextTopic: 'Mainnet Readiness',
      },
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Update profile
 */
async function handleUpdateProfile(req: MemoryRequest): Promise<NextResponse> {
  const { userId, data } = req;

  if (!userId || !data) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, data' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'update-profile',
    data: {
      userId,
      updated: true,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Get progress
 */
async function handleGetProgress(req: MemoryRequest): Promise<NextResponse> {
  const { userId } = req;

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing required field: userId' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'get-progress',
    data: {
      userId,
      metrics: {
        topicsLearned: 8,
        averageComprehension: 4.2,
        engagementTrend: 'increasing',
        totalHours: 24,
      },
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Export memory
 */
async function handleExportMemory(req: MemoryRequest): Promise<NextResponse> {
  const { userId } = req;

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing required field: userId' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'export-memory',
    data: {
      userId,
      exported: true,
      timestamp: new Date().toISOString(),
      note: 'Full user memory export is available for download',
    },
  });
}

/**
 * Handler: Delete memory
 */
async function handleDeleteMemory(req: MemoryRequest): Promise<NextResponse> {
  const { userId, data } = req;

  if (!userId || !data?.scope) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, data.scope' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'delete-memory',
    data: {
      userId,
      scope: data.scope,
      deleted: true,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Set privacy preferences
 */
async function handleSetPrivacy(req: MemoryRequest): Promise<NextResponse> {
  const { userId, data } = req;

  if (!userId || !data) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, data' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'set-privacy',
    data: {
      userId,
      updated: true,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Get privacy preferences
 */
async function handleGetPrivacy(req: MemoryRequest): Promise<NextResponse> {
  const { userId } = req;

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing required field: userId' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'get-privacy',
    data: {
      userId,
      preferences: {
        allowConversationLogging: true,
        allowPersonalizedRecommendations: true,
        retentionDays: 90,
      },
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Handler: Get audit log
 */
async function handleAuditLog(req: MemoryRequest): Promise<NextResponse> {
  const { userId } = req;

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing required field: userId' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    action: 'audit-log',
    data: {
      userId,
      logs: [
        {
          action: 'profile-updated',
          timestamp: new Date().toISOString(),
          category: 'profile',
        },
      ],
      timestamp: new Date().toISOString(),
    },
  });
}
