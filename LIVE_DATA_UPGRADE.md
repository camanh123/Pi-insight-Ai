# Pi Insight — Live Official Data Upgrade

## Overview

Pi Insight now automatically synchronizes with official Pi Network sources to keep the knowledge base always up-to-date. The system detects new announcements, displays visual indicators for unread updates, and notifies users of important changes.

## Key Features

### 1. **Automatic Data Synchronization**
- Fetches official Pi Network announcements from three approved sources:
  - Pi Core Team Blog (minepi.com/blog)
  - Pi Announcements (minepi.com/announcements)
  - App Studio Updates (appstudio.pi.network/updates)
- Initial sync on app load, then every 30 minutes
- Graceful retry with exponential backoff on failures
- Cache-aware to optimize performance

### 2. **New Updates Badge**
- Visual "New" badge appears on updates published today
- Pulsing dot indicator for visual attention
- Color-coded as primary brand color
- Respects reduced-motion preferences for accessibility

### 3. **Smart Notifications**
- Toast notification when new updates are detected
- Shows count of new updates (e.g., "3 new updates")
- Only appears when updates > 0
- Non-intrusive positioning at bottom of screen
- Bilingual support (EN/VI)

### 4. **Sync Status Display**
- Persistent status footer in the updates list
- Shows "Last sync: X minutes ago"
- Real-time sync indicator with animated dot
- Manual "Sync now" button for immediate refresh
- Error state with clear messaging if sync fails
- Indicator colors:
  - Green checkmark: Success
  - Red warning: Error
  - Blinking dot: Syncing

### 5. **Read Status Tracking**
- System tracks which updates users have opened
- New count decreases as updates are read
- Helps users stay current with latest announcements
- Respects user's reading pace

### 6. **Offline Gracefully**
- If sync fails (no internet, API error), shows:
  - Last successful sync time
  - Error message: "Official data could not be updated"
  - Suggests retrying with manual sync button
- App continues to work with cached data

## Architecture

### New Files

**`/lib/insight/sync.ts`**
- Core sync service with:
  - Official source definitions
  - HTML parsers for each source
  - Topic detection from content
  - Deduplication logic
  - Human-readable time formatting
  - Error handling

**`/app/api/sync-updates/route.ts`**
- Server-side API endpoint
- Fetches from official sources
- Returns enriched update objects
- 1-hour cache revalidation
- Proper HTTP error handling

**`/components/insight/sync-status.tsx`**
- Visual sync status component
- Shows last sync time
- Manual sync button with loading state
- New updates counter
- Error notifications

**`/components/insight/new-badge.tsx`**
- Reusable "New" badge component
- Animated pulse dot
- Accessible styling

### Modified Files

**`/contexts/insight-context.tsx`**
- Added sync state management
- Auto-sync on app load and every 30 minutes
- `syncUpdates()` function for manual sync
- `markUpdateAsRead()` tracks read updates
- `newUpdatesCount` export to UI

**`/components/insight/home-view.tsx`**
- Integrated SyncStatus component
- Displays at bottom of update list

**`/components/insight/update-card.tsx`**
- Shows "New" badge for today's updates
- Marks updates as read when opened
- Tracks engagement

**`/lib/insight/i18n.ts`**
- 15 new translation keys (EN + VI)
- Sync status messages
- Time formatting
- Error messages

**`/lib/insight/data.ts`**
- New types: `UpdateReadStatus`, `SyncStatus`
- Support for sync state management

**`/app/globals.css`**
- New `pi-pulse` animation
- Smooth 2s opacity pulse
- Respects prefers-reduced-motion

## User Experience Flow

1. **App Opens**
   - Pi Insight loads with cached data
   - Sync begins automatically in background
   - User doesn't wait

2. **New Updates Detected**
   - Toast appears: "3 new updates from Pi Network"
   - "New" badges appear on today's updates
   - New count shown in sync status (e.g., "3 new updates available")

3. **User Opens an Update**
   - Update marked as read
   - New count decreases by 1
   - Badge removed after first view

4. **Manual Sync**
   - User can tap "Sync now" button anytime
   - Spinner shows while syncing
   - Success/error status updates

5. **Offline Scenario**
   - Error message appears
   - User can retry when connection restored
   - App continues to work with cached data

## Performance Optimizations

- **Efficient Fetching**: Uses HTTP cache headers (no-store) to get fresh data without unnecessary requests
- **Debounced Sync**: 30-minute interval prevents excessive API calls
- **Partial Updates**: Only syncs what's new via deduplication
- **Client Caching**: Cached data allows instant app load
- **Exponential Backoff**: Failed syncs retry with increasing delays (1.8x multiplier, capped at 30s)

## Security & Trust

- **Approved Sources Only**: Fetches from 3 official Pi Network domains
- **No External Ads/Scripts**: Pure data extraction from official pages
- **User Data Private**: Sync status stored locally in user's Pi account
- **Transparent Sources**: Every update shows source URL and publication date

## Technical Details

### Sync State Structure
```typescript
interface SyncStatus {
  lastSyncAt: string | null        // ISO timestamp
  isSyncing: boolean               // Currently fetching
  syncError: string | null         // Error message if failed
  newUpdateCount: number           // Count of unread updates
}
```

### Auto-Sync Logic
- Fires on component mount (when app opens)
- Repeats every 30 minutes while user has app open
- Manual sync available anytime
- Respects rate limits and gracefully handles failures

### New Badge Logic
- Treats updates from today as "new"
- Removed after user opens the update
- Pulsing animation draws attention
- Accessible with reduced-motion support

## Bilingual Support

All sync messages and statuses available in:
- **English**: Complete translations
- **Vietnamese**: Complete translations (Tiếng Việt)

Including:
- "Last sync: just now / 5 minutes ago / 2 hours ago"
- "3 new updates available"
- "Official data could not be updated"
- "Syncing official updates..."

## Future Enhancements

Possible extensions (not in v1):
- Background sync notification service
- Persistent read/unread state across sessions
- User preferences for sync frequency
- Delivery of critical updates (fast-track)
- Contributor attribution for parsed updates
- AI-powered update priority ranking

## Testing Checklist

- [ ] Sync completes on app load
- [ ] New badges appear for today's updates
- [ ] Toast notification shows new count
- [ ] Clicking "Sync now" re-fetches data
- [ ] Opening an update marks it as read
- [ ] Offline: cached data still available
- [ ] Offline: error message shown, can retry
- [ ] Vietnamese translations appear
- [ ] Reduced motion disables animations
- [ ] Mobile: sync status footer visible
- [ ] Manual sync button disables while syncing
