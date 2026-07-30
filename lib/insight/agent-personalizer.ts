import type { UserMemory, PersonalProfile } from './data';

// Agent Personalizer - tailors content to each user
// Respects learning style, preferences, and goals
// Internal-only

export interface PersonalizationContext {
  userId: string;
  learningStyle: 'visual' | 'text' | 'interactive' | 'hands-on';
  comprehensionLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLanguage: string;
  currentGoal?: string;
  recentTopics: string[];
  engagementLevel: number; // 0-100
  timeAvailable: 'quick' | 'standard' | 'deep'; // Expected time for learning
}

export interface PersonalizedContent {
  headline: string;
  summary: string;
  detailedExplanation: string;
  nextBestAction: string;
  relatedTopics: Array<{
    title: string;
    reason: string;
    urgency: 'immediate' | 'soon' | 'future';
  }>;
  reminderTiming: 'now' | '1h' | '4h' | '1d' | '3d' | '1w';
  learningPath?: {
    prerequisite: string | null;
    current: string;
    next: string | null;
  };
}

class Personalizer {
  // Personalize content based on user context
  personalize(
    content: { official: string; analysis: string; suggestion: string },
    context: PersonalizationContext,
    memory: UserMemory
  ): PersonalizedContent {
    return {
      headline: this.generateHeadline(content, context),
      summary: this.generateSummary(content, context),
      detailedExplanation: this.generateDetailedExplanation(content, context),
      nextBestAction: this.generateNextBestAction(content, context, memory),
      relatedTopics: this.identifyRelatedTopics(content, context, memory),
      reminderTiming: this.recommendReminderTiming(context, memory),
      learningPath: this.generateLearningPath(content, context, memory),
    };
  }

  private generateHeadline(
    content: { official: string; analysis: string; suggestion: string },
    context: PersonalizationContext
  ): string {
    // Create compelling, concise headline tailored to learning style
    if (context.learningStyle === 'visual') {
      return `📊 New Pi Update: Visual Guide Available`;
    } else if (context.learningStyle === 'interactive') {
      return `🎯 Try This: Interactive Pi Feature`;
    } else if (context.learningStyle === 'hands-on') {
      return `🔧 Build With: New Pi Capability`;
    }
    return `📖 Pi Update Summary`;
  }

  private generateSummary(
    content: { official: string; analysis: string; suggestion: string },
    context: PersonalizationContext
  ): string {
    // Tailor summary length and complexity to comprehension level
    if (context.comprehensionLevel === 'beginner') {
      return `Simple explanation suitable for beginners: ${this.simplifyContent(content.official, 0.3)}`;
    } else if (context.comprehensionLevel === 'advanced') {
      return `Technical details: ${content.official}`;
    }
    return content.official;
  }

  private generateDetailedExplanation(
    content: { official: string; analysis: string; suggestion: string },
    context: PersonalizationContext
  ): string {
    if (context.timeAvailable === 'quick') {
      return this.truncateContent(content.analysis, 200);
    } else if (context.timeAvailable === 'deep') {
      return `${content.official}\n\nAnalysis:\n${content.analysis}`;
    }
    return content.analysis;
  }

  private generateNextBestAction(
    content: { official: string; analysis: string; suggestion: string },
    context: PersonalizationContext,
    memory: UserMemory
  ): string {
    // Generate most relevant action based on goals and history
    if (context.currentGoal) {
      return `Next step toward "${context.currentGoal}": ${this.suggestActionForGoal(context.currentGoal, content, memory)}`;
    }

    if (context.learningStyle === 'hands-on') {
      return `Try it: Build a small project using this new capability`;
    } else if (context.learningStyle === 'interactive') {
      return `Explore: Interactive tutorial available`;
    }

    return `Learn more: Detailed documentation and examples`;
  }

  private identifyRelatedTopics(
    content: { official: string; analysis: string; suggestion: string },
    context: PersonalizationContext,
    memory: UserMemory
  ): Array<{ title: string; reason: string; urgency: 'immediate' | 'soon' | 'future' }> {
    const related: Array<{ title: string; reason: string; urgency: 'immediate' | 'soon' | 'future' }> =
      [];

    // Topics that would help understand this better
    const prerequisites = this.extractPrerequisites(content.analysis);
    prerequisites.forEach((p) => {
      if (!memory.completedTopics?.includes(p)) {
        related.push({
          title: p,
          reason: 'Prerequisite knowledge for this update',
          urgency: 'immediate',
        });
      }
    });

    // Topics that build on this
    const nextTopics = this.suggestNextTopics(content, context, memory);
    nextTopics.forEach((t) => {
      related.push({
        title: t,
        reason: 'Natural progression after this',
        urgency: 'soon',
      });
    });

    return related.slice(0, 3);
  }

  private recommendReminderTiming(
    context: PersonalizationContext,
    memory: UserMemory
  ): 'now' | '1h' | '4h' | '1d' | '3d' | '1w' {
    // Recommend when user should review/act on this
    if (context.timeAvailable === 'quick') {
      return 'now'; // User has time now
    }

    if (context.engagementLevel > 80) {
      return '4h'; // Highly engaged - follow up in 4h
    }

    if (context.engagementLevel < 40) {
      return '1w'; // Low engagement - space it out
    }

    // Check user's typical activity pattern
    const lastActivities = memory.conversationHistory?.slice(-5) || [];
    const hourOfDay = new Date().getHours();

    if (hourOfDay < 9) return '1h'; // Morning - soon
    if (hourOfDay > 17) return '1d'; // Evening - tomorrow

    return '4h'; // Default
  }

  private generateLearningPath(
    content: { official: string; analysis: string; suggestion: string },
    context: PersonalizationContext,
    memory: UserMemory
  ): { prerequisite: string | null; current: string; next: string | null } | undefined {
    // Only generate learning path for intermediate/advanced learners
    if (context.comprehensionLevel === 'beginner') {
      return undefined;
    }

    const current = this.extractMainTopic(content.official);
    const prerequisite = this.findMissingPrerequisite(current, memory.completedTopics || []);
    const nextStep = this.suggestNextStep(current, context, memory);

    return {
      prerequisite,
      current,
      next: nextStep,
    };
  }

  private simplifyContent(content: string, factor: number): string {
    // Simplify technical content for beginners
    const sentences = content.split('. ');
    const simplified = sentences.slice(0, Math.ceil(sentences.length * factor)).join('. ');
    return simplified.length > 3 ? simplified : content;
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  }

  private suggestActionForGoal(
    goal: string,
    content: { official: string; analysis: string; suggestion: string },
    memory: UserMemory
  ): string {
    // Match goal to specific action
    const goalLower = goal.toLowerCase();

    if (goalLower.includes('mainnet')) {
      return `Review mainnet readiness with this update`;
    } else if (goalLower.includes('app studio')) {
      return `Integrate this into your App Studio project`;
    } else if (goalLower.includes('wallet')) {
      return `Check wallet compatibility`;
    }

    return `Apply this knowledge to your project`;
  }

  private extractPrerequisites(content: string): string[] {
    // Extract prerequisite topics mentioned in analysis
    const keywords = [
      'requires knowledge of',
      'prerequisite',
      'should understand',
      'familiarity with',
    ];
    const prerequisites: string[] = [];

    keywords.forEach((k) => {
      const match = content.match(new RegExp(`${k}\\s+([^.,]+)`, 'i'));
      if (match) {
        prerequisites.push(match[1].trim());
      }
    });

    return prerequisites;
  }

  private suggestNextTopics(
    content: { official: string; analysis: string; suggestion: string },
    context: PersonalizationContext,
    memory: UserMemory
  ): string[] {
    // Suggest related learning topics
    return ['Advanced integration patterns', 'Performance optimization', 'Security best practices'];
  }

  private extractMainTopic(content: string): string {
    // Extract primary topic from content
    const words = content.split(' ');
    return words.slice(0, 3).join(' ');
  }

  private findMissingPrerequisite(topic: string, completed: string[]): string | null {
    // Check if user has completed prerequisites
    const prerequisites = {
      'advanced security': 'basic security concepts',
      'mainnet deployment': 'testnet experience',
      'wallet integration': 'SDK basics',
    };

    const prereq = prerequisites[topic.toLowerCase() as keyof typeof prerequisites];
    if (prereq && !completed.some((c) => c.toLowerCase().includes(prereq))) {
      return prereq;
    }

    return null;
  }

  private suggestNextStep(
    topic: string,
    context: PersonalizationContext,
    memory: UserMemory
  ): string | null {
    // Suggest next learning step
    const progressions: Record<string, string> = {
      'basic concepts': 'Intermediate patterns',
      'intermediate patterns': 'Advanced optimization',
      'advanced optimization': 'Production deployment',
    };

    return progressions[topic.toLowerCase()] || null;
  }
}

export { Personalizer };
