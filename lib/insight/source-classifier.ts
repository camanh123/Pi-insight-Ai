/**
 * Source Classifier
 * Classifies information by source type and assigns reliability scores
 * Official Pi Core Team, Official Documentation, Pi App Studio, Community Content, AI Analysis
 */

export type SourceType = 'official_core' | 'official_docs' | 'official_app_studio' | 'community' | 'ai_analysis';
export type SourceTier = 'primary' | 'secondary' | 'tertiary' | 'unverified';
export type ReliabilityLevel = 'verified' | 'likely_accurate' | 'uncertain' | 'conflicted' | 'unverified';

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  tier: SourceTier;
  url?: string;
  lastVerified?: Date;
  verificationMethod: string;
  reliabilityScore: number; // 0-100
  conflictsWith?: string[]; // source IDs
  confidence: number; // 0-100
}

export interface InformationRecord {
  id: string;
  content: string;
  topic: string;
  sources: Source[];
  reliabilityLevel: ReliabilityLevel;
  overallReliabilityScore: number;
  hasConflicts: boolean;
  conflictingRecords?: string[];
  lastUpdated: Date;
  expiresAt?: Date;
  verificationStatus: 'verified' | 'needs_review' | 'disputed';
  notes?: string;
}

export interface SourceConflict {
  recordId: string;
  conflictingRecords: string[];
  conflictType: 'contradictory' | 'outdated' | 'incomplete' | 'ambiguous';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  resolutionSuggestion?: string;
}

// Source Type Definitions
export const SOURCE_TYPES: Record<SourceType, {
  name: string;
  description: string;
  baseReliability: number;
  tier: SourceTier;
  verificationRequired: boolean;
  updateFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'on-demand';
}> = {
  official_core: {
    name: 'Official Pi Core Team',
    description: 'Statements directly from Pi Core Team',
    baseReliability: 100,
    tier: 'primary',
    verificationRequired: false,
    updateFrequency: 'on-demand',
  },
  official_docs: {
    name: 'Official Documentation',
    description: 'Pi Network official documentation and specifications',
    baseReliability: 98,
    tier: 'primary',
    verificationRequired: false,
    updateFrequency: 'weekly',
  },
  official_app_studio: {
    name: 'Pi App Studio',
    description: 'Pi App Studio official guides and resources',
    baseReliability: 96,
    tier: 'primary',
    verificationRequired: false,
    updateFrequency: 'weekly',
  },
  community: {
    name: 'Community Content',
    description: 'Community discussions, forums, social media',
    baseReliability: 65,
    tier: 'secondary',
    verificationRequired: true,
    updateFrequency: 'daily',
  },
  ai_analysis: {
    name: 'AI Analysis',
    description: 'Synthesized analysis and predictions',
    baseReliability: 45,
    tier: 'tertiary',
    verificationRequired: true,
    updateFrequency: 'on-demand',
  },
};

// Verification Methods
export const VERIFICATION_METHODS = {
  manual_review: 'Manual review by core team',
  api_validation: 'API response validation',
  documentation_cross_reference: 'Cross-referenced with official docs',
  multiple_sources: 'Verified across multiple official sources',
  technical_test: 'Technical testing and validation',
  timestamp_verification: 'Timestamp and publication date verification',
  cryptographic_signature: 'Cryptographically signed by Pi Core',
  community_consensus: 'Community consensus with expert review',
  ai_synthesis: 'AI synthesis from verified sources',
  pending_verification: 'Pending verification',
};

// Source Reliability Database
export const OFFICIAL_SOURCES: Record<string, Source> = {
  pi_core_blog: {
    id: 'pi_core_blog',
    type: 'official_core',
    name: 'Pi Core Team Blog',
    tier: 'primary',
    url: 'https://pi.com/blog',
    verificationMethod: VERIFICATION_METHODS.cryptographic_signature,
    reliabilityScore: 100,
    confidence: 100,
  },
  pi_documentation: {
    id: 'pi_documentation',
    type: 'official_docs',
    name: 'Pi Network Documentation',
    tier: 'primary',
    url: 'https://docs.pi.app',
    verificationMethod: VERIFICATION_METHODS.documentation_cross_reference,
    reliabilityScore: 98,
    confidence: 98,
  },
  pi_app_studio_docs: {
    id: 'pi_app_studio_docs',
    type: 'official_app_studio',
    name: 'Pi App Studio Documentation',
    tier: 'primary',
    url: 'https://appstudio.pi.app/docs',
    verificationMethod: VERIFICATION_METHODS.api_validation,
    reliabilityScore: 96,
    confidence: 96,
  },
  pi_sdk_reference: {
    id: 'pi_sdk_reference',
    type: 'official_docs',
    name: 'Pi SDK Reference',
    tier: 'primary',
    url: 'https://sdk.pi.app/reference',
    verificationMethod: VERIFICATION_METHODS.api_validation,
    reliabilityScore: 97,
    confidence: 97,
  },
  pi_mainnet_docs: {
    id: 'pi_mainnet_docs',
    type: 'official_docs',
    name: 'Mainnet Documentation',
    tier: 'primary',
    url: 'https://docs.pi.app/mainnet',
    verificationMethod: VERIFICATION_METHODS.multiple_sources,
    reliabilityScore: 99,
    confidence: 99,
  },
  pi_kyc_docs: {
    id: 'pi_kyc_docs',
    type: 'official_docs',
    name: 'KYC Documentation',
    tier: 'primary',
    url: 'https://docs.pi.app/kyc',
    verificationMethod: VERIFICATION_METHODS.multiple_sources,
    reliabilityScore: 98,
    confidence: 98,
  },
  pi_node_docs: {
    id: 'pi_node_docs',
    type: 'official_docs',
    name: 'Node Software Documentation',
    tier: 'primary',
    url: 'https://docs.pi.app/node',
    verificationMethod: VERIFICATION_METHODS.technical_test,
    reliabilityScore: 97,
    confidence: 97,
  },
  pi_browser_docs: {
    id: 'pi_browser_docs',
    type: 'official_docs',
    name: 'Pi Browser Documentation',
    tier: 'primary',
    url: 'https://browser.pi.app/docs',
    verificationMethod: VERIFICATION_METHODS.api_validation,
    reliabilityScore: 96,
    confidence: 96,
  },
  pi_wallet_docs: {
    id: 'pi_wallet_docs',
    type: 'official_docs',
    name: 'Pi Wallet Documentation',
    tier: 'primary',
    url: 'https://wallet.pi.app/docs',
    verificationMethod: VERIFICATION_METHODS.api_validation,
    reliabilityScore: 97,
    confidence: 97,
  },
  pi_ecosystem_guide: {
    id: 'pi_ecosystem_guide',
    type: 'official_docs',
    name: 'Ecosystem Guide',
    tier: 'primary',
    url: 'https://docs.pi.app/ecosystem',
    verificationMethod: VERIFICATION_METHODS.documentation_cross_reference,
    reliabilityScore: 95,
    confidence: 95,
  },
};

/**
 * Classify source by type and assign reliability score
 */
export function classifySource(sourceIdentifier: string): Source | null {
  return OFFICIAL_SOURCES[sourceIdentifier] || null;
}

/**
 * Calculate composite reliability score from multiple sources
 */
export function calculateReliabilityScore(sources: Source[]): number {
  if (!sources || sources.length === 0) return 0;

  // Weight by source reliability
  const totalWeight = sources.reduce((sum, s) => sum + s.reliabilityScore, 0);
  const averageScore = totalWeight / sources.length;

  // Boost for multiple sources agreement
  let boost = 0;
  if (sources.length >= 2) boost += 5;
  if (sources.length >= 3) boost += 5;
  if (sources.some(s => s.tier === 'primary')) boost += 10;

  return Math.min(100, averageScore + boost);
}

/**
 * Determine reliability level based on score
 */
export function determineReliabilityLevel(score: number): ReliabilityLevel {
  if (score >= 95) return 'verified';
  if (score >= 80) return 'likely_accurate';
  if (score >= 60) return 'uncertain';
  if (score >= 40) return 'conflicted';
  return 'unverified';
}

/**
 * Check if source is official
 */
export function isOfficialSource(source: Source): boolean {
  return source.type !== 'community' && source.type !== 'ai_analysis';
}

/**
 * Validate information against known conflicts
 */
export function validateAgainstConflicts(
  record: InformationRecord,
  allRecords: InformationRecord[]
): SourceConflict[] {
  const conflicts: SourceConflict[] = [];

  for (const other of allRecords) {
    if (other.id === record.id) continue;
    if (other.topic !== record.topic) continue;

    // Detect contradictions
    if (isContradictory(record.content, other.content)) {
      conflicts.push({
        recordId: record.id,
        conflictingRecords: [other.id],
        conflictType: 'contradictory',
        severity: determineSeverity(record.sources, other.sources),
        description: `Contradicts: "${other.content.substring(0, 50)}..."`,
      });
    }

    // Detect outdated info
    if (isOutdated(record, other)) {
      conflicts.push({
        recordId: record.id,
        conflictingRecords: [other.id],
        conflictType: 'outdated',
        severity: 'high',
        description: `Outdated compared to: "${other.content.substring(0, 50)}..."`,
        resolutionSuggestion: 'Update with newer information',
      });
    }

    // Detect incomplete info
    if (isIncomplete(record.content, other.content)) {
      conflicts.push({
        recordId: record.id,
        conflictingRecords: [other.id],
        conflictType: 'incomplete',
        severity: 'medium',
        description: `Missing details compared to: "${other.content.substring(0, 50)}..."`,
        resolutionSuggestion: 'Integrate additional context',
      });
    }
  }

  return conflicts;
}

function isContradictory(content1: string, content2: string): boolean {
  // Simplified contradiction detection
  const contradictions = [
    { a: 'not supported', b: 'supported' },
    { a: 'will not', b: 'will' },
    { a: 'disabled', b: 'enabled' },
    { a: 'unavailable', b: 'available' },
  ];

  return contradictions.some(
    pair =>
      (content1.toLowerCase().includes(pair.a) && content2.toLowerCase().includes(pair.b)) ||
      (content1.toLowerCase().includes(pair.b) && content2.toLowerCase().includes(pair.a))
  );
}

function isOutdated(record: InformationRecord, other: InformationRecord): boolean {
  return (
    record.lastUpdated < other.lastUpdated &&
    other.reliabilityLevel === 'verified' &&
    !record.lastUpdated.getTime()
  );
}

function isIncomplete(content1: string, content2: string): boolean {
  // If content2 is significantly longer and covers the same topic
  return content2.length > content1.length * 1.5 && content1.length < 200;
}

function determineSeverity(
  sources1: Source[],
  sources2: Source[]
): 'critical' | 'high' | 'medium' | 'low' {
  // Official source conflicts are more critical
  const official1 = sources1.some(s => isOfficialSource(s));
  const official2 = sources2.some(s => isOfficialSource(s));

  if (official1 && official2) return 'critical';
  if (official1 || official2) return 'high';
  return 'medium';
}

/**
 * Create verified information record
 */
export function createVerifiedRecord(
  content: string,
  topic: string,
  sources: Source[],
  notes?: string
): InformationRecord {
  const reliabilityScore = calculateReliabilityScore(sources);
  const reliabilityLevel = determineReliabilityLevel(reliabilityScore);

  return {
    id: `info_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content,
    topic,
    sources,
    reliabilityLevel,
    overallReliabilityScore: reliabilityScore,
    hasConflicts: false,
    lastUpdated: new Date(),
    verificationStatus: reliabilityScore >= 90 ? 'verified' : 'needs_review',
    notes,
  };
}

/**
 * Get source tier hierarchy
 */
export function getSourceTierHierarchy(): SourceTier[] {
  return ['primary', 'secondary', 'tertiary', 'unverified'];
}

/**
 * Check if source requires verification
 */
export function requiresVerification(sourceType: SourceType): boolean {
  return SOURCE_TYPES[sourceType].verificationRequired;
}
