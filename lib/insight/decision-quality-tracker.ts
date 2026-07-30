/**
 * Decision Quality Tracker
 * Tracks reasoning decision quality and continuously improves
 * the AI Reasoning Engine over time
 */

export interface DecisionRecord {
  id: string;
  reasoningId: string;
  query: string;
  recommendedPath: string;
  confidence: number;
  timestamp: Date;
  outcome: 'successful' | 'partial' | 'unsuccessful' | 'pending';
  userFeedback?: string;
  metrics: {
    accuracy: number; // 0-100
    helpfulness: number; // 0-100
    timeToResult: number; // seconds
    resourcesUsed: number;
  };
  improvements?: string[];
}

export interface QualityMetrics {
  totalDecisions: number;
  successRate: number;
  averageAccuracy: number;
  averageHelpfulness: number;
  improvementTrend: number;
  topRecommendations: string[];
  failurePatterns: string[];
  improvementOpportunities: string[];
}

export interface FeedbackEntry {
  decisionId: string;
  feedback: string;
  rating: 1 | 2 | 3 | 4 | 5;
  timestamp: Date;
  userComments: string;
}

export class DecisionQualityTracker {
  private decisions: DecisionRecord[] = [];
  private feedbackEntries: FeedbackEntry[] = [];
  private improvementLog: Array<{ date: Date; improvement: string }> = [];

  /**
   * Record a reasoning decision
   */
  recordDecision(
    reasoningId: string,
    query: string,
    recommendedPath: string,
    confidence: number
  ): DecisionRecord {
    const decision: DecisionRecord = {
      id: `decision-${Date.now()}`,
      reasoningId,
      query,
      recommendedPath,
      confidence,
      timestamp: new Date(),
      outcome: 'pending',
      metrics: {
        accuracy: 0,
        helpfulness: 0,
        timeToResult: 0,
        resourcesUsed: 0,
      },
    };

    this.decisions.push(decision);
    return decision;
  }

  /**
   * Update decision outcome
   */
  updateOutcome(
    decisionId: string,
    outcome: 'successful' | 'partial' | 'unsuccessful',
    metrics: {
      accuracy: number;
      helpfulness: number;
      timeToResult: number;
      resourcesUsed: number;
    }
  ): void {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (decision) {
      decision.outcome = outcome;
      decision.metrics = metrics;
    }
  }

  /**
   * Record user feedback
   */
  recordFeedback(
    decisionId: string,
    feedback: string,
    rating: 1 | 2 | 3 | 4 | 5,
    userComments: string
  ): FeedbackEntry {
    const entry: FeedbackEntry = {
      decisionId,
      feedback,
      rating,
      timestamp: new Date(),
      userComments,
    };

    this.feedbackEntries.push(entry);

    // Update decision outcome based on rating
    const decision = this.decisions.find(d => d.id === decisionId);
    if (decision) {
      if (rating >= 4) {
        decision.outcome = 'successful';
        decision.metrics.helpfulness = rating * 20;
      } else if (rating === 3) {
        decision.outcome = 'partial';
        decision.metrics.helpfulness = 60;
      } else {
        decision.outcome = 'unsuccessful';
        decision.metrics.helpfulness = rating * 20;
      }
    }

    // Analyze and record improvements
    this.analyzeAndImprove(decisionId, feedback, rating);

    return entry;
  }

  /**
   * Calculate quality metrics
   */
  getQualityMetrics(): QualityMetrics {
    if (this.decisions.length === 0) {
      return {
        totalDecisions: 0,
        successRate: 0,
        averageAccuracy: 0,
        averageHelpfulness: 0,
        improvementTrend: 0,
        topRecommendations: [],
        failurePatterns: [],
        improvementOpportunities: [],
      };
    }

    const successCount = this.decisions.filter(d => d.outcome === 'successful').length;
    const successRate = (successCount / this.decisions.length) * 100;

    const averageAccuracy =
      this.decisions.reduce((sum, d) => sum + d.metrics.accuracy, 0) / this.decisions.length;

    const averageHelpfulness =
      this.decisions.reduce((sum, d) => sum + d.metrics.helpfulness, 0) / this.decisions.length;

    const improvementTrend = this.calculateImprovementTrend();
    const topRecommendations = this.identifyTopRecommendations();
    const failurePatterns = this.identifyFailurePatterns();
    const improvementOpportunities = this.identifyImprovementOpportunities();

    return {
      totalDecisions: this.decisions.length,
      successRate,
      averageAccuracy,
      averageHelpfulness,
      improvementTrend,
      topRecommendations,
      failurePatterns,
      improvementOpportunities,
    };
  }

  /**
   * Analyze feedback and generate improvements
   */
  private analyzeAndImprove(decisionId: string, feedback: string, rating: number): void {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) return;

    const improvements: string[] = [];

    // Analyze feedback patterns
    if (feedback.toLowerCase().includes('too complex')) {
      improvements.push('Simplify recommendation explanations');
      improvements.push('Add more beginner-friendly alternatives');
    }

    if (feedback.toLowerCase().includes('missing')) {
      improvements.push('Gather more comprehensive information');
      improvements.push('Include additional verification sources');
    }

    if (feedback.toLowerCase().includes('risky')) {
      improvements.push('Enhance risk assessment');
      improvements.push('Provide more mitigation strategies');
    }

    if (rating < 3) {
      improvements.push('Review confidence score calculation');
      improvements.push('Increase evidence gathering');
      improvements.push('Cross-validate with multiple sources');
    }

    if (improvements.length > 0) {
      decision.improvements = improvements;

      // Log improvements
      for (const improvement of improvements) {
        this.improvementLog.push({
          date: new Date(),
          improvement,
        });
      }
    }
  }

  /**
   * Calculate improvement trend
   */
  private calculateImprovementTrend(): number {
    if (this.decisions.length < 2) return 0;

    const recent = this.decisions.slice(-10);
    const older = this.decisions.slice(-20, -10);

    const recentAvg =
      recent.reduce((sum, d) => sum + (d.outcome === 'successful' ? 1 : 0), 0) / recent.length;
    const olderAvg =
      older.length > 0
        ? older.reduce((sum, d) => sum + (d.outcome === 'successful' ? 1 : 0), 0) / older.length
        : 0;

    return (recentAvg - olderAvg) * 100;
  }

  /**
   * Identify top recommendations
   */
  private identifyTopRecommendations(): string[] {
    const recommendations: Record<string, number> = {};

    for (const decision of this.decisions) {
      if (decision.outcome === 'successful') {
        recommendations[decision.recommendedPath] =
          (recommendations[decision.recommendedPath] || 0) + 1;
      }
    }

    return Object.entries(recommendations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([rec]) => rec);
  }

  /**
   * Identify failure patterns
   */
  private identifyFailurePatterns(): string[] {
    const patterns: Record<string, number> = {};

    for (const decision of this.decisions) {
      if (decision.outcome === 'unsuccessful') {
        // Check confidence level at time of failure
        if (decision.confidence < 60) {
          patterns['Low confidence recommendations'] =
            (patterns['Low confidence recommendations'] || 0) + 1;
        }

        // Check if improvements were identified
        if (decision.improvements) {
          for (const improvement of decision.improvements) {
            patterns[improvement] = (patterns[improvement] || 0) + 1;
          }
        }
      }
    }

    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern]) => pattern);
  }

  /**
   * Identify improvement opportunities
   */
  private identifyImprovementOpportunities(): string[] {
    const opportunities: string[] = [];

    const metrics = this.getQualityMetrics();

    if (metrics.successRate < 80) {
      opportunities.push(`Increase success rate (currently ${Math.round(metrics.successRate)}%)`);
    }

    if (metrics.averageAccuracy < 75) {
      opportunities.push(`Improve accuracy (currently ${Math.round(metrics.averageAccuracy)}%)`);
    }

    if (metrics.averageHelpfulness < 75) {
      opportunities.push(`Enhance helpfulness (currently ${Math.round(metrics.averageHelpfulness)}%)`);
    }

    // Most common improvements from feedback
    const improvementCounts: Record<string, number> = {};
    for (const entry of this.improvementLog) {
      improvementCounts[entry.improvement] = (improvementCounts[entry.improvement] || 0) + 1;
    }

    const topImprovements = Object.entries(improvementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([imp]) => imp);

    opportunities.push(...topImprovements);

    return opportunities.slice(0, 5);
  }

  /**
   * Get recent decisions
   */
  getRecentDecisions(limit: number = 10): DecisionRecord[] {
    return this.decisions.slice(-limit);
  }

  /**
   * Get feedback summary
   */
  getFeedbackSummary(): {
    totalFeedback: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    commonFeedbackThemes: Record<string, number>;
  } {
    if (this.feedbackEntries.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        ratingDistribution: {},
        commonFeedbackThemes: {},
      };
    }

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const commonThemes: Record<string, number> = {};

    let totalRating = 0;

    for (const entry of this.feedbackEntries) {
      ratingDistribution[entry.rating]++;
      totalRating += entry.rating;

      // Extract common themes from feedback
      const words = entry.feedback.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 4) {
          commonThemes[word] = (commonThemes[word] || 0) + 1;
        }
      }
    }

    const averageRating = totalRating / this.feedbackEntries.length;

    return {
      totalFeedback: this.feedbackEntries.length,
      averageRating,
      ratingDistribution,
      commonFeedbackThemes: Object.fromEntries(
        Object.entries(commonThemes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
      ),
    };
  }

  /**
   * Generate improvement report
   */
  generateImprovementReport(): string {
    const metrics = this.getQualityMetrics();
    const feedback = this.getFeedbackSummary();

    let report = `# Reasoning Engine Quality Report\n\n`;
    report += `## Metrics\n`;
    report += `- Total Decisions: ${metrics.totalDecisions}\n`;
    report += `- Success Rate: ${Math.round(metrics.successRate)}%\n`;
    report += `- Average Accuracy: ${Math.round(metrics.averageAccuracy)}%\n`;
    report += `- Average Helpfulness: ${Math.round(metrics.averageHelpfulness)}%\n`;
    report += `- Improvement Trend: ${metrics.improvementTrend > 0 ? '+' : ''}${Math.round(metrics.improvementTrend)}%\n\n`;

    report += `## Feedback Summary\n`;
    report += `- Total Feedback Entries: ${feedback.totalFeedback}\n`;
    report += `- Average Rating: ${feedback.averageRating.toFixed(2)}/5\n`;
    report += `- Rating Distribution: ${JSON.stringify(feedback.ratingDistribution)}\n\n`;

    report += `## Top Recommendations\n`;
    for (const rec of metrics.topRecommendations) {
      report += `- ${rec}\n`;
    }

    report += `\n## Failure Patterns\n`;
    for (const pattern of metrics.failurePatterns) {
      report += `- ${pattern}\n`;
    }

    report += `\n## Improvement Opportunities\n`;
    for (const opp of metrics.improvementOpportunities) {
      report += `- ${opp}\n`;
    }

    return report;
  }
}

export default new DecisionQualityTracker();
