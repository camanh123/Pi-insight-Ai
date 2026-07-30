// Feature prioritization engine for product decisions
export interface FeaturePriority {
  featureId: string;
  name: string;
  businessValue: number;
  userImpact: number;
  effortEstimate: number;
  priorityScore: number;
  rank: number;
  userDemand: number;
  strategicAlignment: number;
  technicalDebt: number;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedROI: number;
  quarterRecommendation: string;
}

export interface PrioritizationMetrics {
  topPriorities: FeaturePriority[];
  mediumPriorities: FeaturePriority[];
  lowPriorities: FeaturePriority[];
  deferredFeatures: FeaturePriority[];
  technicalDebtItems: FeaturePriority[];
  totalUniqueRequests: number;
  averagePriorityScore: number;
}

export class FeaturePrioritizer {
  prioritizeFeatures(requestedFeatures: Record<string, any>, constraints: {
    maxCapacity: number;
    strategicFocus: string[];
    platformConstraints: string[];
  }): PrioritizationMetrics {
    const features = this.scoreFeatures(requestedFeatures);
    const sorted = features.sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      topPriorities: sorted.filter(f => f.priorityScore >= 85).slice(0, 5),
      mediumPriorities: sorted.filter(f => f.priorityScore >= 65 && f.priorityScore < 85).slice(0, 10),
      lowPriorities: sorted.filter(f => f.priorityScore >= 45 && f.priorityScore < 65),
      deferredFeatures: sorted.filter(f => f.priorityScore < 45),
      technicalDebtItems: this.identifyTechnicalDebt(sorted),
      totalUniqueRequests: features.length,
      averagePriorityScore: Math.round(features.reduce((s, f) => s + f.priorityScore, 0) / features.length),
    };
  }

  private scoreFeatures(requestedFeatures: Record<string, any>): FeaturePriority[] {
    const defaultFeatures: Record<string, any> = {
      'ai-conversation-history': {
        businessValue: 85,
        userImpact: 80,
        effortEstimate: 40,
        userDemand: 92,
        strategicAlignment: 78,
      },
      'offline-mode': {
        businessValue: 60,
        userImpact: 70,
        effortEstimate: 80,
        userDemand: 65,
        strategicAlignment: 55,
      },
      'multi-language-support': {
        businessValue: 75,
        userImpact: 85,
        effortEstimate: 60,
        userDemand: 88,
        strategicAlignment: 82,
      },
      'mobile-app': {
        businessValue: 90,
        userImpact: 95,
        effortEstimate: 120,
        userDemand: 98,
        strategicAlignment: 95,
      },
      'voice-assistant': {
        businessValue: 70,
        userImpact: 75,
        effortEstimate: 100,
        userDemand: 72,
        strategicAlignment: 68,
      },
    };

    const scored: FeaturePriority[] = [];
    let rank = 1;

    Object.entries(defaultFeatures).forEach(([featureId, data]) => {
      const priorityScore = this.calculatePriorityScore(data);
      const roi = this.calculateROI(data, priorityScore);

      scored.push({
        featureId,
        name: this.formatFeatureName(featureId),
        businessValue: data.businessValue,
        userImpact: data.userImpact,
        effortEstimate: data.effortEstimate,
        priorityScore,
        rank: 0,
        userDemand: data.userDemand,
        strategicAlignment: data.strategicAlignment,
        technicalDebt: this.assessTechnicalDebt(featureId),
        riskLevel: this.assessRisk(data.effortEstimate),
        estimatedROI: roi,
        quarterRecommendation: this.recommendQuarter(priorityScore),
      });
    });

    scored.sort((a, b) => b.priorityScore - a.priorityScore);
    scored.forEach((f, i) => { f.rank = i + 1; });

    return scored;
  }

  private calculatePriorityScore(data: any): number {
    // RICE scoring: (Reach × Impact × Confidence) / Effort
    const reach = Math.min(data.userDemand, 100);
    const impact = data.userImpact;
    const confidence = 85;
    const effort = Math.max(data.effortEstimate, 1);

    const riceScore = (reach * impact * confidence) / (effort * 10);
    const businessScore = (data.businessValue * 0.35) + (data.strategicAlignment * 0.25);
    
    return Math.round((riceScore + businessScore) / 2);
  }

  private calculateROI(data: any, priorityScore: number): number {
    const value = (data.businessValue + data.userImpact + data.userDemand) / 3;
    const cost = data.effortEstimate;
    return Math.round((value / cost) * 100);
  }

  private assessTechnicalDebt(featureId: string): number {
    const debtMap: Record<string, number> = {
      'ai-conversation-history': 15,
      'offline-mode': 35,
      'multi-language-support': 20,
      'mobile-app': 45,
      'voice-assistant': 40,
    };
    return debtMap[featureId] || 0;
  }

  private assessRisk(effort: number): 'low' | 'medium' | 'high' {
    if (effort < 40) return 'low';
    if (effort < 80) return 'medium';
    return 'high';
  }

  private recommendQuarter(score: number): string {
    if (score >= 85) return 'Q1';
    if (score >= 75) return 'Q1-Q2';
    if (score >= 65) return 'Q2-Q3';
    return 'Q3-Q4';
  }

  private formatFeatureName(id: string): string {
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  private identifyTechnicalDebt(sorted: FeaturePriority[]): FeaturePriority[] {
    return sorted.filter(f => f.technicalDebt > 20).slice(0, 3);
  }
}
