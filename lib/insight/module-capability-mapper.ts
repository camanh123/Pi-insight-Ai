/**
 * Module to Capability Mapper
 * Maps Pi Insight modules to platform capabilities and identifies integration opportunities
 */

import {
  ModuleCapabilityMapping,
  PlatformCapability,
  getCapabilityById
} from './capability-database';

export interface PiInsightModule {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'feature' | 'utility' | 'integration';
  dependencies: string[];
  criticality: 'essential' | 'important' | 'optional';
}

export interface IntegrationOpportunity {
  capabilityId: string;
  capability: PlatformCapability;
  moduleId: string;
  moduleName: string;
  opportunity: string;
  benefit: string;
  effortEstimate: 'low' | 'medium' | 'high';
  impactPotential: 'low' | 'medium' | 'high' | 'transformative';
  priority: number; // 1-100
  prerequisites: string[];
  risks: string[];
  estimatedHours: number;
  suggestedPhase: 'immediate' | 'near-term' | 'mid-term' | 'long-term';
}

export interface ModuleIntegrationReport {
  moduleId: string;
  moduleName: string;
  currentCapabilities: ModuleCapabilityMapping['usedCapabilities'];
  opportunities: IntegrationOpportunity[];
  summary: {
    totalOpportunities: number;
    highPriorityCount: number;
    estimatedTotalHours: number;
    recommendedPhasing: string;
  };
}

// Define Pi Insight modules
export const PI_INSIGHT_MODULES: Record<string, PiInsightModule> = {
  'home-view': {
    id: 'home-view',
    name: 'Home View',
    description: 'Main dashboard displaying Pi updates and insights',
    category: 'core',
    dependencies: ['update-card', 'update-detail'],
    criticality: 'essential'
  },

  'advisor-view': {
    id: 'advisor-view',
    name: 'AI Advisor',
    description: 'Question answering about Pi Network using official data',
    category: 'feature',
    dependencies: ['knowledge-graph', 'answer-engine'],
    criticality: 'important'
  },

  'update-card': {
    id: 'update-card',
    name: 'Update Card Display',
    description: 'Card component for displaying individual updates',
    category: 'utility',
    dependencies: [],
    criticality: 'essential'
  },

  'knowledge-graph': {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    description: 'Graph database of Pi concepts, features, and relationships',
    category: 'feature',
    dependencies: ['storage-database'],
    criticality: 'important'
  },

  'timeline-evolution': {
    id: 'timeline-evolution',
    name: 'Timeline Evolution',
    description: 'Visualize how Pi features evolved over time',
    category: 'feature',
    dependencies: ['update-detail'],
    criticality: 'important'
  },

  'readiness-score': {
    id: 'readiness-score',
    name: 'Pioneer Readiness Score',
    description: 'Score indicating how ready a user is for various Pi features',
    category: 'feature',
    dependencies: ['identity-kyc-verification', 'profile-data'],
    criticality: 'optional'
  },

  'daily-briefing': {
    id: 'daily-briefing',
    name: 'Daily Briefing',
    description: 'Daily summary of important Pi updates and news',
    category: 'feature',
    dependencies: ['update-card', 'ai-summarizer'],
    criticality: 'important'
  },

  'compare-updates': {
    id: 'compare-updates',
    name: 'Compare Updates',
    description: 'Side-by-side comparison of different Pi updates and versions',
    category: 'feature',
    dependencies: ['update-detail'],
    criticality: 'optional'
  },

  'answer-engine': {
    id: 'answer-engine',
    name: 'Answer Engine',
    description: 'AI-powered question answering system',
    category: 'feature',
    dependencies: ['knowledge-graph', 'ai-model'],
    criticality: 'important'
  },

  'profile-data': {
    id: 'profile-data',
    name: 'User Profile Data',
    description: 'Store and manage user profile information',
    category: 'utility',
    dependencies: ['sdk-user-state-storage'],
    criticality: 'essential'
  },

  'storage-database': {
    id: 'storage-database',
    name: 'Database Storage',
    description: 'Backend database for persistent data',
    category: 'utility',
    dependencies: [],
    criticality: 'essential'
  },

  'ai-model': {
    id: 'ai-model',
    name: 'AI Model Integration',
    description: 'Integration with AI models for text generation and analysis',
    category: 'integration',
    dependencies: [],
    criticality: 'important'
  },

  'saved-updates': {
    id: 'saved-updates',
    name: 'Saved Updates',
    description: 'Allow users to save and bookmark important updates',
    category: 'feature',
    dependencies: ['update-card', 'profile-data'],
    criticality: 'optional'
  },

  'notifications-system': {
    id: 'notifications-system',
    name: 'Notifications System',
    description: 'Notify users about important Pi updates and events',
    category: 'integration',
    dependencies: [],
    criticality: 'important'
  },

  'wallet-integration': {
    id: 'wallet-integration',
    name: 'Wallet Integration',
    description: 'Display wallet balance and transaction history',
    category: 'integration',
    dependencies: ['sdk-payments-pi'],
    criticality: 'optional'
  },

  'identity-profile': {
    id: 'identity-profile',
    name: 'Identity & Profile',
    description: 'Manage user identity verification and profile',
    category: 'feature',
    dependencies: ['identity-kyc-verification'],
    criticality: 'important'
  }
};

// Define current capability mappings for each module
export const MODULE_CAPABILITY_MAPPINGS: Record<string, ModuleCapabilityMapping> = {
  'home-view': {
    moduleId: 'home-view',
    moduleName: 'Home View',
    usedCapabilities: [
      { capabilityId: 'storage-database', integrationLevel: 'critical' },
      { capabilityId: 'sdk-user-state-storage', integrationLevel: 'important' }
    ],
    potentialCapabilities: [
      { capabilityId: 'notifications-in-app', opportunity: 'Show in-app notifications for important updates' },
      { capabilityId: 'notifications-push', opportunity: 'Push notifications for critical Pi updates' }
    ]
  },

  'advisor-view': {
    moduleId: 'advisor-view',
    moduleName: 'AI Advisor',
    usedCapabilities: [
      { capabilityId: 'storage-database', integrationLevel: 'critical' }
    ],
    potentialCapabilities: [
      { capabilityId: 'sdk-notifications', opportunity: 'Notify users when advisor has new insights' },
      { capabilityId: 'identity-reputation', opportunity: 'Personalize advice based on user reputation' }
    ]
  },

  'readiness-score': {
    moduleId: 'readiness-score',
    moduleName: 'Pioneer Readiness Score',
    usedCapabilities: [
      { capabilityId: 'identity-kyc-verification', integrationLevel: 'critical' },
      { capabilityId: 'profile-data', integrationLevel: 'important' }
    ],
    potentialCapabilities: [
      { capabilityId: 'identity-reputation', opportunity: 'Use reputation score in readiness calculation' },
      { capabilityId: 'wallet-transaction-history', opportunity: 'Analyze transaction history for readiness' },
      { capabilityId: 'identity-kbb-verification', opportunity: 'Include business verification in score' }
    ]
  },

  'notifications-system': {
    moduleId: 'notifications-system',
    moduleName: 'Notifications System',
    usedCapabilities: [],
    potentialCapabilities: [
      { capabilityId: 'notifications-push', opportunity: 'Enable push notifications for all users' },
      { capabilityId: 'notifications-in-app', opportunity: 'Display in-app notification center' },
      { capabilityId: 'sdk-notifications', opportunity: 'Integrate with SDK notification system' }
    ]
  },

  'wallet-integration': {
    moduleId: 'wallet-integration',
    moduleName: 'Wallet Integration',
    usedCapabilities: [
      { capabilityId: 'wallet-balance-check', integrationLevel: 'important' }
    ],
    potentialCapabilities: [
      { capabilityId: 'wallet-transaction-history', opportunity: 'Display full transaction history' },
      { capabilityId: 'wallet-send-receive', opportunity: 'Enable P2P transfers from app' },
      { capabilityId: 'payments-mainnet-settlement', opportunity: 'Show mainnet settlement details' },
      { capabilityId: 'payments-escrow', opportunity: 'Display escrow transactions' }
    ]
  },

  'identity-profile': {
    moduleId: 'identity-profile',
    moduleName: 'Identity & Profile',
    usedCapabilities: [
      { capabilityId: 'identity-kyc-verification', integrationLevel: 'critical' }
    ],
    potentialCapabilities: [
      { capabilityId: 'identity-kbb-verification', opportunity: 'Support business accounts' },
      { capabilityId: 'identity-reputation', opportunity: 'Display reputation score in profile' }
    ]
  }
};

/**
 * Get module mappings
 */
export const getModuleMapping = (moduleId: string): ModuleCapabilityMapping | undefined => {
  return MODULE_CAPABILITY_MAPPINGS[moduleId];
};

/**
 * Get all module mappings
 */
export const getAllModuleMappings = (): ModuleCapabilityMapping[] => {
  return Object.values(MODULE_CAPABILITY_MAPPINGS);
};

/**
 * Find integration opportunities for a capability
 */
export const findOpportunitiesForCapability = (capabilityId: string): IntegrationOpportunity[] => {
  const opportunities: IntegrationOpportunity[] = [];
  const capability = getCapabilityById(capabilityId);

  if (!capability) return opportunities;

  Object.values(MODULE_CAPABILITY_MAPPINGS).forEach(mapping => {
    mapping.potentialCapabilities.forEach(potential => {
      if (potential.capabilityId === capabilityId) {
        const module = PI_INSIGHT_MODULES[mapping.moduleId];
        if (module) {
          opportunities.push({
            capabilityId,
            capability,
            moduleId: mapping.moduleId,
            moduleName: mapping.moduleName,
            opportunity: potential.opportunity,
            benefit: calculateBenefit(capability, module),
            effortEstimate: estimateEffort(capability),
            impactPotential: assessImpact(capability, module),
            priority: calculatePriority(capability, module),
            prerequisites: capability.requirements,
            risks: identifyRisks(capability, module),
            estimatedHours: estimateHours(capability),
            suggestedPhase: determinePriority(capability)
          });
        }
      }
    });
  });

  return opportunities;
};

/**
 * Find all integration opportunities
 */
export const findAllOpportunities = (): IntegrationOpportunity[] => {
  const allOpportunities: IntegrationOpportunity[] = [];

  Object.values(MODULE_CAPABILITY_MAPPINGS).forEach(mapping => {
    mapping.potentialCapabilities.forEach(potential => {
      const capability = getCapabilityById(potential.capabilityId);
      const module = PI_INSIGHT_MODULES[mapping.moduleId];

      if (capability && module) {
        allOpportunities.push({
          capabilityId: potential.capabilityId,
          capability,
          moduleId: mapping.moduleId,
          moduleName: mapping.moduleName,
          opportunity: potential.opportunity,
          benefit: calculateBenefit(capability, module),
          effortEstimate: estimateEffort(capability),
          impactPotential: assessImpact(capability, module),
          priority: calculatePriority(capability, module),
          prerequisites: capability.requirements,
          risks: identifyRisks(capability, module),
          estimatedHours: estimateHours(capability),
          suggestedPhase: determinePriority(capability)
        });
      }
    });
  });

  return allOpportunities.sort((a, b) => b.priority - a.priority);
};

/**
 * Generate module integration report
 */
export const generateModuleReport = (moduleId: string): ModuleIntegrationReport | null => {
  const mapping = getModuleMapping(moduleId);
  const module = PI_INSIGHT_MODULES[moduleId];

  if (!mapping || !module) return null;

  const opportunities = findOpportunitiesForCapability(moduleId);
  const highPriority = opportunities.filter(o => o.priority >= 70);

  return {
    moduleId,
    moduleName: module.name,
    currentCapabilities: mapping.usedCapabilities,
    opportunities,
    summary: {
      totalOpportunities: opportunities.length,
      highPriorityCount: highPriority.length,
      estimatedTotalHours: opportunities.reduce((sum, o) => sum + o.estimatedHours, 0),
      recommendedPhasing: buildPhasing(opportunities)
    }
  };
};

// Helper functions
const calculateBenefit = (capability: PlatformCapability, _module: PiInsightModule): string => {
  if (capability.tier === 'core') return 'Essential for platform engagement';
  if (capability.tier === 'standard') return 'Enhances user experience significantly';
  if (capability.tier === 'advanced') return 'Advanced features for power users';
  return 'Enterprise capabilities';
};

const estimateEffort = (capability: PlatformCapability): 'low' | 'medium' | 'high' => {
  if (capability.status === 'deprecated') return 'high';
  if (capability.tier === 'core') return 'medium';
  if (capability.status === 'beta') return 'high';
  return 'low';
};

const assessImpact = (
  capability: PlatformCapability,
  module: PiInsightModule
): 'low' | 'medium' | 'high' | 'transformative' => {
  if (module.criticality === 'essential' && capability.tier === 'core') return 'transformative';
  if (capability.tier === 'core') return 'high';
  if (capability.tier === 'standard') return 'medium';
  return 'low';
};

const calculatePriority = (capability: PlatformCapability, module: PiInsightModule): number => {
  let priority = 0;

  // Tier weighting
  if (capability.tier === 'core') priority += 40;
  else if (capability.tier === 'standard') priority += 25;
  else if (capability.tier === 'advanced') priority += 15;

  // Status weighting
  if (capability.status === 'stable') priority += 30;
  else if (capability.status === 'beta') priority += 15;

  // Module criticality
  if (module.criticality === 'essential') priority += 20;
  else if (module.criticality === 'important') priority += 10;

  return Math.min(priority, 100);
};

const estimateHours = (capability: PlatformCapability): number => {
  const baseHours: Record<typeof capability.tier, number> = {
    'core': 16,
    'standard': 24,
    'advanced': 40,
    'enterprise': 60
  };

  let hours = baseHours[capability.tier];

  if (capability.status === 'beta') hours += 8;
  if (capability.status === 'alpha') hours += 16;

  return hours;
};

const identifyRisks = (capability: PlatformCapability, _module: PiInsightModule): string[] => {
  const risks: string[] = [];

  if (capability.status === 'beta') {
    risks.push('API may change before stable release');
  }
  if (capability.status === 'alpha') {
    risks.push('Feature may be discontinued');
  }
  if (capability.deprecated) {
    risks.push('Deprecated capability - plan migration');
  }

  return risks;
};

const determinePriority = (capability: PlatformCapability): 'immediate' | 'near-term' | 'mid-term' | 'long-term' => {
  if (capability.status === 'stable' && capability.tier === 'core') return 'immediate';
  if (capability.status === 'stable' && capability.tier === 'standard') return 'near-term';
  if (capability.status === 'beta') return 'mid-term';
  return 'long-term';
};

const buildPhasing = (opportunities: IntegrationOpportunity[]): string => {
  const phases = {
    immediate: opportunities.filter(o => o.suggestedPhase === 'immediate').length,
    nearTerm: opportunities.filter(o => o.suggestedPhase === 'near-term').length,
    midTerm: opportunities.filter(o => o.suggestedPhase === 'mid-term').length,
    longTerm: opportunities.filter(o => o.suggestedPhase === 'long-term').length
  };

  return `Q1: ${phases.immediate} | Q2: ${phases.nearTerm} | Q3: ${phases.midTerm} | Q4: ${phases.longTerm}`;
};
