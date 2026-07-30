# Agent Engine - Internal Documentation

## Overview

The Agent Engine is Pi Insight's intelligent background system that monitors all internal modules, detects when new Pi information affects users, and generates highly personalized, relevant notifications and actions.

**Key Principle:** Never send irrelevant notifications. Every action must be prioritized by relevance and tailored to the individual user's profile and goals.

## Architecture

The Agent Engine consists of 6 core components working in concert:

### 1. Agent Orchestrator
- Runs background monitoring cycles every 5 minutes (configurable)
- Collects snapshots from: Memory Engine, Personal Profile, Timeline Evolution, Daily Intelligence, Source Reliability
- Coordinates all component interactions
- Manages action queue and delivery
- Tracks metrics and performance

**Location:** `/lib/insight/agent-orchestrator.ts`

### 2. Impact Detector
- Analyzes new Pi updates against user profiles
- Determines which users are affected by specific changes
- Calculates impact levels (critical/high/medium/low/none)
- Generates reasons for impact
- Respects user learning history and goals

**Location:** `/lib/insight/agent-impact-detector.ts`

**Key Functionality:**
- Score direct topic matches (40% weight)
- Align with user goals (25% weight)
- Check prerequisite knowledge (15% weight)
- Identify related topics (15% weight)
- Track learning path progression (5% weight)

### 3. Relevance Scorer
- Prevents irrelevant notifications using multi-factor scoring
- Combines 6 relevance factors (0-100 each)
- Generates final priority score
- Determines delivery recommendation (send/send_delayed/suppress/archive)
- Minimum threshold to send: 60/100

**Location:** `/lib/insight/agent-relevance-scorer.ts`

**Factors:**
- User Match (30%) - alignment with profile
- Timeliness (20%) - urgency/importance
- Context Relevance (15%) - fits current situation
- Learning Alignment (20%) - supports goals
- Novelty (10%) - information value
- Actionability (5%) - user can act on it

**Thresholds:**
- Critical override: ≥85 (always send)
- Send immediately: ≥60
- Send delayed: ≥45
- Suppress: ≥30
- Archive: <30

### 4. Personalizer
- Tailors content to individual learning style and preferences
- Generates custom headlines, summaries, explanations
- Recommends optimal reminder timing
- Suggests related topics and learning paths
- Adapts depth based on comprehension level

**Location:** `/lib/insight/agent-personalizer.ts`

**Personalization Dimensions:**
- Learning style: visual, text, interactive, hands-on
- Comprehension level: beginner, intermediate, advanced
- Time available: quick (5-15min), standard (30-60min), deep (60+min)
- Goal alignment: customizes actions toward specific goals
- Engagement level: adjusts frequency based on recent activity

### 5. Action Generator
- Creates Next Best Actions for each user
- Generates 5 types of actions:
  - Notifications: immediate awareness
  - Reminders: scheduled follow-ups
  - Recommendations: personalized suggestions
  - Learning paths: guided learning sequences
  - Progress updates: achievement tracking

**Location:** `/lib/insight/agent-action-generator.ts`

**Action Elements:**
- Title and description
- Priority level
- Estimated time
- Resources and references
- Follow-up actions

### 6. Notification Formatter
- Formats all messages with clear source attribution
- Always separates 3 sections:
  - **Official Information** (verified, ✓✓✓)
  - **AI Analysis** (high confidence, ✓✓)
  - **AI Recommendations** (moderate confidence, ○)
- Generates markdown for documentation
- Exports to JSON for APIs

**Location:** `/lib/insight/agent-notification-formatter.ts`

## Data Flow

```
1. Timeline Update Detected
   ↓
2. Impact Detector analyzes affected users
   ↓
3. For each affected user:
   - Relevance Scorer prioritizes (send/suppress)
   - Personalizer tailors content
   - Action Generator creates recommendations
   ↓
4. Notification Formatter labels sources clearly
   ↓
5. Queue for delivery (respecting user preferences)
   ↓
6. Deliver when appropriate
   ↓
7. Track engagement for continuous improvement
```

## Monitoring Cycle

The Agent Orchestrator runs monitoring cycles automatically:

```typescript
// Every 5 minutes (configurable)
1. collectSystemSnapshot() - gather data from all monitors
2. analyzeUserImpact() - determine affected users
3. generatePersonalizedActions() - create recommendations
4. scoreAndFilterActions() - ensure relevance
5. formatNotifications() - label sources clearly
6. updateMetrics() - track performance
7. processDeliveryQueue() - send notifications
```

## Privacy & Data Handling

**Privacy First:**
- User memory completely separate from Pi knowledge
- No mixing of personal data with official information
- Users can delete, edit, or export their memory
- Audit trails track all access
- Privacy preferences respected (update frequency, topics)

**Data Minimization:**
- Only collect what's needed
- Automatic deletion after inactivity (configurable)
- User control over notification frequency
- Clear opt-out mechanisms

## Source Attribution

Every notification MUST clearly label information:

### Official Information ✓✓✓
- Source: Pi Core Team, Official Documentation
- Confidence: Verified
- Can be presented as fact
- Examples: Mainnet launch dates, breaking changes, API deprecations

### AI Analysis ✓✓
- Source: Derived from official sources
- Confidence: High
- Must indicate source
- Examples: Impact assessments, feature implications, integration patterns

### AI Recommendations ○
- Source: Personalized analysis
- Confidence: Moderate
- Must indicate personalization
- Examples: Learning suggestions, next best actions, timing recommendations

**Never:**
- Present unofficial information as official
- Mix sources without attribution
- Hide confidence levels
- Recommend critical actions as certain

## Configuration

```typescript
const agentConfig = {
  checkIntervalMs: 300000,        // 5 minutes
  batchSize: 100,                 // Users per cycle
  maxConcurrent: 10,              // Parallel processing
  enableAutoAnalysis: true,       // Auto-detect impact
  privacyMode: 'strict',          // Data protection level
};
```

## Metrics Tracked

```typescript
{
  totalMonitoringCycles: number,
  usersAffected: number,
  actionsGenerated: number,
  avgRelevanceScore: number,      // 0-100
  deliveryRate: number,           // % delivered
  engagementRate: number,         // % opened/acted
  lastRunAt: Date,
}
```

## Integration with Other Modules

**Memory Engine:** Retrieves user profile, learning history, goals, preferences
**Personal Profile:** Understands user comprehension level, learning style
**Timeline Evolution:** Detects new Pi platform changes
**Daily Intelligence:** Incorporates daily context and trends
**Source Reliability:** Ensures all information properly attributed

## API Endpoints

### POST /api/agent-engine/orchestrate
Start a monitoring cycle manually.

```bash
curl -X POST http://localhost:3000/api/agent-engine/orchestrate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "optional-for-testing",
    "updateType": "feature|security|deprecation|breaking",
    "context": {}
  }'
```

**Response:**
```json
{
  "success": true,
  "cycle": {
    "cycleId": "cycle_1234567890",
    "startedAt": "2025-02-17T10:30:00Z",
    "actions": {
      "detected": 5,
      "generated": 3,
      "queued": 2
    }
  }
}
```

### GET /api/agent-engine/orchestrate
Get API schema and documentation.

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/agent-engine/orchestrate
```

### DELETE /api/agent-engine/orchestrate
Stop monitoring (emergency only).

```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/agent-engine/orchestrate
```

## Environment Variables

```env
EVOLUTION_ENGINE_DEV_TOKEN=<your-secure-token>  # 20+ characters minimum
```

## Best Practices

1. **Never send low-relevance notifications** - Filter all actions through relevance scorer
2. **Always attribute sources** - Official|Analysis|Suggestions must be clear
3. **Respect user preferences** - Honor update frequency and topic selections
4. **Test with mock data** - Use impact detector with test profiles
5. **Monitor delivery rates** - Track engagement metrics
6. **Improve continuously** - Adjust thresholds based on performance
7. **Protect privacy** - Never expose user data in logs
8. **Document changes** - Update this file when modifying behavior

## Troubleshooting

**No notifications being sent:**
- Check relevance scores (log them to debug)
- Verify user preferences (might be disabled)
- Check impact detection (user might not be affected)

**Too many notifications:**
- Increase relevance threshold (currently 60)
- Adjust time-based filters
- Review topic preferences

**Wrong target users:**
- Verify impact detector logic
- Check user profile data completeness
- Review topic matching algorithm

## Performance Tuning

```typescript
// Adjust for your user base
{
  checkIntervalMs: 600000,    // 10 min for large scale
  batchSize: 50,              // Smaller batches
  maxConcurrent: 5,           // Reduce parallel load
}
```

## Security

- All access requires Bearer token
- Tokens expire (configurable)
- Audit logging of all operations
- No sensitive data in logs
- Rate limiting on API endpoints
- Validation of all inputs

---

**For Developers Only:** This module is internal and not exposed to end users. It continuously improves Pi Insight's personalization and user experience while maintaining privacy and accuracy.
