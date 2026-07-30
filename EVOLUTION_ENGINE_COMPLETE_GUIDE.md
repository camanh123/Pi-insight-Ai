# Evolution Engine - Complete Developer Guide

## Overview

The Evolution Engine is an internal-only monitoring system for the Pi Insight AI platform. It tracks official Pi platform updates and generates weekly Evolution Reports identifying:

- New platform capabilities
- Affected Pi Insight modules
- Suggested features
- Architecture changes
- Development priorities
- Implementation effort estimates

**This system is completely hidden from end users and only accessible to the development team via secure authentication.**

## System Architecture

### Core Components

```
lib/insight/
├── evolution-engine.ts          # Main engine (monitoring, reporting, analysis)
├── platform-monitor.ts          # Platform update tracking (6 sources)
├── impact-analyzer.ts           # Impact analysis and recommendations
└── evolution-auth.ts            # Developer authentication

app/api/evolution-engine/
├── generate-report/route.ts     # Legacy report generation endpoint
└── report/route.ts              # Main report generation API (RECOMMENDED)

components/insight/
└── evolution-dashboard-internal.tsx  # Internal developer dashboard (hidden from users)
```

### Monitored Sources

The Evolution Engine tracks updates from 6 official Pi sources:

1. **App Studio** - New marketplace features, editor improvements, deployment options
2. **Pi SDK** - Authentication updates, payment features, session management
3. **Pi Browser** - Performance improvements, push notifications, new APIs
4. **Wallet** - KYC/KYB updates, transaction features, security enhancements
5. **Node** - Validator features, operator dashboard, performance metrics
6. **Core Team** - Roadmap updates, ecosystem initiatives, governance changes

## Setup

### 1. Environment Configuration

Create a `.env.local` file or set environment variables:

```bash
# Required for Evolution Engine developer access
EVOLUTION_ENGINE_DEV_TOKEN="dev_evolution_2025_internal_only,team_ai_token,team_infra_token"

# Optional: Internal host for additional security
EVOLUTION_ENGINE_INTERNAL_HOST="localhost,dev.internal.company"
```

### 2. Developer Authentication

The Evolution Engine requires Bearer token authentication:

```bash
# Format: Authorization: Bearer <TOKEN>
Authorization: Bearer dev_evolution_2025_internal_only
```

Supported tokens:
- `dev_evolution_2025_internal_only` - Default internal token
- Custom team tokens (configure via env)

### 3. Access Permissions

Developer roles have different permissions:

| Role | Permissions |
|------|-------------|
| Core Platform Team | view-reports, generate-reports, manage-sources, export-data, admin-dashboard |
| AI/ML Team | view-reports, generate-reports, export-data |
| Infrastructure Team | view-reports, manage-sources, configure-alerts |
| Product Team | view-reports, export-data |

## API Usage

### Generate Weekly Report

**Endpoint:** `POST /api/evolution-engine/report`

**Authentication:** Required (Bearer token)

**Request:**
```bash
curl -X POST http://localhost:3000/api/evolution-engine/report \
  -H "Authorization: Bearer dev_evolution_2025_internal_only" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStart": "2025-02-17",
    "weekEnd": "2025-02-23",
    "minSeverity": "medium",
    "includeRiskAssessment": true
  }'
```

**Response:**
```json
{
  "reportId": "EVO-5N5JHXK2Y-ABC123",
  "generatedAt": "2025-02-18T10:30:00Z",
  "weekStart": "2025-02-17T00:00:00Z",
  "weekEnd": "2025-02-23T23:59:59Z",
  "totalChanges": 8,
  "criticalChanges": 2,
  "recommendations": [
    {
      "changeId": "sdk-001",
      "title": "Multi-Chain Payment Support",
      "affectedModule": "payments",
      "recommendedAction": "adopt",
      "priority": "p0-critical",
      "estimatedHours": 48,
      "estimatedDays": 6,
      "breakingChanges": [],
      "newCapabilities": ["Testnet/Mainnet chain separation"],
      "riskFactors": ["Breaking changes for existing implementations"],
      "mitigationStrategy": "Create feature branch...",
      "suggestedFeatures": ["Update SDK integration examples"],
      "phaseAllocation": "q1",
      "developmentTeam": "Core Platform Team",
      "testingStrategy": "Unit tests for backward compatibility...",
      "dependencies": ["pi-sdk", "payments"]
    }
  ],
  "moduleRiskAssessment": {
    "payments": {
      "riskLevel": "critical",
      "vulnerabilities": ["Breaking changes for existing implementations"]
    }
  },
  "resourceAllocation": {
    "q1": 128,
    "q2": 64,
    "q3": 32,
    "q4": 16
  },
  "architectureChanges": ["payments: Refactoring required - Multi-Chain Payment Support"],
  "newFeatureOpportunities": [
    "Multi-chain payment handling",
    "Enhanced transaction logging",
    "Business account support"
  ],
  "technicalDebt": [
    "dashboard: Deferred update - Legacy API deprecation"
  ],
  "nextWeekPredictions": [
    "2 critical changes expected - prepare team for rapid implementation",
    "Security updates likely - schedule security audit"
  ],
  "executiveSummary": "Evolution Report Summary: 8 platform changes detected. 2 critical, 3 high priority..."
}
```

### Get API Schema

**Endpoint:** `GET /api/evolution-engine/report`

**Authentication:** Required (Bearer token)

**Request:**
```bash
curl -X GET http://localhost:3000/api/evolution-engine/report \
  -H "Authorization: Bearer dev_evolution_2025_internal_only"
```

## Report Structure

### Evolution Report (`EvolutionReport`)

Complete weekly evolution analysis with:

- **Metadata:** Report ID, generation time, week range
- **Summary:** Change counts, critical item count
- **Recommendations:** Detailed implementation guidance for each change
- **Risk Assessment:** Per-module vulnerability analysis
- **Resource Allocation:** Hours needed by quarter
- **Architecture Changes:** Required structural modifications
- **New Features:** Opportunities from platform updates
- **Technical Debt:** Deferred changes for future consideration
- **Predictions:** Expected changes for next week
- **Executive Summary:** High-level overview for leadership

### Implementation Recommendation

Each recommendation includes:

- `changeId` - Unique identifier for the platform change
- `title` - Change title
- `affectedModule` - Which Pi Insight component is impacted
- `recommendedAction` - adopt | monitor | defer | deprecate
- `priority` - p0-critical | p1-high | p2-medium | p3-low
- `estimatedHours` - Development effort in hours
- `estimatedDays` - Calendar days to implementation
- `breakingChanges` - Required compatibility changes
- `newCapabilities` - What becomes possible
- `riskFactors` - Potential issues
- `mitigationStrategy` - How to handle risks
- `suggestedFeatures` - Features to add based on change
- `phaseAllocation` - q1 | q2 | q3 | q4 deployment phase
- `developmentTeam` - Recommended team for work
- `testingStrategy` - How to validate implementation
- `dependencies` - Required modules/systems

## Monitoring Platform Updates

### Adding New Data Sources

The Evolution Engine uses mock data by default. To integrate real Pi APIs:

**File:** `lib/insight/platform-monitor.ts`

Replace mock data retrieval in `monitorPlatformUpdates()`:

```typescript
// Current (mock):
const updates = MOCK_PLATFORM_UPDATES[source] || []

// Real implementation (example):
const updates = await fetchFromPiAPI(source)
```

### Updating Module Registry

Define which modules are affected by changes in:

**File:** `lib/insight/impact-analyzer.ts`

Update `MODULE_PROFILES` to match your Pi Insight architecture:

```typescript
const MODULE_PROFILES: Record<string, ModuleImpactProfile> = {
  'your-module': {
    module: 'your-module',
    description: 'What this module does',
    criticality: 'core' | 'important' | 'supporting' | 'experimental',
    dependencies: ['other-module'],
    estimatedLinesOfCode: 5000
  }
}
```

Module criticality levels:
- **core** - Essential to app functionality
- **important** - Key features
- **supporting** - Enhancement or helper
- **experimental** - Optional or beta features

## Internal Dashboard

The Evolution Engine includes an internal-only developer dashboard (completely hidden from users):

**File:** `components/insight/evolution-dashboard-internal.tsx`

**Features:**
- View all Evolution Reports
- Interactive module impact visualization
- Resource allocation charts
- Risk assessment heatmaps
- One-click report export (JSON/PDF)
- Team collaboration features

**Access:** This component is internal-only and never exposed to end users. It's not linked in main navigation.

## Security

### Authentication

- All Evolution Engine endpoints require Bearer token authentication
- Tokens are environment variable controlled
- Tokens have 24-hour expiration
- Access attempts are logged for audit trail

### Authorization

- Permissions-based access control
- Teams have different permission levels
- No end-user access possible
- Internal-only enforcement

### Audit Logging

All Evolution Engine access is logged:

```
[EVOLUTION_DEV_ACCESS] {
  timestamp: "2025-02-18T10:30:00Z",
  maskedToken: "dev_evolu***",
  action: "report_generation",
  team: "Core Platform Team",
  ...details
}
```

## Integration Examples

### Example 1: Weekly Report Generation

```typescript
// Generate report in your CI/CD pipeline
const reportRequest = await fetch(
  `${process.env.APP_URL}/api/evolution-engine/report`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EVOLUTION_ENGINE_DEV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      weekStart: '2025-02-17',
      weekEnd: '2025-02-23',
      minSeverity: 'medium'
    })
  }
)

const report = await reportRequest.json()

// Save report
fs.writeFileSync(`reports/evolution-${report.reportId}.json`, JSON.stringify(report, null, 2))
```

### Example 2: Alert on Critical Changes

```typescript
// Check for critical items and alert team
const response = await fetch(`${process.env.APP_URL}/api/evolution-engine/report`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.EVOLUTION_ENGINE_DEV_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    weekStart: '2025-02-17',
    weekEnd: '2025-02-23',
    minSeverity: 'high'
  })
})

const report = await response.json()

if (report.criticalChanges > 0) {
  // Send Slack alert, create JIRA tickets, etc.
  await sendSlackAlert(`${report.criticalChanges} critical changes require attention`)
}
```

### Example 3: Team Dashboard Integration

```typescript
// Display report in team dashboard (internal only)
export async function loadEvolutionReport(token: string) {
  const response = await fetch(`/api/evolution-engine/report`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      weekStart: formatDate(getWeekStart(new Date())),
      weekEnd: formatDate(new Date()),
      includeRiskAssessment: true
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to load report: ${response.statusText}`)
  }

  return await response.json()
}
```

## Troubleshooting

### 401 Unauthorized

- Verify Bearer token is correct in Authorization header
- Check token is valid in environment configuration
- Ensure token hasn't expired (24-hour lifetime)

### 403 Forbidden

- Verify your team has the required permission
- Check `EVOLUTION_ENGINE_DEV_TOKEN` env var includes your token
- Review team permissions in `evolution-auth.ts`

### Empty Reports

- Verify platform sources are configured
- Check date range includes recent updates
- Ensure minSeverity filter isn't too high

### API Rate Limiting

- Reports are not cached
- Implement client-side rate limiting
- Consider caching generated reports for 1 hour

## Maintenance

### Weekly Tasks

1. Review generated Evolution Reports
2. Check for missed platform updates
3. Verify module registry is current
4. Update impact scores if needed

### Monthly Tasks

1. Review team permissions
2. Update risk assessment thresholds
3. Analyze recommendation accuracy
4. Adjust effort estimation models

### Quarterly Tasks

1. Integrate new Pi platform sources
2. Review module dependencies
3. Update criticality ratings
4. Planning meeting for Phase allocation

## Support & Feedback

For Evolution Engine issues or improvements:

1. Check this guide first
2. Review recent Evolution Reports for patterns
3. Verify environment configuration
4. Contact Core Platform Team for assistance

---

**Last Updated:** February 2025  
**Version:** 1.0  
**Status:** Internal Developer Tool - Not for End Users
