# Pi Insight — Readiness Score Upgrade

## Overview

The Pi Readiness Score is a personalized scoring system that helps users understand their preparedness for the Pi Network Open Network. It calculates a comprehensive 0-100 score based on the user's profile status across seven key dimensions.

## Features Implemented

### 1. Readiness Score Calculation (0-100)

The readiness score is automatically calculated based on:

- **KYC Status** (0-100): Fundamental requirement for Mainnet access
  - Not started: 0%
  - In progress: 50%
  - Completed: 100%

- **Mainnet Migration** (0-100): Path to Open Network
  - Not started: 0%
  - Eligible: 80%
  - Migrated: 100%

- **Wallet Setup** (0-100): Essential for managing Pi
  - No wallet: 0%
  - Created: 50%
  - Funded: 100%

- **Security Circle** (0-100): Account protection (weighted 0.7)
  - Always pending: 0% (users build gradually)

- **Node Participation** (0-100): Optional contribution to network (weighted 0.6)
  - Not operator: 0%
  - Running node: 30%

- **App Studio Experience** (0-100): Developer capability (weighted 0.7)
  - None: 0%
  - Beginner/Intermediate: 50%
  - Advanced: 100%

- **KYB (Business)** (0-100): Business-tier access (weighted 0.6)
  - N/A or not started: 0%
  - In progress: 20%

### 2. Visual Score Display

- **Circular Progress Indicator**: Animated SVG circle showing overall score
- **Color-coded**: Green (80+), Amber (60-80), Orange (40-60), Red (<40)
- **Category Breakdown**: Individual progress bars for each category
- **Completed vs Pending Steps**: Visual separation with green/neutral styling

### 3. Smart Next Actions

- Automatically generated based on profile gaps
- Prioritized by impact (High/Medium/Low)
- Linked to related Pi topics (KYC, Mainnet, Nodes, etc.)
- "Next Best Action" highlighted for immediate focus

### 4. AI Recommendations

- Adaptive message based on overall score:
  - 80+: Nearly ready — optimize remaining steps
  - 60-80: Good progress — continue priority actions
  - 40-60: Started journey — focus on KYC
  - <40: Begin with KYC verification

- Clearly marked as "Official Information"

### 5. Auto-Update on Profile Change

When a user updates their profile:
1. Profile changes trigger `updateProfile()`
2. Next actions are regenerated based on new status
3. Readiness score recalculates automatically
4. UI updates reflect new scores and recommendations

## Data Types

### ReadinessStep
```typescript
interface ReadinessStep {
  id: string
  name: Loc              // Bilingual name
  description: Loc       // Bilingual description
  completed: boolean
  category: string       // kyc, mainnet, wallet, security, node, appstudio, kyb
  weight: number        // Importance multiplier
  relatedTopic: Topic
}
```

### ReadinessScore
```typescript
interface ReadinessScore {
  overall: number       // 0-100
  category: {
    kyc: number
    mainnet: number
    wallet: number
    security: number
    node: number
    appstudio: number
    kyb: number
  }
  steps: ReadinessStep[]
  nextBestAction: NextAction | null
  recommendation: Loc   // Bilingual AI recommendation
  isOfficial: boolean
}
```

## Components

### ReadinessScore Component
- Main card displaying all readiness metrics
- Responsive mobile-first design
- Shows completed and pending steps
- Displays AI recommendation
- Highlights next best action

### ReadinessView Component
- Full-page view of readiness tracking
- Includes quick tips and official information note
- Can be integrated into main navigation

## Usage

### In Context
```typescript
const { profile, nextActions } = useInsight()
const readiness = calculateReadinessScore(profile, nextActions, lang)
// readiness.overall (0-100)
// readiness.category.kyc, mainnet, wallet, etc.
// readiness.nextBestAction
// readiness.recommendation
```

### In Components
```typescript
import { ReadinessScore } from "@/components/insight/readiness-score"

export function MyComponent() {
  return <ReadinessScore />
}
```

## Information Classification

All score components clearly separate:

- **Official Information** (green badge): Direct facts from profile status based on official Pi requirements
- **AI Analysis** (blue): Synthesis of status into recommendations
- **AI Prediction**: Forward-looking suggestions (where applicable)

## Bilingual Support

All strings support English and Vietnamese:
- Score calculations based on universally understood status
- Recommendations translated fully
- UI properly supports both languages
- RTL considerations for future expansion

## Integration Points

The readiness score integrates with:

1. **Profile Editor**: Updates trigger score recalculation
2. **Next Actions**: Feeds into action generation logic
3. **Pi Journey**: Related to overall journey progression
4. **Dashboard**: Can display as key metric
5. **AI Advisor**: Can reference user's readiness in personalized responses

## Performance Characteristics

- **Calculation**: O(n) where n = number of steps (typically 7) — negligible impact
- **Rendering**: Smooth animations with CSS transitions
- **Updates**: Real-time recalculation on profile changes
- **Storage**: No additional storage beyond profile data

## Future Enhancements

- Historical score tracking (see improvement over time)
- Comparative metrics (how user ranks vs community average)
- Predictive timeline (estimated days to reach milestones)
- Custom goal setting
- Achievement badges upon reaching score milestones
