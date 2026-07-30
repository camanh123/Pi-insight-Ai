# Internal Memory Engine for Pi Insight

## Overview

The Memory Engine is a comprehensive user context and personalization system designed for Pi Insight developers. It stores, manages, and retrieves user information while maintaining strict separation from official Pi knowledge and respecting user privacy.

**Status**: Internal-only, developer accessible via API  
**Access**: Bearer token authentication required  
**End-User Visibility**: Zero - completely hidden from users  

## Core Components

### 1. Memory Storage (`memory-storage.ts` - 448 lines)

Manages all user memory across 8 categories:

**Data Types**:
- `UserProfile` - Experience level, learning style, preferences, interests
- `PiJourney` - Milestones, engagement metrics, progression tracking
- `LearningRecord` - Topics explored, comprehension levels, time spent
- `ConversationRecord` - Questions asked, modules used, feedback
- `PersonalizedGoal` - User goals with progress tracking and checkpoints
- `SessionMemory` - Current session context and activity
- `ContextualMemory` - Session-specific temporary memory
- `LongTermMemory` - Persistent user information

**Key Methods**:
- `upsertProfile()` - Create/update user profile
- `recordLearning()` - Log learning sessions
- `recordConversation()` - Store conversation history
- `upsertGoal()` - Create/manage goals
- `getProgressMetrics()` - Calculate learning progress
- `exportUserMemory()` - Full user data export
- `deleteUserMemory()` - Permanent user memory deletion

### 2. Context Retriever (`context-retriever.ts` - 250 lines)

Provides AI modules with relevant user context before answering:

**Key Methods**:
- `getUserContext()` - Comprehensive context for specific topic
- `getRelevantLearning()` - Filter learning records by topic
- `extractRelevantMemories()` - Find related memories
- `generateFollowUpSuggestions()` - Smart suggestion generation
- `calculateContextConfidence()` - Confidence score (0-100)
- `getContextualInsights()` - Retrieve relevant insights

**Context Includes**:
- User profile and experience level
- Recent learning history
- Previous conversations
- Active goals and progress
- Progress metrics
- Suggested follow-ups
- Confidence indicators

### 3. Recommendation Engine (`recommendation-engine.ts` - 384 lines)

Generates personalized recommendations and learning paths:

**Recommendation Types**:
- Topic recommendations (based on gaps and sequence)
- Goal-based recommendations (progress tracking)
- Skill gap recommendations (critical topics)
- Learning style recommendations (personalized resources)

**Smart Features**:
- `createSmartReminders()` - Daily briefings, goal alerts, streak reminders
- `createLearningPath()` - Personalized learning sequences
- `updatePathProgress()` - Track learning path completion
- Confidence scoring (0-100)
- Relevance ranking

### 4. Privacy Manager (`privacy-manager.ts` - 277 lines)

Strictly enforces privacy and memory separation:

**Features**:
- `setPrivacyPreferences()` - User privacy controls
- `requestDataDeletion()` - Scope-based deletion (all, conversations, learning, goals)
- `exportUserData()` - Complete data export
- `anonymizeUserData()` - Auto-anonymization after inactivity
- `validateSeparation()` - Ensures user memory ≠ official knowledge
- `getAuditLog()` - Complete access history

**Privacy Settings**:
- Conversation logging (on/off)
- Behavior tracking (on/off)
- Personalization opt-in
- Retention periods (default 90 days conversations, 365 days learning)
- Auto-anonymization after 30 days inactivity
- Data export allowed
- Delete-on-request supported

### 5. Memory Engine API (`/app/api/memory-engine/route.ts` - 523 lines)

Developer-only REST API with Bearer token authentication:

**Endpoints**:
- `POST /api/memory-engine` - Main operations
- `GET /api/memory-engine` - API documentation

**Actions**:
- `get-context` - Retrieve user context
- `store-learning` - Record learning session
- `store-conversation` - Log conversation
- `create-goal` - Create new goal
- `get-recommendations` - Generate recommendations
- `create-reminders` - Generate smart reminders
- `get-learning-path` - Retrieve learning path
- `update-profile` - Update user profile
- `get-progress` - Get progress metrics
- `export-memory` - Export all user memory
- `delete-memory` - Request data deletion
- `set-privacy` - Configure privacy settings
- `get-privacy` - Retrieve privacy settings
- `audit-log` - Access audit trail

## Memory Tiers

### Long-Term Memory
- Persistent user data (profile, journey, completed learning)
- Retained for extended periods
- Used for trend analysis and recommendations
- Survives session boundaries

### Session Memory
- Active session context
- Started at session initialization
- Contains session-specific activity tracking
- Cleared on session end

### Contextual Memory
- Temporary working memory for current topic
- Topic-specific information retrieval
- Session-specific context
- Expires after session timeout

### Transient Memory
- Immediate working data
- Used during active conversation
- Cleared after response generation

## Separation: User Memory vs Official Knowledge

**Critical Principle**: User memory is completely separate from official Pi knowledge.

**User Memory Includes**:
- Personal learning history
- Questions asked and topics explored
- Goals and progress
- Preferences and settings
- Conversation records
- Journey milestones
- Achievement records

**Official Knowledge Includes**:
- Pi documentation
- Core team announcements
- API specifications
- Security guidelines
- Mainnet information
- KYC/KYB requirements

**Enforcement**:
- All user memory is marked internally as user-generated
- Official knowledge is marked as source-verified
- Privacy manager validates separation
- Deletion requests only affect user memory
- Official knowledge persists independently

## API Usage

### Get User Context
```bash
curl -X POST http://localhost:3000/api/memory-engine \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get-context",
    "userId": "user-123",
    "sessionId": "session-456",
    "topic": "KYC"
  }'
```

### Store Learning Record
```bash
curl -X POST http://localhost:3000/api/memory-engine \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "store-learning",
    "userId": "user-123",
    "data": {
      "topic": "KYC",
      "contentType": "documentation",
      "title": "KYC Process Guide",
      "comprehensionLevel": 4,
      "timeSpent": 1200
    }
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:3000/api/memory-engine \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get-recommendations",
    "userId": "user-123"
  }'
```

### Export User Memory
```bash
curl -X POST http://localhost:3000/api/memory-engine \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "export-memory",
    "userId": "user-123"
  }'
```

### Request Data Deletion
```bash
curl -X POST http://localhost:3000/api/memory-engine \
  -H "Authorization: Bearer YOUR_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete-memory",
    "userId": "user-123",
    "data": {
      "scope": "conversations"
    }
  }'
```

## Configuration

Set environment variable for developer access:
```bash
EVOLUTION_ENGINE_DEV_TOKEN=your-secure-dev-token
```

## Integration with AI Modules

Before any AI response:
```typescript
// 1. Retrieve user context
const context = await retriever.getUserContext(userId, sessionId, topic);

// 2. Check privacy settings
const privacy = await privacyManager.getPrivacyPreferences(userId);

// 3. Verify memory separation
const validation = await privacyManager.validateSeparation(userId);

// 4. Generate recommendations
const recommendations = await recommender.generateRecommendations(userId, context);

// 5. Create reminders if needed
const reminders = await recommender.createSmartReminders(userId, context);

// 6. Store interaction
await storage.recordConversation(userId, { query, response, sourceUsed });

// 7. Update progress
const metrics = await storage.getProgressMetrics(userId);
```

## Privacy Protection

The Memory Engine implements multiple privacy safeguards:

1. **User Control** - Full privacy preference configuration
2. **Data Minimization** - Only store necessary information
3. **Retention Policies** - Automatic data expiration
4. **Anonymization** - Auto-anonymize after inactivity
5. **Export Rights** - Users can export all their data
6. **Deletion Rights** - Users can delete data in full or in part
7. **Audit Trail** - Complete access logging
8. **Separation** - User memory never mixed with official knowledge

## Development Checklist

- [x] Memory storage system implemented
- [x] Context retrieval system built
- [x] Recommendation engine functional
- [x] Privacy manager with controls
- [x] API endpoint with authentication
- [x] Documentation and guides
- [ ] Integration with all AI modules
- [ ] Testing and validation
- [ ] Performance optimization
- [ ] Audit trail analysis

## Best Practices

1. **Always retrieve context** before AI response generation
2. **Validate memory separation** on data operations
3. **Respect privacy settings** - honor user preferences
4. **Log all operations** in audit trail
5. **Clean up transient memory** after session
6. **Update progress metrics** when learning occurs
7. **Generate recommendations** from relevant context
8. **Test deletion requests** thoroughly before enabling

## Support

For developer support or questions about Memory Engine:
1. Check `/MEMORY_ENGINE_DEVELOPER_GUIDE.md` for detailed docs
2. Review API schema: `GET /api/memory-engine`
3. Check audit logs: `action: audit-log`
4. Validate memory separation: `validateSeparation()`
5. Test with sample data before production
