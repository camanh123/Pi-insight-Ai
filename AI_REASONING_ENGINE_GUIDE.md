# AI Reasoning Engine - Developer Guide

## Overview

The AI Reasoning Engine is an internal-only system that performs advanced multi-step reasoning before generating answers. It analyzes user goals, official Pi information, verified knowledge, historical context, and related updates to produce evidence-based recommendations with confidence scoring and risk assessment.

**Status:** Internal Only | **Visibility:** Developer-Only | **Access:** Bearer Token Required

---

## Architecture

### Core Components

#### 1. **Reasoning Engine** (`lib/insight/reasoning-engine.ts`)
Main orchestration engine performing 7-step reasoning analysis:
- Context Analysis: Evaluates user profile and query relationship
- Goal Identification: Links user goals to query intent
- Information Gathering: Collects official sources
- Alternative Generation: Creates multiple solution paths
- Risk Assessment: Evaluates potential issues
- Confidence Estimation: Calculates confidence score
- Recommendation Generation: Produces final recommendation

**Output:** `ReasoningResult` with all analysis details, confidence scores, and alternatives

#### 2. **Evidence Aggregator** (`lib/insight/evidence-aggregator.ts`)
Synthesizes evidence from multiple sources:
- Official sources (highest priority)
- Verified knowledge (established facts)
- Historical context (past decisions)
- Platform updates (recent changes)
- Platform capabilities (available features)

**Features:**
- Conflict detection between sources
- Supporting evidence identification
- Total confidence calculation
- Evidence synthesis into actionable insights

**Output:** `EvidenceCollection` with synthesized recommendations

#### 3. **Reasoning Formatter** (`lib/insight/reasoning-formatter.ts`)
Formats reasoning results with clear information separation:
- **Official Information** - From verified official sources
- **AI Analysis** - System's analytical findings
- **AI Suggestions** - Recommendations and alternatives

Includes confidence indicators (✓✓✓ / ✓✓ / ○ / △ / ✗) and markdown export

**Output:** `FormattedReasoning` with separated sections and confidence labels

#### 4. **Module Bridge** (`lib/insight/reasoning-module-bridge.ts`)
Shares reasoning results with AI modules:
- AI Advisor: Provides guidance context
- Compare Engine: Alternative comparison data
- Timeline Explorer: Implementation timeline
- Daily Intelligence: Briefing content
- Personal Copilot: Personalized recommendations

**Features:**
- Module-specific content formatting
- Priority and cache settings
- Learning path generation
- Reminder scheduling

#### 5. **Quality Tracker** (`lib/insight/decision-quality-tracker.ts`)
Continuously improves decision quality:
- Records all reasoning decisions
- Tracks user feedback (1-5 rating)
- Analyzes success patterns
- Identifies improvement opportunities
- Generates quality reports

**Features:**
- Success rate tracking
- Accuracy and helpfulness metrics
- Failure pattern detection
- Improvement trend analysis

---

## API Endpoint

### POST `/api/reasoning-engine/analyze`

**Authentication:** Bearer token (EVOLUTION_ENGINE_DEV_TOKEN)

**Request:**
```json
{
  "userId": "user123",
  "query": "How do I integrate KYC into my Pi app?",
  "userContext": {
    "experience": "intermediate",
    "learningStyle": "visual",
    "goals": ["Launch mainnet app", "Implement KYC"],
    "completedTopics": ["App Studio basics", "SDK setup"],
    "interests": ["Pi payments", "User verification"]
  },
  "officialSources": [...],
  "historicalContext": [...],
  "relatedUpdates": [...],
  "platformCapabilities": [...],
  "shareWithModules": true
}
```

**Response:**
```json
{
  "success": true,
  "reasoning": {
    "confidenceScore": 82,
    "riskFactors": [...],
    "limitations": [...]
  },
  "evidence": {
    "totalConfidence": 85,
    "conflictCount": 0,
    "supportingCount": 4
  },
  "formatted": {
    "confidence": {
      "score": 82,
      "level": "high",
      "symbol": "✓✓"
    }
  },
  "recommendation": {
    "alternative": "Phased Integration Approach",
    "effort": "medium",
    "impactScore": 85,
    "nextSteps": [...]
  },
  "modules": {
    "shared": true,
    "recipients": ["ai-advisor", "compare-engine", "timeline-explorer"],
    "count": 3
  }
}
```

---

## Usage Examples

### Example 1: Analyze KYC Integration
```bash
curl -X POST http://localhost:3000/api/reasoning-engine/analyze \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "dev-123",
    "query": "Implement KYC verification in my app",
    "userContext": {
      "experience": "intermediate",
      "learningStyle": "visual",
      "goals": ["Launch mainnet"],
      "completedTopics": ["App Studio"],
      "interests": ["Security", "User verification"]
    },
    "shareWithModules": true
  }'
```

### Example 2: Generate Recommendations
```bash
curl -X POST http://localhost:3000/api/reasoning-engine/analyze \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "dev-456",
    "query": "Best way to handle Pi payments?",
    "userContext": {
      "experience": "advanced",
      "learningStyle": "textual",
      "goals": ["Payment integration", "Monetization"],
      "completedTopics": ["SDK", "Backend", "Wallet"],
      "interests": ["Transactions", "User experience"]
    },
    "officialSources": [
      {
        "source": "documentation",
        "content": "Pi payments require mainnet access",
        "verified": true,
        "confidence": 95
      }
    ]
  }'
```

---

## Information Separation

### Official Information
- Source: Pi Core Team, official documentation, App Studio
- Confidence: 95%+
- Label: "📋 OFFICIAL INFORMATION"
- Symbol: ✓✓✓ (very high confidence)

### AI Analysis
- Source: System reasoning based on official sources
- Confidence: 70-90%
- Label: "🔍 AI ANALYSIS"
- Symbol: ✓✓ (high confidence)

### AI Suggestions
- Source: AI recommendations and alternatives
- Confidence: 50-85%
- Label: "✨ AI SUGGESTIONS"
- Symbol: ○ / △ (moderate to low confidence)

---

## Confidence Scoring

| Score | Level | Symbol | Description |
|-------|-------|--------|-------------|
| 90-100 | Very High | ✓✓✓ | Based on verified official sources |
| 75-89 | High | ✓✓ | Official + verified information |
| 60-74 | Moderate | ○ | Some sources verified |
| 40-59 | Low | △ | Limited verified sources |
| 0-39 | Very Low | ✗ | Unverified or conflicting |

---

## Quality Tracking

### Recording Decisions
```javascript
import DecisionQualityTracker from '@/lib/insight/decision-quality-tracker';

const decision = DecisionQualityTracker.recordDecision(
  reasoningId,
  query,
  recommendedPath,
  confidenceScore
);
```

### Recording Feedback
```javascript
DecisionQualityTracker.recordFeedback(
  decisionId,
  "Very helpful guidance",
  5,
  "Exactly what I needed"
);
```

### Getting Metrics
```javascript
const metrics = DecisionQualityTracker.getQualityMetrics();
// {
//   totalDecisions: 156,
//   successRate: 92,
//   averageAccuracy: 87,
//   averageHelpfulness: 89,
//   improvementTrend: 1.05
// }
```

### Generating Reports
```javascript
const report = DecisionQualityTracker.generateImprovementReport();
```

---

## Module Integration

### AI Advisor
Receives user goals, official guidance, and recommended approaches for contextual answers.

### Compare Engine
Gets alternative options with detailed scoring for side-by-side comparison.

### Timeline Explorer
Receives implementation timelines, milestones, and related platform updates.

### Daily Intelligence
Gets briefing headlines, key points, action items, and urgency levels.

### Personal Copilot
Receives personalized learning paths, goals, reminders, and progress tracking.

---

## Best Practices

1. **Always Include Official Sources**
   - Official sources receive highest weight (40%)
   - Verified sources support confidence (25%)
   - Always validate against Pi documentation

2. **Clear Labeling is Mandatory**
   - Every answer must separate Official / Analysis / Suggestions
   - Use confidence indicators prominently
   - Include disclaimers for low-confidence recommendations

3. **Risk Assessment is Critical**
   - Identify all potential risk factors
   - Provide mitigation strategies
   - Disclose limitations honestly

4. **Continuous Improvement**
   - Record all decisions for quality tracking
   - Collect user feedback actively
   - Analyze failure patterns regularly

5. **Privacy and Transparency**
   - Never mix user data with official Pi knowledge
   - Log all reasoning steps
   - Make audit trails available

---

## Environment Variables

```
EVOLUTION_ENGINE_DEV_TOKEN=your_secure_token_here
```

Generate secure token:
```bash
openssl rand -base64 32
```

---

## Security

- **Internal Only**: Never exposed to end users
- **Bearer Token**: Required for all API access
- **Audit Logging**: All accesses logged
- **Rate Limiting**: Recommended 10 requests/minute per token
- **No Sensitive Data**: Never log user personal information

---

## Troubleshooting

### Low Confidence Scores
- Check official source count
- Verify source timestamps (< 30 days recommended)
- Add more verified sources

### Conflicting Evidence
- Investigate source reliability
- Check for outdated information
- Request clarification from official sources

### Failed Recommendations
- Review failure patterns in quality tracker
- Analyze user feedback themes
- Adjust weighting of source types

---

## Performance Metrics

- **Analysis Speed**: < 500ms per query
- **Module Sharing**: < 100ms
- **Quality Tracking**: < 50ms
- **Memory Usage**: ~5MB per 1000 decisions

---

## Future Enhancements

1. Machine learning confidence prediction
2. Real-time source reliability scoring
3. Automated conflict resolution
4. Predictive risk analysis
5. Personalized reasoning weights by user type

---

**Version:** 1.0.0  
**Last Updated:** 2026  
**Developed for:** Pi Insight AI Platform  
**Access:** Internal Developers Only
