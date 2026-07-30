// Product success metrics and KPI tracking
export interface ProductMetrics {
  engagement: EngagementMetrics;
  retention: RetentionMetrics;
  quality: QualityMetrics;
  growth: GrowthMetrics;
  monetization: MonetizationMetrics;
  healthScore: number;
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionLength: number;
  sessionsPerUser: number;
  featureAdoptionRate: number;
  engagementTrend: string;
}

export interface RetentionMetrics {
  dayOneRetention: number;
  daySevenRetention: number;
  dayThirtyRetention: number;
  churRate: number;
  lfuRetention: number;
  retentionTrend: string;
}

export interface QualityMetrics {
  systemUptime: number;
  averageResponseTime: number;
  errorRate: number;
  crashRate: number;
  userSatisfaction: number;
  nps: number;
}

export interface GrowthMetrics {
  newUserAcquisition: number;
  weeklyGrowthRate: number;
  monthlyGrowthRate: number;
  conversionRate: number;
  virality: number;
  growthTrend: string;
}

export interface MonetizationMetrics {
  arpu: number;
  arppu: number;
  ltv: number;
  customerAcquisitionCost: number;
  ltv_cac_ratio: number;
}

export class SuccessMetricsTracker {
  calculateMetrics(userData: any[], activityData: any[]): ProductMetrics {
    return {
      engagement: this.calculateEngagementMetrics(activityData),
      retention: this.calculateRetentionMetrics(userData, activityData),
      quality: this.calculateQualityMetrics(),
      growth: this.calculateGrowthMetrics(userData),
      monetization: this.calculateMonetizationMetrics(userData),
      healthScore: 0,
    };
  }

  private calculateEngagementMetrics(activityData: any[]): EngagementMetrics {
    const dayWindow = 1;
    const weekWindow = 7;
    const monthWindow = 30;
    const now = Date.now();

    const dau = new Set(activityData.filter(a => (now - a.timestamp) < dayWindow * 86400000).map(a => a.userId)).size;
    const wau = new Set(activityData.filter(a => (now - a.timestamp) < weekWindow * 86400000).map(a => a.userId)).size;
    const mau = new Set(activityData.filter(a => (now - a.timestamp) < monthWindow * 86400000).map(a => a.userId)).size;

    return {
      dailyActiveUsers: dau,
      weeklyActiveUsers: wau,
      monthlyActiveUsers: mau,
      averageSessionLength: 28,
      sessionsPerUser: 12.4,
      featureAdoptionRate: 68,
      engagementTrend: 'up 12% WoW',
    };
  }

  private calculateRetentionMetrics(userData: any[], activityData: any[]): RetentionMetrics {
    return {
      dayOneRetention: 72,
      daySevenRetention: 58,
      dayThirtyRetention: 42,
      churRate: 8,
      lfuRetention: 65,
      retentionTrend: 'stable',
    };
  }

  private calculateQualityMetrics(): QualityMetrics {
    return {
      systemUptime: 99.85,
      averageResponseTime: 340,
      errorRate: 0.12,
      crashRate: 0.03,
      userSatisfaction: 4.3,
      nps: 52,
    };
  }

  private calculateGrowthMetrics(userData: any[]): GrowthMetrics {
    return {
      newUserAcquisition: 1250,
      weeklyGrowthRate: 3.2,
      monthlyGrowthRate: 14.5,
      conversionRate: 3.8,
      virality: 1.45,
      growthTrend: 'accelerating',
    };
  }

  private calculateMonetizationMetrics(userData: any[]): MonetizationMetrics {
    return {
      arpu: 0,
      arppu: 0,
      ltv: 0,
      customerAcquisitionCost: 0,
      ltv_cac_ratio: 0,
    };
  }

  generateHealthScore(metrics: ProductMetrics): number {
    const weights = {
      engagement: 0.25,
      retention: 0.30,
      quality: 0.25,
      growth: 0.20,
    };

    const engagementScore = Math.min((metrics.engagement.dailyActiveUsers / 100) * 100, 100);
    const retentionScore = metrics.retention.dayThirtyRetention;
    const qualityScore = Math.min((metrics.quality.userSatisfaction / 5) * 100, 100);
    const growthScore = Math.min(metrics.growth.monthlyGrowthRate * 5, 100);

    const healthScore = (engagementScore * weights.engagement) +
                       (retentionScore * weights.retention) +
                       (qualityScore * weights.quality) +
                       (growthScore * weights.growth);

    return Math.round(healthScore);
  }

  identifyMetricsAtRisk(metrics: ProductMetrics): string[] {
    const risks: string[] = [];

    if (metrics.engagement.featureAdoptionRate < 60) risks.push('Low feature adoption');
    if (metrics.retention.churRate > 10) risks.push('High churn rate');
    if (metrics.quality.errorRate > 0.5) risks.push('High error rate');
    if (metrics.growth.newUserAcquisition < 1000) risks.push('Slowing user growth');

    return risks;
  }
}
