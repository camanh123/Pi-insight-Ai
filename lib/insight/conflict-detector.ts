/**
 * Conflict Detector
 * Identifies, tracks and flags conflicting information across sources
 */

import { InformationRecord, Source, SourceConflict, ReliabilityLevel } from './source-classifier';

export interface ConflictReport {
  id: string;
  timestamp: Date;
  totalRecords: number;
  conflictCount: number;
  criticalConflicts: number;
  conflictsByTopic: Map<string, SourceConflict[]>;
  recommendations: ConflictResolution[];
  resolutionStatus: 'unresolved' | 'in_progress' | 'resolved';
}

export interface ConflictResolution {
  conflictId: string;
  recommendedAction: 'accept' | 'reject' | 'merge' | 'investigate' | 'deprecate';
  reasoning: string;
  preferredSource?: Source;
  mergeStrategy?: 'newer_takes_precedence' | 'more_reliable' | 'both_valid' | 'requires_clarification';
  investigationRequired: boolean;
  estimatedResolutionTime?: string;
}

export interface ConflictMetrics {
  totalConflicts: number;
  byTopic: Record<string, number>;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byType: {
    contradictory: number;
    outdated: number;
    incomplete: number;
    ambiguous: number;
  };
  resolutionRate: number; // 0-100
  unresolvedCritical: number;
}

/**
 * Detector for conflicting information
 */
export class ConflictDetector {
  private recordDatabase: Map<string, InformationRecord> = new Map();
  private conflictHistory: ConflictReport[] = [];

  /**
   * Register an information record
   */
  registerRecord(record: InformationRecord): void {
    this.recordDatabase.set(record.id, record);
  }

  /**
   * Get all records
   */
  getAllRecords(): InformationRecord[] {
    return Array.from(this.recordDatabase.values());
  }

  /**
   * Detect conflicts for a record against all others
   */
  detectConflicts(record: InformationRecord): SourceConflict[] {
    const conflicts: SourceConflict[] = [];
    const allRecords = this.getAllRecords();

    for (const other of allRecords) {
      if (other.id === record.id) continue;
      if (other.topic !== record.topic) continue;

      // Check for direct contradictions
      const contradiction = this.detectContradiction(record, other);
      if (contradiction) {
        conflicts.push(contradiction);
        record.hasConflicts = true;
        other.hasConflicts = true;
      }

      // Check for outdated information
      const outdated = this.detectOutdatedInfo(record, other);
      if (outdated) {
        conflicts.push(outdated);
        record.hasConflicts = true;
      }

      // Check for incomplete information
      const incomplete = this.detectIncompleteInfo(record, other);
      if (incomplete) {
        conflicts.push(incomplete);
      }

      // Check for ambiguous claims
      const ambiguous = this.detectAmbiguousClaims(record, other);
      if (ambiguous) {
        conflicts.push(ambiguous);
      }
    }

    return conflicts;
  }

  /**
   * Detect direct contradictions between records
   */
  private detectContradiction(record1: InformationRecord, record2: InformationRecord): SourceConflict | null {
    const patterns = [
      { pattern1: /not supported/i, pattern2: /fully supported/i },
      { pattern1: /not available/i, pattern2: /now available/i },
      { pattern1: /will not be/i, pattern2: /will be/i },
      { pattern1: /disabled by default/i, pattern2: /enabled by default/i },
      { pattern1: /is not required/i, pattern2: /is required/i },
      { pattern1: /does not support/i, pattern2: /supports/i },
    ];

    for (const { pattern1, pattern2 } of patterns) {
      if (
        (pattern1.test(record1.content) && pattern2.test(record2.content)) ||
        (pattern1.test(record2.content) && pattern2.test(record1.content))
      ) {
        return {
          recordId: record1.id,
          conflictingRecords: [record2.id],
          conflictType: 'contradictory',
          severity: this.calculateSeverity(record1, record2),
          description: `Contradictory claims: "${record1.content.substring(0, 40)}..." vs "${record2.content.substring(0, 40)}..."`,
        };
      }
    }

    return null;
  }

  /**
   * Detect outdated information
   */
  private detectOutdatedInfo(record1: InformationRecord, record2: InformationRecord): SourceConflict | null {
    // If record1 is older and record2 is verified
    if (
      record1.lastUpdated < record2.lastUpdated &&
      record2.reliabilityLevel === 'verified' &&
      this.hasOfficialSource(record2)
    ) {
      const daysDiff = Math.floor(
        (record2.lastUpdated.getTime() - record1.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff > 7) {
        // Older than 7 days
        return {
          recordId: record1.id,
          conflictingRecords: [record2.id],
          conflictType: 'outdated',
          severity: daysDiff > 30 ? 'critical' : 'high',
          description: `Information is ${daysDiff} days old. Newer verified information available.`,
          resolutionSuggestion: 'Update with latest information from official sources',
        };
      }
    }

    return null;
  }

  /**
   * Detect incomplete information
   */
  private detectIncompleteInfo(record1: InformationRecord, record2: InformationRecord): SourceConflict | null {
    // If record2 is significantly more comprehensive
    if (
      record2.content.length > record1.content.length * 1.5 &&
      record1.content.length < 200 &&
      record2.topic === record1.topic &&
      this.hasOfficialSource(record2)
    ) {
      return {
        recordId: record1.id,
        conflictingRecords: [record2.id],
        conflictType: 'incomplete',
        severity: 'medium',
        description: `Information is incomplete. More comprehensive details available.`,
        resolutionSuggestion: 'Merge or supplement with additional information from verified source',
      };
    }

    return null;
  }

  /**
   * Detect ambiguous claims
   */
  private detectAmbiguousClaims(record1: InformationRecord, record2: InformationRecord): SourceConflict | null {
    const ambiguousPatterns = [/may/, /might/, /could/, /possibly/, /seems/, /appears/i];

    const record1Ambiguous = ambiguousPatterns.some(p => p.test(record1.content));
    const record2Ambiguous = ambiguousPatterns.some(p => p.test(record2.content));

    if (record1Ambiguous && record2Ambiguous && record1.topic === record2.topic) {
      return {
        recordId: record1.id,
        conflictingRecords: [record2.id],
        conflictType: 'ambiguous',
        severity: 'low',
        description: 'Both claims contain ambiguous language, requiring clarification',
        resolutionSuggestion: 'Seek authoritative source for clarification',
      };
    }

    return null;
  }

  /**
   * Calculate conflict severity
   */
  private calculateSeverity(record1: InformationRecord, record2: InformationRecord): 'critical' | 'high' | 'medium' | 'low' {
    const official1 = this.hasOfficialSource(record1);
    const official2 = this.hasOfficialSource(record2);

    if (official1 && official2) return 'critical'; // Both official
    if (official1 || official2) return 'high'; // One is official
    if (record1.reliabilityLevel === 'verified' && record2.reliabilityLevel === 'verified') return 'medium';
    return 'low';
  }

  /**
   * Check if record has official source
   */
  private hasOfficialSource(record: InformationRecord): boolean {
    return record.sources.some(s => s.type !== 'community' && s.type !== 'ai_analysis');
  }

  /**
   * Generate comprehensive conflict report
   */
  generateConflictReport(): ConflictReport {
    const allRecords = this.getAllRecords();
    const conflictsByTopic = new Map<string, SourceConflict[]>();
    const recommendations: ConflictResolution[] = [];

    let totalConflicts = 0;
    let criticalCount = 0;

    // Detect all conflicts
    for (const record of allRecords) {
      const conflicts = this.detectConflicts(record);
      if (conflicts.length > 0) {
        const topic = record.topic;
        if (!conflictsByTopic.has(topic)) {
          conflictsByTopic.set(topic, []);
        }
        conflictsByTopic.get(topic)!.push(...conflicts);
        totalConflicts += conflicts.length;

        // Count critical
        criticalCount += conflicts.filter(c => c.severity === 'critical').length;

        // Generate recommendations
        for (const conflict of conflicts) {
          recommendations.push(this.generateResolution(conflict, allRecords));
        }
      }
    }

    const report: ConflictReport = {
      id: `report_${Date.now()}`,
      timestamp: new Date(),
      totalRecords: allRecords.length,
      conflictCount: totalConflicts,
      criticalConflicts: criticalCount,
      conflictsByTopic,
      recommendations,
      resolutionStatus: totalConflicts === 0 ? 'resolved' : 'unresolved',
    };

    this.conflictHistory.push(report);
    return report;
  }

  /**
   * Generate resolution recommendation
   */
  private generateResolution(conflict: SourceConflict, allRecords: InformationRecord[]): ConflictResolution {
    const record1 = allRecords.find(r => r.id === conflict.recordId);
    const record2 = allRecords.find(r => r.id === conflict.conflictingRecords[0]);

    if (!record1 || !record2) {
      return {
        conflictId: conflict.recordId,
        recommendedAction: 'investigate',
        reasoning: 'Unable to locate conflicting records',
        investigationRequired: true,
      };
    }

    // Recommend based on conflict type and source reliability
    if (conflict.conflictType === 'contradictory') {
      if (record2.overallReliabilityScore > record1.overallReliabilityScore) {
        return {
          conflictId: conflict.recordId,
          recommendedAction: 'reject',
          reasoning: `Record 2 has higher reliability score (${record2.overallReliabilityScore} vs ${record1.overallReliabilityScore})`,
          preferredSource: record2.sources[0],
          investigationRequired: false,
        };
      }
      return {
        conflictId: conflict.recordId,
        recommendedAction: 'investigate',
        reasoning: 'Both sources have similar reliability; manual review required',
        investigationRequired: true,
      };
    }

    if (conflict.conflictType === 'outdated') {
      return {
        conflictId: conflict.recordId,
        recommendedAction: 'deprecate',
        reasoning: 'Information is outdated; newer verified information available',
        preferredSource: record2.sources[0],
        investigationRequired: false,
      };
    }

    if (conflict.conflictType === 'incomplete') {
      return {
        conflictId: conflict.recordId,
        recommendedAction: 'merge',
        reasoning: 'Record 2 provides more comprehensive information',
        mergeStrategy: 'more_reliable',
        investigationRequired: false,
      };
    }

    return {
      conflictId: conflict.recordId,
      recommendedAction: 'investigate',
      reasoning: 'Requires manual investigation',
      investigationRequired: true,
    };
  }

  /**
   * Get conflict metrics
   */
  getMetrics(): ConflictMetrics {
    const report = this.generateConflictReport();

    const byTopic: Record<string, number> = {};
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byType = { contradictory: 0, outdated: 0, incomplete: 0, ambiguous: 0 };

    for (const [topic, conflicts] of report.conflictsByTopic) {
      byTopic[topic] = conflicts.length;
      for (const conflict of conflicts) {
        bySeverity[conflict.severity]++;
        byType[conflict.conflictType]++;
      }
    }

    const unresolvedCritical = report.criticalConflicts;
    const resolutionRate =
      report.totalRecords > 0 ? 100 - (report.conflictCount / (report.totalRecords * report.totalRecords)) * 100 : 100;

    return {
      totalConflicts: report.conflictCount,
      byTopic,
      bySeverity,
      byType,
      resolutionRate: Math.max(0, Math.min(100, resolutionRate)),
      unresolvedCritical,
    };
  }
}

export const conflictDetector = new ConflictDetector();
