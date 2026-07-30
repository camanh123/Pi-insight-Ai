// Agent Notification Formatter - formats all messages with clear source attribution
// Always separates Official Information, AI Analysis, and AI Recommendations
// Internal-only

export interface FormattedNotification {
  id: string;
  userId: string;
  title: string;
  body: {
    official: Array<{ label: string; content: string; source: string; confidence: string }>;
    analysis: Array<{ label: string; content: string; reasoning: string; confidence: string }>;
    recommendations: Array<{
      label: string;
      content: string;
      rationale: string;
      confidence: string;
    }>;
  };
  nextBestAction: {
    title: string;
    description: string;
    url?: string;
    estimatedTime?: number;
  };
  metadata: {
    priority: 'critical' | 'high' | 'normal' | 'low';
    relevanceScore: number;
    timestamp: Date;
    expiresAt: Date;
    tags: string[];
  };
  userPreferences: {
    displayFormat: 'compact' | 'detailed' | 'minimal';
    includeRecommendations: boolean;
    includeAnalysis: boolean;
  };
}

class NotificationFormatter {
  formatNotification(
    official: string,
    analysis: string,
    suggestions: string,
    nextBestAction: string,
    userPreferences: {
      displayFormat: 'compact' | 'detailed' | 'minimal';
      includeRecommendations: boolean;
      includeAnalysis: boolean;
    },
    priority: 'critical' | 'high' | 'normal' | 'low',
    relevanceScore: number,
    tags: string[] = []
  ): FormattedNotification {
    const id = this.generateId();
    const now = new Date();

    return {
      id,
      userId: 'user-context-will-be-injected',
      title: this.generateTitle(official, priority),
      body: {
        official: this.formatOfficial(official),
        analysis: userPreferences.includeAnalysis ? this.formatAnalysis(analysis) : [],
        recommendations: userPreferences.includeRecommendations
          ? this.formatRecommendations(suggestions)
          : [],
      },
      nextBestAction: this.formatAction(nextBestAction),
      metadata: {
        priority,
        relevanceScore,
        timestamp: now,
        expiresAt: this.calculateExpiration(priority),
        tags,
      },
      userPreferences,
    };
  }

  private generateTitle(official: string, priority: string): string {
    const priorityEmojis: Record<string, string> = {
      critical: '🚨',
      high: '⚡',
      normal: '📋',
      low: '💡',
    };

    const firstSentence = official.split(/[.!?]+/)[0].slice(0, 60);
    return `${priorityEmojis[priority]} ${firstSentence}...`;
  }

  private formatOfficial(
    content: string
  ): Array<{ label: string; content: string; source: string; confidence: string }> {
    // Break down official information into sections
    const sections = this.splitContent(content);

    return sections.map((section, index) => ({
      label: `Official Information ${index + 1 > 1 ? index + 1 : ''}`.trim(),
      content: section,
      source: 'Official Pi Core Team',
      confidence: '✓✓✓ Verified',
    }));
  }

  private formatAnalysis(
    content: string
  ): Array<{ label: string; content: string; reasoning: string; confidence: string }> {
    // Break down AI analysis
    const sections = this.splitContent(content);

    return sections.map((section, index) => ({
      label: `AI Analysis ${index + 1 > 1 ? index + 1 : ''}`.trim(),
      content: section,
      reasoning: 'Based on official documentation and verified sources',
      confidence: '✓✓ High Confidence',
    }));
  }

  private formatRecommendations(
    content: string
  ): Array<{ label: string; content: string; rationale: string; confidence: string }> {
    // Break down AI suggestions
    const sections = this.splitContent(content);

    return sections.map((section, index) => ({
      label: `Suggestion ${index + 1 > 1 ? index + 1 : ''}`.trim(),
      content: section,
      rationale: 'Personalized based on your learning history and goals',
      confidence: '○ Moderate Confidence',
    }));
  }

  private formatAction(nextBestAction: string): {
    title: string;
    description: string;
    url?: string;
    estimatedTime?: number;
  } {
    // Parse next best action into structured format
    const lines = nextBestAction.split('\n').filter((l) => l.trim());

    return {
      title: lines[0] || 'View Details',
      description: lines.slice(1).join(' ') || '',
      estimatedTime: this.extractTime(nextBestAction),
    };
  }

  private splitContent(content: string): string[] {
    // Split long content into digestible chunks
    const paragraphs = content.split(/\n\n+/);

    return paragraphs.flatMap((p) => {
      if (p.length > 500) {
        // Split very long paragraphs
        const sentences = p.split(/(?<=[.!?])\s+/);
        const chunks: string[] = [];
        let current = '';

        for (const sentence of sentences) {
          if ((current + sentence).length > 250) {
            if (current) chunks.push(current.trim());
            current = sentence;
          } else {
            current += (current ? ' ' : '') + sentence;
          }
        }

        if (current) chunks.push(current.trim());
        return chunks;
      }

      return [p];
    });
  }

  private calculateExpiration(priority: string): Date {
    const now = new Date();
    const expirations: Record<string, number> = {
      critical: 7 * 24 * 60 * 60 * 1000, // 7 days
      high: 3 * 24 * 60 * 60 * 1000, // 3 days
      normal: 24 * 60 * 60 * 1000, // 1 day
      low: 6 * 60 * 60 * 1000, // 6 hours
    };

    const ms = expirations[priority] || expirations.normal;
    return new Date(now.getTime() + ms);
  }

  private extractTime(content: string): number | undefined {
    const match = content.match(/(\d+)\s*(minute|hour|hour)/i);
    if (!match) return undefined;

    const number = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (unit.includes('hour')) return number * 60;
    return number;
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Format for display in UI
  toMarkdown(notification: FormattedNotification): string {
    let markdown = `# ${notification.title}\n\n`;

    // Official information
    if (notification.body.official.length > 0) {
      markdown += `## 📋 Official Information\n\n`;
      notification.body.official.forEach((item) => {
        markdown += `**${item.label}** (${item.confidence})\n\n`;
        markdown += `> ${item.source}\n\n`;
        markdown += `${item.content}\n\n`;
      });
    }

    // AI Analysis
    if (notification.body.analysis.length > 0) {
      markdown += `## 🔍 AI Analysis\n\n`;
      notification.body.analysis.forEach((item) => {
        markdown += `**${item.label}** (${item.confidence})\n\n`;
        markdown += `_${item.reasoning}_\n\n`;
        markdown += `${item.content}\n\n`;
      });
    }

    // AI Recommendations
    if (notification.body.recommendations.length > 0) {
      markdown += `## ✨ AI Recommendations\n\n`;
      notification.body.recommendations.forEach((item) => {
        markdown += `**${item.label}** (${item.confidence})\n\n`;
        markdown += `_${item.rationale}_\n\n`;
        markdown += `${item.content}\n\n`;
      });
    }

    // Next best action
    if (notification.nextBestAction.title) {
      markdown += `## 🎯 Next Best Action\n\n`;
      markdown += `**${notification.nextBestAction.title}**\n\n`;
      markdown += `${notification.nextBestAction.description}`;
      if (notification.nextBestAction.estimatedTime) {
        markdown += `\n\n⏱️ Estimated time: ${notification.nextBestAction.estimatedTime} minutes`;
      }
    }

    return markdown;
  }

  // Format for JSON API
  toJSON(notification: FormattedNotification): Record<string, unknown> {
    return {
      id: notification.id,
      title: notification.title,
      official: notification.body.official,
      analysis: notification.body.analysis,
      recommendations: notification.body.recommendations,
      nextBestAction: notification.nextBestAction,
      priority: notification.metadata.priority,
      relevanceScore: notification.metadata.relevanceScore,
      tags: notification.metadata.tags,
      expiresAt: notification.metadata.expiresAt.toISOString(),
    };
  }
}

export { NotificationFormatter };
