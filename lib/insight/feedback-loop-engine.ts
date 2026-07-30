import { NextResponse } from 'next/server';

export interface FeedbackEntry {
  id: string;
  userId: string;
  engineType: 'reasoning' | 'agent' | 'memory' | 'recommendation' | 'reasoning-module-bridge';
  actionId: string;
  outcome: 'success' | 'partial' | 'neutral' | 'failure';
  userRating: number;
  timeToCompletion: number;
  completionDate: Date;
  metadata: Record<string, any>;
}

export interface EngineMetrics {
  engineType: string;
  successRate: number;
  averageRating: number;
  adoptionRate: number;
  completionRate: number;
  improvementTrend: number;
  anomalyScore: number;
}

export interface LearningInsight {
  pattern: string;
  confidence: number;
  recommendation: string;
  affectedUsers: number;
  potentialImpact: string;
}

class FeedbackLoopEngine {
  private feedbackStore: Map<string, FeedbackEntry[]> = new Map();
  private metricsCache: Map<string, EngineMetrics> = new Map();
  private learningInsights: LearningInsight[] = [];

  async recordFeedback(entry: FeedbackEntry): Promise<void> {
    const userId = entry.userId;
    if (!this.feedbackStore.has(userId)) {
      this.feedbackStore.set(userId, []);
    }
    this.feedbackStore.get(userId)!.push(entry);
    await this.updateMetrics(entry.engineType);
  }

  private async updateMetrics(engineType: string): Promise<void> {
    const allFeedback = Array.from(this.feedbackStore.values()).flat();
    const engineFeedback = allFeedback.filter(f => f.engineType === engineType);
    
    if (engineFeedback.length === 0) return;

    const successCount = engineFeedback.filter(f => f.outcome === 'success').length;
    const ratings = engineFeedback.map(f => f.userRating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const trend = this.calculateTrend(engineType);

    this.metricsCache.set(engineType, {
      engineType,
      successRate: successCount / engineFeedback.length,
      averageRating: avgRating,
      adoptionRate: engineFeedback.length / this.feedbackStore.size,
      completionRate: engineFeedback.filter(f => f.outcome !== 'neutral').length / engineFeedback.length,
      improvementTrend: trend,
      anomalyScore: 0,
    });
  }

  private calculateTrend(engineType: string): number {
    const feedback = Array.from(this.feedbackStore.values())
      .flat()
      .filter(f => f.engineType === engineType)
      .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime())
      .slice(0, 20);

    if (feedback.length < 2) return 0;

    const recent = feedback.slice(0, 10).map(f => f.userRating).reduce((a, b) => a + b, 0) / 10;
    const older = feedback.slice(10, 20).map(f => f.userRating).reduce((a, b) => a + b, 0) / 10;

    return (recent - older) / older;
  }

  getEngineMetrics(engineType: string): EngineMetrics | undefined {
    return this.metricsCache.get(engineType);
  }

  getAllMetrics(): EngineMetrics[] {
    return Array.from(this.metricsCache.values());
  }

  identifyLearningPatterns(): LearningInsight[] {
    const insights: LearningInsight[] = [];
    const allFeedback = Array.from(this.feedbackStore.values()).flat();

    // Pattern 1: High-rated actions by engine type
    const engineRatings = new Map<string, number[]>();
    allFeedback.forEach(f => {
      if (!engineRatings.has(f.engineType)) {
        engineRatings.set(f.engineType, []);
      }
      engineRatings.get(f.engineType)!.push(f.userRating);
    });

    engineRatings.forEach((ratings, engineType) => {
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (avgRating >= 4.5) {
        insights.push({
          pattern: `High user satisfaction with ${engineType}`,
          confidence: 0.9,
          recommendation: `Continue optimizing ${engineType}`,
          affectedUsers: this.feedbackStore.size,
          potentialImpact: 'Improved user satisfaction',
        });
      }
    });

    // Pattern 2: Completion time analysis
    const completionTimes = allFeedback.map(f => f.timeToCompletion);
    const avgTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
    insights.push({
      pattern: `Average action completion time: ${avgTime.toFixed(0)} seconds`,
      confidence: 0.85,
      recommendation: 'Monitor for improvements in recommendation timeliness',
      affectedUsers: allFeedback.length,
      potentialImpact: 'Better user experience through faster actions',
    });

    this.learningInsights = insights;
    return insights;
  }

  detectAnomalies(): Array<{ anomaly: string; severity: 'low' | 'medium' | 'high' }> {
    const anomalies = [];
    const metrics = this.getAllMetrics();

    metrics.forEach(m => {
      if (m.successRate < 0.5) {
        anomalies.push({
          anomaly: `${m.engineType} has low success rate (${(m.successRate * 100).toFixed(1)}%)`,
          severity: 'high',
        });
      }
      if (m.averageRating < 2.5) {
        anomalies.push({
          anomaly: `${m.engineType} has low average rating (${m.averageRating.toFixed(1)}/5)`,
          severity: 'high',
        });
      }
      if (m.improvementTrend < -0.1) {
        anomalies.push({
          anomaly: `${m.engineType} shows negative improvement trend`,
          severity: 'medium',
        });
      }
    });

    return anomalies;
  }

  generateReport() {
    return {
      timestamp: new Date(),
      totalFeedback: Array.from(this.feedbackStore.values()).flat().length,
      uniqueUsers: this.feedbackStore.size,
      engineMetrics: this.getAllMetrics(),
      learningInsights: this.learningInsights,
      anomalies: this.detectAnomalies(),
    };
  }
}

export const feedbackEngine = new FeedbackLoopEngine();
