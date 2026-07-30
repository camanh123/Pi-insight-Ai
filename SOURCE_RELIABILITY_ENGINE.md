# Source Reliability Engine

## Overview

The Source Reliability Engine is an internal system that ensures all information in Pi Insight is properly classified, scored, and labeled with clear source attribution and confidence levels. This engine prevents AI from presenting unofficial information as official and maintains strict adherence to information accuracy standards.

**This module is for developers only and is not exposed to end users.**

## Core Components

### 1. Source Classifier (`source-classifier.ts`)
Classifies information by source type and assigns reliability scores.

**Source Types:**
- `official_core` - Official Pi Core Team statements (100% reliability)
- `official_docs` - Official documentation (98% reliability)
- `official_app_studio` - Pi App Studio resources (96% reliability)
- `community` - Community discussions/forums (65% reliability)
- `ai_analysis` - AI-generated analysis (45% reliability)

**Features:**
- Defines 10+ official Pi sources with verification methods
- Calculates composite reliability scores from multiple sources
- Determines reliability levels (verified to unverified)
- Validates against known conflicts
- Creates verified information records

### 2. Conflict Detector (`conflict-detector.ts`)
Identifies and tracks conflicting information across sources.

**Detects:**
- Direct contradictions
- Outdated information
- Incomplete information
- Ambiguous claims

**Generates:**
- Comprehensive conflict reports
- Resolution recommendations
- Metrics and analytics

### 3. Response Formatter (`response-formatter.ts`)
Formats AI responses with clear source attribution and confidence indicators.

**Separates:**
- Official Information
- Community Information
- AI Analysis & Synthesis

**Includes:**
- Source attribution for every claim
- Confidence indicators (0-100%)
- Reliability scoring
- Clear disclaimers
- Markdown export

### 4. Verification Engine (`verification-engine.ts`)
Validates AI responses meet source reliability standards.

**Prevents:**
- Unofficial content presented as official
- Unverified claims on critical topics
- Community-only information misclassified
- AI-only content presented as official

**Critical Topics Requiring Official Sources:**
- Mainnet launch
- KYC process
- Wallet security
- Node requirements
- Payment & transaction
- Security & authentication
- Identity & compliance

## API Endpoint

### POST /api/source-reliability/verify

Verify and format an AI response with complete source reliability analysis.

**Authentication:** Bearer token (developer only)

**Request:**
```json
{
  "records": [
    {
      "id": "info_123",
      "content": "Pi Mainnet is now live and operational.",
      "topic": "mainnet",
      "sources": [
        {
          "id": "pi_core_blog",
          "type": "official_core",
          "name": "Pi Core Team Blog",
          "reliabilityScore": 100
        }
      ],
      "overallReliabilityScore": 100,
      "verificationStatus": "verified",
      "lastUpdated": "2025-02-17T12:00:00Z"
    }
  ],
  "includeMarkdown": true
}
```

**Response:**
```json
{
  "success": true,
  "verification": {
    "results": [
      {
        "status": "approved",
        "recordId": "info_123",
        "issues": [],
        "recommendations": [],
        "approvedForPresentation": true
      }
    ],
    "report": {
      "totalVerified": 1,
      "approved": 1,
      "flagged": 0,
      "blocked": 0,
      "needsReview": 0,
      "criticalIssuesFound": 0
    }
  },
  "formattedResponse": {
    "sections": [
      {
        "type": "official",
        "title": "Official Information",
        "content": "Pi Mainnet is now live and operational...",
        "reliabilityScore": 100,
        "confidence": 100,
        "disclaimers": ["This information is sourced from official Pi Core Team..."]
      }
    ],
    "overallConfidence": 100,
    "warnings": [],
    "metadata": {
      "totalSources": 1,
      "officialSourceCount": 1,
      "communitySourceCount": 0,
      "aiGeneratedCount": 0,
      "conflictsDetected": false,
      "needsVerification": false
    }
  },
  "conflicts": {
    "total": 0,
    "critical": 0,
    "byTopic": {}
  },
  "markdown": "# Pi Insight Response\n\n**Overall Confidence:** ✓ Verified Official (95-100%)\n...",
  "timestamp": "2025-02-17T12:00:00.000Z"
}
```

## Verification Status Codes

- **approved** - Record meets all standards, can be presented as-is
- **flagged** - Record has issues but can be presented with proper labeling
- **blocked** - Record cannot be presented; contains critical issues
- **needs_review** - Record requires manual developer review

## Verification Issues

### Critical Issues (Block Presentation)

1. **CRITICAL_TOPIC_NO_OFFICIAL**
   - Critical topic lacks official source
   - Examples: mainnet, KYC, security

2. **CRITICAL_TOPIC_UNVERIFIED**
   - Critical topic is unverified
   - Must verify against official sources

### High Severity Issues (Flag for Review)

1. **LOW_RELIABILITY**
   - Reliability score below minimum threshold

2. **INSUFFICIENT_SOURCES**
   - Less than recommended number of sources

### Medium Severity Issues (Require Labeling)

1. **AI_ONLY_CONTENT**
   - Entirely AI-generated analysis
   - Must be labeled clearly

2. **COMMUNITY_ONLY**
   - Sourced from community only
   - Must be clearly labeled

3. **OUTDATED_INFO**
   - Information exceeds max age threshold

## Usage Examples

### Example 1: Verify Official Mainnet Information

```typescript
import { createVerifiedRecord, OFFICIAL_SOURCES } from '@/lib/insight/source-classifier';
import { verificationEngine } from '@/lib/insight/verification-engine';
import { responseFormatter } from '@/lib/insight/response-formatter';

const record = createVerifiedRecord(
  'Pi Mainnet is now operational with KYC requirements.',
  'mainnet',
  [OFFICIAL_SOURCES.pi_core_blog, OFFICIAL_SOURCES.pi_mainnet_docs],
  'Verified from official announcement'
);

const verification = verificationEngine.verifyRecord(record);
if (verification.approvedForPresentation) {
  const formatted = responseFormatter.formatResponse([record]);
  console.log(formatted);
}
```

### Example 2: Detect Conflicts

```typescript
import { conflictDetector } from '@/lib/insight/conflict-detector';

conflictDetector.registerRecord(record1);
conflictDetector.registerRecord(record2);

const report = conflictDetector.generateConflictReport();
console.log(`Found ${report.conflictCount} conflicts`);
console.log(`Critical: ${report.criticalConflicts}`);
```

### Example 3: Format Response for End Users

```typescript
import { responseFormatter } from '@/lib/insight/response-formatter';

const formatted = responseFormatter.formatResponse(records);
const markdown = responseFormatter.exportAsMarkdown(formatted);

// Display to user with proper formatting
console.log(markdown);
```

## Confidence Indicators

Users see these labels:

| Score | Label |
|-------|-------|
| 95-100% | ✓ Verified Official |
| 80-94% | ✓ Highly Reliable |
| 60-79% | ○ Likely Accurate |
| 40-59% | △ Uncertain |
| <40% | ✗ Unverified |

## Response Format Example

All responses include clear labeling:

```
## Official Information
Sourced directly from Pi Core Team and official documentation

[Content here]
[Sources: Pi Core Team Blog, Pi Mainnet Docs]
[Confidence: ✓ Verified Official (95-100%)]

## Community Information
Sourced from community discussions and forums

[Content here]
[Sources: Pi Network Reddit, Discord discussions]
[Confidence: ○ Likely Accurate (60-79%)]
[⚠️ Community content should be cross-referenced with official sources]

## AI Analysis & Synthesis
Synthesized analysis and predictions from AI

[Content here]
[Confidence: △ Uncertain (40-59%)]
[⚠️ This is AI-generated analysis, not official information]
[⚠️ For critical decisions, please consult official Pi documentation]
```

## Verification Policies

Default verification policy:
- Require official source for critical topics: **TRUE**
- Minimum reliability score: **60%**
- Maximum AI-only content: **20%**
- Require multiple sources for claims: **FALSE**
- Verify before presenting: **TRUE**
- Flag unofficial as non-official: **TRUE**
- Max information age: **30 days**

Customize policy:
```typescript
verificationEngine.updatePolicy({
  minimumReliabilityScore: 80,
  maxAgeInDays: 14,
  requireMultipleSourcesForClaims: true,
});
```

## Security & Access Control

- **Authentication:** Developer-only Bearer token
- **Rate Limiting:** 100 requests/hour per token
- **Audit Logging:** All verifications logged for 30 days
- **Data Isolation:** No access to end-user data
- **Export:** Markdown format only for documentation

## Developer Workflow

1. **Create Information Records** with sources
2. **Verify Records** using verification engine
3. **Check for Conflicts** using conflict detector
4. **Format Response** for end users
5. **Export as Markdown** if needed
6. **Review Logs** for quality metrics

## Metrics & Reporting

Get verification report:
```typescript
const report = verificationEngine.getVerificationReport(timeWindowMinutes);
// Returns: totalVerified, approved, flagged, blocked, needsReview, criticalIssuesFound
```

Get conflict metrics:
```typescript
const metrics = conflictDetector.getMetrics();
// Returns: totalConflicts, byTopic, bySeverity, byType, resolutionRate, unresolvedCritical
```

## Best Practices

1. **Always verify before presenting** - Never skip verification
2. **Use official sources** - Prioritize official Pi sources
3. **Label correctly** - Mark AI analysis and community content appropriately
4. **Resolve conflicts** - Address conflicting information before presenting
5. **Keep info fresh** - Update information regularly
6. **Document sources** - Always include source attribution
7. **Monitor metrics** - Track verification and conflict reports
8. **Communicate clearly** - Use confidence indicators to set expectations

## Maintenance

Review and update:
- Official sources monthly (check for new capabilities)
- Critical topics list (based on platform evolution)
- Verification policies (based on quality metrics)
- Conflict patterns (identify recurring issues)
- Source reliability scores (based on accuracy)

## Support

For developers:
- Check verification logs in `/logs` directory
- Review conflict reports for patterns
- Contact Pi Core Team for official source verification
- Reference official documentation at `docs.pi.app`
