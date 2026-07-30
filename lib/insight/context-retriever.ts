/**
 * Context Retrieval Engine
 * Retrieves relevant user memory before AI answering
 * Supports all AI modules with contextual information
 */

import {
  MemoryStorageManager,
  ContextualMemory,
  LearningRecord,
  ConversationRecord,
  PersonalizedGoal,
  ProgressMetrics,
} from './memory-storage';

export interface UserContext {
  userId: string;
  sessionId: string;
  profile: any;
  currentTopic: string;
  journey: any;
  recentLearning: LearningRecord[];
  recentConversations: ConversationRecord[];
  activeGoals: PersonalizedGoal[];
  progressMetrics: ProgressMetrics;
  relevantMemories: string[];
  suggestedFollowUps: string[];
  contextConfidence: number; // 0-100
}

export interface ContextualInsight {
  insight: string;
  source: 'learning' | 'conversation' | 'goal' | 'journey' | 'progress';
  relevance: number;
  age: number; // days
}

export class ContextRetriever {
  private storage: MemoryStorageManager;
  private topicRelations: Map<string, string[]> = new Map();

  constructor(storage: MemoryStorageManager) {
    this.storage = storage;
    this.initializeTopicRelations();
  }

  /**
   * Retrieve comprehensive user context for AI modules
   */
  async getUserContext(userId: string, sessionId: string, topic: string): Promise<UserContext> {
    const [profile, journey, learning, conversations, goals, metrics] = await Promise.all([
      this.storage.getProfile(userId),
      this.getJourneyContext(userId),
      this.getRelevantLearning(userId, topic),
      this.storage.getConversationHistory(userId, 20),
      this.getActiveGoals(userId),
      this.storage.getProgressMetrics(userId),
    ]);

    const contextualMemory = await this.storage.getContextualMemory(userId, sessionId);
    const relevantMemories = this.extractRelevantMemories(learning, conversations, topic);
    const suggestedFollowUps = this.generateFollowUpSuggestions(learning, conversations, topic);

    return {
      userId,
      sessionId,
      profile,
      currentTopic: topic,
      journey,
      recentLearning: learning,
      recentConversations: conversations,
      activeGoals: goals,
      progressMetrics: metrics,
      relevantMemories,
      suggestedFollowUps,
      contextConfidence: this.calculateContextConfidence(learning, conversations),
    };
  }

  /**
   * Get relevant learning records for a topic
   */
  private async getRelevantLearning(userId: string, topic: string): Promise<LearningRecord[]> {
    const history = await this.storage.getLearningHistory(userId);
    const relatedTopics = this.getRelatedTopics(topic);

    return history
      .filter(record => {
        const matches = record.topic === topic || relatedTopics.includes(record.topic);
        return matches;
      })
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5);
  }

  /**
   * Get active goals for user
   */
  private async getActiveGoals(userId: string): Promise<PersonalizedGoal[]> {
    // This would retrieve from storage in production
    return [];
  }

  /**
   * Get journey context
   */
  private async getJourneyContext(userId: string): Promise<any> {
    // This would retrieve from storage in production
    return {};
  }

  /**
   * Extract relevant memories for context
   */
  private extractRelevantMemories(
    learning: LearningRecord[],
    conversations: ConversationRecord[],
    topic: string
  ): string[] {
    const memories: string[] = [];

    // From learning
    learning.forEach(record => {
      if (record.notes) {
        memories.push(`Previous learning on ${record.topic}: ${record.notes}`);
      }
    });

    // From conversations
    conversations
      .filter(conv => conv.topic || conv.query.includes(topic))
      .forEach(conv => {
        memories.push(`Previous question: ${conv.query}`);
      });

    return memories.slice(0, 5);
  }

  /**
   * Generate follow-up suggestions based on history
   */
  private generateFollowUpSuggestions(
    learning: LearningRecord[],
    conversations: ConversationRecord[],
    topic: string
  ): string[] {
    const suggestions: string[] = [];

    // Find topics user is interested in but hasn't deeply explored
    if (learning.length > 0) {
      const avgComprehension = learning.reduce((sum, l) => sum + l.comprehensionLevel, 0) / learning.length;
      if (avgComprehension < 3) {
        suggestions.push(`Would you like a deeper dive into ${topic}?`);
      }
    }

    // Check for related topics not yet explored
    const relatedTopics = this.getRelatedTopics(topic);
    const exploredTopics = new Set(learning.map(l => l.topic));
    const unexplored = relatedTopics.filter(t => !exploredTopics.has(t));

    unexplored.slice(0, 2).forEach(topic => {
      suggestions.push(`Interested in ${topic}? It relates to what you're learning.`);
    });

    return suggestions;
  }

  /**
   * Calculate confidence of current context
   */
  private calculateContextConfidence(
    learning: LearningRecord[],
    conversations: ConversationRecord[]
  ): number {
    let confidence = 50; // baseline

    // Increase with learning history
    if (learning.length > 0) {
      confidence += Math.min(20, learning.length * 2);
    }

    // Increase with conversation history
    if (conversations.length > 0) {
      confidence += Math.min(15, conversations.length);
    }

    // Increase with recent activity
    const recentActivity = conversations.filter(
      c => new Date().getTime() - new Date(c.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    );
    if (recentActivity.length > 0) {
      confidence += 15;
    }

    return Math.min(100, confidence);
  }

  /**
   * Get related topics for a given topic
   */
  private getRelatedTopics(topic: string): string[] {
    return this.topicRelations.get(topic) || [];
  }

  /**
   * Get contextual insights for recommendations
   */
  async getContextualInsights(userId: string, topic: string): Promise<ContextualInsight[]> {
    const learning = await this.getRelevantLearning(userId, topic);
    const insights: ContextualInsight[] = [];

    learning.forEach(record => {
      const age = Math.floor((new Date().getTime() - new Date(record.completedAt).getTime()) / (1000 * 60 * 60 * 24));
      insights.push({
        insight: `You learned about ${record.topic} (${record.comprehensionLevel}/5 comprehension)`,
        source: 'learning',
        relevance: 100 - age, // older is less relevant
        age,
      });
    });

    return insights.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Track context usage for learning
   */
  async trackContextUsage(userId: string, context: UserContext, helpful: boolean): Promise<void> {
    // Log whether context was helpful for future optimization
    console.log(`[Memory] Context usage tracked for ${userId}: helpful=${helpful}`);
  }

  /**
   * Initialize topic relationships
   */
  private initializeTopicRelations(): void {
    this.topicRelations.set('KYC', ['Identity', 'Verification', 'Security', 'Account Setup']);
    this.topicRelations.set('Mainnet', ['Consensus', 'Security', 'Roadmap', 'Migration']);
    this.topicRelations.set('App Studio', ['SDK', 'Backend', 'Deployment', 'APIs']);
    this.topicRelations.set('Node', ['Mining', 'Backend', 'Security', 'Infrastructure']);
    this.topicRelations.set('Wallet', ['Payments', 'Security', 'Transactions', 'Pi Network']);
    this.topicRelations.set('SDK', ['Integration', 'Authentication', 'App Studio', 'APIs']);
    this.topicRelations.set('Security', ['Encryption', 'KYC', 'Wallet', 'Node']);
    this.topicRelations.set('Payments', ['Wallet', 'Transactions', 'Fees', 'Pi Network']);
  }
}

export let contextRetriever: ContextRetriever;
