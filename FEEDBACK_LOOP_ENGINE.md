# Feedback Loop Engine - Internal Developer Guide

## Overview

The Feedback Loop Engine is an internal-only system that measures the effectiveness of all Pi Insight AI engines, learns from outcomes, identifies patterns, and continuously improves decision quality. It operates silently in the background and is never exposed to end users.

## Architecture

### 1. Feedback Loop Engine Core
The main orchestrator that:
- Records feedback from all AI modules
- Updates metrics continuously
- Identifies learning patterns automatically
- Detects anomalies in system behavior
- Generates comprehensive reports

### 2. Outcome Tracker
Manages action outcomes by:
- Recording action initiation and completion
- Tracking user engagement (clicked, ignored, marked useful, etc.)
- Calculating engagement rates and usefulness scores
- Analyzing follow-up actions
- Providing engagement statistics by engine

### 3. Learning Optimizer
Generates optimization plans by:
- Analyzing current vs. target metrics
- Identifying performance gaps
- Generating prioritized improvement actions
- Calculating ROI for each optimization
- Estimating impact on affected users

### 4. Improvement Recommender
Creates specific recommendations by:
- Analyzing metrics for accuracy issues
- Detecting relevance problems
- Identifying speed bottlenecks
- Spotting adoption gaps
- Addressing satisfaction concerns

### 5. Anomaly Detector
Monitors system health by:
- Comparing current metrics against baselines
- Detecting performance degradation
- Identifying user dissatisfaction patterns
- Tracking adoption changes
- Detecting unusual patterns with statistical methods

## API Endpoints

### POST /api/feedback-engine/analyze

#### record-feedback
Records feedback from any AI module about a user interaction.

```bash
curl -X POST http://localhost:3000/api/feedback-engine/analyze \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record-feedback",
    "engineType": "reasoning",
    "userId": "user-123",
    "metrics": {
      "outcome": "success",
      "rating": 4.5,
      "timeMs": 1200,
      "metadata": {"topic": "mainnet", "complexity": "high"}
    }
  }'
```

#### record-engagement
Records how users engaged with an action.

```bash
curl -X POST http://localhost:3000/api/feedback-engine/analyze \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record-engagement",
    "actionId": "action-123",
    "engagement": "clicked",
    "timeSpent": 45000
  }'
```

#### get-engine-metrics
Retrieves current metrics for a specific engine.

```bash
curl -X POST http://localhost:3000/api/feedback-engine/analyze \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get-engine-metrics",
    "engineType": "reasoning"
  }'
```

Response includes:
- Engine-specific metrics (success rate, rating, adoption)
- All engine metrics for comparison
- Detected anomalies

#### generate-report
Generates comprehensive system report.

```bash
curl -X POST http://localhost:3000/api/feedback-engine/analyze \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate-report"
  }'
```

Response includes:
- Complete feedback aggregation
- Learning patterns identified
- System anomalies detected
- Quality metrics across all engines

#### get-improvements
Gets specific improvement recommendations for an engine.

```bash
curl -X POST http://localhost:3000/api/feedback-engine/analyze \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get-improvements",
    "engineType": "reasoning",
    "metrics": {
      "successRate": 0.75,
      "averageRating": 3.8,
      "adoptionRate": 0.65,
      "completionRate": 0.82
    }
  }'
```

Response includes:
- Specific recommendations by category
- Optimization plan with phased actions
- Implementation rate
- Category breakdown of issues

#### detect-anomalies
Detects system anomalies and performance issues.

```bash
curl -X POST http://localhost:3000/api/feedback-engine/analyze \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "detect-anomalies",
    "engineType": "reasoning",
    "metrics": {
      "successRate": 0.45,
      "averageRating": 2.1,
      "adoptionRate": 0.35,
      "completionRate": 0.60
    }
  }'
```

Response includes:
- Detected anomalies with severity levels
- Critical anomalies only list
- 7-day trend analysis

#### get-engagement-stats
Gets detailed engagement statistics for an engine.

```bash
curl -X POST http://localhost:3000/api/feedback-engine/analyze \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get-engagement-stats",
    "engineType": "agent"
  }'
```

## Integration with Other Engines

### Memory Engine
- Retrieves user engagement patterns
- Tracks learning effectiveness
- Updates user preferences based on outcomes

### Agent Engine
- Uses feedback to personalize notifications
- Adjusts recommendation confidence scores
- Updates timing based on engagement patterns

### Reasoning Engine
- Improves confidence scoring
- Refines multi-step reasoning logic
- Enhances evidence weighting

### Source Reliability Engine
- Updates source trustworthiness based on outcomes
- Refines conflict detection
- Improves accuracy scoring

## Metrics Tracked

### Success Rate
Percentage of actions resulting in positive outcomes.
- Target: 75%+
- Critical if: < 50%

### Average Rating
User satisfaction rating (1-5 scale).
- Target: 4.0+
- Critical if: < 2.5

### Adoption Rate
Percentage of affected users engaging with feature.
- Target: 70%+
- Warning if: < 60%

### Completion Rate
Percentage of initiated actions completed.
- Target: 85%+
- Warning if: < 70%

### Response Time
Average time to complete action (milliseconds).
- Target: < 2000ms
- Warning if: > 5000ms

## Anomaly Detection

### Performance Degradation
Detected when success rate drops >30% from baseline.
Severity: Critical if >50% drop, High if >30% drop.

### User Dissatisfaction
Detected when rating drops >0.8 points from baseline.
Severity: Critical if >1.5 drop, High if >0.8 drop.

### Adoption Drop
Detected when adoption rate drops >30% from baseline.
Severity: High if >50% drop, Medium if >30% drop.

### Unusual Patterns
Detected using statistical analysis (>3σ deviation).
Severity: High if >5σ, Medium if >3σ.

### Data Quality Issues
Detected when metrics become inconsistent or incomplete.
Severity: Medium.

## Continuous Improvement Cycle

1. **Feedback Collection** (Real-time)
   - Every AI action generates feedback
   - User engagement tracked automatically

2. **Metric Calculation** (Every cycle)
   - Aggregates feedback across engines
   - Calculates comprehensive metrics
   - Compares against baselines

3. **Pattern Detection** (Every cycle)
   - Identifies success patterns
   - Detects learning opportunities
   - Spots anomalies

4. **Recommendation Generation** (Daily)
   - Generates improvement recommendations
   - Prioritizes by impact and effort
   - Creates optimization plans

5. **Implementation** (Weekly)
   - Engineers review recommendations
   - Implement top-priority improvements
   - Track implementation impact

## Best Practices

1. **Record All Feedback**
   - Every AI interaction should generate feedback
   - Include relevant metadata for analysis
   - Track both outcomes and engagement

2. **Monitor Metrics Regularly**
   - Check engine metrics daily
   - Review reports weekly
   - Investigate anomalies immediately

3. **Act on Recommendations**
   - Prioritize high-impact recommendations
   - Implement in phases
   - Measure impact of changes

4. **Maintain Baselines**
   - Update baselines after improvements
   - Reset baselines for major changes
   - Document baseline changes

5. **Privacy First**
   - Keep feedback data internal only
   - Aggregate at engine level when reporting
   - Never expose individual user data

## Environment Setup

Set in `.env.local`:

```
EVOLUTION_ENGINE_DEV_TOKEN=your_secure_token_here
FEEDBACK_ENGINE_ENABLED=true
FEEDBACK_CYCLE_MINUTES=5
```

## Security

- All endpoints require Bearer token authentication
- Tokens expire after 24 hours
- All actions logged for audit trail
- No user PII in feedback records
- Internal API only - never expose to users

## Troubleshooting

**Low success rates?**
- Check for broken dependencies
- Verify source reliability
- Review recent changes
- Increase confidence thresholds

**User dissatisfaction?**
- Review negative feedback themes
- Test recommendations manually
- Check for accuracy issues
- Improve personalization

**Adoption issues?**
- Check feature discoverability
- Review user onboarding
- Increase visibility in UI
- Run awareness campaign

**Anomalies detected?**
- Investigate root causes immediately
- Check system health
- Review recent deployments
- Consider rollback if critical
