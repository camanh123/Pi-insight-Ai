// Platform Monitor Service - Internal Developer Tool
// Tracks official Pi Platform updates from all sources
// Never exposed to end users

import type { EvolutionUpdate, PlatformSource } from './evolution-engine'

export interface MonitoredPlatformChange {
  id: string
  source: PlatformSource
  category: 'feature' | 'breaking' | 'deprecation' | 'bugfix' | 'performance' | 'security'
  title: string
  description: string
  affectedComponents: string[]
  severity: 'critical' | 'high' | 'medium' | 'low'
  detectedAt: Date
  officialUrl?: string
  version?: string
}

export interface SourceFeed {
  source: PlatformSource
  lastChecked: Date
  updates: MonitoredPlatformChange[]
  healthy: boolean
  errorMessage?: string
}

export interface MonitoringMetrics {
  totalChanges: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
  averageProcessingTime: number
  lastFullScan: Date
  sourceHealth: Record<PlatformSource, boolean>
}

// Mock data for demonstration - replace with real API calls
const MOCK_PLATFORM_UPDATES: Record<PlatformSource, MonitoredPlatformChange[]> = {
  'app-studio': [
    {
      id: 'as-001',
      source: 'app-studio',
      category: 'feature',
      title: 'Enhanced App Marketplace Filtering',
      description: 'New AI-powered recommendation system for App Studio marketplace. Categorizes apps by engagement metrics, user rating patterns, and ecosystem fit.',
      affectedComponents: ['marketplace', 'search', 'recommendations', 'ai-advisor'],
      severity: 'high',
      detectedAt: new Date('2025-02-17'),
      version: '4.2.0',
      officialUrl: 'https://pi.app-studio/releases/4.2.0'
    },
    {
      id: 'as-002',
      source: 'app-studio',
      category: 'performance',
      title: 'Improved App Load Times via Progressive Rendering',
      description: 'App Studio now supports progressive rendering, reducing time-to-interactive by 40%. Apps load UI immediately with data streaming.',
      affectedComponents: ['performance', 'ui-rendering', 'api-patterns'],
      severity: 'medium',
      detectedAt: new Date('2025-02-16'),
      version: '4.1.9'
    }
  ],
  'pi-sdk': [
    {
      id: 'sdk-001',
      source: 'pi-sdk',
      category: 'feature',
      title: 'Multi-Chain Payment Support',
      description: 'Pi SDK now supports payments on Testnet and Mainnet chains separately. Enables testing in isolation before production deployment.',
      affectedComponents: ['payments', 'wallet-integration', 'transaction-handling'],
      severity: 'critical',
      detectedAt: new Date('2025-02-18'),
      version: '2.15.0',
      officialUrl: 'https://sdk.pi-network.dev/releases/2.15.0'
    },
    {
      id: 'sdk-002',
      source: 'pi-sdk',
      category: 'security',
      title: 'Session Token Rotation Security Enhancement',
      description: 'SDK now automatically rotates session tokens every 24 hours. Reduces security window for token compromise attacks.',
      affectedComponents: ['auth', 'session-management', 'security'],
      severity: 'high',
      detectedAt: new Date('2025-02-15'),
      version: '2.14.8'
    }
  ],
  'pi-browser': [
    {
      id: 'pb-001',
      source: 'pi-browser',
      category: 'feature',
      title: 'Push Notification Integration for Dapps',
      description: 'Pi Browser now supports push notifications for dapp events. Enables real-time user engagement without requiring separate email/SMS.',
      affectedComponents: ['notifications', 'user-engagement', 'dashboard'],
      severity: 'medium',
      detectedAt: new Date('2025-02-17'),
      version: '3.8.0'
    }
  ],
  'wallet': [
    {
      id: 'wallet-001',
      source: 'wallet',
      category: 'feature',
      title: 'KYB (Know Your Business) Verification Support',
      description: 'Wallet now supports business account verification alongside individual KYC. Enables B2B transactions and business-focused apps.',
      affectedComponents: ['kyc-system', 'business-accounts', 'verification-ui', 'advisor'],
      severity: 'high',
      detectedAt: new Date('2025-02-18'),
      version: '5.4.0'
    },
    {
      id: 'wallet-002',
      source: 'wallet',
      category: 'bugfix',
      title: 'Fixed High-Frequency Transaction Race Condition',
      description: 'Resolved race condition affecting rapid consecutive transactions. Apps can now safely handle burst payment scenarios.',
      affectedComponents: ['transaction-handling', 'performance'],
      severity: 'high',
      detectedAt: new Date('2025-02-14'),
      version: '5.3.2'
    }
  ],
  'node': [
    {
      id: 'node-001',
      source: 'node',
      category: 'feature',
      title: 'Node Operator Dashboard Improvements',
      description: 'New dashboard metrics for node operators: real-time performance scoring, reward predictions, and infrastructure health alerts.',
      affectedComponents: ['node-content', 'educational-materials', 'advisor'],
      severity: 'medium',
      detectedAt: new Date('2025-02-16'),
      version: '1.12.0'
    }
  ],
  'core-team': [
    {
      id: 'ct-001',
      source: 'core-team',
      category: 'feature',
      title: 'Mainnet Phase 3 Launch Roadmap Published',
      description: 'Core team published detailed Phase 3 roadmap covering ecosystem scaling, developer incentives, and enterprise adoption programs.',
      affectedComponents: ['roadmap-content', 'advisor', 'timeline-evolution', 'knowledge-graph'],
      severity: 'critical',
      detectedAt: new Date('2025-02-18'),
      officialUrl: 'https://pi-network.org/phase3-roadmap'
    },
    {
      id: 'ct-002',
      source: 'core-team',
      category: 'feature',
      title: 'Developer Incentive Program Expansion',
      description: 'Pi Core Team announced expanded developer incentive program: grants, revenue sharing, and early feature access for high-impact apps.',
      affectedComponents: ['knowledge-base', 'advisor', 'business-opportunities'],
      severity: 'high',
      detectedAt: new Date('2025-02-17'),
      officialUrl: 'https://pi-network.org/dev-incentives'
    }
  ]
}

export async function monitorPlatformUpdates(): Promise<SourceFeed[]> {
  const feeds: SourceFeed[] = []
  const sources: PlatformSource[] = ['app-studio', 'pi-sdk', 'pi-browser', 'wallet', 'node', 'core-team']

  for (const source of sources) {
    try {
      // In production, replace with real API calls
      // Example: const updates = await fetchFromPiAPI(source)
      const updates = MOCK_PLATFORM_UPDATES[source] || []

      feeds.push({
        source,
        lastChecked: new Date(),
        updates,
        healthy: true
      })
    } catch (error) {
      feeds.push({
        source,
        lastChecked: new Date(),
        updates: [],
        healthy: false,
        errorMessage: `Failed to fetch ${source} updates: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  return feeds
}

export function calculateMonitoringMetrics(feeds: SourceFeed[]): MonitoringMetrics {
  const allChanges = feeds.flatMap(f => f.updates)
  
  const byCategory: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}

  allChanges.forEach(change => {
    byCategory[change.category] = (byCategory[change.category] || 0) + 1
    bySeverity[change.severity] = (bySeverity[change.severity] || 0) + 1
  })

  const sourceHealth: Record<PlatformSource, boolean> = {}
  feeds.forEach(feed => {
    sourceHealth[feed.source] = feed.healthy
  })

  return {
    totalChanges: allChanges.length,
    byCategory,
    bySeverity,
    averageProcessingTime: 245, // ms
    lastFullScan: new Date(),
    sourceHealth
  }
}

export function filterChangesBySeverity(
  changes: MonitoredPlatformChange[],
  minSeverity: 'critical' | 'high' | 'medium' | 'low'
): MonitoredPlatformChange[] {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return changes.filter(c => severityOrder[c.severity] <= severityOrder[minSeverity])
}

export function getRecentChanges(
  changes: MonitoredPlatformChange[],
  daysBack: number = 7
): MonitoredPlatformChange[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysBack)
  return changes.filter(c => c.detectedAt >= cutoff).sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
}

export function groupChangesBySource(
  changes: MonitoredPlatformChange[]
): Record<PlatformSource, MonitoredPlatformChange[]> {
  const grouped: Record<PlatformSource, MonitoredPlatformChange[]> = {
    'app-studio': [],
    'pi-sdk': [],
    'pi-browser': [],
    'wallet': [],
    'node': [],
    'core-team': []
  }

  changes.forEach(change => {
    if (grouped[change.source]) {
      grouped[change.source].push(change)
    }
  })

  return grouped
}

export function identifyAffectedModules(
  changes: MonitoredPlatformChange[]
): Record<string, { count: number; changes: MonitoredPlatformChange[] }> {
  const affected: Record<string, { count: number; changes: MonitoredPlatformChange[] }> = {}

  changes.forEach(change => {
    change.affectedComponents.forEach(component => {
      if (!affected[component]) {
        affected[component] = { count: 0, changes: [] }
      }
      affected[component].count += 1
      affected[component].changes.push(change)
    })
  })

  return Object.fromEntries(
    Object.entries(affected).sort((a, b) => b[1].count - a[1].count)
  )
}
