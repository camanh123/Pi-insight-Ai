/**
 * Platform Capability Engine API
 * Analyze capabilities, detect changes, and identify integration opportunities
 * Internal developer-only endpoint - requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCapabilities,
  getCapabilitiesByCategory,
  getNewCapabilities,
  getDeprecatedCapabilities,
  searchCapabilities,
  getCapabilityStats
} from '@/lib/insight/capability-database';
import {
  generateDetectionReport,
  compareCapabilitiesSinceDate,
  saveCapabilitySnapshot,
  predictUpcomingChanges,
  getImpactSummary
} from '@/lib/insight/capability-detector';
import {
  findAllOpportunities,
  findOpportunitiesForCapability,
  generateModuleReport,
  getAllModuleMappings,
  PI_INSIGHT_MODULES
} from '@/lib/insight/module-capability-mapper';

// Simple developer authentication (in production, use proper OAuth/JWT)
const verifyDevAccess = (req: NextRequest): boolean => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const devToken = process.env.EVOLUTION_ENGINE_DEV_TOKEN || 'dev-token-change-in-production';
  return token === devToken;
};

export async function GET(req: NextRequest) {
  if (!verifyDevAccess(req)) {
    return NextResponse.json(
      { error: 'Unauthorized - Developer token required' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'all':
        return handleGetAllCapabilities();

      case 'stats':
        return handleGetStats();

      case 'category': {
        const category = searchParams.get('category');
        if (!category) {
          return NextResponse.json({ error: 'Missing category parameter' }, { status: 400 });
        }
        return handleGetByCategory(category as any);
      }

      case 'new': {
        const sinceDate = searchParams.get('sinceDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        return handleGetNewCapabilities(sinceDate);
      }

      case 'deprecated':
        return handleGetDeprecated();

      case 'search': {
        const query = searchParams.get('query');
        if (!query) {
          return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
        }
        return handleSearch(query);
      }

      case 'opportunities':
        return handleGetOpportunities();

      case 'module-opportunities': {
        const moduleId = searchParams.get('moduleId');
        if (!moduleId) {
          return NextResponse.json({ error: 'Missing moduleId parameter' }, { status: 400 });
        }
        return handleGetModuleOpportunities(moduleId);
      }

      case 'detection-report': {
        const startDate = searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = searchParams.get('endDate') || new Date().toISOString();
        return handleDetectionReport(startDate, endDate);
      }

      case 'comparison': {
        const sinceDate = searchParams.get('sinceDate') || '2024-01-01';
        return handleComparison(sinceDate);
      }

      case 'modules':
        return handleGetModules();

      case 'module-report': {
        const moduleId = searchParams.get('moduleId');
        if (!moduleId) {
          return NextResponse.json({ error: 'Missing moduleId parameter' }, { status: 400 });
        }
        return handleModuleReport(moduleId);
      }

      default:
        return handleSchema();
    }
  } catch (error) {
    console.error('Capability Engine Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!verifyDevAccess(req)) {
    return NextResponse.json(
      { error: 'Unauthorized - Developer token required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const action = body.action;

    switch (action) {
      case 'save-snapshot':
        return handleSaveSnapshot();

      case 'analyze-module':
        return handleAnalyzeModule(body.moduleId);

      default:
        return NextResponse.json(
          { error: 'Unknown action', availableActions: ['save-snapshot', 'analyze-module'] },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Capability Engine Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler functions
const handleGetAllCapabilities = () => {
  const capabilities = getAllCapabilities();
  return NextResponse.json({
    status: 'success',
    count: capabilities.length,
    data: capabilities
  });
};

const handleGetStats = () => {
  const stats = getCapabilityStats();
  return NextResponse.json({
    status: 'success',
    data: stats
  });
};

const handleGetByCategory = (category: string) => {
  const capabilities = getCapabilitiesByCategory(category as any);
  return NextResponse.json({
    status: 'success',
    category,
    count: capabilities.length,
    data: capabilities
  });
};

const handleGetNewCapabilities = (sinceDate: string) => {
  const capabilities = getNewCapabilities(sinceDate);
  return NextResponse.json({
    status: 'success',
    sinceDate,
    count: capabilities.length,
    data: capabilities
  });
};

const handleGetDeprecated = () => {
  const capabilities = getDeprecatedCapabilities();
  return NextResponse.json({
    status: 'success',
    count: capabilities.length,
    data: capabilities
  });
};

const handleSearch = (query: string) => {
  const results = searchCapabilities(query);
  return NextResponse.json({
    status: 'success',
    query,
    count: results.length,
    data: results
  });
};

const handleGetOpportunities = () => {
  const opportunities = findAllOpportunities();
  return NextResponse.json({
    status: 'success',
    count: opportunities.length,
    topOpportunities: opportunities.slice(0, 10),
    allCount: opportunities.length,
    averagePriority: opportunities.reduce((sum, o) => sum + o.priority, 0) / opportunities.length,
    data: opportunities
  });
};

const handleGetModuleOpportunities = (moduleId: string) => {
  const opportunities = findOpportunitiesForCapability(moduleId);
  return NextResponse.json({
    status: 'success',
    moduleId,
    count: opportunities.length,
    data: opportunities
  });
};

const handleDetectionReport = (startDate: string, endDate: string) => {
  const report = generateDetectionReport(startDate, endDate);
  const predictions = predictUpcomingChanges();

  return NextResponse.json({
    status: 'success',
    data: {
      ...report,
      predictions
    }
  });
};

const handleComparison = (sinceDate: string) => {
  const result = compareCapabilitiesSinceDate(sinceDate);
  return NextResponse.json({
    status: 'success',
    sinceDate,
    data: result
  });
};

const handleGetModules = () => {
  const modules = Object.values(PI_INSIGHT_MODULES);
  return NextResponse.json({
    status: 'success',
    count: modules.length,
    data: modules
  });
};

const handleModuleReport = (moduleId: string) => {
  const report = generateModuleReport(moduleId);
  if (!report) {
    return NextResponse.json(
      { error: 'Module not found', moduleId },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: 'success',
    data: report
  });
};

const handleSaveSnapshot = () => {
  const snapshot = saveCapabilitySnapshot();
  return NextResponse.json({
    status: 'success',
    message: 'Capability snapshot saved',
    data: snapshot
  });
};

const handleAnalyzeModule = (moduleId: string) => {
  const mappings = getAllModuleMappings();
  const moduleMapping = mappings.find(m => m.moduleId === moduleId);

  if (!moduleMapping) {
    return NextResponse.json(
      { error: 'Module not found', moduleId },
      { status: 404 }
    );
  }

  const opportunities = findOpportunitiesForCapability(moduleId);
  const report = generateModuleReport(moduleId);

  return NextResponse.json({
    status: 'success',
    data: {
      module: PI_INSIGHT_MODULES[moduleId],
      mapping: moduleMapping,
      opportunities,
      report
    }
  });
};

// Schema endpoint
const handleSchema = () => {
  return NextResponse.json({
    status: 'success',
    message: 'Platform Capability Engine - Developer API',
    authentication: 'Bearer token in Authorization header',
    endpoints: {
      GET: {
        'all': 'Get all capabilities',
        'stats': 'Get capability statistics',
        'category?category=NAME': 'Get capabilities by category',
        'new?sinceDate=ISO_DATE': 'Get new capabilities since date',
        'deprecated': 'Get deprecated capabilities',
        'search?query=TEXT': 'Search capabilities',
        'opportunities': 'Get all integration opportunities',
        'module-opportunities?moduleId=ID': 'Get opportunities for module',
        'detection-report?startDate=DATE&endDate=DATE': 'Generate detection report',
        'comparison?sinceDate=DATE': 'Compare capabilities since date',
        'modules': 'Get all Pi Insight modules',
        'module-report?moduleId=ID': 'Get module integration report'
      },
      POST: {
        'save-snapshot': 'Save current capability snapshot',
        'analyze-module': 'Analyze module (requires moduleId in body)'
      }
    }
  });
};
