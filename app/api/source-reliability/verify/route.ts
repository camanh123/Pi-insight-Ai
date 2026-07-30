/**
 * Source Reliability Verification API
 * Internal endpoint for verifying and formatting AI responses
 * Developers only - not exposed to end users
 */

import { NextRequest, NextResponse } from 'next/server';
import { verificationEngine } from '@/lib/insight/verification-engine';
import { responseFormatter } from '@/lib/insight/response-formatter';
import { conflictDetector } from '@/lib/insight/conflict-detector';
import { InformationRecord, createVerifiedRecord } from '@/lib/insight/source-classifier';

// Middleware: Verify developer token
function validateDeveloperToken(request: NextRequest): boolean {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const devToken = process.env.EVOLUTION_ENGINE_DEV_TOKEN;

  if (!devToken || !token) {
    return false;
  }

  return token === devToken;
}

/**
 * POST /api/source-reliability/verify
 * Verify and format a response with source reliability checks
 */
export async function POST(request: NextRequest) {
  // Check authentication
  if (!validateDeveloperToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing developer token' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { records, includeMarkdown = true } = body;

    if (!Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Invalid request: records must be an array' },
        { status: 400 }
      );
    }

    // Verify all records
    const verificationResults = verificationEngine.verifyBatch(records);

    // Format response
    const formattedResponse = responseFormatter.formatResponse(records);

    // Detect conflicts
    for (const record of records) {
      conflictDetector.registerRecord(record);
    }
    const conflictReport = conflictDetector.generateConflictReport();

    // Generate markdown if requested
    let markdown: string | undefined;
    if (includeMarkdown) {
      markdown = responseFormatter.exportAsMarkdown(formattedResponse);
    }

    return NextResponse.json(
      {
        success: true,
        verification: {
          results: verificationResults,
          report: verificationEngine.getVerificationReport(),
        },
        formattedResponse,
        conflicts: {
          total: conflictReport.conflictCount,
          critical: conflictReport.criticalConflicts,
          byTopic: Object.fromEntries(conflictReport.conflictsByTopic),
        },
        markdown,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Source Reliability API Error]', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/source-reliability/verify
 * Get API schema and documentation
 */
export async function GET(request: NextRequest) {
  // Check authentication
  if (!validateDeveloperToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing developer token' },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      service: 'Source Reliability Verification Engine',
      version: '1.0.0',
      description: 'Internal API for verifying AI responses against source reliability standards',
      endpoints: {
        POST: {
          path: '/api/source-reliability/verify',
          description: 'Verify and format an AI response',
          parameters: {
            records: {
              type: 'array',
              description: 'Array of InformationRecord objects to verify',
              required: true,
            },
            includeMarkdown: {
              type: 'boolean',
              description: 'Include markdown export of formatted response',
              required: false,
              default: true,
            },
          },
          response: {
            verification: 'Verification results for each record',
            formattedResponse: 'Formatted response with source attribution',
            conflicts: 'Detected conflicts and inconsistencies',
            markdown: 'Markdown export if requested',
          },
        },
        GET: {
          path: '/api/source-reliability/verify',
          description: 'Get API schema and documentation',
        },
      },
      recordSchema: {
        id: 'Unique identifier',
        content: 'Information content',
        topic: 'Topic category',
        sources: 'Array of Source objects',
        reliabilityLevel: 'verified | likely_accurate | uncertain | conflicted | unverified',
        overallReliabilityScore: 'Number 0-100',
        hasConflicts: 'Boolean',
        lastUpdated: 'ISO date string',
        verificationStatus: 'verified | needs_review | disputed',
      },
      sourceSchema: {
        id: 'Source identifier',
        type: 'official_core | official_docs | official_app_studio | community | ai_analysis',
        name: 'Source name',
        tier: 'primary | secondary | tertiary | unverified',
        url: 'Source URL (optional)',
        reliabilityScore: 'Number 0-100',
        confidence: 'Number 0-100',
        verificationMethod: 'How source was verified',
      },
      features: [
        'Source classification by type (Official, Community, AI Analysis)',
        'Reliability scoring (0-100 scale)',
        'Conflict detection and analysis',
        'Automated verification checks',
        'Clear labeling of information types',
        'Confidence indicators for all claims',
        'Prevention of unofficial content as official',
        'Markdown export for documentation',
      ],
      authentication: 'Bearer token in Authorization header',
      rateLimit: '100 requests per hour per token',
      dataRetention: 'Verification logs retained for 30 days',
    },
    { status: 200 }
  );
}
