/**
 * Verification Engine
 * Validates that AI responses meet source reliability standards
 * Prevents unofficial information from being presented as official
 */

import { InformationRecord, Source, isOfficialSource, OFFICIAL_SOURCES } from './source-classifier';
import { ResponseWarning } from './response-formatter';

export type VerificationStatus = 'approved' | 'flagged' | 'blocked' | 'needs_review';

export interface VerificationResult {
  status: VerificationStatus;
  timestamp: Date;
  recordId: string;
  issues: VerificationIssue[];
  recommendations: string[];
  approvedForPresentation: boolean;
}

export interface VerificationIssue {
  code: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category:
    | 'unofficial_as_official'
    | 'unverified_content'
    | 'conflicting_claims'
    | 'outdated_info'
    | 'insufficient_sources'
    | 'community_only'
    | 'ai_only';
  message: string;
  affectedContent?: string;
  suggestedFix?: string;
}

export interface VerificationPolicy {
  requireOfficialSourceForCriticalTopics: boolean;
  minimumReliabilityScore: number;
  maximumAiOnlyContent: number; // percentage
  requireMultipleSourcesForClaims: boolean;
  verifyBeforePresenting: boolean;
  flagUnofficialAsNonOfficial: boolean;
  maxAgeInDays: number;
}

/**
 * Verification engine for source reliability
 */
export class VerificationEngine {
  private policy: VerificationPolicy;
  private verificationLog: VerificationResult[] = [];

  // Critical topics that MUST have official sources
  private criticalTopics = [
    'mainnet launch',
    'kyc process',
    'wallet security',
    'node requirements',
    'payment',
    'transaction',
    'security',
    'authentication',
    'identity',
    'compliance',
  ];

  constructor(policy?: Partial<VerificationPolicy>) {
    this.policy = {
      requireOfficialSourceForCriticalTopics: true,
      minimumReliabilityScore: 60,
      maximumAiOnlyContent: 20,
      requireMultipleSourcesForClaims: false,
      verifyBeforePresenting: true,
      flagUnofficialAsNonOfficial: true,
      maxAgeInDays: 30,
      ...policy,
    };
  }

  /**
   * Verify a record before presentation
   */
  verifyRecord(record: InformationRecord): VerificationResult {
    const issues: VerificationIssue[] = [];
    const recommendations: string[] = [];

    // Check for critical issues
    const criticalIssues = this.checkForCriticalIssues(record);
    issues.push(...criticalIssues);

    // Check for source reliability
    const sourceIssues = this.checkSourceReliability(record);
    issues.push(...sourceIssues);

    // Check for outdated information
    const ageIssues = this.checkInformationAge(record);
    issues.push(...ageIssues);

    // Check for conflicting claims
    if (record.hasConflicts) {
      issues.push({
        code: 'CONFLICT_DETECTED',
        severity: 'high',
        category: 'conflicting_claims',
        message: 'This record has conflicting information from other sources',
        suggestedFix: 'Resolve conflicts before presenting',
      });
    }

    // Determine status
    const status = this.determineStatus(issues);
    const approvedForPresentation = this.canPresent(status, issues);

    // Generate recommendations
    if (issues.length > 0) {
      recommendations.push(...this.generateRecommendations(issues));
    }

    const result: VerificationResult = {
      status,
      timestamp: new Date(),
      recordId: record.id,
      issues,
      recommendations,
      approvedForPresentation,
    };

    this.verificationLog.push(result);
    return result;
  }

  /**
   * Check for critical issues
   */
  private checkForCriticalIssues(record: InformationRecord): VerificationIssue[] {
    const issues: VerificationIssue[] = [];

    // Check if critical topic lacks official sources
    const isCriticalTopic = this.criticalTopics.some(topic =>
      record.topic.toLowerCase().includes(topic)
    );

    if (isCriticalTopic && this.policy.requireOfficialSourceForCriticalTopics) {
      const hasOfficial = record.sources.some(s => isOfficialSource(s));
      if (!hasOfficial) {
        issues.push({
          code: 'CRITICAL_TOPIC_NO_OFFICIAL',
          severity: 'critical',
          category: 'unofficial_as_official',
          message: `Critical topic "${record.topic}" lacks official source. This cannot be presented as authoritative.`,
          affectedContent: record.content.substring(0, 100),
          suggestedFix: 'Add official source or reclassify as community/AI analysis',
        });
      }
    }

    // Check for unverified content on critical topics
    if (isCriticalTopic && record.verificationStatus === 'needs_review') {
      issues.push({
        code: 'CRITICAL_TOPIC_UNVERIFIED',
        severity: 'critical',
        category: 'unverified_content',
        message: `Critical topic "${record.topic}" is unverified. Must be verified before presenting.`,
        suggestedFix: 'Verify against official sources',
      });
    }

    return issues;
  }

  /**
   * Check source reliability
   */
  private checkSourceReliability(record: InformationRecord): VerificationIssue[] {
    const issues: VerificationIssue[] = [];

    // Check minimum reliability score
    if (record.overallReliabilityScore < this.policy.minimumReliabilityScore) {
      issues.push({
        code: 'LOW_RELIABILITY',
        severity: 'high',
        category: 'insufficient_sources',
        message: `Record reliability score (${record.overallReliabilityScore}%) is below minimum threshold (${this.policy.minimumReliabilityScore}%)`,
        suggestedFix: 'Add more reliable sources or reclassify',
      });
    }

    // Check for AI-only content
    const aiOnlyContent = record.sources.every(s => s.type === 'ai_analysis');
    if (aiOnlyContent && this.policy.flagUnofficialAsNonOfficial) {
      issues.push({
        code: 'AI_ONLY_CONTENT',
        severity: 'medium',
        category: 'ai_only',
        message: 'This record is entirely AI-generated analysis, not official information',
        suggestedFix: 'Present clearly as AI analysis, not as official information',
      });
    }

    // Check for community-only content
    const communityOnly = record.sources.every(s => s.type === 'community');
    if (communityOnly && this.policy.flagUnofficialAsNonOfficial) {
      issues.push({
        code: 'COMMUNITY_ONLY',
        severity: 'medium',
        category: 'community_only',
        message: 'This record is sourced only from community content, not official sources',
        suggestedFix: 'Present as community information, not official',
      });
    }

    // Check source count requirement
    if (
      this.policy.requireMultipleSourcesForClaims &&
      record.sources.length < 2
    ) {
      issues.push({
        code: 'INSUFFICIENT_SOURCES',
        severity: 'medium',
        category: 'insufficient_sources',
        message: 'Record has only one source. Multiple sources recommended.',
        suggestedFix: 'Add additional sources to support claim',
      });
    }

    return issues;
  }

  /**
   * Check information age
   */
  private checkInformationAge(record: InformationRecord): VerificationIssue[] {
    const issues: VerificationIssue[] = [];

    const ageInDays = Math.floor(
      (new Date().getTime() - record.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (ageInDays > this.policy.maxAgeInDays) {
      issues.push({
        code: 'OUTDATED_INFO',
        severity: 'medium',
        category: 'outdated_info',
        message: `Information is ${ageInDays} days old (max: ${this.policy.maxAgeInDays} days)`,
        suggestedFix: 'Update with newer information from official sources',
      });
    }

    return issues;
  }

  /**
   * Determine verification status
   */
  private determineStatus(issues: VerificationIssue[]): VerificationStatus {
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');

    if (criticalIssues.length > 0) return 'blocked';
    if (highIssues.length > 0) return 'flagged';
    if (issues.length > 0) return 'needs_review';
    return 'approved';
  }

  /**
   * Check if record can be presented
   */
  private canPresent(status: VerificationStatus, issues: VerificationIssue[]): boolean {
    if (status === 'blocked') return false;

    // Can present if flagged only if properly labeled
    const mustLabel = issues.some(i => i.category === 'ai_only' || i.category === 'community_only');
    return !mustLabel || this.policy.flagUnofficialAsNonOfficial;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(issues: VerificationIssue[]): string[] {
    const recommendations: string[] = [];
    const categories = new Set(issues.map(i => i.category));

    if (categories.has('unofficial_as_official')) {
      recommendations.push('Do not present unofficial information as official');
      recommendations.push('Add official sources or clearly label as community/AI content');
    }

    if (categories.has('unverified_content')) {
      recommendations.push('Verify all claims against official Pi documentation');
      recommendations.push('Contact Pi Core Team if verification needed');
    }

    if (categories.has('conflicting_claims')) {
      recommendations.push('Resolve conflicts between sources before presenting');
      recommendations.push('Prioritize official sources in conflicts');
    }

    if (categories.has('outdated_info')) {
      recommendations.push('Refresh information from latest official sources');
      recommendations.push('Add update timestamp for transparency');
    }

    if (categories.has('ai_only')) {
      recommendations.push('Present as "AI Analysis" not official information');
      recommendations.push('Include disclaimer about AI-generated nature');
    }

    if (categories.has('community_only')) {
      recommendations.push('Present as "Community Information" not official');
      recommendations.push('Recommend users verify with official sources');
    }

    return recommendations;
  }

  /**
   * Batch verify records
   */
  verifyBatch(records: InformationRecord[]): VerificationResult[] {
    return records.map(r => this.verifyRecord(r));
  }

  /**
   * Get verification report
   */
  getVerificationReport(timeWindowMinutes: number = 1440): {
    totalVerified: number;
    approved: number;
    flagged: number;
    blocked: number;
    needsReview: number;
    criticalIssuesFound: number;
  } {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recent = this.verificationLog.filter(r => r.timestamp > cutoff);

    const criticalCount = recent.reduce(
      (sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length,
      0
    );

    return {
      totalVerified: recent.length,
      approved: recent.filter(r => r.status === 'approved').length,
      flagged: recent.filter(r => r.status === 'flagged').length,
      blocked: recent.filter(r => r.status === 'blocked').length,
      needsReview: recent.filter(r => r.status === 'needs_review').length,
      criticalIssuesFound: criticalCount,
    };
  }

  /**
   * Update verification policy
   */
  updatePolicy(newPolicy: Partial<VerificationPolicy>): void {
    this.policy = { ...this.policy, ...newPolicy };
  }

  /**
   * Export verification log
   */
  exportLog(): VerificationResult[] {
    return [...this.verificationLog];
  }
}

export const verificationEngine = new VerificationEngine();
