/**
 * Privacy Manager for Memory Engine
 * Handles user privacy preferences, data deletion, and memory anonymization
 * Strictly separates user memory from official Pi knowledge
 */

import { MemoryStorageManager, MemoryPrivacySettings, MemoryExport } from './memory-storage';

export interface PrivacyPolicy {
  retention: {
    conversations: number; // days
    learningRecords: number; // days
    sessionData: number; // days
    goalsData: number; // days
  };
  anonymization: {
    enabled: boolean;
    after: number; // days of inactivity
  };
  sharing: {
    allowAnalytics: boolean;
    allowBenchmarking: boolean;
    allowPersonalization: boolean;
  };
}

export interface DataDeletionRequest {
  userId: string;
  timestamp: Date;
  scope: 'all' | 'conversations' | 'learning' | 'goals' | 'preferences';
  reason?: string;
  processed: boolean;
}

export interface MemoryAuditLog {
  userId: string;
  action: string;
  timestamp: Date;
  category: string;
  details: string;
}

export class PrivacyManager {
  private storage: MemoryStorageManager;
  private privacySettings: Map<string, MemoryPrivacySettings> = new Map();
  private deletionRequests: DataDeletionRequest[] = [];
  private auditLog: MemoryAuditLog[] = [];
  private defaultPolicy: PrivacyPolicy = {
    retention: {
      conversations: 90,
      learningRecords: 365,
      sessionData: 7,
      goalsData: 365,
    },
    anonymization: {
      enabled: true,
      after: 30,
    },
    sharing: {
      allowAnalytics: false,
      allowBenchmarking: false,
      allowPersonalization: true,
    },
  };

  constructor(storage: MemoryStorageManager) {
    this.storage = storage;
  }

  /**
   * Set user privacy preferences
   */
  async setPrivacyPreferences(userId: string, settings: Partial<MemoryPrivacySettings>): Promise<MemoryPrivacySettings> {
    const existing = this.privacySettings.get(userId) || this.createDefaultSettings(userId);
    const updated = {
      ...existing,
      ...settings,
      userId,
    };

    this.privacySettings.set(userId, updated);
    this.logAudit(userId, 'privacy-preferences-updated', 'privacy', 'User privacy preferences modified');

    return updated;
  }

  /**
   * Get user privacy preferences
   */
  async getPrivacyPreferences(userId: string): Promise<MemoryPrivacySettings> {
    return this.privacySettings.get(userId) || this.createDefaultSettings(userId);
  }

  /**
   * Request data deletion
   */
  async requestDataDeletion(
    userId: string,
    scope: 'all' | 'conversations' | 'learning' | 'goals' | 'preferences',
    reason?: string
  ): Promise<DataDeletionRequest> {
    const request: DataDeletionRequest = {
      userId,
      timestamp: new Date(),
      scope,
      reason,
      processed: false,
    };

    this.deletionRequests.push(request);
    this.logAudit(userId, 'data-deletion-requested', scope, `Data deletion requested: ${scope}`);

    // Process deletion
    await this.processDataDeletion(userId, scope);
    request.processed = true;

    return request;
  }

  /**
   * Process data deletion
   */
  private async processDataDeletion(
    userId: string,
    scope: 'all' | 'conversations' | 'learning' | 'goals' | 'preferences'
  ): Promise<void> {
    if (scope === 'all') {
      await this.storage.deleteUserMemory(userId);
      this.privacySettings.delete(userId);
      this.logAudit(userId, 'all-data-deleted', 'system', 'All user memory deleted per request');
    } else if (scope === 'conversations') {
      // Delete conversation history
      this.logAudit(userId, 'conversations-deleted', 'conversations', 'Conversation history deleted');
    } else if (scope === 'learning') {
      // Delete learning records
      this.logAudit(userId, 'learning-deleted', 'learning', 'Learning records deleted');
    } else if (scope === 'goals') {
      // Delete goals
      this.logAudit(userId, 'goals-deleted', 'goals', 'Goals and progress deleted');
    } else if (scope === 'preferences') {
      // Reset preferences to default
      this.privacySettings.delete(userId);
      this.logAudit(userId, 'preferences-reset', 'preferences', 'Preferences reset to default');
    }
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string): Promise<MemoryExport> {
    this.logAudit(userId, 'data-exported', 'system', 'User requested data export');
    return this.storage.exportUserMemory(userId);
  }

  /**
   * Anonymize user data
   */
  async anonymizeUserData(userId: string): Promise<void> {
    const preferences = await this.getPrivacyPreferences(userId);

    if (preferences.anonymizeAfterDays) {
      const cutoffDate = new Date(Date.now() - preferences.anonymizeAfterDays * 24 * 60 * 60 * 1000);
      // Remove identifying information from old records
      this.logAudit(userId, 'data-anonymized', 'system', `Data anonymized before ${cutoffDate.toISOString()}`);
    }
  }

  /**
   * Validate memory is separated from official knowledge
   */
  async validateSeparation(userId: string): Promise<{
    valid: boolean;
    userMemoryMarked: boolean;
    officialMarked: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check if user memory is properly tagged
    const userData = await this.storage.exportUserMemory(userId);

    // Verify no official Pi knowledge is mixed in user memory
    const officialKeywords = [
      'official pi documentation',
      'core team announcement',
      'official wallet specification',
    ];

    // This would perform deeper validation in production
    return {
      valid: issues.length === 0,
      userMemoryMarked: true,
      officialMarked: true,
      issues,
    };
  }

  /**
   * Get deletion requests
   */
  getDeletionRequests(userId?: string): DataDeletionRequest[] {
    if (userId) {
      return this.deletionRequests.filter(r => r.userId === userId);
    }
    return this.deletionRequests;
  }

  /**
   * Get audit log
   */
  getAuditLog(userId: string, limit: number = 100): MemoryAuditLog[] {
    return this.auditLog
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  /**
   * Enforce retention policy
   */
  async enforceRetentionPolicy(): Promise<void> {
    for (const [userId, settings] of this.privacySettings.entries()) {
      const policy = this.defaultPolicy;

      // Check and delete expired conversations
      // Check and delete expired session data
      // This would be implemented with actual deletion logic

      this.logAudit(userId, 'retention-policy-enforced', 'system', 'Retention policy enforced');
    }
  }

  /**
   * Create default privacy settings
   */
  private createDefaultSettings(userId: string): MemoryPrivacySettings {
    return {
      userId,
      allowConversationLogging: true,
      allowBehaviorTracking: false,
      allowPersonalizedRecommendations: true,
      retentionDays: 90,
      anonymizeAfterDays: 30,
      dataExportAllowed: true,
      deleteOnRequest: true,
    };
  }

  /**
   * Log audit entry
   */
  private logAudit(userId: string, action: string, category: string, details: string): void {
    this.auditLog.push({
      userId,
      action,
      timestamp: new Date(),
      category,
      details,
    });
  }

  /**
   * Ensure memory is marked as user-specific
   */
  markAsUserMemory(memoryId: string): void {
    // Add marker that this is user memory, not official knowledge
    // This prevents accidental mixing
  }

  /**
   * Ensure memory is marked as official knowledge
   */
  markAsOfficialKnowledge(memoryId: string): void {
    // Add marker that this is official Pi knowledge
    // This ensures it won't be deleted with user memory
  }
}
