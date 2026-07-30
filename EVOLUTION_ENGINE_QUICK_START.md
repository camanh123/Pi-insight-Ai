# Evolution Engine — Quick Start for Developers

**This is an internal-only tool. Never expose to end users.**

## 30-Second Overview

The Evolution Engine automatically monitors official Pi platform updates (App Studio, SDK, Wallet, Nodes, etc.) and generates weekly reports showing:

- **New Platform Capabilities** – What Pi released this week
- **Affected Modules** – Which Pi Insight components need updates
- **Suggested Features** – What to build based on platform changes
- **Architecture Changes** – Structural improvements recommended
- **Development Priority & Effort** – What to do first and how long it takes

## Generate a Report (5 Minutes)

### 1. Set Environment Variable

```bash
export EVOLUTION_ENGINE_DEV_TOKEN="your-secure-token"
```

### 2. Call the API

```bash
curl -X POST http://localhost:3000/api/evolution-engine/generate-report \
  -H "Authorization: Bearer your-secure-token" \
  -H "Content-Type: application/json" \
  -d '{"weekStart": "2025-02-17", "weekEnd": "2025-02-23"}'
```

### 3. Get Structured JSON Report

Response includes:
- Summary metrics (capabilities, affected modules, effort)
- Evolution events (what changed)
- Module impacts (code files affected)
- Feature suggestions (what to build)
- Architecture changes (how to improve)
- Risk assessment (what could go wrong)

## Key Metrics You'll See

| Metric | Meaning |
|--------|---------|
| **Criticality Score** | 0-100: How urgent are the changes? |
| **Total Estimated Effort** | Hours needed to implement all changes |
| **Critical Priority Items** | Count of high-urgency tasks |
| **Affected Modules** | Pi Insight components that need updates |
| **Phase 1-4 Effort** | Workload distribution across quarters |

## Making Decisions

### High Criticality (70+)
- Must act immediately
- Check for breaking changes
- Prioritize Phase 1 work
- May impact user experience

### Medium Criticality (40-69)
- Plan implementation in next quarter
- Can group with other features
- Moderate risk if delayed

### Low Criticality (<40)
- Nice-to-have improvements
- Can be handled in later phases
- Strategic long-term work

## Common Actions

### "We Need to Update KYC"
```
evolutionEvents → find "KYC v2"
moduleImpacts → check impact.filePath
requiredChanges → step-by-step update list
estimatedEffort → schedule time
riskFactors → prepare for issues
```

### "Should We Build Real-Time Updates?"
```
suggestedFeatures → find "Real-Time Update Notifications"
relatedCapabilities → check platform support
estimatedEffort → 20 hours
priority → "high"
phase → "phase-1"
okrs → success metrics
```

### "How Should We Handle Version Compatibility?"
```
architectureChanges → find "SDK Version Adapter Pattern"
currentArchitecture → today's approach
proposedArchitecture → recommended approach
migrationPath → step-by-step
riskAssessment → potential issues
```

## Weekly Workflow (Recommended)

**Monday 9am:** Generate report for previous week

```bash
curl -X POST http://localhost:3000/api/evolution-engine/generate-report \
  -H "Authorization: Bearer token" \
  -d '{"weekStart": "2025-02-17", "weekEnd": "2025-02-23"}'
```

**Monday 10am:** Team reviews report
- Discuss immediate actions
- Identify any surprises
- Highlight risks

**Monday-Tuesday:** Plan implementation
- Assign tasks from Phase 1 immediate actions
- Create tickets in Linear/Jira
- Estimate effort needed

**Tuesday-Friday:** Execute implementation
- Work on highest-priority items
- Monitor for new announcements
- Test against Pi SDK changes

**Friday 4pm:** Weekly retrospective
- Compare predicted effort vs. actual
- Document lessons learned
- Adjust next week's estimates

## Where to Find Things

### Internal Only Code
```
/lib/insight/evolution-engine.ts           # Core logic
/app/api/evolution-engine/                 # API endpoints
/components/insight/evolution-dashboard-internal.tsx  # Dashboard
```

### Documentation
```
/EVOLUTION_ENGINE_INTERNAL.md              # Full documentation
/EVOLUTION_ENGINE_QUICK_START.md           # This file
```

### Environment Setup
```
.env.local                                 # Dev token
```

## Typical Report Structure

```json
{
  "summary": {
    "totalNewCapabilities": 4,           // Platform releases
    "affectedModules": 3,                // Code files to change
    "suggestedFeatures": 3,              // Features to build
    "architectureChanges": 2,            // Structural improvements
    "totalEstimatedEffort": 140,         // Total hours
    "criticalPriority": 2                // Urgent items
  },
  
  "evolutionEvents": [
    {
      "source": "pi-sdk",
      "title": "SDK v3.2.0 Release",
      "breakingChanges": false
    }
  ],
  
  "moduleImpacts": [
    {
      "moduleName": "Advisor Context",
      "impactLevel": "high",
      "estimatedEffort": 12
    }
  ],
  
  "suggestedFeatures": [
    {
      "title": "Real-Time Updates",
      "priority": "high",
      "estimatedEffort": 20,
      "phase": "phase-1"
    }
  ],
  
  "recommendations": {
    "immediateActions": ["Update KYC endpoint", ...],
    "nextQuarterFocus": ["Implement real-time...", ...]
  }
}
```

## Common Questions

### Q: Why are some items marked "phase-2" or later?
**A:** Phase 1 (urgent) goes first. Later phases can wait for next quarter. Phasing helps spread work evenly.

### Q: What if criticality is low but effort is high?
**A:** It's a nice-to-have improvement. Schedule in Phase 3-4 when resources available. Don't rush it.

### Q: How often should we generate reports?
**A:** Weekly (Monday mornings recommended). This catches Pi platform changes promptly.

### Q: Can we ignore risk factors?
**A:** No. Mitigations are listed for each risk. Plan testing and reviews accordingly.

### Q: Who can access this tool?
**A:** Internal Pi Insight developers only. Never expose dashboard or API to users.

## Troubleshooting

**401 Unauthorized?**
```bash
# Check token is set correctly
echo $EVOLUTION_ENGINE_DEV_TOKEN
# Should print your token, not empty
```

**No evolution events detected?**
```
# Using mock data until real Pi API integration
# To test, check MOCK_EVOLUTION_EVENTS in evolution-engine.ts
# To use real data, integrate with Pi API sources
```

**Report shows 0 effort?**
```
# No changes detected for that week
# Pi platform updates may be lighter than usual
# Check next week's report
```

## Next Steps

1. **Set up token** – Add `EVOLUTION_ENGINE_DEV_TOKEN` to `.env.local`
2. **Generate first report** – Try the curl command above
3. **Review with team** – Discuss findings
4. **Create tickets** – Move immediate actions to Linear/Jira
5. **Implement Phase 1** – Start with high-priority, short-effort items
6. **Make it routine** – Generate reports every Monday

## More Information

- Full guide: `/EVOLUTION_ENGINE_INTERNAL.md`
- Integration points: See "Integration Points" in full guide
- Future roadmap: See "Future Enhancements" in full guide

---

**Remember:** This is internal-only. Keep the Evolution Engine hidden from end users.

Last Updated: February 20, 2025
