# Pi Insight: Interactive Knowledge Graph Feature

## Overview

The Knowledge Graph feature in Pi Insight provides an interactive, visual way for Pioneers to explore how core Pi Network topics connect and relate to each other. It transforms learning from linear (reading updates one by one) to exploratory (understanding topic relationships and dependencies).

## Core Topics Connected

The Knowledge Graph includes 9 core Pi Network topics:

1. **KYC** (Know Your Customer) - Identity verification for individuals
2. **Wallet** - Pi coin storage and asset management  
3. **Open Network** - Decentralized network allowing anyone to run nodes
4. **Nodes** - Network nodes that validate transactions
5. **Mainnet** - Pi's main live blockchain
6. **KYB** (Know Your Business) - Business verification for companies
7. **App Studio** - Development platform for decentralized apps
8. **Ecosystem** - Network of businesses, apps, and services
9. **Roadmap** - Future features and milestones

## Visual Components

### 1. Knowledge Graph Visualization (knowledge-graph.tsx)

**Features:**
- SVG-based circular node layout with 8 nodes arranged in a circle around center
- Connection lines showing topic relationships
- Color-coded nodes (each topic has unique gradient color)
- Emoji icons for quick visual identification
- Interactive hover states with emphasis on connections
- Touch-friendly for mobile devices
- Responsive scaling for all screen sizes

**Technical Details:**
- Nodes positioned at 320x320 SVG canvas
- Circular arrangement: angle = (index / total) * 2π, radius = 120px
- Edges drawn first (behind nodes) for clean rendering
- Connection strength visually indicated (strong/medium/weak line weights)
- Selected topic highlighted in primary color with thicker edges

### 2. Topic Detail Modal (topic-detail.tsx)

**Features:**
- Full-screen modal on mobile (rounded bottom) / centered modal on desktop
- Shows 5 key sections for selected topic:
  - Prerequisites: What you should learn first (dependency chain)
  - Enables: What topics this unlocks (reverse dependencies)
  - Related Topics: Connected topics with relationship descriptions
  - Official Updates: Linked official Pi updates about this topic
  - Topic Description: Detailed explanation

**Sections Breakdown:**

1. **Prerequisites** (Blue Cards)
   - Shows all required prerequisite topics
   - Displayed as individual cards with icon, title, description
   - Helps users understand learning path

2. **Enables** (Green Pills)
   - Shows which topics depend on the current topic
   - Compact pill display for quick scanning
   - Helps users see impact of learning

3. **Related Topics** (Purple Chain)
   - Shows connected topics with relationship descriptions
   - Clickable to navigate (future: deep linking)
   - Examples: "Required for", "Enables", "Relates to"

4. **Official Updates** (Amber/Gold)
   - Links to official Pi updates about the topic
   - Tappable to open full update detail
   - Shows update title, summary, source, date

## Data Structure

### Knowledge Graph Nodes

```typescript
interface KnowledgeGraphNode {
  id: Topic
  label: Loc           // English & Vietnamese
  description: Loc     // Full explanation
  color: string        // Tailwind gradient color
  icon: string         // Emoji icon
  relatedUpdates: string[]  // Update IDs
  dependencies: Topic[]     // Required prerequisites
  learningOrder: number     // Recommended sequence (1-9)
}
```

### Knowledge Graph Edges

```typescript
interface KnowledgeGraphEdge {
  from: Topic
  to: Topic
  relationship: Loc    // "Required for", "Enables", etc.
  strength: "strong" | "medium" | "weak"
}
```

## Learning Paths

The Knowledge Graph suggests a natural learning progression:

1. **KYC** (Foundation)
   - First thing every Pioneer needs
   - Foundation for all other access

2. **Wallet** (Key Infrastructure)
   - Depends on: KYC
   - Enables: Mainnet transactions

3. **Open Network** (Network Architecture)
   - Depends on: KYC, Wallet
   - Foundation for decentralization

4. **Nodes** (Network Security)
   - Depends on: Open Network
   - Powers Mainnet validation

5. **Mainnet** (Live Blockchain)
   - Depends on: Open Network, Nodes
   - Powers all transactions

6. **KYB** (Business Verification)
   - Depends on: KYC
   - Required for business builders

7. **App Studio** (Development)
   - Depends on: KYB, Mainnet
   - Build on Pi

8. **Ecosystem** (Network Effects)
   - Depends on: App Studio, Mainnet, KYB
   - Vision of connected businesses

9. **Roadmap** (Future Vision)
   - Contextual: shows what's coming

## Topic Colors & Icons

| Topic | Color | Icon | Hex |
|-------|-------|------|-----|
| KYC | Blue | 🆔 | #3b82f6 |
| Wallet | Purple | 💰 | #a855f7 |
| Open Network | Green | 🌐 | #22c55e |
| Nodes | Orange | 🖥️ | #f97316 |
| Mainnet | Red | ⛓️ | #ef4444 |
| KYB | Indigo | 🏢 | #6366f1 |
| App Studio | Cyan | ⚙️ | #06b6d4 |
| Ecosystem | Pink | 🌱 | #ec4899 |
| Roadmap | Yellow | 🗺️ | #eab308 |

## Relationship Types

The graph defines 9 key relationships:

1. **KYC → Wallet** (strong): "Required for" - Must complete KYC before using wallet
2. **Wallet → Mainnet** (strong): "Enables transactions on" - Wallet needed to transact
3. **Open Network → Nodes** (strong): "Powered by" - Network runs on nodes
4. **Nodes → Mainnet** (strong): "Validates transactions on" - Nodes secure blockchain
5. **KYC → KYB** (medium): "Foundation for" - KYC is prerequisite for KYB
6. **KYB → App Studio** (strong): "Required for" - Businesses need KYB to build
7. **App Studio → Ecosystem** (strong): "Builds" - Apps create the ecosystem
8. **Mainnet → Ecosystem** (strong): "Powers" - Mainnet enables all apps
9. **KYC → Open Network** (medium): "Participant in" - Verified users participate in network

## Bilingual Support

All content is fully bilingual:
- Topic names, descriptions, relationships
- Official Evidence section headers
- Button labels and interactive text
- Relationship descriptions
- Prerequisite and enabling topic labels

Language toggle at top of app switches all content immediately.

## Mobile Optimization

**Design Decisions:**
- Graph uses SVG scaling (100% width, maintains aspect ratio)
- Topic buttons below graph for easy selection
- Modal slides up from bottom on mobile (touch-friendly)
- Large tap targets (minimum 44px recommended)
- Swipe support for modal dismiss (standard mobile pattern)
- Responsive font sizes and spacing

**Breakpoints:**
- Mobile (< 640px): Full-width graph, two-column topic buttons
- Tablet (≥ 640px): Wider graph, three-column buttons
- Desktop (≥ 1024px): Centered modal, better spacing

## Performance Characteristics

- **SVG Rendering**: Fast (9 nodes, 9 edges - negligible render time)
- **Interaction Response**: Instant (no network calls on tap)
- **Memory Usage**: Minimal (static data structures)
- **Bundle Size**: ~5KB (components + CSS)

## Integration Points

1. **Home View** - Knowledge Graph shown in main feed
2. **Topic Detail Modal** - Shows related updates and dependencies
3. **Navigation** - Can eventually deep-link to specific topics
4. **Advisor** - Could reference graph for context in Q&A

## Future Enhancements

1. **Deep Linking** - Share specific topic links: `#/graph/mainnet`
2. **Topic Filtering** - Focus on related topics to reduce clutter
3. **Path Recommendations** - "Start here" based on user profile
4. **Progress Tracking** - Show which topics user has learned
5. **Interactive Tutorials** - "Learn KYC Path" guided experience
6. **Export/Share** - Save learning paths or share with friends

## Testing Scenarios

1. **Tap KYC node** → See prerequisites empty, enables Wallet/KYB
2. **Tap Mainnet** → See 3 prerequisites, enables Ecosystem
3. **Hover edges** → See relationship descriptions
4. **Mobile touch** → Graph responds to touch, modal slides up
5. **Language toggle** → All text updates immediately
6. **Click update** → Opens full update detail view
7. **Scroll modal** → Can view all content on small screens
8. **Close modal** → Returns to main graph view

## Files Created/Modified

### New Files:
- `/components/insight/knowledge-graph.tsx` - Graph visualization
- `/components/insight/topic-detail.tsx` - Topic detail modal
- `/components/insight/icons.tsx` - Added IconBook, IconChain

### Modified Files:
- `/lib/insight/data.ts` - Added KnowledgeGraphNode, KnowledgeGraphEdge types + node/edge data
- `/components/insight/home-view.tsx` - Integrated graph into home view
- `/lib/insight/i18n.ts` - Added EN/VI translations

### Data Counts:
- 9 Knowledge Graph Nodes
- 9 Knowledge Graph Edges
- 80+ new translation strings (EN + VI)
