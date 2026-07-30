export interface OptimizationTarget {
  engineType: string;
  currentScore: number;
  targetScore: number;
  gaps: string[];
}

export interface OptimizationPlan {
  target: OptimizationTarget;
  actions: OptimizationAction[];
  expectedOutcome: string;
  timeline: string;
}

export interface OptimizationAction {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: number;
  potentialGain: number;
  dependencies: string[];
}

class LearningOptimizer {
  private optimizationHistory: Map<string, OptimizationPlan[]> = new Map();

  generateOptimizationPlan(engineType: string, currentMetrics: any, targetMetrics: any): OptimizationPlan {
    const gaps: string[] = [];

    if (currentMetrics.successRate < targetMetrics.successRate) {
      gaps.push(`Success rate gap: ${((targetMetrics.successRate - currentMetrics.successRate) * 100).toFixed(1)}%`);
    }
    if (currentMetrics.averageRating < targetMetrics.averageRating) {
      gaps.push(`Rating gap: ${(targetMetrics.averageRating - currentMetrics.averageRating).toFixed(1)} points`);
    }
    if (currentMetrics.adoptionRate < targetMetrics.adoptionRate) {
      gaps.push(`Adoption gap: ${((targetMetrics.adoptionRate - currentMetrics.adoptionRate) * 100).toFixed(1)}%`);
    }

    const actions = this.generateActions(engineType, gaps, currentMetrics);

    const plan: OptimizationPlan = {
      target: {
        engineType,
        currentScore: this.calculateScore(currentMetrics),
        targetScore: this.calculateScore(targetMetrics),
        gaps,
      },
      actions,
      expectedOutcome: `Improvement from ${this.calculateScore(currentMetrics).toFixed(2)} to ${this.calculateScore(targetMetrics).toFixed(2)}`,
      timeline: '2-4 weeks',
    };

    if (!this.optimizationHistory.has(engineType)) {
      this.optimizationHistory.set(engineType, []);
    }
    this.optimizationHistory.get(engineType)!.push(plan);

    return plan;
  }

  private calculateScore(metrics: any): number {
    return (metrics.successRate * 0.4 + (metrics.averageRating / 5) * 0.3 + metrics.adoptionRate * 0.2 + metrics.completionRate * 0.1) * 100;
  }

  private generateActions(engineType: string, gaps: string[], metrics: any): OptimizationAction[] {
    const actions: OptimizationAction[] = [];

    if (gaps.some(g => g.includes('Success rate'))) {
      actions.push({
        id: `action-${Date.now()}-1`,
        title: 'Improve Success Rate',
        description: 'Enhance recommendation accuracy and reduce false positives',
        priority: 'high',
        estimatedEffort: 20,
        potentialGain: 0.15,
        dependencies: [],
      });
    }

    if (gaps.some(g => g.includes('Rating gap'))) {
      actions.push({
        id: `action-${Date.now()}-2`,
        title: 'Increase User Satisfaction',
        description: 'Refine personalization and improve response quality',
        priority: 'high',
        estimatedEffort: 25,
        potentialGain: 0.8,
        dependencies: [],
      });
    }

    if (gaps.some(g => g.includes('Adoption gap'))) {
      actions.push({
        id: `action-${Date.now()}-3`,
        title: 'Boost Adoption',
        description: 'Improve discoverability and user awareness',
        priority: 'medium',
        estimatedEffort: 15,
        potentialGain: 0.2,
        dependencies: [],
      });
    }

    actions.push({
      id: `action-${Date.now()}-4`,
      title: 'Performance Monitoring',
      description: 'Set up continuous metrics tracking and alerts',
      priority: 'medium',
      estimatedEffort: 10,
      potentialGain: 0.05,
      dependencies: [],
    });

    return actions;
  }

  prioritizeActions(actions: OptimizationAction[]): OptimizationAction[] {
    return actions.sort((a, b) => {
      const priorityScore = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityScore[a.priority];
      const bPriority = priorityScore[b.priority];
      
      if (bPriority !== aPriority) return bPriority - aPriority;
      return (b.potentialGain / b.estimatedEffort) - (a.potentialGain / a.estimatedEffort);
    });
  }

  getOptimizationHistory(engineType: string): OptimizationPlan[] {
    return this.optimizationHistory.get(engineType) || [];
  }

  calculateROI(action: OptimizationAction): number {
    return (action.potentialGain / action.estimatedEffort) * 100;
  }

  estimateImpact(action: OptimizationAction, affectedUsers: number): {
    users: number;
    estimatedScore: number;
    timeframe: string;
  } {
    return {
      users: Math.ceil(affectedUsers * (1 - Math.exp(-action.potentialGain))),
      estimatedScore: action.potentialGain * 100,
      timeframe: action.estimatedEffort <= 10 ? '1 week' : action.estimatedEffort <= 20 ? '2 weeks' : '3-4 weeks',
    };
  }
}

export const learningOptimizer = new LearningOptimizer();
