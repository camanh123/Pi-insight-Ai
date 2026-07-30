export interface Anomaly {
  id: string;
  type: 'performance_degradation' | 'user_dissatisfaction' | 'adoption_drop' | 'unusual_pattern' | 'data_quality';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedEngines: string[];
  detectedAt: Date;
  metrics: Record<string, number>;
  recommendedAction: string;
}

class AnomalyDetector {
  private baselines: Map<string, any> = new Map();
  private anomalies: Anomaly[] = [];
  private threshold = 0.3; // 30% deviation triggers anomaly

  setBaseline(engineType: string, metrics: any): void {
    this.baselines.set(engineType, {
      successRate: metrics.successRate,
      averageRating: metrics.averageRating,
      adoptionRate: metrics.adoptionRate,
      completionRate: metrics.completionRate,
      timestamp: new Date(),
    });
  }

  detectAnomalies(engineType: string, currentMetrics: any): Anomaly[] {
    const baseline = this.baselines.get(engineType);
    if (!baseline) {
      this.setBaseline(engineType, currentMetrics);
      return [];
    }

    const detected: Anomaly[] = [];

    // Performance degradation
    const successRateDelta = Math.abs(currentMetrics.successRate - baseline.successRate) / baseline.successRate;
    if (successRateDelta > this.threshold) {
      detected.push({
        id: `anomaly-${Date.now()}-1`,
        type: 'performance_degradation',
        severity: successRateDelta > 0.5 ? 'critical' : 'high',
        description: `Success rate dropped from ${(baseline.successRate * 100).toFixed(1)}% to ${(currentMetrics.successRate * 100).toFixed(1)}%`,
        affectedEngines: [engineType],
        detectedAt: new Date(),
        metrics: {
          baseline: baseline.successRate,
          current: currentMetrics.successRate,
          delta: successRateDelta,
        },
        recommendedAction: 'Investigate recent changes, run diagnostics, consider rollback',
      });
    }

    // User dissatisfaction
    const ratingDelta = Math.abs(currentMetrics.averageRating - baseline.averageRating);
    if (ratingDelta > 0.8) {
      detected.push({
        id: `anomaly-${Date.now()}-2`,
        type: 'user_dissatisfaction',
        severity: ratingDelta > 1.5 ? 'critical' : 'high',
        description: `Average rating dropped from ${baseline.averageRating.toFixed(1)} to ${currentMetrics.averageRating.toFixed(1)}`,
        affectedEngines: [engineType],
        detectedAt: new Date(),
        metrics: {
          baseline: baseline.averageRating,
          current: currentMetrics.averageRating,
          delta: ratingDelta,
        },
        recommendedAction: 'Review user feedback, identify pain points, prioritize fixes',
      });
    }

    // Adoption drop
    const adoptionDelta = Math.abs(currentMetrics.adoptionRate - baseline.adoptionRate) / baseline.adoptionRate;
    if (adoptionDelta > this.threshold && currentMetrics.adoptionRate < baseline.adoptionRate) {
      detected.push({
        id: `anomaly-${Date.now()}-3`,
        type: 'adoption_drop',
        severity: adoptionDelta > 0.5 ? 'high' : 'medium',
        description: `Adoption rate dropped from ${(baseline.adoptionRate * 100).toFixed(1)}% to ${(currentMetrics.adoptionRate * 100).toFixed(1)}%`,
        affectedEngines: [engineType],
        detectedAt: new Date(),
        metrics: {
          baseline: baseline.adoptionRate,
          current: currentMetrics.adoptionRate,
          delta: adoptionDelta,
        },
        recommendedAction: 'Review onboarding, improve visibility, conduct user surveys',
      });
    }

    this.anomalies.push(...detected);
    return detected;
  }

  detectUnusualPatterns(data: any[]): Anomaly[] {
    const detected: Anomaly[] = [];

    if (data.length < 10) return detected;

    // Spike detection
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    values.forEach((val, idx) => {
      if (Math.abs(val - mean) > 3 * stdDev) {
        detected.push({
          id: `anomaly-${Date.now()}-${idx}`,
          type: 'unusual_pattern',
          severity: Math.abs(val - mean) > 5 * stdDev ? 'high' : 'medium',
          description: `Unusual spike detected: ${val} (normal range: ${(mean - 2 * stdDev).toFixed(2)}-${(mean + 2 * stdDev).toFixed(2)})`,
          affectedEngines: [data[idx].engineType],
          detectedAt: new Date(),
          metrics: { value: val, mean, stdDev },
          recommendedAction: 'Investigate cause, check for system errors or unusual activity',
        });
      }
    });

    return detected;
  }

  getAnomalies(engineType?: string, severity?: string): Anomaly[] {
    let filtered = this.anomalies;

    if (engineType) {
      filtered = filtered.filter(a => a.affectedEngines.includes(engineType));
    }

    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }

    return filtered.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  getCriticalAnomalies(): Anomaly[] {
    return this.getAnomalies(undefined, 'critical');
  }

  acknowledgeAnomaly(anomalyId: string): void {
    const anomaly = this.anomalies.find(a => a.id === anomalyId);
    if (anomaly) {
      this.anomalies = this.anomalies.filter(a => a.id !== anomalyId);
    }
  }

  getAnomalyTrend(engineType: string, timeWindowDays: number = 7): {
    total: number;
    critical: number;
    high: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  } {
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeWindowDays * 24 * 60 * 60 * 1000);

    const recent = this.getAnomalies(engineType).filter(a => new Date(a.detectedAt) > cutoff);
    const criticalCount = recent.filter(a => a.severity === 'critical').length;
    const highCount = recent.filter(a => a.severity === 'high').length;

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (recent.length > 3) {
      const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
      const secondHalf = recent.slice(Math.floor(recent.length / 2));
      if (secondHalf.length > firstHalf.length) trend = 'increasing';
      else if (secondHalf.length < firstHalf.length) trend = 'decreasing';
    }

    return {
      total: recent.length,
      critical: criticalCount,
      high: highCount,
      trend,
    };
  }
}

export const anomalyDetector = new AnomalyDetector();
