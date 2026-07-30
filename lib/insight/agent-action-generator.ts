// Agent Action Generator - creates Next Best Actions and recommendations
// Internal-only

export interface ActionContext {
  userId: string;
  topic: string;
  userGoals: string[];
  learningHistory: string[];
  currentChallenges: string[];
  comprehensionLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface GeneratedAction {
  type: 'notification' | 'reminder' | 'recommendation' | 'learning_path' | 'progress_update';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  actionUrl?: string;
  estimatedTime?: number; // minutes
  resources?: Array<{ title: string; type: string; url?: string }>;
  followUpActions?: string[];
}

class ActionGenerator {
  generateNextBestActions(
    official: string,
    analysis: string,
    suggestion: string,
    context: ActionContext
  ): GeneratedAction[] {
    const actions: GeneratedAction[] = [];

    // 1. Immediate learning action
    if (this.isLearningOpportunity(official, context)) {
      actions.push(this.generateLearningAction(official, context));
    }

    // 2. Goal-aligned action
    if (context.userGoals.length > 0) {
      actions.push(this.generateGoalAlignedAction(suggestion, context));
    }

    // 3. Challenge mitigation
    if (context.currentChallenges.length > 0) {
      const mitigation = this.generateChallengeMitigation(official, context);
      if (mitigation) actions.push(mitigation);
    }

    // 4. Capability integration
    if (this.isNewCapability(official)) {
      actions.push(this.generateCapabilityIntegration(official, context));
    }

    // 5. Progress tracking
    if (context.learningHistory.length > 0) {
      actions.push(this.generateProgressUpdate(context));
    }

    return actions.filter((a) => a !== null) as GeneratedAction[];
  }

  private isLearningOpportunity(official: string, context: ActionContext): boolean {
    const keywords = ['new', 'introduced', 'now available', 'capability', 'feature'];
    return keywords.some((k) => official.toLowerCase().includes(k));
  }

  private generateLearningAction(official: string, context: ActionContext): GeneratedAction {
    const title = this.extractTopicFromContent(official);
    const estimatedTime = this.estimateLearnTime(context.comprehensionLevel);

    return {
      type: 'recommendation',
      title: `Learn: ${title}`,
      description: `New capability available that builds on your ${context.learningHistory.slice(-1)[0] || 'foundation'} knowledge`,
      priority: 'high',
      estimatedTime,
      resources: [
        { title: 'Official Documentation', type: 'docs', url: '/docs/pi-updates' },
        {
          title: 'Interactive Tutorial',
          type: 'tutorial',
          url: '/learn/tutorials',
        },
        { title: 'Community Examples', type: 'examples', url: '/examples' },
      ],
      followUpActions: [
        'Try a hands-on example',
        'Discuss with community',
        'Build a small project',
      ],
    };
  }

  private generateGoalAlignedAction(suggestion: string, context: ActionContext): GeneratedAction {
    const alignedGoal = this.findAlignedGoal(suggestion, context.userGoals);

    return {
      type: 'learning_path',
      title: `Progress: ${alignedGoal}`,
      description: `This update helps you advance toward: ${alignedGoal}`,
      priority: 'high',
      actionUrl: `/learn/paths/${this.sanitize(alignedGoal)}`,
      followUpActions: [
        'Review learning path',
        'Schedule practice time',
        'Join study group',
      ],
    };
  }

  private generateChallengeMitigation(
    official: string,
    context: ActionContext
  ): GeneratedAction | null {
    const relevantChallenge = context.currentChallenges.find((c) =>
      official.toLowerCase().includes(c.toLowerCase())
    );

    if (!relevantChallenge) return null;

    return {
      type: 'recommendation',
      title: `Solve: ${relevantChallenge}`,
      description: `This update provides a solution to your current challenge: ${relevantChallenge}`,
      priority: 'critical',
      estimatedTime: 15,
      resources: [
        { title: 'Solution Guide', type: 'guide' },
        { title: 'Code Examples', type: 'examples' },
        { title: 'Ask Community', type: 'community' },
      ],
      followUpActions: ['Apply solution', 'Verify results', 'Share success'],
    };
  }

  private generateCapabilityIntegration(
    official: string,
    context: ActionContext
  ): GeneratedAction {
    const capability = this.extractCapability(official);

    return {
      type: 'recommendation',
      title: `Integrate: ${capability}`,
      description: `${capability} can be integrated into your projects`,
      priority: 'normal',
      estimatedTime: 30,
      actionUrl: `/integrate/${this.sanitize(capability)}`,
      resources: [
        { title: 'Integration Guide', type: 'guide' },
        { title: 'Code Samples', type: 'samples' },
        { title: 'API Reference', type: 'reference' },
      ],
      followUpActions: [
        'Review requirements',
        'Follow integration steps',
        'Test in sandbox',
        'Deploy to production',
      ],
    };
  }

  private generateProgressUpdate(context: ActionContext): GeneratedAction {
    const nextTopic = this.suggestNextTopic(context);

    return {
      type: 'progress_update',
      title: `Next: ${nextTopic}`,
      description: `You've learned ${context.learningHistory.length} topics. Here's what's next.`,
      priority: 'low',
      estimatedTime: 60,
      actionUrl: `/learn/next/${this.sanitize(nextTopic)}`,
      followUpActions: ['Review prerequisites', 'Start learning', 'Get help'],
    };
  }

  private extractTopicFromContent(content: string): string {
    // Extract primary topic
    const words = content.split(/[\s,.:]+/).filter((w) => w.length > 3);
    return words.slice(0, 3).join(' ');
  }

  private estimateLearnTime(comprehensionLevel: string): number {
    const estimates = {
      beginner: 45,
      intermediate: 30,
      advanced: 20,
    };
    return estimates[comprehensionLevel as keyof typeof estimates] || 30;
  }

  private findAlignedGoal(suggestion: string, goals: string[]): string {
    const suggestionLower = suggestion.toLowerCase();
    return (
      goals.find((g) => suggestionLower.includes(g.toLowerCase())) || goals[0] || 'Your Goal'
    );
  }

  private extractCapability(content: string): string {
    // Extract capability name
    const patterns = [/capability[:\s]+([^,.\n]+)/, /feature[:\s]+([^,.\n]+)/];
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    return 'New Capability';
  }

  private suggestNextTopic(context: ActionContext): string {
    const completed = context.learningHistory;
    const progressions: Record<string, string> = {
      'basics': 'Advanced Concepts',
      'fundamentals': 'Integration Patterns',
      'app studio': 'Deployment',
      'mainnet': 'Optimization',
    };

    for (const [key, value] of Object.entries(progressions)) {
      if (completed.some((t) => t.toLowerCase().includes(key))) {
        return value;
      }
    }

    return 'Explore Advanced Topics';
  }

  private sanitize(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-');
  }
}

export { ActionGenerator };
