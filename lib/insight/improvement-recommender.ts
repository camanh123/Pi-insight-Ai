export interface ImprovementRecommendation {
  engineType: string;
  category: 'accuracy' | 'relevance' | 'speed' | 'adoption' | 'satisfaction';
  recommendation: string;
  rationale: string;
  implementation: string;
  estimatedImpact: string;
  confidence: number;
  priority: number;
}

class ImprovementRecommender {
  private recommendations: Map<string, ImprovementRecommendation[]> = new Map();
  private implementedCount: number = 0;

  generateRecommendations(engineType: string, metrics: any, feedback: any[]): ImprovementRecommendation[] {
    const recs: ImprovementRecommendation[] = [];

    // Accuracy recommendations
    if (metrics.successRate < 0.7) {
      recs.push({
        engineType,
        category: 'accuracy',
        recommendation: 'Implement confidence thresholding for recommendations',
        rationale: `Success rate of ${(metrics.successRate * 100).toFixed(1)}% indicates potential false positives`,
        implementation: 'Filter recommendations below 75% confidence threshold',
        estimatedImpact: 'Improve success rate by 15-20%',
        confidence: 0.85,
        priority: 1,
      });
    }

    // Relevance recommendations
    if (metrics.averageRating < 3.5) {
      recs.push({
        engineType,
        category: 'relevance',
        recommendation: 'Enhance user context retrieval accuracy',
        rationale: `Low average rating (${metrics.averageRating.toFixed(1)}/5) suggests recommendations miss user needs`,
        implementation: 'Expand context window and improve semantic matching',
        estimatedImpact: 'Increase rating by 0.5-1.0 points',
        confidence: 0.9,
        priority: 1,
      });
    }

    // Speed recommendations
    const avgTime = feedback.length > 0 
      ? feedback.reduce((sum: number, f: any) => sum + f.timeToCompletion, 0) / feedback.length 
      : 0;
    
    if (avgTime > 5000) {
      recs.push({
        engineType,
        category: 'speed',
        recommendation: 'Optimize response time performance',
        rationale: `Average response time of ${avgTime.toFixed(0)}ms exceeds optimal 2000ms target`,
        implementation: 'Implement caching, parallel processing, and query optimization',
        estimatedImpact: 'Reduce response time by 40-60%',
        confidence: 0.8,
        priority: 2,
      });
    }

    // Adoption recommendations
    if (metrics.adoptionRate < 0.6) {
      recs.push({
        engineType,
        category: 'adoption',
        recommendation: 'Increase feature discoverability',
        rationale: `Low adoption rate (${(metrics.adoptionRate * 100).toFixed(1)}%) indicates awareness gap`,
        implementation: 'Add onboarding, improve UI visibility, send proactive tips',
        estimatedImpact: 'Increase adoption by 25-40%',
        confidence: 0.75,
        priority: 2,
      });
    }

    // Satisfaction recommendations
    const negativeRatings = feedback.filter((f: any) => f.userRating <= 2).length;
    if (negativeRatings / feedback.length > 0.2) {
      recs.push({
        engineType,
        category: 'satisfaction',
        recommendation: 'Address user satisfaction issues',
        rationale: `${((negativeRatings / feedback.length) * 100).toFixed(1)}% negative feedback indicates satisfaction problem`,
        implementation: 'Review negative feedback, prioritize pain points, implement fixes',
        estimatedImpact: 'Reduce negative feedback by 50%',
        confidence: 0.9,
        priority: 1,
      });
    }

    recs.sort((a, b) => b.priority - a.priority || b.confidence - a.confidence);

    if (!this.recommendations.has(engineType)) {
      this.recommendations.set(engineType, []);
    }
    this.recommendations.get(engineType)!.push(...recs);

    return recs;
  }

  getRecommendations(engineType: string): ImprovementRecommendation[] {
    return this.recommendations.get(engineType) || [];
  }

  prioritizeByImpact(recommendations: ImprovementRecommendation[]): ImprovementRecommendation[] {
    return recommendations.sort((a, b) => {
      const scoreA = a.priority * a.confidence;
      const scoreB = b.priority * b.confidence;
      return scoreB - scoreA;
    });
  }

  getTopRecommendations(engineType: string, count: number = 3): ImprovementRecommendation[] {
    const recs = this.getRecommendations(engineType);
    return this.prioritizeByImpact(recs).slice(0, count);
  }

  markImplemented(recommendation: ImprovementRecommendation): void {
    this.implementedCount++;
  }

  getImplementationRate(): number {
    const total = Array.from(this.recommendations.values()).flat().length;
    return total > 0 ? (this.implementedCount / total) * 100 : 0;
  }

  getCategoryBreakdown(engineType: string) {
    const recs = this.getRecommendations(engineType);
    const breakdown = {
      accuracy: recs.filter(r => r.category === 'accuracy').length,
      relevance: recs.filter(r => r.category === 'relevance').length,
      speed: recs.filter(r => r.category === 'speed').length,
      adoption: recs.filter(r => r.category === 'adoption').length,
      satisfaction: recs.filter(r => r.category === 'satisfaction').length,
    };
    return breakdown;
  }
}

export const improvementRecommender = new ImprovementRecommender();
