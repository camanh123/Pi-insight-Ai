import type { UserMemory, PersonalProfile, TimelineUpdate } from './data';

// Agent Impact Detector - determines which users are affected by Pi updates
// Based on learning history, goals, and profile preferences
// Internal-only

export interface ImpactAnalysis {
  userId: string;
  updateId: string;
  affectedAreas: string[];
  impactLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  reasons: string[];
  relevanceFactors: Record<string, number>;
  shouldNotify: boolean;
  confidenceScore: number;
}

export interface UserImpactProfile {
  userId: string;
  learningAreas: string[];
  goals: string[];
  currentChallenges: string[];
  completedTopics: string[];
  inProgressTopics: string[];
  preferences: {
    updateFrequency: 'immediate' | 'daily' | 'weekly' | 'manual';
    minimumRelevance: number;
    topicPreferences: Record<string, number>;
  };
}

class ImpactDetector {
  private IMPACT_THRESHOLDS = {
    critical: 0.85,
    high: 0.7,
    medium: 0.55,
    low: 0.4,
  };

  private RELEVANCE_WEIGHTS = {
    directMatch: 0.4,
    goalAlignment: 0.25,
    prerequisiteKnowledge: 0.15,
    relatedTopics: 0.15,
    learningPathProgression: 0.05,
  };

  // Detect which users are affected by a new update
  detectAffectedUsers(
    update: TimelineUpdate,
    userProfiles: UserImpactProfile[]
  ): ImpactAnalysis[] {
    return userProfiles.map((profile) => this.analyzeUserImpact(update, profile));
  }

  private analyzeUserImpact(update: TimelineUpdate, profile: UserImpactProfile): ImpactAnalysis {
    const relevanceFactors = this.calculateRelevanceFactors(update, profile);
    const totalRelevance = this.calculateTotalRelevance(relevanceFactors);
    const impactLevel = this.determineImpactLevel(totalRelevance);
    const shouldNotify = this.shouldNotifyUser(profile, impactLevel, totalRelevance);

    return {
      userId: profile.userId,
      updateId: update.id,
      affectedAreas: this.identifyAffectedAreas(update, profile),
      impactLevel,
      reasons: this.generateReasons(update, profile, relevanceFactors),
      relevanceFactors,
      shouldNotify,
      confidenceScore: totalRelevance,
    };
  }

  private calculateRelevanceFactors(
    update: TimelineUpdate,
    profile: UserImpactProfile
  ): Record<string, number> {
    const factors: Record<string, number> = {};

    // 1. Direct match with learning areas
    factors.directMatch = this.scoreDirectMatch(update.topics, profile.learningAreas);

    // 2. Goal alignment
    factors.goalAlignment = this.scoreGoalAlignment(update.topics, profile.goals);

    // 3. Prerequisite knowledge
    factors.prerequisiteKnowledge = this.scorePrerequisiteMatch(
      update.prerequisites,
      profile.completedTopics
    );

    // 4. Related topics
    factors.relatedTopics = this.scoreRelatedTopics(update.relatedTopics, profile.inProgressTopics);

    // 5. Learning path progression
    factors.learningPathProgression = this.scorePathProgression(update, profile);

    return factors;
  }

  private calculateTotalRelevance(factors: Record<string, number>): number {
    let total = 0;
    for (const [key, value] of Object.entries(factors)) {
      const weight = this.RELEVANCE_WEIGHTS[key as keyof typeof this.RELEVANCE_WEIGHTS] || 0;
      total += value * weight;
    }
    return Math.min(1, total); // Normalize to 0-1
  }

  private scoreDirectMatch(updateTopics: string[], userLearningAreas: string[]): number {
    if (!updateTopics.length || !userLearningAreas.length) return 0;

    const matches = updateTopics.filter((t) =>
      userLearningAreas.some((a) => this.topicsMatch(t, a))
    ).length;

    return matches / updateTopics.length;
  }

  private scoreGoalAlignment(updateTopics: string[], userGoals: string[]): number {
    if (!updateTopics.length || !userGoals.length) return 0;

    const alignments = updateTopics.filter((t) =>
      userGoals.some((g) => this.topicsMatch(t, g))
    ).length;

    return alignments / updateTopics.length;
  }

  private scorePrerequisiteMatch(updatePrereqs: string[], completedTopics: string[]): number {
    if (!updatePrereqs.length) return 0.5; // No prerequisites = neutral

    const metPrereqs = updatePrereqs.filter((p) =>
      completedTopics.some((c) => this.topicsMatch(p, c))
    ).length;

    return metPrereqs / updatePrereqs.length;
  }

  private scoreRelatedTopics(relatedTopics: string[], inProgressTopics: string[]): number {
    if (!relatedTopics.length || !inProgressTopics.length) return 0;

    const related = relatedTopics.filter((t) =>
      inProgressTopics.some((p) => this.topicsMatch(t, p))
    ).length;

    return related / relatedTopics.length;
  }

  private scorePathProgression(update: TimelineUpdate, profile: UserImpactProfile): number {
    // Updates that unlock next learning steps are higher value
    const nextSteps = update.nextSteps || [];
    const matchedSteps = nextSteps.filter((s) =>
      profile.inProgressTopics.some((t) => this.topicsMatch(s, t))
    ).length;

    return matchedSteps / (nextSteps.length || 1);
  }

  private topicsMatch(topic1: string, topic2: string): boolean {
    const normalize = (t: string) => t.toLowerCase().replace(/\s+/g, '_');
    const t1 = normalize(topic1);
    const t2 = normalize(topic2);

    return t1 === t2 || t1.includes(t2) || t2.includes(t1);
  }

  private determineImpactLevel(
    relevance: number
  ): 'critical' | 'high' | 'medium' | 'low' | 'none' {
    if (relevance >= this.IMPACT_THRESHOLDS.critical) return 'critical';
    if (relevance >= this.IMPACT_THRESHOLDS.high) return 'high';
    if (relevance >= this.IMPACT_THRESHOLDS.medium) return 'medium';
    if (relevance >= this.IMPACT_THRESHOLDS.low) return 'low';
    return 'none';
  }

  private shouldNotifyUser(
    profile: UserImpactProfile,
    impactLevel: string,
    relevance: number
  ): boolean {
    // Never notify for low relevance
    if (relevance < profile.preferences.minimumRelevance) return false;

    // Critical and high always notify
    if (['critical', 'high'].includes(impactLevel)) return true;

    // Medium/low respect preferences
    if (profile.preferences.updateFrequency === 'immediate') return true;
    if (profile.preferences.updateFrequency === 'manual') return false;

    return relevance >= 0.65;
  }

  private identifyAffectedAreas(update: TimelineUpdate, profile: UserImpactProfile): string[] {
    const areas: Set<string> = new Set();

    // Topics directly matching
    update.topics.forEach((t) => {
      if (profile.learningAreas.some((a) => this.topicsMatch(t, a))) {
        areas.add(t);
      }
    });

    // Related goals
    update.topics.forEach((t) => {
      if (profile.goals.some((g) => this.topicsMatch(t, g))) {
        areas.add(`Goal: ${t}`);
      }
    });

    return Array.from(areas);
  }

  private generateReasons(
    update: TimelineUpdate,
    profile: UserImpactProfile,
    factors: Record<string, number>
  ): string[] {
    const reasons: string[] = [];

    if (factors.directMatch > 0.5) {
      reasons.push(`Matches your active learning area: ${update.topics.join(', ')}`);
    }

    if (factors.goalAlignment > 0.5) {
      reasons.push(`Supports your current goals`);
    }

    if (factors.prerequisiteKnowledge > 0.7) {
      reasons.push(`You have the required background knowledge`);
    }

    if (factors.learningPathProgression > 0.6) {
      reasons.push(`Advances your learning path`);
    }

    if (update.breaking) {
      reasons.push(`Contains important breaking changes`);
    }

    if (update.security) {
      reasons.push(`Includes security-related updates`);
    }

    return reasons;
  }
}

export { ImpactDetector };
