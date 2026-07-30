/**
 * Platform Capability Database
 * Maintains official Pi platform capabilities across all services
 * Source: Official Pi documentation, SDK releases, and core team announcements
 */

export type CapabilityCategory = 'AppStudio' | 'SDK' | 'Backend' | 'Storage' | 'Wallet' | 'Browser' | 'Node' | 'Payments' | 'Notifications' | 'Identity';
export type CapabilityStatus = 'stable' | 'beta' | 'alpha' | 'deprecated' | 'planned';
export type CapabilityTier = 'core' | 'standard' | 'advanced' | 'enterprise';

export interface PlatformCapability {
  id: string;
  category: CapabilityCategory;
  name: string;
  description: string;
  status: CapabilityStatus;
  tier: CapabilityTier;
  introduced: string; // ISO date
  deprecated?: string; // ISO date
  officialDocs: string;
  apiVersion?: string;
  requirements: string[];
  relatedCapabilities: string[];
  limitations?: string[];
  performanceMetrics?: {
    latency?: string;
    throughput?: string;
    scalability?: string;
  };
  sdkSupport: {
    javascript?: string;
    python?: string;
    rust?: string;
    swift?: string;
    kotlin?: string;
  };
  sampleCode?: string;
  lastUpdated: string; // ISO date
}

export interface ModuleCapabilityMapping {
  moduleId: string;
  moduleName: string;
  usedCapabilities: {
    capabilityId: string;
    integrationLevel: 'critical' | 'important' | 'optional';
    implementationNotes?: string;
  }[];
  potentialCapabilities: {
    capabilityId: string;
    opportunity: string;
    estimatedBenefit: string;
  }[];
}

export interface CapabilityComparisonResult {
  newCapabilities: PlatformCapability[];
  deprecatedCapabilities: PlatformCapability[];
  upgradedCapabilities: {
    capability: PlatformCapability;
    improvements: string[];
  }[];
  migratedCapabilities: {
    oldCapabilityId: string;
    newCapabilityId: string;
    deprecationTimeline: string;
  }[];
}

// Official Pi Platform Capabilities Database
export const PLATFORM_CAPABILITIES: Record<string, PlatformCapability> = {
  // App Studio Capabilities
  'app-studio-project-create': {
    id: 'app-studio-project-create',
    category: 'AppStudio',
    name: 'Project Creation & Management',
    description: 'Create and manage full-stack applications with Next.js framework, shadcn/ui components, and integrated Pi SDK',
    status: 'stable',
    tier: 'core',
    introduced: '2024-01-15',
    officialDocs: 'https://appstudio.pi/docs/getting-started',
    apiVersion: '1.0',
    requirements: ['Pi account', 'Vercel connection optional'],
    relatedCapabilities: ['app-studio-deployment', 'app-studio-git-integration'],
    performanceMetrics: {
      throughput: '100+ projects per user',
      scalability: 'Unlimited project size'
    },
    sdkSupport: {
      javascript: '1.0+',
      typescript: '4.5+'
    },
    lastUpdated: '2025-02-20'
  },

  'app-studio-deployment': {
    id: 'app-studio-deployment',
    category: 'AppStudio',
    name: 'One-Click Deployment to Vercel',
    description: 'Deploy applications directly to Vercel with automatic CI/CD, custom domains, and environment management',
    status: 'stable',
    tier: 'core',
    introduced: '2024-02-01',
    officialDocs: 'https://appstudio.pi/docs/deployment',
    requirements: ['Vercel account'],
    relatedCapabilities: ['app-studio-project-create', 'app-studio-git-integration'],
    performanceMetrics: {
      latency: '< 5 seconds deployment initiation',
      scalability: 'Auto-scaling on Vercel infrastructure'
    },
    sdkSupport: {
      javascript: '1.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'app-studio-git-integration': {
    id: 'app-studio-git-integration',
    category: 'AppStudio',
    name: 'GitHub Repository Integration',
    description: 'Connect GitHub repositories, enable automatic syncing, branch management, and pull request workflows',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-03-10',
    officialDocs: 'https://appstudio.pi/docs/git-integration',
    requirements: ['GitHub account', 'OAuth authorization'],
    relatedCapabilities: ['app-studio-deployment'],
    sdkSupport: {
      javascript: '1.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'app-studio-design-mode': {
    id: 'app-studio-design-mode',
    category: 'AppStudio',
    name: 'Visual Design Mode',
    description: 'Edit styling, colors, and layouts with live preview without writing CSS',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-04-20',
    officialDocs: 'https://appstudio.pi/docs/design-mode',
    sdkSupport: {
      javascript: '1.0+'
    },
    lastUpdated: '2025-02-20'
  },

  // SDK Capabilities
  'sdk-auth-core': {
    id: 'sdk-auth-core',
    category: 'SDK',
    name: 'Core Authentication',
    description: 'Pi Network authentication with KYC, session management, and user verification',
    status: 'stable',
    tier: 'core',
    introduced: '2023-01-01',
    officialDocs: 'https://sdk.pi/docs/auth',
    apiVersion: '2.0',
    requirements: ['Pi account', 'SDK initialization'],
    relatedCapabilities: ['identity-kyc-verification', 'identity-kbb-verification'],
    sdkSupport: {
      javascript: '2.0+',
      python: '2.0+'
    },
    sampleCode: 'const user = await sdk.init(config);',
    lastUpdated: '2025-02-20'
  },

  'sdk-user-state-storage': {
    id: 'sdk-user-state-storage',
    category: 'SDK',
    name: 'User State Storage',
    description: 'Persistent per-user storage up to 128KB with automatic sync across devices',
    status: 'stable',
    tier: 'core',
    introduced: '2024-01-01',
    officialDocs: 'https://sdk.pi/docs/user-state',
    requirements: ['Authentication', 'Less than 64 keys per user'],
    relatedCapabilities: ['backend-database', 'storage-blob'],
    limitations: ['64KB per object', '4 levels nesting max', '1 write per 5s per key'],
    performanceMetrics: {
      latency: '< 500ms average',
      throughput: 'Up to 64 keys per user'
    },
    sdkSupport: {
      javascript: '2.0+'
    },
    sampleCode: 'await sdk.userState.set(key, value);',
    lastUpdated: '2025-02-20'
  },

  'sdk-payments-pi': {
    id: 'sdk-payments-pi',
    category: 'SDK',
    name: 'Pi Payment Integration',
    description: 'Accept Pi cryptocurrency payments with payment flow, transaction confirmation, and on-chain settlement',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-06-01',
    officialDocs: 'https://sdk.pi/docs/payments',
    apiVersion: '1.0',
    requirements: ['Mainnet enabled', 'Payment product configuration'],
    relatedCapabilities: ['payments-mainnet-settlement', 'wallet-balance-check'],
    sdkSupport: {
      javascript: '2.0+'
    },
    sampleCode: 'const payment = await sdk.makePurchase(productId);',
    lastUpdated: '2025-02-20'
  },

  'sdk-notifications': {
    id: 'sdk-notifications',
    category: 'SDK',
    name: 'Push Notifications',
    description: 'Send push notifications to Pi users with rich content, deep linking, and delivery tracking',
    status: 'beta',
    tier: 'standard',
    introduced: '2024-08-15',
    officialDocs: 'https://sdk.pi/docs/notifications',
    requirements: ['Browser push permission', 'SDK v2.1+'],
    sdkSupport: {
      javascript: '2.1+'
    },
    lastUpdated: '2025-02-20'
  },

  // Wallet Capabilities
  'wallet-balance-check': {
    id: 'wallet-balance-check',
    category: 'Wallet',
    name: 'Real-Time Balance Query',
    description: 'Query user Pi balance, transaction history, and locked amounts',
    status: 'stable',
    tier: 'core',
    introduced: '2024-01-01',
    officialDocs: 'https://wallet.pi/docs/balance',
    requirements: ['User authentication', 'Wallet initialized'],
    relatedCapabilities: ['wallet-transaction-history', 'payments-mainnet-settlement'],
    performanceMetrics: {
      latency: '< 1 second'
    },
    sdkSupport: {
      javascript: '2.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'wallet-transaction-history': {
    id: 'wallet-transaction-history',
    category: 'Wallet',
    name: 'Transaction History & Ledger',
    description: 'Access complete transaction history with filtering, sorting, and export capabilities',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-02-01',
    officialDocs: 'https://wallet.pi/docs/history',
    relatedCapabilities: ['wallet-balance-check', 'payments-mainnet-settlement'],
    performanceMetrics: {
      throughput: 'Up to 10,000 transactions per query'
    },
    sdkSupport: {
      javascript: '2.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'wallet-send-receive': {
    id: 'wallet-send-receive',
    category: 'Wallet',
    name: 'Send & Receive Pi',
    description: 'Enable peer-to-peer transfers with QR code generation, contact book, and multi-sig support',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-03-15',
    officialDocs: 'https://wallet.pi/docs/transfers',
    relatedCapabilities: ['payments-mainnet-settlement', 'identity-kyc-verification'],
    sdkSupport: {
      javascript: '2.0+'
    },
    lastUpdated: '2025-02-20'
  },

  // Storage Capabilities
  'storage-blob': {
    id: 'storage-blob',
    category: 'Storage',
    name: 'File Storage (Blob)',
    description: 'Store files up to 5GB with public/private access control and CDN delivery',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-04-01',
    officialDocs: 'https://appstudio.pi/docs/storage',
    requirements: ['Vercel account for production'],
    sdkSupport: {
      javascript: '1.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'storage-database': {
    id: 'storage-database',
    category: 'Storage',
    name: 'SQL Database (Neon/Aurora/etc)',
    description: 'Serverless PostgreSQL database with automatic scaling and backups',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-02-01',
    officialDocs: 'https://appstudio.pi/docs/database',
    relatedCapabilities: ['backend-api', 'backend-drizzle-orm'],
    sdkSupport: {
      javascript: '1.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'storage-redis': {
    id: 'storage-redis',
    category: 'Storage',
    name: 'Redis Cache (Upstash)',
    description: 'Serverless Redis for caching, rate limiting, sessions, and queues',
    status: 'stable',
    tier: 'advanced',
    introduced: '2024-05-01',
    officialDocs: 'https://upstash.com/docs/redis/features/integration',
    sdkSupport: {
      javascript: '1.0+'
    },
    lastUpdated: '2025-02-20'
  },

  // Browser Capabilities
  'browser-sdk-integration': {
    id: 'browser-sdk-integration',
    category: 'Browser',
    name: 'Pi Browser SDK Integration',
    description: 'Seamless integration in Pi Browser with automatic user detection and authentication',
    status: 'stable',
    tier: 'core',
    introduced: '2024-01-01',
    officialDocs: 'https://browser.pi/docs/developers',
    requirements: ['Browser v5+'],
    sdkSupport: {
      javascript: '2.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'browser-deep-linking': {
    id: 'browser-deep-linking',
    category: 'Browser',
    name: 'Deep Linking & Intent Handling',
    description: 'Handle custom protocol and deep link routing for seamless user navigation',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-03-01',
    officialDocs: 'https://browser.pi/docs/deep-linking',
    sdkSupport: {
      javascript: '2.0+'
    },
    lastUpdated: '2025-02-20'
  },

  // Node Capabilities
  'node-full-archive': {
    id: 'node-full-archive',
    category: 'Node',
    name: 'Full Archive Node',
    description: 'Run full archive node with complete ledger history and query access',
    status: 'stable',
    tier: 'enterprise',
    introduced: '2024-06-01',
    officialDocs: 'https://node.pi/docs/setup',
    requirements: ['Server with 500GB+ storage', 'Linux OS'],
    performanceMetrics: {
      latency: '< 100ms query response'
    },
    lastUpdated: '2025-02-20'
  },

  'node-lite-validator': {
    id: 'node-lite-validator',
    category: 'Node',
    name: 'Lite Validator Node',
    description: 'Run validator node with 10GB storage footprint and participation rewards',
    status: 'stable',
    tier: 'advanced',
    introduced: '2024-06-01',
    officialDocs: 'https://node.pi/docs/validator',
    requirements: ['$1000 Pi collateral', 'Minimum 2Mbps bandwidth'],
    lastUpdated: '2025-02-20'
  },

  // Payments Capabilities
  'payments-mainnet-settlement': {
    id: 'payments-mainnet-settlement',
    category: 'Payments',
    name: 'Mainnet Pi Settlement',
    description: 'Settle payments on Pi mainnet with on-chain verification and immediate finality',
    status: 'stable',
    tier: 'core',
    introduced: '2024-12-01',
    officialDocs: 'https://payments.pi/docs/mainnet',
    requirements: ['Mainnet activated', 'KYC verified'],
    relatedCapabilities: ['identity-kyc-verification', 'sdk-payments-pi'],
    performanceMetrics: {
      latency: '5-15 seconds finality',
      throughput: '1000+ TPS'
    },
    sdkSupport: {
      javascript: '2.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'payments-escrow': {
    id: 'payments-escrow',
    category: 'Payments',
    name: 'Escrow & Dispute Resolution',
    description: 'Secure payments with escrow, dispute resolution, and multi-sig accounts',
    status: 'beta',
    tier: 'advanced',
    introduced: '2025-01-15',
    officialDocs: 'https://payments.pi/docs/escrow',
    requirements: ['Mainnet enabled', 'Multi-sig support'],
    sdkSupport: {
      javascript: '2.1+'
    },
    lastUpdated: '2025-02-20'
  },

  // Notifications Capabilities
  'notifications-push': {
    id: 'notifications-push',
    category: 'Notifications',
    name: 'Push Notifications',
    description: 'Send push notifications with rich content, images, and deep linking',
    status: 'beta',
    tier: 'standard',
    introduced: '2024-09-01',
    officialDocs: 'https://notifications.pi/docs/push',
    relatedCapabilities: ['sdk-notifications'],
    sdkSupport: {
      javascript: '2.1+'
    },
    lastUpdated: '2025-02-20'
  },

  'notifications-in-app': {
    id: 'notifications-in-app',
    category: 'Notifications',
    name: 'In-App Notifications',
    description: 'Display contextual in-app notifications and activity feeds',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-08-01',
    officialDocs: 'https://notifications.pi/docs/in-app',
    sdkSupport: {
      javascript: '2.0+'
    },
    lastUpdated: '2025-02-20'
  },

  // Identity Capabilities
  'identity-kyc-verification': {
    id: 'identity-kyc-verification',
    category: 'Identity',
    name: 'KYC Verification',
    description: 'Know Your Customer verification with document upload, facial recognition, and compliance reporting',
    status: 'stable',
    tier: 'core',
    introduced: '2023-06-01',
    officialDocs: 'https://identity.pi/docs/kyc',
    requirements: ['Valid government ID', '18+ age'],
    relatedCapabilities: ['identity-kbb-verification', 'identity-reputation'],
    performanceMetrics: {
      latency: '< 24 hours verification'
    },
    sdkSupport: {
      javascript: '2.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'identity-kbb-verification': {
    id: 'identity-kbb-verification',
    category: 'Identity',
    name: 'Know Your Business (KYB) Verification',
    description: 'Business entity verification with compliance documentation and entity linking',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-03-01',
    officialDocs: 'https://identity.pi/docs/kyb',
    requirements: ['Business registration documents', 'KYC pre-requirement'],
    relatedCapabilities: ['identity-kyc-verification'],
    sdkSupport: {
      javascript: '2.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'identity-reputation': {
    id: 'identity-reputation',
    category: 'Identity',
    name: 'Reputation & Scoring',
    description: 'User reputation scoring based on transaction history, KYC level, and platform activity',
    status: 'beta',
    tier: 'advanced',
    introduced: '2024-11-01',
    officialDocs: 'https://identity.pi/docs/reputation',
    relatedCapabilities: ['identity-kyc-verification', 'wallet-transaction-history'],
    sdkSupport: {
      javascript: '2.1+'
    },
    lastUpdated: '2025-02-20'
  },

  // Backend Capabilities
  'backend-api': {
    id: 'backend-api',
    category: 'Backend',
    name: 'API Routes & Server Functions',
    description: 'Next.js API routes for backend logic with environment variable management',
    status: 'stable',
    tier: 'core',
    introduced: '2024-01-01',
    officialDocs: 'https://appstudio.pi/docs/api',
    requirements: ['Next.js 13+'],
    relatedCapabilities: ['storage-database', 'backend-drizzle-orm'],
    sdkSupport: {
      javascript: '1.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'backend-drizzle-orm': {
    id: 'backend-drizzle-orm',
    category: 'Backend',
    name: 'Drizzle ORM Integration',
    description: 'Type-safe database ORM with schema definition and migrations',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-02-01',
    officialDocs: 'https://orm.drizzle.team/',
    relatedCapabilities: ['storage-database', 'backend-api'],
    sdkSupport: {
      javascript: '1.0+'
    },
    lastUpdated: '2025-02-20'
  },

  'backend-better-auth': {
    id: 'backend-better-auth',
    category: 'Backend',
    name: 'Better Auth Framework',
    description: 'Production authentication with session management, OAuth, and multiple providers',
    status: 'stable',
    tier: 'standard',
    introduced: '2024-03-01',
    officialDocs: 'https://authjs.dev/',
    relatedCapabilities: ['sdk-auth-core', 'backend-api'],
    sdkSupport: {
      javascript: '1.0+'
    },
    lastUpdated: '2025-02-20'
  }
};

// Get all capabilities
export const getAllCapabilities = (): PlatformCapability[] => {
  return Object.values(PLATFORM_CAPABILITIES);
};

// Get capabilities by category
export const getCapabilitiesByCategory = (category: CapabilityCategory): PlatformCapability[] => {
  return Object.values(PLATFORM_CAPABILITIES).filter(cap => cap.category === category);
};

// Get capabilities by status
export const getCapabilitiesByStatus = (status: CapabilityStatus): PlatformCapability[] => {
  return Object.values(PLATFORM_CAPABILITIES).filter(cap => cap.status === status);
};

// Get new capabilities since date
export const getNewCapabilities = (sinceDate: string): PlatformCapability[] => {
  const since = new Date(sinceDate);
  return Object.values(PLATFORM_CAPABILITIES).filter(cap => {
    return new Date(cap.introduced) > since;
  });
};

// Get deprecated capabilities
export const getDeprecatedCapabilities = (): PlatformCapability[] => {
  return Object.values(PLATFORM_CAPABILITIES).filter(cap => cap.deprecated);
};

// Find capability by ID
export const getCapabilityById = (id: string): PlatformCapability | undefined => {
  return PLATFORM_CAPABILITIES[id];
};

// Search capabilities
export const searchCapabilities = (query: string): PlatformCapability[] => {
  const lowerQuery = query.toLowerCase();
  return Object.values(PLATFORM_CAPABILITIES).filter(cap =>
    cap.name.toLowerCase().includes(lowerQuery) ||
    cap.description.toLowerCase().includes(lowerQuery) ||
    cap.category.toLowerCase().includes(lowerQuery)
  );
};

// Get capabilities by tier
export const getCapabilitiesByTier = (tier: CapabilityTier): PlatformCapability[] => {
  return Object.values(PLATFORM_CAPABILITIES).filter(cap => cap.tier === tier);
};

// Export metadata for tracking
export const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  'AppStudio',
  'SDK',
  'Backend',
  'Storage',
  'Wallet',
  'Browser',
  'Node',
  'Payments',
  'Notifications',
  'Identity'
];

export const CAPABILITY_STATUSES: CapabilityStatus[] = [
  'stable',
  'beta',
  'alpha',
  'deprecated',
  'planned'
];

export const CAPABILITY_TIERS: CapabilityTier[] = [
  'core',
  'standard',
  'advanced',
  'enterprise'
];

// Statistics
export const getCapabilityStats = () => {
  const capabilities = Object.values(PLATFORM_CAPABILITIES);
  return {
    total: capabilities.length,
    byCategory: CAPABILITY_CATEGORIES.reduce((acc, cat) => ({
      ...acc,
      [cat]: capabilities.filter(c => c.category === cat).length
    }), {} as Record<CapabilityCategory, number>),
    byStatus: CAPABILITY_STATUSES.reduce((acc, status) => ({
      ...acc,
      [status]: capabilities.filter(c => c.status === status).length
    }), {} as Record<CapabilityStatus, number>),
    byTier: CAPABILITY_TIERS.reduce((acc, tier) => ({
      ...acc,
      [tier]: capabilities.filter(c => c.tier === tier).length
    }), {} as Record<CapabilityTier, number>),
    stableCapabilities: capabilities.filter(c => c.status === 'stable').length,
    betaCapabilities: capabilities.filter(c => c.status === 'beta').length,
    deprecatedCapabilities: capabilities.filter(c => c.deprecated).length
  };
};
