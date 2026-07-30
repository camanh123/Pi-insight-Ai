/**
 * Evidence Aggregator
 * Collects and synthesizes evidence from multiple sources
 * for comprehensive reasoning analysis
 */

export interface Evidence {
  id: string;
  source: 'official' | 'verified' | 'historical' | 'update' | 'capability';
  category: string;
  content: string;
  confidence: number; // 0-100
  timestamp: Date;
  relatedTopics: string[];
}

export interface EvidenceCollection {
  query: string;
  officialEvidence: Evidence[];
  verifiedEvidence: Evidence[];
  historicalEvidence: Evidence[];
  updateEvidence: Evidence[];
  capabilityEvidence: Evidence[];
  conflictingEvidence: Evidence[];
  supportingEvidence: Evidence[];
  totalConfidence: number;
}

export interface EvidenceSynthesis {
  mainClaim: string;
  supportingFacts: string[];
  contradictions: string[];
  limitations: string[];
  recommendations: string[];
  confidenceScore: number;
}

export class EvidenceAggregator {
  /**
   * Aggregate evidence from all sources
   */
  async aggregateEvidence(
    query: string,
    officialSources: any[],
    verifiedKnowledge: any[],
    historicalContext: string[],
    relatedUpdates: string[],
    platformCapabilities: any[]
  ): Promise<EvidenceCollection> {
    const collection: EvidenceCollection = {
      query,
      officialEvidence: this.extractOfficialEvidence(officialSources),
      verifiedEvidence: this.extractVerifiedEvidence(verifiedKnowledge),
      historicalEvidence: this.extractHistoricalEvidence(historicalContext),
      updateEvidence: this.extractUpdateEvidence(relatedUpdates),
      capabilityEvidence: this.extractCapabilityEvidence(platformCapabilities),
      conflictingEvidence: [],
      supportingEvidence: [],
      totalConfidence: 0,
    };

    // Detect conflicts
    collection.conflictingEvidence = this.detectConflicts(
      collection.officialEvidence,
      collection.verifiedEvidence,
      collection.historicalEvidence
    );

    // Identify supporting evidence
    collection.supportingEvidence = this.identifySupportingEvidence(
      collection.officialEvidence,
      collection.verifiedEvidence,
      collection.capabilityEvidence
    );

    // Calculate total confidence
    collection.totalConfidence = this.calculateTotalConfidence(collection);

    return collection;
  }

  /**
   * Extract official evidence
   */
  private extractOfficialEvidence(sources: any[]): Evidence[] {
    return sources.map((source, index) => ({
      id: `official-${index}`,
      source: 'official',
      category: source.source || 'official',
      content: source.content,
      confidence: source.confidence || 95,
      timestamp: source.timestamp || new Date(),
      relatedTopics: this.extractTopics(source.content),
    }));
  }

  /**
   * Extract verified evidence
   */
  private extractVerifiedEvidence(knowledge: any[]): Evidence[] {
    return knowledge.map((item, index) => ({
      id: `verified-${index}`,
      source: 'verified',
      category: item.source || 'verified',
      content: item.fact,
      confidence: item.confidence || 85,
      timestamp: new Date(),
      relatedTopics: this.extractTopics(item.fact),
    }));
  }

  /**
   * Extract historical evidence
   */
  private extractHistoricalEvidence(context: string[]): Evidence[] {
    return context.map((item, index) => ({
      id: `historical-${index}`,
      source: 'historical',
      category: 'history',
      content: item,
      confidence: 75,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      relatedTopics: this.extractTopics(item),
    }));
  }

  /**
   * Extract update evidence
   */
  private extractUpdateEvidence(updates: string[]): Evidence[] {
    return updates.map((item, index) => ({
      id: `update-${index}`,
      source: 'update',
      category: 'platform-update',
      content: item,
      confidence: 80,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      relatedTopics: this.extractTopics(item),
    }));
  }

  /**
   * Extract capability evidence
   */
  private extractCapabilityEvidence(capabilities: any[]): Evidence[] {
    return capabilities.map((item, index) => ({
      id: `capability-${index}`,
      source: 'capability',
      category: item.category || 'capability',
      content: item.description || item.name,
      confidence: item.status === 'stable' ? 90 : 70,
      timestamp: item.released || new Date(),
      relatedTopics: this.extractTopics(item.name),
    }));
  }

  /**
   * Detect conflicting evidence
   */
  private detectConflicts(
    official: Evidence[],
    verified: Evidence[],
    historical: Evidence[]
  ): Evidence[] {
    const conflicts: Evidence[] = [];

    // Compare official with verified
    for (const off of official) {
      for (const ver of verified) {
        if (this.isConflict(off.content, ver.content)) {
          conflicts.push({
            id: `conflict-${off.id}-${ver.id}`,
            source: 'official',
            category: 'conflict',
            content: `Conflict: Official says "${off.content.substring(0, 50)}..." but verified says "${ver.content.substring(0, 50)}..."`,
            confidence: 50,
            timestamp: new Date(),
            relatedTopics: [...off.relatedTopics, ...ver.relatedTopics],
          });
        }
      }
    }

    // Compare current with historical
    for (const cur of official) {
      for (const hist of historical) {
        if (this.hasChanged(cur.content, hist.content)) {
          conflicts.push({
            id: `change-${cur.id}-${hist.id}`,
            source: 'official',
            category: 'change-detected',
            content: `Change detected: ${hist.content.substring(0, 50)}... → ${cur.content.substring(0, 50)}...`,
            confidence: 60,
            timestamp: new Date(),
            relatedTopics: cur.relatedTopics,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Identify supporting evidence
   */
  private identifySupportingEvidence(
    official: Evidence[],
    verified: Evidence[],
    capability: Evidence[]
  ): Evidence[] {
    const supporting: Evidence[] = [];

    // Combine all evidence
    const allEvidence = [...official, ...verified, ...capability];

    for (const evidence of allEvidence) {
      // Count supporting mentions
      const mentions = allEvidence.filter(e =>
        e.relatedTopics.some(t => evidence.relatedTopics.includes(t))
      ).length;

      if (mentions >= 2) {
        supporting.push({
          ...evidence,
          confidence: Math.min(100, evidence.confidence + mentions * 5),
        });
      }
    }

    return supporting.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate total confidence
   */
  private calculateTotalConfidence(collection: EvidenceCollection): number {
    const weights = {
      official: 0.4,
      verified: 0.25,
      capability: 0.2,
      update: 0.1,
      historical: 0.05,
    };

    let totalConfidence = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const evidence = collection[key as keyof EvidenceCollection];
      if (Array.isArray(evidence)) {
        const avgConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / (evidence.length || 1);
        totalConfidence += avgConfidence * weight;
        totalWeight += weight;
      }
    }

    // Reduce confidence based on conflicts
    const conflictPenalty = (collection.conflictingEvidence.length / 10) * 10;
    totalConfidence = Math.max(0, totalConfidence - conflictPenalty);

    return Math.round(totalConfidence);
  }

  /**
   * Synthesize evidence into actionable insights
   */
  synthesizeEvidence(collection: EvidenceCollection): EvidenceSynthesis {
    const mainClaim = this.generateMainClaim(collection);
    const supportingFacts = this.extractSupportingFacts(collection.supportingEvidence);
    const contradictions = this.extractContradictions(collection.conflictingEvidence);
    const limitations = this.identifyLimitations(collection);
    const recommendations = this.generateRecommendations(collection);
    const confidenceScore = collection.totalConfidence;

    return {
      mainClaim,
      supportingFacts,
      contradictions,
      limitations,
      recommendations,
      confidenceScore,
    };
  }

  /**
   * Generate main claim from evidence
   */
  private generateMainClaim(collection: EvidenceCollection): string {
    if (collection.officialEvidence.length > 0) {
      return `According to official sources: ${collection.officialEvidence[0].content.substring(0, 100)}...`;
    }
    if (collection.verifiedEvidence.length > 0) {
      return `Verified information: ${collection.verifiedEvidence[0].content.substring(0, 100)}...`;
    }
    return 'Analysis based on available evidence';
  }

  /**
   * Extract supporting facts
   */
  private extractSupportingFacts(evidence: Evidence[]): string[] {
    return evidence.slice(0, 5).map(e => `${e.content} (${e.confidence}% confidence)`);
  }

  /**
   * Extract contradictions
   */
  private extractContradictions(conflicts: Evidence[]): string[] {
    return conflicts.slice(0, 3).map(c => c.content);
  }

  /**
   * Identify limitations
   */
  private identifyLimitations(collection: EvidenceCollection): string[] {
    const limitations: string[] = [];

    if (collection.officialEvidence.length === 0) {
      limitations.push('No official sources available');
    }

    if (collection.conflictingEvidence.length > 0) {
      limitations.push(`${collection.conflictingEvidence.length} conflicting sources detected`);
    }

    if (collection.totalConfidence < 70) {
      limitations.push('Low overall confidence score');
    }

    const oldestEvidence = Math.max(...[
      ...collection.officialEvidence,
      ...collection.verifiedEvidence,
    ].map(e => new Date(e.timestamp).getTime()));
    const daysOld = Math.floor((Date.now() - oldestEvidence) / (1000 * 60 * 60 * 24));
    if (daysOld > 30) {
      limitations.push(`Oldest evidence is ${daysOld} days old`);
    }

    return limitations;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(collection: EvidenceCollection): string[] {
    const recommendations: string[] = [];

    if (collection.officialEvidence.length > 0) {
      recommendations.push('Follow official documentation as primary guide');
    }

    if (collection.conflictingEvidence.length > 0) {
      recommendations.push('Verify conflicting information with official sources before implementation');
    }

    if (collection.capabilityEvidence.length > 0) {
      recommendations.push('Leverage available platform capabilities to optimize implementation');
    }

    if (collection.totalConfidence < 70) {
      recommendations.push('Request clarification or updated information on uncertain areas');
    }

    recommendations.push('Validate recommendations with your team before proceeding');

    return recommendations;
  }

  /**
   * Helper: Extract topics from text
   */
  private extractTopics(text: string): string[] {
    const keywords = [
      'mainnet',
      'kyc',
      'wallet',
      'app studio',
      'sdk',
      'browser',
      'payments',
      'nodes',
      'identity',
      'notifications',
    ];
    return keywords.filter(k => text.toLowerCase().includes(k));
  }

  /**
   * Helper: Check if two pieces of evidence conflict
   */
  private isConflict(text1: string, text2: string): boolean {
    const keywords = ['yes', 'no', 'enabled', 'disabled', 'supported', 'unsupported', 'available', 'unavailable'];
    const hasDifferent = keywords.some(
      k => (text1.toLowerCase().includes(k) && !text2.toLowerCase().includes(k)) ||
            (!text1.toLowerCase().includes(k) && text2.toLowerCase().includes(k))
    );
    return hasDifferent && text1.toLowerCase() !== text2.toLowerCase();
  }

  /**
   * Helper: Check if information has changed
   */
  private hasChanged(current: string, historical: string): boolean {
    const similarity = this.calculateSimilarity(current, historical);
    return similarity < 0.7; // 30% difference threshold
  }

  /**
   * Helper: Calculate text similarity (Levenshtein-like)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;
    if (longer.length === 0) return 1.0;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Helper: Levenshtein distance calculation
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
}

export default new EvidenceAggregator();
