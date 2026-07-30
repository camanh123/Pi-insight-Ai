export interface ActionOutcome {
  actionId: string;
  userId: string;
  actionType: 'notification' | 'recommendation' | 'learning-path' | 'reminder' | 'progress-update';
  targetEngine: string;
  initiated: Date;
  completed?: Date;
  userEngagement: 'clicked' | 'ignored' | 'marked-useful' | 'marked-not-useful' | 'pending';
  timeSpentSeconds: number;
  followUpActions: string[];
}

export interface OutcomeAnalysis {
  actionId: string;
  engagementRate: number;
  usefulness: number;
  completionLikelihood: number;
  recommenderScore: number;
  ranking: 'excellent' | 'good' | 'fair' | 'poor';
}

class OutcomeTracker {
  private outcomes: Map<string, ActionOutcome> = new Map();
  private analyses: Map<string, OutcomeAnalysis> = new Map();

  recordActionInitiated(actionId: string, userId: string, actionType: string, targetEngine: string): void {
    this.outcomes.set(actionId, {
      actionId,
      userId,
      actionType: actionType as any,
      targetEngine,
      initiated: new Date(),
      userEngagement: 'pending',
      timeSpentSeconds: 0,
      followUpActions: [],
    });
  }

  recordUserEngagement(actionId: string, engagement: string, timeSpent: number): void {
    const outcome = this.outcomes.get(actionId);
    if (outcome) {
      outcome.userEngagement = engagement as any;
      outcome.timeSpentSeconds = timeSpent;
      outcome.completed = new Date();
      this.analyzeOutcome(actionId);
    }
  }

  private analyzeOutcome(actionId: string): void {
    const outcome = this.outcomes.get(actionId);
    if (!outcome) return;

    const engagementMap = {
      clicked: 1.0,
      'marked-useful': 0.9,
      'marked-not-useful': 0.2,
      ignored: 0.0,
      pending: 0.5,
    };

    const engagementRate = engagementMap[outcome.userEngagement as keyof typeof engagementMap] || 0.5;
    const usefulness = outcome.userEngagement === 'marked-useful' ? 1.0 : outcome.userEngagement === 'marked-not-useful' ? 0.0 : engagementRate;
    const completionLikelihood = outcome.completed ? 0.9 : 0.5;
    const recommenderScore = (engagementRate + usefulness + completionLikelihood) / 3;

    let ranking: 'excellent' | 'good' | 'fair' | 'poor';
    if (recommenderScore >= 0.85) ranking = 'excellent';
    else if (recommenderScore >= 0.7) ranking = 'good';
    else if (recommenderScore >= 0.5) ranking = 'fair';
    else ranking = 'poor';

    this.analyses.set(actionId, {
      actionId,
      engagementRate,
      usefulness,
      completionLikelihood,
      recommenderScore,
      ranking,
    });
  }

  getOutcome(actionId: string): ActionOutcome | undefined {
    return this.outcomes.get(actionId);
  }

  getAnalysis(actionId: string): OutcomeAnalysis | undefined {
    return this.analyses.get(actionId);
  }

  getUserOutcomes(userId: string): ActionOutcome[] {
    return Array.from(this.outcomes.values()).filter(o => o.userId === userId);
  }

  getEngineOutcomes(targetEngine: string): ActionOutcome[] {
    return Array.from(this.outcomes.values()).filter(o => o.targetEngine === targetEngine);
  }

  getAverageDuration(actionType: string): number {
    const actions = Array.from(this.outcomes.values()).filter(o => o.actionType === actionType);
    if (actions.length === 0) return 0;
    return actions.reduce((sum, a) => sum + a.timeSpentSeconds, 0) / actions.length;
  }

  getEngagementStats(engineType: string) {
    const outcomes = this.getEngineOutcomes(engineType);
    if (outcomes.length === 0) return null;

    const engaged = outcomes.filter(o => ['clicked', 'marked-useful'].includes(o.userEngagement)).length;
    const ignored = outcomes.filter(o => o.userEngagement === 'ignored').length;

    return {
      total: outcomes.length,
      engaged,
      ignored,
      engagementRate: engaged / outcomes.length,
      averageTimeSpent: outcomes.reduce((sum, o) => sum + o.timeSpentSeconds, 0) / outcomes.length,
    };
  }

  getFollowUpAnalysis(actionId: string) {
    const outcome = this.outcomes.get(actionId);
    if (!outcome) return null;

    return {
      hadFollowUps: outcome.followUpActions.length > 0,
      followUpCount: outcome.followUpActions.length,
      followUpIds: outcome.followUpActions,
    };
  }

  recordFollowUp(originalActionId: string, followUpActionId: string): void {
    const outcome = this.outcomes.get(originalActionId);
    if (outcome) {
      outcome.followUpActions.push(followUpActionId);
    }
  }
}

export const outcomeTracker = new OutcomeTracker();
