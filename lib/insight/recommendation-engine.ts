/**
 * Personalized Recommendation Engine
 * Generates smart recommendations, reminders, and learning paths
 * Uses user memory to provide tailored suggestions
 */

import {
  MemoryStorageManager,
  PersonalizedRecommendation,
  LearningRecord,
  PersonalizedGoal,
  ProgressMetrics,
} from './memory-storage';

export interface RecommendationContext {
  userId: string;
  topics: Set<string>;
  learningStyle: string;
  experienceLevel: string;
  goals: PersonalizedGoal[];
  metrics: ProgressMetrics;
}

export interface SmartReminder {
  id: string;
  userId: string;
  type: 'daily-briefing' | 'goal-checkpoint' | 'learning-streak' | 'update-summary' | 'skill-gap';
  title: string;
  description: string;
  action: string;
  scheduledFor: Date;
  priority: 'high' | 'medium' | 'low';
  dismissed: boolean;
}

export interface LearningPath {
  userId: string;
  pathId: string;
  title: string;
  description: string;
  topics: string[];
  estimatedDuration: number; // hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  currentProgress: number; // percentage
  nextTopic?: string;
  completionDate?: Date;
}

export class RecommendationEngine {
  private storage: MemoryStorageManager;
  private reminders: Map<string, SmartReminder[]> = new Map();
  private learningPaths: Map<string, LearningPath[]> = new Map();

  constructor(storage: MemoryStorageManager) {
    this.storage = storage;
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(
    userId: string,
    context: RecommendationContext
  ): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    // Topic recommendations based on learning history
    const topicRecs = this.getTopicRecommendations(context, userId);
    recommendations.push(...topicRecs);

    // Goal-based recommendations
    const goalRecs = this.getGoalRecommendations(context, userId);
    recommendations.push(...goalRecs);

    // Skill gap recommendations
    const gapRecs = this.getSkillGapRecommendations(context, userId);
    recommendations.push(...gapRecs);

    // Learning style recommendations
    const styleRecs = this.getLearningStyleRecommendations(context, userId);
    recommendations.push(...styleRecs);

    // Sort by relevance and confidence
    return recommendations.sort((a, b) => {
      const scoreA = (a.relevanceScore * a.confidenceLevel) / 100;
      const scoreB = (b.relevanceScore * b.confidenceLevel) / 100;
      return scoreB - scoreA;
    });
  }

  /**
   * Get topic-based recommendations
   */
  private getTopicRecommendations(context: RecommendationContext, userId: string): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];
    const criticalTopics = ['KYC', 'Security', 'Mainnet'];
    const unexploredCritical = criticalTopics.filter(t => !context.topics.has(t));

    unexploredCritical.forEach(topic => {
      recommendations.push({
        id: `topic-${topic}-${Date.now()}`,
        userId,
        type: 'topic',
        title: `Learn about ${topic}`,
        description: `${topic} is crucial for Pi Network participants. Get a comprehensive overview.`,
        relevanceScore: 95,
        confidenceLevel: 90,
        basedOnPattern: 'critical-topic-gap',
        recommendedAt: new Date(),
        engageWithin: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      });
    });

    // Suggest next topic based on current learning
    const nextTopic = this.suggestNextTopic(context.topics);
    if (nextTopic) {
      recommendations.push({
        id: `topic-next-${Date.now()}`,
        userId,
        type: 'topic',
        title: `Continue learning: ${nextTopic}`,
        description: `Based on your learning path, ${nextTopic} is the natural next step.`,
        relevanceScore: 80,
        confidenceLevel: 75,
        basedOnPattern: 'learning-sequence',
        recommendedAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Get goal-based recommendations
   */
  private getGoalRecommendations(context: RecommendationContext, userId: string): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    context.goals
      .filter(g => g.status === 'active')
      .forEach(goal => {
        const progressGap = 100 - goal.progressPercentage;
        if (progressGap > 20) {
          recommendations.push({
            id: `goal-${goal.id}-${Date.now()}`,
            userId,
            type: 'goal',
            title: `Continue working on: ${goal.title}`,
            description: `You're ${goal.progressPercentage}% toward "${goal.title}". ${progressGap}% to go!`,
            relevanceScore: Math.min(100, 70 + progressGap / 2),
            confidenceLevel: 85,
            basedOnPattern: 'active-goal-progress',
            recommendedAt: new Date(),
          });
        }
      });

    return recommendations;
  }

  /**
   * Get skill gap recommendations
   */
  private getSkillGapRecommendations(context: RecommendationContext, userId: string): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    context.metrics.skillGaps.forEach(gap => {
      recommendations.push({
        id: `skill-${gap}-${Date.now()}`,
        userId,
        type: 'topic',
        title: `Close skill gap: ${gap}`,
        description: `Understanding ${gap} will enhance your overall knowledge of Pi Network.`,
        relevanceScore: 75,
        confidenceLevel: 70,
        basedOnPattern: 'skill-gap-detection',
        recommendedAt: new Date(),
      });
    });

    return recommendations;
  }

  /**
   * Get learning style recommendations
   */
  private getLearningStyleRecommendations(
    context: RecommendationContext,
    userId: string
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    if (context.learningStyle === 'visual') {
      recommendations.push({
        id: `resource-visual-${Date.now()}`,
        userId,
        type: 'resource',
        title: 'Visual learning resources available',
        description: 'Infographics and diagrams explaining Pi Network architecture and flow.',
        relevanceScore: 85,
        confidenceLevel: 80,
        basedOnPattern: 'learning-style-match',
        recommendedAt: new Date(),
      });
    }

    if (context.learningStyle === 'interactive') {
      recommendations.push({
        id: `resource-interactive-${Date.now()}`,
        userId,
        type: 'resource',
        title: 'Interactive tutorials',
        description: 'Hands-on guides for setting up nodes, using App Studio, and more.',
        relevanceScore: 85,
        confidenceLevel: 80,
        basedOnPattern: 'learning-style-match',
        recommendedAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Create smart reminders
   */
  async createSmartReminders(userId: string, context: RecommendationContext): Promise<SmartReminder[]> {
    const reminders: SmartReminder[] = [];

    // Daily briefing reminder
    reminders.push({
      id: `reminder-daily-${Date.now()}`,
      userId,
      type: 'daily-briefing',
      title: 'Daily Pi Insight Briefing',
      description: 'Check your personalized summary of Pi Network updates and recommendations.',
      action: 'open-briefing',
      scheduledFor: this.getNextMorning(),
      priority: 'medium',
      dismissed: false,
    });

    // Goal checkpoint reminder
    const activeGoal = context.goals.find(g => g.status === 'active');
    if (activeGoal && activeGoal.targetDate) {
      const daysUntilDeadline = Math.ceil((activeGoal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) {
        reminders.push({
          id: `reminder-goal-${activeGoal.id}`,
          userId,
          type: 'goal-checkpoint',
          title: `Goal deadline approaching: ${activeGoal.title}`,
          description: `${daysUntilDeadline} days until your target date.`,
          action: `view-goal-${activeGoal.id}`,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
          priority: 'high',
          dismissed: false,
        });
      }
    }

    // Learning streak reminder
    reminders.push({
      id: `reminder-streak-${Date.now()}`,
      userId,
      type: 'learning-streak',
      title: 'Keep your learning streak alive',
      description: 'Log back in and explore another topic to maintain your engagement streak.',
      action: 'open-home',
      scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000),
      priority: 'low',
      dismissed: false,
    });

    // Store reminders
    if (!this.reminders.has(userId)) {
      this.reminders.set(userId, []);
    }
    this.reminders.get(userId)?.push(...reminders);

    return reminders;
  }

  /**
   * Get active reminders
   */
  async getActiveReminders(userId: string): Promise<SmartReminder[]> {
    const allReminders = this.reminders.get(userId) || [];
    const now = new Date();
    return allReminders.filter(r => r.scheduledFor <= now && !r.dismissed);
  }

  /**
   * Create personalized learning path
   */
  async createLearningPath(userId: string, context: RecommendationContext): Promise<LearningPath> {
    const path: LearningPath = {
      userId,
      pathId: `path-${Date.now()}`,
      title: `Your Pi Network Learning Path (${context.experienceLevel})`,
      description: `Tailored journey based on your experience level and interests.`,
      topics: this.generateLearningSequence(context.topics, context.experienceLevel),
      estimatedDuration: this.estimateDuration(context),
      difficulty: context.experienceLevel as any,
      currentProgress: 0,
      nextTopic: this.suggestNextTopic(context.topics),
    };

    if (!this.learningPaths.has(userId)) {
      this.learningPaths.set(userId, []);
    }
    this.learningPaths.get(userId)?.push(path);

    return path;
  }

  /**
   * Get learning paths
   */
  async getLearningPaths(userId: string): Promise<LearningPath[]> {
    return this.learningPaths.get(userId) || [];
  }

  /**
   * Update learning path progress
   */
  async updatePathProgress(userId: string, pathId: string, progress: number): Promise<LearningPath | null> {
    const paths = this.learningPaths.get(userId) || [];
    const path = paths.find(p => p.pathId === pathId);

    if (path) {
      path.currentProgress = Math.min(100, progress);
      if (progress === 100) {
        path.completionDate = new Date();
      }
    }

    return path || null;
  }

  /**
   * Private helper methods
   */
  private suggestNextTopic(explored: Set<string>): string | undefined {
    const sequence = [
      'Pi Network Basics',
      'KYC Process',
      'Wallet Setup',
      'Node Operation',
      'App Studio',
      'SDK Integration',
      'Security',
      'Mainnet Readiness',
    ];

    for (const topic of sequence) {
      if (!explored.has(topic)) {
        return topic;
      }
    }
    return undefined;
  }

  private generateLearningSequence(explored: Set<string>, level: string): string[] {
    const beginner = ['Pi Network Basics', 'KYC Process', 'Wallet Setup', 'Security Basics'];
    const intermediate = [...beginner, 'Node Operation', 'App Studio Basics', 'SDK Introduction'];
    const advanced = [...intermediate, 'Advanced SDK', 'Backend Development', 'Network Architecture'];

    const sequence = level === 'advanced' ? advanced : level === 'intermediate' ? intermediate : beginner;
    return sequence.filter(t => !explored.has(t));
  }

  private estimateDuration(context: RecommendationContext): number {
    const baseHours = context.experienceLevel === 'beginner' ? 40 : context.experienceLevel === 'intermediate' ? 30 : 20;
    return baseHours;
  }

  private getNextMorning(): Date {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  }
}
