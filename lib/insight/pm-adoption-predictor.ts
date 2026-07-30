// Predict feature adoption and user impact
export interface AdoptionPrediction {
  featureId: string;
  predictedAdoptionRate: number;
  adoptionCurve: string;
  timeToMainstream: number;
  peakAdoptionMonth: string;
  estimatedImpactedUsers: number;
  userSegmentAdoption: Record<string, AdoptionSegment>;
  successFactors: string[];
  riskFactors: string[];
  recommendedLaunchStrategy: string;
}

export interface AdoptionSegment {
  segmentName: string;
  adoptionRate: number;
  adoptionSpeed: string;
  timeToAdopt: number;
  keyBarriers: string[];
  successCriteria: string[];
}

export interface UserImpactEstimate {
  featureId: string;
  directlyAffected: number;
  indirectlyAffected: number;
  productivityGain: number;
  engagementImprovement: number;
  retentionImprovement: number;
  userSatisfactionLift: number;
  totalValueCreated: number;
}

export class AdoptionPredictor {
  predictAdoption(feature: any, marketContext: any): AdoptionPrediction {
    const adoptionRate = this.calculateAdoptionRate(feature);
    const curve = this.predictAdoptionCurve(adoptionRate, feature);

    return {
      featureId: feature.id,
      predictedAdoptionRate: adoptionRate,
      adoptionCurve: curve,
      timeToMainstream: this.estimateTimeToMainstream(adoptionRate),
      peakAdoptionMonth: this.estimatePeakMonth(feature),
      estimatedImpactedUsers: this.estimateImpactedUsers(adoptionRate, marketContext),
      userSegmentAdoption: this.predictSegmentAdoption(feature),
      successFactors: this.identifySuccessFactors(feature),
      riskFactors: this.identifyRiskFactors(feature),
      recommendedLaunchStrategy: this.recommendLaunchStrategy(feature),
    };
  }

  estimateUserImpact(feature: any, adoptionRate: number): UserImpactEstimate {
    const affectedUsers = Math.round(1000 * (adoptionRate / 100));
    
    return {
      featureId: feature.id,
      directlyAffected: affectedUsers,
      indirectlyAffected: Math.round(affectedUsers * 0.6),
      productivityGain: Math.round(affectedUsers * 12),
      engagementImprovement: Math.round(adoptionRate * 0.8),
      retentionImprovement: Math.round(adoptionRate * 0.5),
      userSatisfactionLift: Math.round(adoptionRate * 0.7),
      totalValueCreated: Math.round(affectedUsers * 150),
    };
  }

  private calculateAdoptionRate(feature: any): number {
    const demandScore = feature.userDemand || 70;
    const easeScore = Math.max(100 - (feature.effortEstimate || 50), 30);
    const valueFit = (feature.businessValue + feature.userImpact) / 2;

    return Math.round((demandScore * 0.4) + (easeScore * 0.3) + (valueFit * 0.3));
  }

  private predictAdoptionCurve(adoptionRate: number, feature: any): string {
    if (adoptionRate > 80) return 'Exponential Growth (S-curve)';
    if (adoptionRate > 65) return 'Steady Growth (Linear)';
    if (adoptionRate > 50) return 'Gradual Growth';
    return 'Niche Adoption';
  }

  private estimateTimeToMainstream(adoptionRate: number): number {
    if (adoptionRate > 80) return 3;
    if (adoptionRate > 65) return 4;
    if (adoptionRate > 50) return 6;
    return 9;
  }

  private estimatePeakMonth(feature: any): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = new Date().getMonth();
    const peakOffset = Math.round((feature.effortEstimate || 50) / 10);
    const peakMonth = (currentMonth + peakOffset) % 12;
    return months[peakMonth];
  }

  private estimateImpactedUsers(adoptionRate: number, context: any): number {
    const totalUsers = context.totalUsers || 1000;
    return Math.round(totalUsers * (adoptionRate / 100));
  }

  private predictSegmentAdoption(feature: any): Record<string, AdoptionSegment> {
    return {
      'Early Adopters': {
        segmentName: 'Early Adopters',
        adoptionRate: 85,
        adoptionSpeed: 'Very Fast (Week 1)',
        timeToAdopt: 1,
        keyBarriers: [],
        successCriteria: ['Feature availability', 'Social proof'],
      },
      'Mainstream Users': {
        segmentName: 'Mainstream Users',
        adoptionRate: 65,
        adoptionSpeed: 'Gradual (Weeks 2-8)',
        timeToAdopt: 6,
        keyBarriers: ['Learning curve', 'Habit change'],
        successCriteria: ['Tutorials', 'Success examples', 'Community discussion'],
      },
      'Laggards': {
        segmentName: 'Laggards',
        adoptionRate: 35,
        adoptionSpeed: 'Slow (Months 2-6)',
        timeToAdopt: 16,
        keyBarriers: ['Skepticism', 'Effort required', 'Uncertainty'],
        successCriteria: ['Mandatory features', 'High social pressure', 'Clear ROI demonstration'],
      },
    };
  }

  private identifySuccessFactors(feature: any): string[] {
    return [
      'Clear value communication and onboarding',
      'Integration with existing workflows',
      'Early wins and quick visible benefits',
      'Community evangelization and social proof',
      'Continuous improvement based on feedback',
      'Mobile-first accessibility',
    ];
  }

  private identifyRiskFactors(feature: any): string[] {
    if (feature.effortEstimate > 80) {
      return ['Complex implementation may cause issues', 'Longer development delays adoption'];
    }
    return ['Market saturation', 'User resistance to change'];
  }

  private recommendLaunchStrategy(feature: any): string {
    if (feature.userDemand > 85) return 'Beta → Limited Release → Full Launch';
    if (feature.userDemand > 70) return 'Phased Rollout → Full Launch';
    return 'Targeted Beta → Conditional Release';
  }
}
