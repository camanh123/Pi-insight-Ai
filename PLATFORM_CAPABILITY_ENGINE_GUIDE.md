# Platform Capability Engine - Developer Guide

## Overview

The Platform Capability Engine maintains a comprehensive database of official Pi Network platform capabilities and intelligently maps them to Pi Insight modules to identify integration opportunities, estimate development effort, and prioritize feature development.

## Architecture

### Core Components

#### 1. **Capability Database** (`lib/insight/capability-database.ts`)
- Maintains 40+ official Pi platform capabilities across 10 categories
- Sources: Official Pi documentation, SDK releases, announcements
- Categories:
  - App Studio (UI/design)
  - SDK (authentication, payments, user state)
  - Backend (API routes, databases, auth)
  - Storage (blob, database, cache)
  - Wallet (balance, transactions, transfers)
  - Browser (integration, deep linking)
  - Node (full archive, validators)
  - Payments (mainnet settlement, escrow)
  - Notifications (push, in-app)
  - Identity (KYC, KYB, reputation)

#### 2. **Capability Detector** (`lib/insight/capability-detector.ts`)
- Detects new, upgraded, and deprecated capabilities
- Compares snapshots to identify changes
- Generates impact summaries
- Predicts upcoming capability releases
- Provides recommendations for module updates

#### 3. **Module Mapper** (`lib/insight/module-capability-mapper.ts`)
- Maps 16+ Pi Insight modules to capabilities
- Identifies integration opportunities
- Estimates implementation effort
- Calculates priority scores (1-100)
- Determines suggested development phases

#### 4. **Capability API** (`app/api/platform-engine/capabilities/route.ts`)
- Developer-only REST endpoint
- Bearer token authentication
- Comprehensive query and analysis operations

## Data Models

### PlatformCapability
```typescript
{
  id: string;                    // Unique identifier
  category: CapabilityCategory;  // Service category
  name: string;                  // Human-readable name
  description: string;           // Detailed description
  status: 'stable'|'beta'|'alpha'|'deprecated'|'planned';
  tier: 'core'|'standard'|'advanced'|'enterprise';
  introduced: string;            // ISO date
  deprecated?: string;           // ISO date
  officialDocs: string;          // Link to Pi documentation
  apiVersion?: string;           // Current API version
  requirements: string[];        // Prerequisites
  relatedCapabilities: string[]; // Related capability IDs
  limitations?: string[];        // Known limitations
  performanceMetrics?: {};       // Latency, throughput, etc.
  sdkSupport: {};               // Language support versions
  sampleCode?: string;           // Example code snippet
  lastUpdated: string;           // Last update date
}
```

### IntegrationOpportunity
```typescript
{
  capabilityId: string;
  capability: PlatformCapability;
  moduleId: string;
  moduleName: string;
  opportunity: string;           // What to implement
  benefit: string;               // Expected benefit
  effortEstimate: 'low'|'medium'|'high';
  impactPotential: 'low'|'medium'|'high'|'transformative';
  priority: number;              // 1-100 score
  prerequisites: string[];
  risks: string[];
  estimatedHours: number;
  suggestedPhase: 'immediate'|'near-term'|'mid-term'|'long-term';
}
```

## API Usage

### Authentication
All requests require a Bearer token:
```bash
Authorization: Bearer YOUR_DEV_TOKEN
```

Set `EVOLUTION_ENGINE_DEV_TOKEN` environment variable in `.env.local`:
```env
EVOLUTION_ENGINE_DEV_TOKEN=dev-token-12345
```

### GET Endpoints

#### Get All Capabilities
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=all"
```

#### Get Capability Statistics
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=stats"
```

Response:
```json
{
  "status": "success",
  "data": {
    "total": 42,
    "byCategory": {
      "AppStudio": 4,
      "SDK": 4,
      "Backend": 3,
      "Storage": 3,
      "Wallet": 3,
      "Browser": 2,
      "Node": 2,
      "Payments": 2,
      "Notifications": 2,
      "Identity": 3
    },
    "byStatus": {
      "stable": 35,
      "beta": 4,
      "alpha": 2,
      "deprecated": 1,
      "planned": 0
    },
    "byTier": {
      "core": 8,
      "standard": 18,
      "advanced": 12,
      "enterprise": 4
    },
    "stableCapabilities": 35,
    "betaCapabilities": 4,
    "deprecatedCapabilities": 1
  }
}
```

#### Get Capabilities by Category
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=category&category=Wallet"
```

#### Get New Capabilities Since Date
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=new&sinceDate=2025-01-01"
```

#### Get Deprecated Capabilities
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=deprecated"
```

#### Search Capabilities
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=search&query=payment"
```

#### Get All Integration Opportunities
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=opportunities"
```

Response includes top 10 opportunities plus statistics:
```json
{
  "status": "success",
  "count": 28,
  "topOpportunities": [...],
  "allCount": 28,
  "averagePriority": 65.3,
  "data": [...]
}
```

#### Get Module-Specific Opportunities
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=module-opportunities&moduleId=wallet-integration"
```

#### Get Detection Report
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=detection-report&startDate=2025-02-15&endDate=2025-02-22"
```

Returns:
- New capabilities detected
- Upgraded capabilities
- Deprecated capabilities
- Status changes
- Impact summary
- Recommendations
- Predictions for next week

#### Get Module Report
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=module-report&moduleId=advisor-view"
```

### POST Endpoints

#### Save Current Snapshot
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "save-snapshot"}' \
  http://localhost:3000/api/platform-engine/capabilities
```

#### Analyze Module
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "analyze-module", "moduleId": "notifications-system"}' \
  http://localhost:3000/api/platform-engine/capabilities
```

## Integration Opportunity Scoring

### Priority Calculation (0-100)
- **Tier Weight**: Core +40, Standard +25, Advanced +15, Enterprise 0
- **Status Weight**: Stable +30, Beta +15, Alpha +5
- **Module Criticality**: Essential +20, Important +10, Optional 0

### Effort Estimation
- **Core Tier**: 16 hours base
- **Standard Tier**: 24 hours base
- **Advanced Tier**: 40 hours base
- **Enterprise Tier**: 60 hours base
- **Beta Status**: +8 hours
- **Alpha Status**: +16 hours

### Impact Assessment
- **Transformative**: Essential module + Core capability
- **High**: Core capability or Essential module
- **Medium**: Standard capability or Important module
- **Low**: Advanced/Enterprise capability or Optional module

## Module Definitions

Pi Insight has 16 mapped modules:

1. **home-view** - Main dashboard
2. **advisor-view** - AI advisor
3. **update-card** - Update display components
4. **knowledge-graph** - Concept relationships
5. **timeline-evolution** - Feature history
6. **readiness-score** - User readiness assessment
7. **daily-briefing** - Daily summary
8. **compare-updates** - Side-by-side comparison
9. **answer-engine** - Question answering
10. **profile-data** - User profiles
11. **storage-database** - Backend storage
12. **ai-model** - AI integration
13. **saved-updates** - Bookmarking
14. **notifications-system** - Push/in-app notifications
15. **wallet-integration** - Wallet features
16. **identity-profile** - Identity management

## Workflow Examples

### Weekly Capability Review
```bash
# 1. Generate detection report
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=detection-report"

# 2. Save snapshot for next week
curl -X POST -H "Authorization: Bearer TOKEN" \
  -d '{"action": "save-snapshot"}' \
  http://localhost:3000/api/platform-engine/capabilities

# 3. Get top opportunities
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=opportunities"
```

### Planning Module Updates
```bash
# 1. Get all opportunities for a module
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=module-report&moduleId=notifications-system"

# 2. Review recommended phasing
# 3. Prioritize by effort and impact
# 4. Schedule implementations across quarters
```

### New Capability Assessment
```bash
# 1. Check new capabilities since last release
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=new&sinceDate=2025-02-01"

# 2. Search for related capabilities
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=search&query=wallet"

# 3. Find integration opportunities
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/platform-engine/capabilities?action=module-opportunities&moduleId=wallet-integration"
```

## Maintenance

### Adding New Capabilities
Edit `lib/insight/capability-database.ts`:

```typescript
'new-capability-id': {
  id: 'new-capability-id',
  category: 'Payments',
  name: 'New Capability Name',
  description: 'What it does',
  status: 'beta',
  tier: 'standard',
  introduced: new Date().toISOString(),
  officialDocs: 'https://pi.docs/...',
  requirements: ['requirement1'],
  relatedCapabilities: ['related-id'],
  sdkSupport: {
    javascript: '2.1+'
  },
  lastUpdated: new Date().toISOString()
}
```

### Updating Module Mappings
Edit `lib/insight/module-capability-mapper.ts`:

```typescript
'module-id': {
  moduleId: 'module-id',
  moduleName: 'Module Name',
  usedCapabilities: [
    { capabilityId: 'capability-id', integrationLevel: 'critical' }
  ],
  potentialCapabilities: [
    { capabilityId: 'new-capability-id', opportunity: 'What to build' }
  ]
}
```

### Weekly Maintenance Checklist
- [ ] Review official Pi announcements
- [ ] Update capability database if new features released
- [ ] Run detection report
- [ ] Save capability snapshot
- [ ] Review top opportunities
- [ ] Update module mappings if needed
- [ ] Generate recommendations for product team

## Best Practices

1. **Run Weekly Reports** - Every Monday for consistency
2. **Verify Official Sources** - Only add capabilities from official Pi documentation
3. **Keep Snapshots Updated** - Save monthly snapshots for trend analysis
4. **Review Deprecated Items** - Plan migrations immediately
5. **Prioritize Core Capabilities** - Focus on core tier integrations first
6. **Estimate Conservatively** - Add buffer to hour estimates for unknowns
7. **Document Assumptions** - Note any assumptions in opportunity analysis

## Environment Variables

```env
# Required
EVOLUTION_ENGINE_DEV_TOKEN=your-secure-token

# Optional (defaults provided)
NEXT_PUBLIC_API_URL=http://localhost:3000
CAPABILITY_SNAPSHOT_RETENTION=52  # weeks
```

## Security

- Developer token required for all endpoints
- No capability data is exposed to end users
- Internal-only API endpoints
- Consider rate limiting in production
- Rotate tokens quarterly

## Future Enhancements

- Real-time Pi platform monitoring
- Automated capability detection from Pi RSS feeds
- GraphQL query support
- Database persistence (currently in-memory)
- Slack notifications for critical changes
- Historical analysis and trend reports
- Machine learning-based effort estimation
- Automated opportunity recommendation system
