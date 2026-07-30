/**
 * Reasoning Formatter
 * Formats reasoning results for clear presentation to users
 * Separates Official Information, AI Analysis, and AI Suggestions
 */

export interface FormattedReasoning {
  query: string;
  officialInformation: FormattedSection[];
  aiAnalysis: FormattedSection[];
  aiSuggestions: FormattedSection[];
  reasoning: FormattedReasoning;
  confidence: ConfidenceIndicator;
  disclaimers: string[];
  markdown: string;
}

export interface FormattedSection {
  title: string;
  content: string;
  source: string;
  confidence: string;
  evidence: string[];
  relatedTopics: string[];
}

export interface ConfidenceIndicator {
  score: number; // 0-100
  level: 'very-high' | 'high' | 'moderate' | 'low' | 'very-low';
  symbol: string;
  description: string;
}

export class ReasoningFormatter {
  /**
   * Format reasoning result with clear separation of information types
   */
  formatReasoning(reasoningResult: any): FormattedReasoning {
    const officialInformation = this.formatOfficialInformation(reasoningResult);
    const aiAnalysis = this.formatAIAnalysis(reasoningResult);
    const aiSuggestions = this.formatAISuggestions(reasoningResult);
    const confidence = this.getConfidenceIndicator(reasoningResult.confidenceScore);
    const disclaimers = this.generateDisclaimers(reasoningResult);
    const markdown = this.generateMarkdown(
      officialInformation,
      aiAnalysis,
      aiSuggestions,
      confidence,
      disclaimers
    );

    return {
      query: reasoningResult.query,
      officialInformation,
      aiAnalysis,
      aiSuggestions,
      reasoning: reasoningResult,
      confidence,
      disclaimers,
      markdown,
    };
  }

  /**
   * Format official information section
   */
  private formatOfficialInformation(reasoningResult: any): FormattedSection[] {
    const sections: FormattedSection[] = [];

    if (reasoningResult.officialInformation && reasoningResult.officialInformation.length > 0) {
      const official = reasoningResult.officialInformation[0];
      sections.push({
        title: '📋 Official Information',
        content: official.content,
        source: `From ${official.source}`,
        confidence: `${official.confidence}% verified`,
        evidence: reasoningResult.verifiedKnowledge.map(k => `• ${k.fact}`),
        relatedTopics: this.extractTopics(official.content),
      });
    }

    // Add historical context if available
    if (reasoningResult.historicalContext && reasoningResult.historicalContext.length > 0) {
      sections.push({
        title: '📚 Historical Context',
        content: reasoningResult.historicalContext[0],
        source: 'From historical records',
        confidence: '75% reliable',
        evidence: reasoningResult.historicalContext.slice(0, 3),
        relatedTopics: this.extractTopics(reasoningResult.historicalContext[0]),
      });
    }

    return sections;
  }

  /**
   * Format AI analysis section
   */
  private formatAIAnalysis(reasoningResult: any): FormattedSection[] {
    const sections: FormattedSection[] = [];

    // Analysis from reasoning steps
    const analysisSteps = reasoningResult.reasoningSteps.filter(
      (s: any) => s.step !== 'recommendation-generation'
    );

    for (const step of analysisSteps) {
      sections.push({
        title: `🔍 ${this.formatStepTitle(step.step)}`,
        content: step.analysis,
        source: 'AI Analysis',
        confidence: this.formatConfidenceLevel(step.confidence),
        evidence: step.findings,
        relatedTopics: [],
      });
    }

    // Add risk assessment
    if (reasoningResult.riskFactors && reasoningResult.riskFactors.length > 0) {
      sections.push({
        title: '⚠️ Risk Analysis',
        content: `Identified ${reasoningResult.riskFactors.length} potential risk factors`,
        source: 'AI Analysis',
        confidence: 'High',
        evidence: reasoningResult.riskFactors.map(r => `• ${r}`),
        relatedTopics: [],
      });
    }

    return sections;
  }

  /**
   * Format AI suggestions section
   */
  private formatAISuggestions(reasoningResult: any): FormattedSection[] {
    const sections: FormattedSection[] = [];

    // Recommended path
    if (reasoningResult.recommendedPath) {
      const rec = reasoningResult.recommendedPath;
      sections.push({
        title: '✨ Recommended Approach',
        content: `${rec.alternative.title}: ${rec.alternative.description}`,
        source: 'AI Recommendation',
        confidence: `${rec.alternative.overallScore}% optimal`,
        evidence: [
          `Effort: ${rec.alternative.effort}`,
          `Timeline: ${rec.alternative.timeToComplete}`,
          `Impact: ${rec.alternative.impactScore}/100`,
          `Feasibility: ${rec.alternative.feasibilityScore}/100`,
          ...rec.nextSteps,
        ],
        relatedTopics: [],
      });

      // Alternative options
      if (reasoningResult.alternatives && reasoningResult.alternatives.length > 1) {
        const alternatives = reasoningResult.alternatives.filter(
          (a: any) => a.id !== rec.alternative.id
        );
        sections.push({
          title: '🔄 Alternative Options',
          content: `${alternatives.length} alternative approaches available`,
          source: 'AI Suggestions',
          confidence: 'Medium',
          evidence: alternatives.map(
            (a: any) => `${a.title}: ${a.overallScore}% optimal (${a.effort} effort)`
          ),
          relatedTopics: [],
        });
      }
    }

    // Related updates
    if (reasoningResult.relatedUpdates && reasoningResult.relatedUpdates.length > 0) {
      sections.push({
        title: '📢 Related Platform Updates',
        content: 'Recent updates that may affect this recommendation',
        source: 'AI Suggestions',
        confidence: 'Medium',
        evidence: reasoningResult.relatedUpdates.slice(0, 3),
        relatedTopics: [],
      });
    }

    return sections;
  }

  /**
   * Get confidence indicator with visual symbol
   */
  private getConfidenceIndicator(score: number): ConfidenceIndicator {
    let level: 'very-high' | 'high' | 'moderate' | 'low' | 'very-low';
    let symbol: string;
    let description: string;

    if (score >= 90) {
      level = 'very-high';
      symbol = '✓✓✓';
      description = 'Highly confident - based on verified official sources';
    } else if (score >= 75) {
      level = 'high';
      symbol = '✓✓';
      description = 'Confident - based on official and verified information';
    } else if (score >= 60) {
      level = 'moderate';
      symbol = '○';
      description = 'Moderately confident - some sources verified';
    } else if (score >= 40) {
      level = 'low';
      symbol = '△';
      description = 'Low confidence - limited verified sources';
    } else {
      level = 'very-low';
      symbol = '✗';
      description = 'Very low confidence - unverified or conflicting sources';
    }

    return { score, level, symbol, description };
  }

  /**
   * Generate disclaimers based on reasoning
   */
  private generateDisclaimers(reasoningResult: any): string[] {
    const disclaimers: string[] = [];

    if (reasoningResult.limitations && reasoningResult.limitations.length > 0) {
      disclaimers.push(...reasoningResult.limitations.map(l => `⚠️ ${l}`));
    }

    if (reasoningResult.riskFactors && reasoningResult.riskFactors.length > 0) {
      disclaimers.push(
        `⚠️ This recommendation involves ${reasoningResult.riskFactors.length} potential risk factors. Please review carefully.`
      );
    }

    disclaimers.push('ℹ️ This analysis is based on available information as of today. Please verify before implementation.');
    disclaimers.push('ℹ️ Always consult official Pi documentation for the most current information.');

    return disclaimers;
  }

  /**
   * Generate markdown representation
   */
  private generateMarkdown(
    officialInfo: FormattedSection[],
    aiAnalysis: FormattedSection[],
    aiSuggestions: FormattedSection[],
    confidence: ConfidenceIndicator,
    disclaimers: string[]
  ): string {
    let markdown = '';

    // Confidence header
    markdown += `## Confidence: ${confidence.symbol} ${confidence.level.toUpperCase()}\n`;
    markdown += `**Score:** ${confidence.score}%\n`;
    markdown += `${confidence.description}\n\n`;

    // Official Information
    if (officialInfo.length > 0) {
      markdown += '## 📋 OFFICIAL INFORMATION\n';
      markdown += '*Sourced from official Pi documentation and verified sources*\n\n';
      for (const section of officialInfo) {
        markdown += `### ${section.title}\n`;
        markdown += `${section.content}\n`;
        markdown += `**Source:** ${section.source}\n`;
        if (section.evidence.length > 0) {
          markdown += '**Evidence:**\n';
          markdown += section.evidence.map(e => `- ${e}\n`).join('');
        }
        markdown += '\n';
      }
    }

    // AI Analysis
    if (aiAnalysis.length > 0) {
      markdown += '## 🔍 AI ANALYSIS\n';
      markdown += '*Analysis performed by AI based on official sources and historical context*\n\n';
      for (const section of aiAnalysis) {
        markdown += `### ${section.title}\n`;
        markdown += `${section.content}\n`;
        markdown += `**Confidence:** ${section.confidence}\n`;
        if (section.evidence.length > 0) {
          markdown += '**Findings:**\n';
          markdown += section.evidence.map(e => `- ${e}\n`).join('');
        }
        markdown += '\n';
      }
    }

    // AI Suggestions
    if (aiSuggestions.length > 0) {
      markdown += '## ✨ AI SUGGESTIONS\n';
      markdown += '*Recommendations based on analysis - validate before implementation*\n\n';
      for (const section of aiSuggestions) {
        markdown += `### ${section.title}\n`;
        markdown += `${section.content}\n`;
        markdown += `**Confidence:** ${section.confidence}\n`;
        if (section.evidence.length > 0) {
          markdown += '**Details:**\n';
          markdown += section.evidence.map(e => `- ${e}\n`).join('');
        }
        markdown += '\n';
      }
    }

    // Disclaimers
    if (disclaimers.length > 0) {
      markdown += '## ⚠️ IMPORTANT DISCLAIMERS\n';
      markdown += disclaimers.map(d => `- ${d}\n`).join('');
    }

    return markdown;
  }

  /**
   * Helper: Format step title
   */
  private formatStepTitle(step: string): string {
    const titles: Record<string, string> = {
      'context-analysis': 'Context Analysis',
      'goal-identification': 'Goal Identification',
      'information-gathering': 'Information Gathering',
      'alternative-generation': 'Alternative Analysis',
      'risk-assessment': 'Risk Assessment',
      'confidence-estimation': 'Confidence Estimation',
      'recommendation-generation': 'Recommendation',
    };
    return titles[step] || step;
  }

  /**
   * Helper: Format confidence level
   */
  private formatConfidenceLevel(level: string): string {
    const levelMap: Record<string, string> = {
      'very-high': '✓✓✓ 95%',
      'high': '✓✓ 80%',
      'moderate': '○ 65%',
      'low': '△ 40%',
      'very-low': '✗ 20%',
    };
    return levelMap[level] || '○ Unknown';
  }

  /**
   * Helper: Extract topics from text
   */
  private extractTopics(text: string): string[] {
    const keywords = [
      'mainnet',
      'kyc',
      'wallet',
      'app studio',
      'sdk',
      'browser',
      'payments',
      'nodes',
      'identity',
      'notifications',
      'backend',
      'storage',
    ];
    return keywords.filter(k => text.toLowerCase().includes(k));
  }

  /**
   * Export formatted reasoning as JSON
   */
  exportJSON(formatted: FormattedReasoning): string {
    return JSON.stringify(formatted, null, 2);
  }

  /**
   * Export formatted reasoning as plain text
   */
  exportText(formatted: FormattedReasoning): string {
    let text = `REASONING ANALYSIS\n`;
    text += `Query: ${formatted.query}\n`;
    text += `Confidence: ${formatted.confidence.symbol} ${formatted.confidence.level} (${formatted.confidence.score}%)\n\n`;

    text += `OFFICIAL INFORMATION\n`;
    text += `${formatted.officialInformation.map(s => `${s.title}\n${s.content}`).join('\n\n')}\n\n`;

    text += `AI ANALYSIS\n`;
    text += `${formatted.aiAnalysis.map(s => `${s.title}\n${s.content}`).join('\n\n')}\n\n`;

    text += `AI SUGGESTIONS\n`;
    text += `${formatted.aiSuggestions.map(s => `${s.title}\n${s.content}`).join('\n\n')}\n\n`;

    text += `DISCLAIMERS\n`;
    text += formatted.disclaimers.join('\n');

    return text;
  }
}

export default new ReasoningFormatter();
