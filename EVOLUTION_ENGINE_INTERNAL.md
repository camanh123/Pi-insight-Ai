# Evolution Engine — Internal Developer Tools

**⚠️ INTERNAL ONLY — DO NOT EXPOSE TO END USERS**

The Evolution Engine is a comprehensive system for monitoring official Pi platform updates and generating weekly Evolution Reports. This tool helps Pi Insight developers track platform changes and plan implementation priorities.

## Overview

The Evolution Engine continuously monitors official sources:
- **Pi App Studio** – Development platform updates
- **Pi SDK** – SDK releases, API changes, deprecations
- **Pi Browser** – Browser updates, feature launches
- **Pi Wallet** – Wallet security, new capabilities
- **Pi Nodes** – Node requirements, consensus changes
- **Pi Core Team** – Official announcements, roadmap updates

### Key Components

1. **Evolution Engine** (`/lib/insight/evolution-engine.ts`)
   - Core logic for analyzing platform changes
   - Report generation algorithms
   - Impact scoring and prioritization

2. **Report API** (`/app/api/evolution-engine/generate-report/route.ts`)
   - Internal endpoint for generating Evolution Reports
   - Requires developer authentication
   - Returns structured JSON reports

3. **Developer Dashboard** (`/components/insight/evolution-dashboard-internal.tsx`)
   - Visualization of Evolution Reports
   - Interactive filtering and analysis
   - Report export (JSON, PDF)

## Usage

### Generating a Weekly Report

```bash
curl -X POST http://localhost:3000/api/evolution-engine/generate-report \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStart": "2025-02-17",
    "weekEnd": "2025-02-23"
  }'
```

### Response Structure

```json
{
  "id": "evo-report-2025-02-17",
  "weekStart": "2025-02-17",
  "weekEnd": "2025-02-23",
  "generatedAt": "2025-02-23T14:30:00.000Z",
  "version": "1.0",
  
  "summary": {
    "totalNewCapabilities": 4,
    "affectedModules": 3,
    "suggestedFeatures": 3,
    "architectureChanges": 2,
    "totalEstimatedEffort": 140,
    "criticalPriority": 2
  },
  
  "evolutionEvents": [...],
  "moduleImpacts": [...],
  "suggestedFeatures": [...],
  "architectureChanges": [...],
  
  "recommendations": {
    "immediateActions": [...],
    "nextQuarterFocus": [...],
    "longTermVision": [...]
  },
  
  "riskAssessment": {...},
  "effortAllocation": {...},
  "analytics": {...}
}
```

## Report Sections Explained

### Evolution Events
New capabilities and changes detected from official Pi sources.

**Fields:**
- `id` – Unique event identifier
- `source` – Origin (app-studio, pi-sdk, wallet, etc.)
- `title` – Event name
- `description` – What changed
- `breakingChanges` – Whether this is a breaking change
- `technicalDetails` – Developer details
- `url` – Link to documentation

### Module Impacts
Analysis of which Pi Insight modules are affected by changes.

**Fields:**
- `moduleName` – Component name
- `filePath` – Code location
- `impactLevel` – critical/high/medium/low
- `requiredChanges` – Specific code updates needed
- `estimatedEffort` – Hours to implement
- `riskFactors` – Potential issues
- `mitigationStrategies` – How to reduce risk

### Feature Suggestions
New features Pi Insight should implement based on platform evolution.

**Fields:**
- `id` – Unique feature identifier
- `title` – Feature name
- `description` – What it does
- `userBenefit` – Why Pioneers need it
- `estimatedEffort` – Implementation hours
- `priority` – critical/high/medium/low
- `phase` – phase-1 through phase-4
- `okrs` – Success metrics (optional)

### Architecture Changes
Recommended structural improvements to handle platform evolution.

**Fields:**
- `id` – Unique change identifier
- `title` – Architecture improvement name
- `currentArchitecture` – Today's approach
- `proposedArchitecture` – Recommended approach
- `reasoning` – Why the change is needed
- `breakingChanges` – Whether this breaks existing code
- `riskAssessment` – Detailed risk analysis
- `phase` – Implementation phase

### Recommendations

#### Immediate Actions (Next Week)
Critical items that must be addressed ASAP to maintain compatibility.

#### Next Quarter Focus
Medium-priority items for Q2-Q3 planning.

#### Long-Term Vision
Strategic improvements and competitive advantages.

### Risk Assessment

Identifies:
- **Highest Risks** – What could go wrong
- **Mitigation Strategies** – How to prevent issues
- **Dependencies on Other Teams** – Coordination needed

## Implementation Phases

The Evolution Engine organizes work into 4 phases:

**Phase 1** – Critical fixes and SDK updates (1-2 weeks)
- KYC v2 migration
- SDK adapter pattern
- Breaking change handling

**Phase 2** – Core feature development (3-4 weeks)
- Real-time event systems
- Security enhancements
- New advisor capabilities

**Phase 3** – Advanced features (5-6 weeks)
- Developer dashboard
- Advanced analysis tools
- Performance optimizations

**Phase 4** – Polish and long-term vision (7+ weeks)
- Community features
- Ecosystem integration
- Advanced monetization

## Integration Points

The Evolution Engine integrates with:

1. **Advisor Engine** – Knowledge base updates
   - New platform changes added to system prompt
   - Updated best practices recommendations

2. **Sync System** – Update detection
   - Monitors for new official announcements
   - Triggers Evolution Engine analysis

3. **Data Models** – Pi update taxonomy
   - Uses existing Topic classifications
   - Aligns with current update structure

4. **Admin Components** – Internal access
   - Developer authentication layer
   - Report generation endpoints

## Authentication & Security

**CRITICAL: This system must remain internal-only**

Authentication:
- Uses `EVOLUTION_ENGINE_DEV_TOKEN` environment variable
- Bearer token in Authorization header
- Fails with 401 if token missing or invalid

Setup (`.env.local`):
```
EVOLUTION_ENGINE_DEV_TOKEN=your-secure-random-token
```

**Best Practices:**
- ✅ Use strong random tokens (32+ characters)
- ✅ Rotate tokens quarterly
- ✅ Never commit tokens to git
- ✅ Use different tokens per environment
- ❌ Don't expose in client-side code
- ❌ Don't share tokens in documentation
- ❌ Don't use weak or predictable values

## Accessing the Developer Dashboard

The Evolution Dashboard is NOT linked from the main app to prevent accidental user discovery.

To access (internal developers only):

1. **Direct URL (local):** `http://localhost:3000/internal/evolution-dashboard`
2. **Need to implement:** Create hidden route that requires authentication

## Future Enhancements

Planned improvements:

1. **Real Data Integration** – Replace mock data with actual Pi API
   - Connect to official Pi SDK for real-time data
   - Monitor Pi blog RSS feeds
   - Track GitHub releases
   - Subscribe to Pi team announcements

2. **Automated Analysis** – ML-powered impact detection
   - Automatically categorize breaking changes
   - Predict module impacts
   - Suggest features based on patterns

3. **Team Collaboration** – Multi-developer support
   - Comments on reports
   - Feature voting
   - Implementation tracking
   - Effort estimation refinement

4. **Metrics & Analytics** – Track how well predictions perform
   - Compare predicted vs. actual effort
   - Accuracy of impact assessments
   - Quarterly retrospectives

5. **Alerting System** – Notifications for critical changes
   - Slack/Email alerts for breaking changes
   - Smart notifications (not everything)
   - Weekly digest option

6. **Integration with Linear/Jira** – Auto-create development tasks
   - Generate tickets from feature suggestions
   - Link to architecture changes
   - Set effort estimates automatically

## Troubleshooting

### Report Generation Fails

**Problem:** 401 Unauthorized
```
Error: UNAUTHORIZED - This is an internal-only API endpoint
```

**Solution:** Check `EVOLUTION_ENGINE_DEV_TOKEN` environment variable
```bash
# Verify token is set
echo $EVOLUTION_ENGINE_DEV_TOKEN

# Update .env.local with correct token
```

### Missing Dependencies

**Problem:** Import errors for evolution engine types
```
Cannot find module '@/lib/insight/evolution-engine'
```

**Solution:** Ensure `evolution-engine.ts` exists in `/lib/insight/`
```bash
ls -la /lib/insight/evolution-engine.ts
```

### Stale Data in Reports

**Problem:** Reports show old platform information
```
evolutionEvents: [] // Empty despite recent Pi updates
```

**Solution:** Evolution Engine uses mock data until real API integration
- Currently based on `MOCK_EVOLUTION_EVENTS`
- To use real data, integrate with Pi API sources
- Update mock data manually for testing

## Developer Workflow

Suggested weekly workflow:

1. **Monday Morning**
   - Generate Evolution Report for previous week
   - Review new capabilities detected
   - Identify critical changes

2. **Monday-Wednesday**
   - Team discusses immediate actions
   - Prioritize feature suggestions
   - Assign implementation work

3. **Wednesday-Friday**
   - Begin Phase 1 implementation
   - Create tickets in Linear/Jira
   - Start SDK adapter refactoring

4. **Friday**
   - Weekly retrospective
   - Review effort predictions vs. actual
   - Plan next week's focus

## Related Documentation

- [Pi Network Official Docs](https://pi.ai)
- [Pi App Studio Documentation](https://docs.app-studio.pi)
- [Pi SDK Reference](https://github.com/pi-network/sdk)
- [Pi Insight Architecture](/ARCHITECTURE.md)
- [Advisor Engine Guide](/PI_INSIGHT_ADVISOR_UPGRADE.md)

---

**Last Updated:** February 20, 2025
**Maintained By:** Pi Insight Development Team
**Status:** INTERNAL USE ONLY
