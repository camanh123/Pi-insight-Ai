/**
 * Response Formatter
 * Formats AI responses with clear source attribution and confidence indicators
 * Separates Official Information, Community Information, and AI Analysis
 */

import { InformationRecord, Source, isOfficialSource } from './source-classifier';

export type ResponseSectionType = 'official' | 'community' | 'ai_analysis';

export interface ResponseSection {
  type: ResponseSectionType;
  title: string;
  content: string;
  sources: Source[];
  reliabilityScore: number;
  confidence: number;
  disclaimers: string[];
}

export interface FormattedResponse {
  sections: ResponseSection[];
  overallConfidence: number;
  lastUpdated: Date;
  warnings: ResponseWarning[];
  metadata: ResponseMetadata;
}

export interface ResponseWarning {
  type: 'unverified_content' | 'conflicting_info' | 'outdated' | 'incomplete' | 'community_sourced';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
}

export interface ResponseMetadata {
  totalSources: number;
  officialSourceCount: number;
  communitySourceCount: number;
  aiGeneratedCount: number;
  conflictsDetected: boolean;
  needsVerification: boolean;
}

/**
 * Format response with source attribution
 */
export class ResponseFormatter {
  /**
   * Format comprehensive response
   */
  formatResponse(records: InformationRecord[]): FormattedResponse {
    const sections = this.groupBySourceType(records);
    const warnings = this.generateWarnings(records);
    const metadata = this.generateMetadata(records);
    const overallConfidence = this.calculateOverallConfidence(records);

    return {
      sections,
      overallConfidence,
      lastUpdated: new Date(),
      warnings,
      metadata,
    };
  }

  /**
   * Group records by source type
   */
  private groupBySourceType(records: InformationRecord[]): ResponseSection[] {
    const sections: ResponseSection[] = [];

    // Official Information
    const officialRecords = records.filter(r => r.sources.some(s => isOfficialSource(s)));
    if (officialRecords.length > 0) {
      sections.push(
        this.createSection(
          'official',
          'Official Information',
          officialRecords,
          'Sourced directly from Pi Core Team and official documentation'
        )
      );
    }

    // Community Information
    const communityRecords = records.filter(r =>
      r.sources.some(s => s.type === 'community') && !r.sources.some(s => isOfficialSource(s))
    );
    if (communityRecords.length > 0) {
      sections.push(
        this.createSection('community', 'Community Information', communityRecords, 'Sourced from community discussions and forums')
      );
    }

    // AI Analysis
    const aiRecords = records.filter(
      r =>
        r.sources.every(s => s.type === 'ai_analysis') || (r.reliabilityScore && r.reliabilityScore < 60)
    );
    if (aiRecords.length > 0) {
      sections.push(this.createSection('ai_analysis', 'AI Analysis & Synthesis', aiRecords, 'Synthesized analysis and predictions from AI'));
    }

    return sections;
  }

  /**
   * Create response section
   */
  private createSection(
    type: ResponseSectionType,
    title: string,
    records: InformationRecord[],
    description: string
  ): ResponseSection {
    const content = records.map(r => this.formatRecord(r)).join('\n\n');
    const sources = [...new Set(records.flatMap(r => r.sources))];
    const reliabilityScore = this.calculateSectionReliability(records);
    const confidence = this.calculateSectionConfidence(records);

    const disclaimers = this.generateSectionDisclaimers(type, records);

    return {
      type,
      title,
      content,
      sources,
      reliabilityScore,
      confidence,
      disclaimers,
    };
  }

  /**
   * Format individual record
   */
  private formatRecord(record: InformationRecord): string {
    let formatted = `${record.content}\n`;

    // Add source attribution
    const sourceNames = record.sources.map(s => s.name).join(', ');
    formatted += `[Sources: ${sourceNames}]\n`;

    // Add confidence indicator
    formatted += `[Confidence: ${this.getConfidenceLabel(record.overallReliabilityScore)}]\n`;

    // Add verification status
    if (record.verificationStatus !== 'verified') {
      formatted += `[⚠️ Status: ${record.verificationStatus.toUpperCase()}]\n`;
    }

    // Add conflict warning
    if (record.hasConflicts) {
      formatted += `[⚠️ Conflicting information detected]\n`;
    }

    // Add expiration warning
    if (record.expiresAt && new Date() > record.expiresAt) {
      formatted += `[⚠️ This information may be outdated]\n`;
    }

    return formatted;
  }

  /**
   * Generate section disclaimers
   */
  private generateSectionDisclaimers(type: ResponseSectionType, records: InformationRecord[]): string[] {
    const disclaimers: string[] = [];

    switch (type) {
      case 'official':
        disclaimers.push(
          'This information is sourced from official Pi Core Team and documentation.',
          'Pi Insight always prioritizes official sources for accuracy.'
        );
        break;

      case 'community':
        disclaimers.push(
          'This information is sourced from community discussions and may not be officially verified.',
          'Community content should be cross-referenced with official sources before relying on it.',
          'Pi Insight recommends verifying community information through official channels.'
        );
        break;

      case 'ai_analysis':
        disclaimers.push(
          'This is AI-generated analysis and synthesis, not official information.',
          'AI analysis predictions should be treated as informational only.',
          'For critical decisions, please consult official Pi documentation or the Core Team.'
        );
        break;
    }

    // Add verification status warnings
    if (records.some(r => r.verificationStatus !== 'verified')) {
      disclaimers.push('Some information in this section requires verification.');
    }

    // Add conflict warnings
    if (records.some(r => r.hasConflicts)) {
      disclaimers.push('Conflicting information has been detected in this section.');
    }

    return disclaimers;
  }

  /**
   * Generate response warnings
   */
  private generateWarnings(records: InformationRecord[]): ResponseWarning[] {
    const warnings: ResponseWarning[] = [];

    // Check for unverified content
    const unverified = records.filter(r => r.verificationStatus === 'needs_review');
    if (unverified.length > 0) {
      warnings.push({
        type: 'unverified_content',
        severity: 'medium',
        message: `${unverified.length} piece(s) of information require verification`,
      });
    }

    // Check for conflicts
    const conflicted = records.filter(r => r.hasConflicts);
    if (conflicted.length > 0) {
      warnings.push({
        type: 'conflicting_info',
        severity: 'high',
        message: `${conflicted.length} conflicting claim(s) detected. Manual review recommended.`,
      });
    }

    // Check for outdated content
    const outdated = records.filter(r => r.expiresAt && new Date() > r.expiresAt);
    if (outdated.length > 0) {
      warnings.push({
        type: 'outdated',
        severity: 'medium',
        message: `${outdated.length} outdated information detected. Please refresh.`,
      });
    }

    // Check for incomplete content
    const incomplete = records.filter(r => r.content.length < 100);
    if (incomplete.length > records.length * 0.5) {
      warnings.push({
        type: 'incomplete',
        severity: 'low',
        message: 'Some information appears incomplete. Consider seeking more detailed sources.',
      });
    }

    // Check for community-only content
    const communityOnly = records.filter(r => r.sources.every(s => s.type === 'community'));
    if (communityOnly.length > 0 && records.length > 0) {
      warnings.push({
        type: 'community_sourced',
        severity: 'low',
        message: `${communityOnly.length} items sourced from community only. Official sources not available.`,
      });
    }

    return warnings;
  }

  /**
   * Generate response metadata
   */
  private generateMetadata(records: InformationRecord[]): ResponseMetadata {
    const allSources = [...new Set(records.flatMap(r => r.sources))];
    const officialSources = allSources.filter(s => isOfficialSource(s)).length;
    const communitySources = allSources.filter(s => s.type === 'community').length;
    const aiSources = allSources.filter(s => s.type === 'ai_analysis').length;

    return {
      totalSources: allSources.length,
      officialSourceCount: officialSources,
      communitySourceCount: communitySources,
      aiGeneratedCount: aiSources,
      conflictsDetected: records.some(r => r.hasConflicts),
      needsVerification: records.some(r => r.verificationStatus === 'needs_review'),
    };
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(records: InformationRecord[]): number {
    if (records.length === 0) return 0;

    const avgScore = records.reduce((sum, r) => sum + r.overallReliabilityScore, 0) / records.length;

    // Reduce confidence if conflicts exist
    const conflictPenalty = records.filter(r => r.hasConflicts).length * 10;

    // Boost confidence if all verified
    const verifiedBoost = records.every(r => r.verificationStatus === 'verified') ? 5 : 0;

    return Math.max(0, Math.min(100, avgScore - conflictPenalty + verifiedBoost));
  }

  /**
   * Calculate section reliability
   */
  private calculateSectionReliability(records: InformationRecord[]): number {
    if (records.length === 0) return 0;
    return Math.round(records.reduce((sum, r) => sum + r.overallReliabilityScore, 0) / records.length);
  }

  /**
   * Calculate section confidence
   */
  private calculateSectionConfidence(records: InformationRecord[]): number {
    if (records.length === 0) return 0;

    const verified = records.filter(r => r.verificationStatus === 'verified').length;
    const ratio = verified / records.length;

    return Math.round(ratio * 100);
  }

  /**
   * Get confidence label
   */
  private getConfidenceLabel(score: number): string {
    if (score >= 95) return '✓ Verified Official (95-100%)';
    if (score >= 80) return '✓ Highly Reliable (80-94%)';
    if (score >= 60) return '○ Likely Accurate (60-79%)';
    if (score >= 40) return '△ Uncertain (40-59%)';
    return '✗ Unverified (<40%)';
  }

  /**
   * Export response as markdown
   */
  exportAsMarkdown(response: FormattedResponse): string {
    let markdown = '# Pi Insight Response\n\n';

    // Add metadata
    markdown += `**Overall Confidence:** ${this.getConfidenceLabel(response.overallConfidence)}\n\n`;
    markdown += `**Sources:** ${response.metadata.totalSources} total `;
    markdown += `(${response.metadata.officialSourceCount} official, `;
    markdown += `${response.metadata.communitySourceCount} community, `;
    markdown += `${response.metadata.aiGeneratedCount} AI-generated)\n\n`;

    // Add warnings
    if (response.warnings.length > 0) {
      markdown += '## ⚠️ Warnings\n\n';
      for (const warning of response.warnings) {
        markdown += `- [${warning.severity.toUpperCase()}] ${warning.message}\n`;
      }
      markdown += '\n';
    }

    // Add sections
    for (const section of response.sections) {
      markdown += `## ${section.title}\n\n`;
      markdown += `**Reliability:** ${section.reliabilityScore}% | **Confidence:** ${section.confidence}%\n\n`;
      markdown += section.content + '\n\n';

      if (section.disclaimers.length > 0) {
        markdown += '**Disclaimers:**\n';
        for (const disclaimer of section.disclaimers) {
          markdown += `- ${disclaimer}\n`;
        }
        markdown += '\n';
      }
    }

    return markdown;
  }
}

export const responseFormatter = new ResponseFormatter();
