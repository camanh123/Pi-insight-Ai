/**
 * Memory Storage System for Pi Insight
 * Manages user profile, journey, learning history, preferences, conversations, and goals
 * Completely separate from official Pi knowledge
 * Developer-only internal system
 */

export type MemoryCategory = 'profile' | 'journey' | 'learning' | 'preferences' | 'goals' | 'conversations' | 'progress' | 'achievements';

export type MemoryTier = 'long-term' | 'session' | 'contextual' | 'transient';

export interface UserProfile {
  userId: string;
  createdAt: Date;
  lastActiveAt: Date;
  displayName?: string;
  piExperienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningStyle: 'visual' | 'textual' | 'interactive' | 'mixed';
  preferredLanguage: 'en' | 'vi';
  timezone?: string;
  interests: string[];
  notificationPreferences: {
    dailyBriefing: boolean;
    weeklyReport: boolean;
    personalizedTips: boolean;
    updateAlerts: boolean;
  };
}

export interface PiJourney {
  userId: string;
  startDate: Date;
  milestone: 'join' | 'kyc-progress' | 'app-studio-explorer' | 'node-runner' | 'ecosystem-participant' | 'mainnet-ready';
  milestoneDate: Date;
  topicsExplored: string[];
  questionsAsked: number;
  tasksCompleted: number;
  documentsRead: number;
  averageTimePerSession: number; // minutes
  consecutiveActiveDays: number;
  longestStreak: number;
  totalEngagementScore: number;
}

export interface LearningRecord {
  id: string;
  userId: string;
  topic: string;
  contentType: 'update' | 'documentation' | 'tutorial' | 'faq' | 'analysis';
  title: string;
  completedAt: Date;
  timeSpent: number; // seconds
  comprehensionLevel: 1 | 2 | 3 | 4 | 5; // self-assessed
  notes?: string;
  sourceUrl?: string;
  relatedTopics: string[];
  queried: boolean; // did user ask questions about this
}

export interface ConversationRecord {
  id: string;
  userId: string;
  timestamp: Date;
  query: string;
  responseLength: number;
  sourcesUsed: string[];
  moduleUsed: string;
  userFeedback?: 'helpful' | 'partial' | 'unclear' | 'incorrect';
  followUpQuestions: boolean;
  conversationChain?: string; // parent conversation id
}

export interface PersonalizedGoal {
  id: string;
  userId: string;
  category: 'learning' | 'participation' | 'achievement' | 'understanding';
  title: string;
  description: string;
  targetDate?: Date;
  createdAt: Date;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  progressPercentage: number;
  checkpoints: {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: Date;
  }[];
}

export interface ContextualMemory {
  userId: string;
  sessionId: string;
  currentTopic: string;
  recentQueries: string[];
  currentObjective?: string;
  contextualNotes: string;
  relatedMemories: string[];
  expiresAt: Date;
}

export interface SessionMemory {
  sessionId: string;
  userId: string;
  startedAt: Date;
  lastActivityAt: Date;
  activitiesCount: number;
  focusTopic?: string;
  sessionNotes: string;
  queriesByModule: Record<string, number>;
}

export interface LongTermMemory {
  userId: string;
  category: MemoryCategory;
  data: Record<string, any>;
  createdAt: Date;
  lastUpdatedAt: Date;
  accessCount: number;
  relevanceScore: number; // 0-100
}

export interface MemoryUpdate {
  category: MemoryCategory;
  action: 'create' | 'update' | 'delete' | 'archive';
  data: Record<string, any>;
  timestamp: Date;
  userId: string;
}

export interface MemoryPrivacySettings {
  userId: string;
  allowConversationLogging: boolean;
  allowBehaviorTracking: boolean;
  allowPersonalizedRecommendations: boolean;
  retentionDays: number; // how long to keep conversation records
  anonymizeAfterDays?: number;
  dataExportAllowed: boolean;
  deleteOnRequest: boolean;
}

export interface MemoryExport {
  userId: string;
  exportedAt: Date;
  profile: UserProfile;
  journey: PiJourney;
  learningHistory: LearningRecord[];
  conversations: ConversationRecord[];
  goals: PersonalizedGoal[];
  achievements: string[];
}

export interface ProgressMetrics {
  userId: string;
  totalTopicsLearned: number;
  averageComprehension: number;
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
  recommendedNextTopics: string[];
  estimatedMasteryTime: Record<string, number>; // topic -> hours
  skillGaps: string[];
  strengths: string[];
  lastProgressUpdate: Date;
}

export interface PersonalizedRecommendation {
  id: string;
  userId: string;
  type: 'topic' | 'goal' | 'question' | 'resource';
  title: string;
  description: string;
  relevanceScore: number;
  confidenceLevel: number; // 0-100
  basedOnPattern: string;
  recommendedAt: Date;
  engageWithin?: Date;
  dismissedAt?: Date;
}

// Memory Storage Manager
export class MemoryStorageManager {
  private userMemory: Map<string, Map<string, LongTermMemory>> = new Map();
  private sessionMemory: Map<string, SessionMemory> = new Map();
  private contextualMemory: Map<string, ContextualMemory[]> = new Map();
  private updateLog: MemoryUpdate[] = [];

  // Create or update user profile
  async upsertProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    const updated = {
      ...existing,
      ...profile,
      userId,
      lastActiveAt: new Date(),
    };

    this.storeMemory(userId, 'profile', updated);
    return updated;
  }

  // Store long-term memory
  private storeMemory(userId: string, category: MemoryCategory, data: any): void {
    if (!this.userMemory.has(userId)) {
      this.userMemory.set(userId, new Map());
    }

    const memory: LongTermMemory = {
      userId,
      category,
      data,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      accessCount: 0,
      relevanceScore: 100,
    };

    this.userMemory.get(userId)?.set(category, memory);
    this.logUpdate(userId, category, 'create', data);
  }

  // Retrieve user profile
  async getProfile(userId: string): Promise<UserProfile> {
    const memory = this.userMemory.get(userId)?.get('profile');
    return memory?.data || this.createDefaultProfile(userId);
  }

  // Create session memory
  async initializeSession(userId: string, sessionId: string): Promise<SessionMemory> {
    const session: SessionMemory = {
      sessionId,
      userId,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      activitiesCount: 0,
      sessionNotes: '',
      queriesByModule: {},
    };

    this.sessionMemory.set(sessionId, session);
    return session;
  }

  // Get session memory
  async getSessionMemory(sessionId: string): Promise<SessionMemory | null> {
    return this.sessionMemory.get(sessionId) || null;
  }

  // Add contextual memory
  async addContextualMemory(userId: string, context: Omit<ContextualMemory, 'userId'>): Promise<ContextualMemory> {
    const memory: ContextualMemory = {
      ...context,
      userId,
    };

    if (!this.contextualMemory.has(userId)) {
      this.contextualMemory.set(userId, []);
    }

    this.contextualMemory.get(userId)?.push(memory);
    return memory;
  }

  // Retrieve contextual memory
  async getContextualMemory(userId: string, sessionId: string): Promise<ContextualMemory | null> {
    const memories = this.contextualMemory.get(userId) || [];
    return memories.find(m => m.sessionId === sessionId) || null;
  }

  // Add learning record
  async recordLearning(userId: string, record: Omit<LearningRecord, 'id' | 'userId'>): Promise<LearningRecord> {
    const learning: LearningRecord = {
      ...record,
      id: `learn-${Date.now()}`,
      userId,
    };

    const existing = this.userMemory.get(userId)?.get('learning');
    const records = existing?.data || [];
    records.push(learning);

    this.storeMemory(userId, 'learning', records);
    return learning;
  }

  // Add conversation record
  async recordConversation(userId: string, record: Omit<ConversationRecord, 'id' | 'userId'>): Promise<ConversationRecord> {
    const conversation: ConversationRecord = {
      ...record,
      id: `conv-${Date.now()}`,
      userId,
    };

    const existing = this.userMemory.get(userId)?.get('conversations');
    const records = existing?.data || [];
    records.push(conversation);

    this.storeMemory(userId, 'conversations', records);
    return conversation;
  }

  // Get user learning history
  async getLearningHistory(userId: string): Promise<LearningRecord[]> {
    const memory = this.userMemory.get(userId)?.get('learning');
    return memory?.data || [];
  }

  // Get conversation history
  async getConversationHistory(userId: string, limit: number = 50): Promise<ConversationRecord[]> {
    const memory = this.userMemory.get(userId)?.get('conversations');
    const records = memory?.data || [];
    return records.slice(-limit);
  }

  // Create or update goal
  async upsertGoal(userId: string, goal: Omit<PersonalizedGoal, 'id' | 'userId' | 'createdAt'>): Promise<PersonalizedGoal> {
    const newGoal: PersonalizedGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      userId,
      createdAt: new Date(),
    };

    const existing = this.userMemory.get(userId)?.get('goals');
    const goals = existing?.data || [];
    goals.push(newGoal);

    this.storeMemory(userId, 'goals', goals);
    return newGoal;
  }

  // Update goal progress
  async updateGoalProgress(userId: string, goalId: string, progressPercentage: number): Promise<PersonalizedGoal | null> {
    const existing = this.userMemory.get(userId)?.get('goals');
    const goals = existing?.data || [];
    const goal = goals.find((g: PersonalizedGoal) => g.id === goalId);

    if (goal) {
      goal.progressPercentage = progressPercentage;
      if (progressPercentage === 100) {
        goal.status = 'completed';
      }
      this.storeMemory(userId, 'goals', goals);
    }

    return goal || null;
  }

  // Calculate progress metrics
  async getProgressMetrics(userId: string): Promise<ProgressMetrics> {
    const learning = await this.getLearningHistory(userId);
    const topicsSet = new Set(learning.map(l => l.topic));
    const avgComprehension = learning.length > 0
      ? learning.reduce((sum, l) => sum + l.comprehensionLevel, 0) / learning.length
      : 0;

    return {
      userId,
      totalTopicsLearned: topicsSet.size,
      averageComprehension: avgComprehension,
      engagementTrend: 'stable',
      recommendedNextTopics: this.getRecommendedTopics(topicsSet),
      estimatedMasteryTime: this.estimateMasteryTimes(topicsSet),
      skillGaps: this.identifySkillGaps(topicsSet),
      strengths: Array.from(topicsSet).slice(0, 5),
      lastProgressUpdate: new Date(),
    };
  }

  // Private helper methods
  private createDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      piExperienceLevel: 'beginner',
      learningStyle: 'mixed',
      preferredLanguage: 'en',
      interests: [],
      notificationPreferences: {
        dailyBriefing: true,
        weeklyReport: true,
        personalizedTips: true,
        updateAlerts: true,
      },
    };
  }

  private getRecommendedTopics(learned: Set<string>): string[] {
    const allTopics = ['KYC', 'KYB', 'Mainnet', 'Node Setup', 'App Studio', 'Wallet', 'SDK', 'Backend'];
    return allTopics.filter(t => !learned.has(t)).slice(0, 3);
  }

  private estimateMasteryTimes(topics: Set<string>): Record<string, number> {
    const estimates: Record<string, number> = {};
    topics.forEach(topic => {
      estimates[topic] = Math.random() * 20 + 5; // 5-25 hours
    });
    return estimates;
  }

  private identifySkillGaps(topics: Set<string>): string[] {
    const critical = ['KYC', 'Security', 'Mainnet'];
    return critical.filter(t => !topics.has(t));
  }

  private logUpdate(userId: string, category: MemoryCategory, action: 'create' | 'update' | 'delete' | 'archive', data: any): void {
    this.updateLog.push({
      userId,
      category,
      action,
      data,
      timestamp: new Date(),
    });
  }

  // Export all user memory
  async exportUserMemory(userId: string): Promise<MemoryExport> {
    return {
      userId,
      exportedAt: new Date(),
      profile: await this.getProfile(userId),
      journey: this.userMemory.get(userId)?.get('journey')?.data || {},
      learningHistory: await this.getLearningHistory(userId),
      conversations: await this.getConversationHistory(userId, 1000),
      goals: this.userMemory.get(userId)?.get('goals')?.data || [],
      achievements: this.userMemory.get(userId)?.get('achievements')?.data || [],
    };
  }

  // Delete user memory
  async deleteUserMemory(userId: string): Promise<void> {
    this.userMemory.delete(userId);
    this.contextualMemory.delete(userId);
    Array.from(this.sessionMemory.entries())
      .filter(([_, session]) => session.userId === userId)
      .forEach(([sessionId]) => this.sessionMemory.delete(sessionId));
  }

  // Get update history
  getUpdateHistory(userId: string, limit: number = 100): MemoryUpdate[] {
    return this.updateLog
      .filter(u => u.userId === userId)
      .slice(-limit);
  }
}

// Singleton instance
export const memoryStorage = new MemoryStorageManager();
