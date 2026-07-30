// Agent Relevance Scorer - prioritizes actions using AI scoring
// Ensures no irrelevant notifications are sent
// Internal-only

export interface RelevanceFactors {
  userMatch: number; // 0-100: how well matches user profile
  timelinessScore: number; // 0-100: urgency/importance
  contextRelevance: number; // 0-100: fits current context
  learningAlignment: number; // 0-100: helps reach goals
  noveltyScore: number; // 0-100: new information value
  actionablility: number; // 0-100: user can act on it
}

export interface RelevanceResult {
  score: number; // Final 0-100 score
  factors: RelevanceFactors;
  recommendation: 'send' | 'send_delayed' | 'suppress' | 'archive';
  confidence: number; // 0-100 confidence in recommendation
  explanation: string;
}

class RelevanceScorer {
  private MIN_SEND_THRESHOLD = 60; // Minimum score to send notification
  private MIN_ACTIONABLE_THRESHOLD = 45; // Minimum score to suggest learning path
  private CRITICAL_OVERRIDE_THRESHOLD = 85; // Always send if critical

  scoreRelevance(
    userId: string,
    content: { official: string; analysis: string; suggestion: string },
    userContext: {
      learningAreas: string[];
      goals: string[];
      completedTopics: string[];
      preferences: Record<string, unknown>;
      lastActivityTime: Date;
    },
    historicalContext: {
      recentNotifications: Array<{ topic: string; timestamp: Date }>;
      engagementRates: Record<string, number>;
      dismissedTopics: string[];
    }
  ): RelevanceResult {
    const factors = this.calculateRelevanceFactors(
      content,
      userContext,
      historicalContext
    );

    const score = this.calculateFinalScore(factors);
    const recommendation = this.determineRecommendation(
      score,
      factors,
      userContext
    );
    const confidence = this.calculateConfidence(factors);

    return {
      score,
      factors,
      recommendation,
      confidence,
      explanation: this.generateExplanation(score, factors, recommendation),
    };
  }

  private calculateRelevanceFactors(
    content: { official: string; analysis: string; suggestion: string },
    userContext: {
      learningAreas: string[];
      goals: string[];
      completedTopics: string[];
      preferences: Record<string, unknown>;
      lastActivityTime: Date;
    },
    historicalContext: {
      recentNotifications: Array<{ topic: string; timestamp: Date }>;
      engagementRates: Record<string, number>;
      dismissedTopics: string[];
    }
  ): RelevanceFactors {
    return {
      userMatch: this.scoreUserMatch(content, userContext),
      timelinessScore: this.scoreTimeliness(content, historicalContext),
      contextRelevance: this.scoreContextRelevance(
        content,
        userContext,
        historicalContext
      ),
      learningAlignment: this.scoreLearningAlignment(content, userContext),
      noveltyScore: this.scoreNovelty(content, historicalContext),
      actionablility: this.scoreActionability(content, userContext),
    };
  }

  private scoreUserMatch(
    content: { official: string; analysis: string; suggestion: string },
    userContext: {
      learningAreas: string[];
      goals: string[];
      completedTopics: string[];
      preferences: Record<string, unknown>;
    }
  ): number {
    let score = 0;
    const contentLower = `${content.official} ${content.analysis}`.toLowerCase();

    // Check against learning areas
    const learningAreaMatches = userContext.learningAreas.filter((area) =>
      contentLower.includes(area.toLowerCase())
    ).length;
    score += (learningAreaMatches / Math.max(userContext.learningAreas.length, 1)) * 40;

    // Check against goals
    const goalMatches = userContext.goals.filter((goal) =>
      contentLower.includes(goal.toLowerCase())
    ).length;
    score += (goalMatches / Math.max(userContext.goals.length, 1)) * 30;

    // Check if building on completed knowledge
    const relevantKnowledge = userContext.completedTopics.filter((topic) =>
      contentLower.includes(topic.toLowerCase())
    ).length;
    score += (relevantKnowledge / Math.max(userContext.completedTopics.length, 1)) * 30;

    return Math.min(100, score);
  }

  private scoreTimeliness(
    content: { official: string; analysis: string; suggestion: string },
    historicalContext: {
      recentNotifications: Array<{ topic: string; timestamp: Date }>;
      engagementRates: Record<string, number>;
      dismissedTopics: string[];
    }
  ): number {
    let score = 50; // Base score

    // Critical keywords boost timeliness
    const urgentKeywords = [
      'breaking',
      'security',
      'critical',
      'urgent',
      'mainnet',
      'deprecated',
    ];
    const hasCritical = urgentKeywords.some((k) =>
      content.official.toLowerCase().includes(k)
    );
    if (hasCritical) score += 30;

    // Check for notification fatigue
    const recentCount = historicalContext.recentNotifications.filter(
      (n) => Date.now() - n.timestamp.getTime() < 3600000 // Last hour
    ).length;
    if (recentCount > 2) score -= 15;

    // Increase if previously dismissed similar
    const wasDismissed = historicalContext.dismissedTopics.some((topic) =>
      content.official.toLowerCase().includes(topic)
    );
    if (wasDismissed) score = Math.max(30, score - 20);

    return Math.max(0, Math.min(100, score));
  }

  private scoreContextRelevance(
    content: { official: string; analysis: string; suggestion: string },
    userContext: {
      learningAreas: string[];
      goals: string[];
      completedTopics: string[];
      preferences: Record<string, unknown>;
      lastActivityTime: Date;
    },
    historicalContext: {
      recentNotifications: Array<{ topic: string; timestamp: Date }>;
    }
  ): number {
    let score = 0;

    // Recent activity increases relevance
    const hoursSinceActivity = (Date.now() - userContext.lastActivityTime.getTime()) / 3600000;
    if (hoursSinceActivity < 2) score += 40;
    else if (hoursSinceActivity < 24) score += 20;

    // Current focus areas
    const inProgress = userContext.preferences['inProgressTopics'] as string[] | undefined;
    if (inProgress) {
      const matchesInProgress = inProgress.some((topic) =>
        content.official.toLowerCase().includes(topic.toLowerCase())
      );
      if (matchesInProgress) score += 40;
    }

    // Complements recent notifications
    const recentTopics = historicalContext.recentNotifications
      .slice(-3)
      .map((n) => n.topic.toLowerCase());
    const complements = recentTopics.some((t) =>
      content.analysis.toLowerCase().includes(t)
    );
    if (complements) score += 20;

    return Math.min(100, score);
  }

  private scoreLearningAlignment(
    content: { official: string; analysis: string; suggestion: string },
    userContext: {
      learningAreas: string[];
      goals: string[];
      completedTopics: string[];
    }
  ): number {
    let score = 0;

    // Aligns with stated goals
    const goalAlignment = userContext.goals.filter((g) =>
      content.suggestion.toLowerCase().includes(g.toLowerCase())
    ).length;
    score += (goalAlignment / Math.max(userContext.goals.length, 1)) * 50;

    // Prerequisite met?
    const hasPrerequisites = userContext.completedTopics.some((t) =>
      content.official.toLowerCase().includes(t.toLowerCase())
    );
    if (hasPrerequisites) score += 30;

    // Advancement opportunity
    const advancesLearning = [
      'advanced',
      'next step',
      'building on',
      'integration',
    ].some((keyword) => content.suggestion.toLowerCase().includes(keyword));
    if (advancesLearning) score += 20;

    return Math.min(100, score);
  }

  private scoreNovelty(
    content: { official: string; analysis: string; suggestion: string },
    historicalContext: {
      recentNotifications: Array<{ topic: string; timestamp: Date }>;
      dismissedTopics: string[];
    }
  ): number {
    const contentLower = content.official.toLowerCase();

    // Check if similar topic was recently shown
    const recentTopicSimilarity = historicalContext.recentNotifications
      .slice(-10)
      .filter((n) => {
        const similarity = this.calculateSimilarity(n.topic.toLowerCase(), contentLower);
        return similarity > 0.7;
      }).length;

    let score = 100 - recentTopicSimilarity * 10;

    // New information scores higher
    const newKeywords = ['new', 'introduced', 'launched', 'released', 'beta'];
    const isNew = newKeywords.some((k) => contentLower.includes(k));
    if (isNew) score += 20;

    return Math.min(100, Math.max(0, score));
  }

  private scoreActionability(
    content: { official: string; analysis: string; suggestion: string },
    userContext: {
      learningAreas: string[];
      goals: string[];
      completedTopics: string[];
    }
  ): number {
    let score = 0;

    // Can user act on this?
    const actionKeywords = [
      'can',
      'able to',
      'now',
      'available',
      'integrate',
      'build',
      'use',
    ];
    const isActionable = actionKeywords.some((k) =>
      content.suggestion.toLowerCase().includes(k)
    );
    if (isActionable) score += 50;

    // Has clear next steps
    const hasNextSteps =
      content.suggestion.includes('step') || content.suggestion.includes('how to');
    if (hasNextSteps) score += 30;

    // User has skills to act
    const hasSkills = userContext.completedTopics.length > 3;
    if (hasSkills) score += 20;

    return Math.min(100, score);
  }

  private calculateFinalScore(factors: RelevanceFactors): number {
    // Weighted average with emphasis on user match and learning alignment
    const weights = {
      userMatch: 0.3,
      timelinessScore: 0.2,
      contextRelevance: 0.15,
      learningAlignment: 0.2,
      noveltyScore: 0.1,
      actionablility: 0.05,
    };

    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      score += factors[key as keyof RelevanceFactors] * weight;
    }

    return Math.round(score);
  }

  private determineRecommendation(
    score: number,
    factors: RelevanceFactors,
    userContext: { preferences: Record<string, unknown> }
  ): 'send' | 'send_delayed' | 'suppress' | 'archive' {
    // Critical content always sent
    if (score >= this.CRITICAL_OVERRIDE_THRESHOLD) return 'send';

    // High relevance sends immediately
    if (score >= this.MIN_SEND_THRESHOLD) return 'send';

    // Medium relevance delays
    if (score >= this.MIN_ACTIONABLE_THRESHOLD) return 'send_delayed';

    // Suppressible if low user match
    if (factors.userMatch < 30) return 'suppress';

    // Archive if too low relevance
    return 'archive';
  }

  private calculateConfidence(factors: RelevanceFactors): number {
    // Confidence is higher when multiple factors agree
    const values = Object.values(factors);
    const average = values.reduce((a, b) => a + b) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // High variance = low confidence
    return Math.max(0, 100 - stdDev);
  }

  private generateExplanation(
    score: number,
    factors: RelevanceFactors,
    recommendation: string
  ): string {
    if (score >= 85) {
      return `Highly relevant to your learning goals and current interests`;
    } else if (score >= 65) {
      return `Relevant to your Pi learning journey`;
    } else if (score >= 45) {
      return `Potentially useful as background knowledge`;
    }
    return `Limited relevance to your current focus`;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple token-based similarity
    const tokens1 = new Set(text1.split(/\s+/));
    const tokens2 = new Set(text2.split(/\s+/));

    const intersection = [...tokens1].filter((t) => tokens2.has(t)).length;
    const union = new Set([...tokens1, ...tokens2]).size;

    return union > 0 ? intersection / union : 0;
  }
}

export { RelevanceScorer };
