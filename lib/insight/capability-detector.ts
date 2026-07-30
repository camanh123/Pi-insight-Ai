/**
 * Capability Detector & Comparator
 * Detects new capabilities, tracks changes, and compares with historical data
 */

import {
  PlatformCapability,
  CapabilityComparisonResult,
  getNewCapabilities,
  getDeprecatedCapabilities,
  getCapabilityById,
  getAllCapabilities
} from './capability-database';

export interface CapabilitySnapshot {
  timestamp: string;
  capabilities: Record<string, PlatformCapability>;
  stats: {
    total: number;
    stable: number;
    beta: number;
    deprecated: number;
  };
}

export interface CapabilityChange {
  type: 'new' | 'upgraded' | 'deprecated' | 'status-change' | 'tier-upgrade';
  capabilityId: string;
  before?: PlatformCapability;
  after: PlatformCapability;
  changedFields: string[];
  detectedAt: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CapabilityDetectionReport {
  reportDate: string;
  period: {
    start: string;
    end: string;
  };
  changes: CapabilityChange[];
  summary: {
    newCapabilities: number;
    upgradedCapabilities: number;
    deprecatedCapabilities: number;
    statusChanges: number;
  };
  recommendations: string[];
  nextReviewDate: string;
}

// In-memory storage for snapshots (in production, use database)
const capabilitySnapshots: CapabilitySnapshot[] = [];

// Initialize with current state
const initializeSnapshot = (timestamp: string): CapabilitySnapshot => {
  const allCapabilities = getAllCapabilities();
  const capabilities: Record<string, PlatformCapability> = {};
  allCapabilities.forEach(cap => {
    capabilities[cap.id] = cap;
  });

  return {
    timestamp,
    capabilities,
    stats: {
      total: allCapabilities.length,
      stable: allCapabilities.filter(c => c.status === 'stable').length,
      beta: allCapabilities.filter(c => c.status === 'beta').length,
      deprecated: allCapabilities.filter(c => c.status === 'deprecated').length
    }
  };
};

/**
 * Detect capability changes between two snapshots
 */
export const detectCapabilityChanges = (
  before: CapabilitySnapshot,
  after: CapabilitySnapshot
): CapabilityChange[] => {
  const changes: CapabilityChange[] = [];

  // Check for new capabilities
  Object.values(after.capabilities).forEach(afterCap => {
    const beforeCap = before.capabilities[afterCap.id];

    if (!beforeCap) {
      changes.push({
        type: 'new',
        capabilityId: afterCap.id,
        after: afterCap,
        changedFields: ['introduced', 'status', 'tier'],
        detectedAt: after.timestamp,
        impactLevel: afterCap.tier === 'core' ? 'high' : 'medium'
      });
    } else {
      // Check for changes in existing capabilities
      const changedFields: string[] = [];

      if (beforeCap.status !== afterCap.status) {
        changedFields.push('status');
      }
      if (beforeCap.tier !== afterCap.tier) {
        changedFields.push('tier');
      }
      if (beforeCap.apiVersion !== afterCap.apiVersion) {
        changedFields.push('apiVersion');
      }
      if (JSON.stringify(beforeCap.sdkSupport) !== JSON.stringify(afterCap.sdkSupport)) {
        changedFields.push('sdkSupport');
      }

      if (changedFields.length > 0) {
        let changeType: CapabilityChange['type'] = 'status-change';
        let impactLevel: CapabilityChange['impactLevel'] = 'low';

        if (beforeCap.status === 'alpha' && afterCap.status === 'beta') {
          changeType = 'upgraded';
          impactLevel = 'medium';
        } else if (beforeCap.status === 'beta' && afterCap.status === 'stable') {
          changeType = 'upgraded';
          impactLevel = 'high';
        } else if (beforeCap.tier !== afterCap.tier && 
                   (beforeCap.tier === 'standard' || beforeCap.tier === 'advanced') &&
                   (afterCap.tier === 'advanced' || afterCap.tier === 'enterprise')) {
          changeType = 'tier-upgrade';
          impactLevel = 'medium';
        } else if (afterCap.deprecated) {
          changeType = 'deprecated';
          impactLevel = 'high';
        }

        changes.push({
          type: changeType,
          capabilityId: afterCap.id,
          before: beforeCap,
          after: afterCap,
          changedFields,
          detectedAt: after.timestamp,
          impactLevel
        });
      }
    }
  });

  // Check for deprecated capabilities
  Object.values(before.capabilities).forEach(beforeCap => {
    if (!after.capabilities[beforeCap.id] || after.capabilities[beforeCap.id].deprecated) {
      const afterCap = after.capabilities[beforeCap.id];
      if (afterCap && !beforeCap.deprecated && afterCap.deprecated) {
        changes.push({
          type: 'deprecated',
          capabilityId: beforeCap.id,
          before: beforeCap,
          after: afterCap,
          changedFields: ['deprecated'],
          detectedAt: after.timestamp,
          impactLevel: 'critical'
        });
      }
    }
  });

  return changes;
};

/**
 * Generate detection report
 */
export const generateDetectionReport = (
  startDate: string,
  endDate: string
): CapabilityDetectionReport => {
  // Get current snapshot
  const currentSnapshot = initializeSnapshot(new Date().toISOString());

  // Get previous snapshot (would come from database in production)
  const previousSnapshot = capabilitySnapshots.length > 0
    ? capabilitySnapshots[capabilitySnapshots.length - 1]
    : initializeSnapshot(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const changes = detectCapabilityChanges(previousSnapshot, currentSnapshot);

  const newChanges = changes.filter(c => c.type === 'new');
  const upgradedChanges = changes.filter(c => c.type === 'upgraded');
  const deprecatedChanges = changes.filter(c => c.type === 'deprecated');
  const statusChanges = changes.filter(c => c.type === 'status-change');

  const recommendations = generateRecommendations(changes);

  return {
    reportDate: new Date().toISOString(),
    period: { start: startDate, end: endDate },
    changes,
    summary: {
      newCapabilities: newChanges.length,
      upgradedCapabilities: upgradedChanges.length,
      deprecatedCapabilities: deprecatedChanges.length,
      statusChanges: statusChanges.length
    },
    recommendations,
    nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
};

/**
 * Generate recommendations based on detected changes
 */
const generateRecommendations = (changes: CapabilityChange[]): string[] => {
  const recommendations: string[] = [];

  // New core capabilities
  const newCoreCapabilities = changes.filter(c => c.type === 'new' && c.after.tier === 'core');
  if (newCoreCapabilities.length > 0) {
    recommendations.push(
      `HIGH PRIORITY: ${newCoreCapabilities.length} new core capabilities detected. ` +
      `Review integration opportunities immediately: ${newCoreCapabilities.map(c => c.after.name).join(', ')}`
    );
  }

  // Upgraded capabilities
  const upgradedToStable = changes.filter(c => 
    c.type === 'upgraded' && c.after.status === 'stable'
  );
  if (upgradedToStable.length > 0) {
    recommendations.push(
      `MEDIUM PRIORITY: ${upgradedToStable.length} capabilities promoted to stable. ` +
      `Consider moving from beta usage to stable: ${upgradedToStable.map(c => c.after.name).join(', ')}`
    );
  }

  // Deprecated capabilities
  const deprecated = changes.filter(c => c.type === 'deprecated');
  if (deprecated.length > 0) {
    recommendations.push(
      `CRITICAL: ${deprecated.length} capabilities deprecated. ` +
      `Plan migration immediately: ${deprecated.map(c => c.after.name).join(', ')}`
    );
  }

  // SDK support changes
  const sdkChanges = changes.filter(c => c.changedFields.includes('sdkSupport'));
  if (sdkChanges.length > 0) {
    recommendations.push(
      `SDK Support Changes: Review ${sdkChanges.length} capabilities with updated SDK support. ` +
      `Update SDK dependencies and compatibility checks.`
    );
  }

  // Tier upgrades (advanced/enterprise)
  const tierUpgrades = changes.filter(c => c.type === 'tier-upgrade');
  if (tierUpgrades.length > 0) {
    recommendations.push(
      `${tierUpgrades.length} capabilities have tier changes. ` +
      `Review availability and licensing implications.`
    );
  }

  return recommendations;
};

/**
 * Save current snapshot for future comparison
 */
export const saveCapabilitySnapshot = (): CapabilitySnapshot => {
  const snapshot = initializeSnapshot(new Date().toISOString());
  capabilitySnapshots.push(snapshot);

  // Keep only last 52 snapshots (one year of weekly snapshots)
  if (capabilitySnapshots.length > 52) {
    capabilitySnapshots.shift();
  }

  return snapshot;
};

/**
 * Compare current capabilities with a specific date
 */
export const compareCapabilitiesSinceDate = (sinceDate: string): CapabilityComparisonResult => {
  const newCapabilities = getNewCapabilities(sinceDate);
  const deprecatedCapabilities = getDeprecatedCapabilities();
  const allCapabilities = getAllCapabilities();

  // Find upgraded capabilities
  const upgradedCapabilities = allCapabilities
    .filter(cap => {
      const introducedDate = new Date(cap.introduced);
      return introducedDate > new Date(sinceDate) && cap.status === 'stable' && cap.tier !== 'alpha';
    })
    .map(cap => ({
      capability: cap,
      improvements: [
        `Status: ${cap.status}`,
        `Tier: ${cap.tier}`,
        `API Version: ${cap.apiVersion || 'N/A'}`
      ]
    }));

  return {
    newCapabilities,
    deprecatedCapabilities,
    upgradedCapabilities,
    migratedCapabilities: []
  };
};

/**
 * Get capability change frequency
 */
export const getCapabilityChangeFrequency = (): Record<string, number> => {
  const frequency: Record<string, number> = {};

  capabilitySnapshots.forEach((snapshot, index) => {
    if (index === 0) return;

    const previousSnapshot = capabilitySnapshots[index - 1];
    const changes = detectCapabilityChanges(previousSnapshot, snapshot);

    changes.forEach(change => {
      frequency[change.capabilityId] = (frequency[change.capabilityId] || 0) + 1;
    });
  });

  return frequency;
};

/**
 * Predict upcoming changes based on trend
 */
export const predictUpcomingChanges = (): string[] => {
  const predictions: string[] = [];
  const frequency = getCapabilityChangeFrequency();

  // Identify frequently changing capabilities
  const frequentChanges = Object.entries(frequency)
    .filter(([_, count]) => count >= 3)
    .map(([id]) => getCapabilityById(id))
    .filter(Boolean) as PlatformCapability[];

  if (frequentChanges.length > 0) {
    predictions.push(
      `Watch for continued development in: ${frequentChanges.map(c => c.name).join(', ')}`
    );
  }

  // Beta capabilities likely to graduate
  const betaCapabilities = getAllCapabilities().filter(c => c.status === 'beta');
  if (betaCapabilities.length > 0) {
    predictions.push(
      `${betaCapabilities.length} capabilities in beta may graduate to stable soon. Prepare integration roadmap.`
    );
  }

  // Enterprise tier implications
  const enterpriseCapabilities = getAllCapabilities().filter(c => c.tier === 'enterprise');
  if (enterpriseCapabilities.length > 0) {
    predictions.push(
      `${enterpriseCapabilities.length} enterprise capabilities available. Plan for enterprise customer support.`
    );
  }

  return predictions;
};

/**
 * Get impact summary
 */
export const getImpactSummary = (changes: CapabilityChange[]): Record<string, number> => {
  return {
    critical: changes.filter(c => c.impactLevel === 'critical').length,
    high: changes.filter(c => c.impactLevel === 'high').length,
    medium: changes.filter(c => c.impactLevel === 'medium').length,
    low: changes.filter(c => c.impactLevel === 'low').length
  };
};
