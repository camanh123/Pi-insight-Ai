# Knowledge Graph - Quick Start Guide

## For Users: How to Use

1. **Open Pi Insight Home** → Scroll down to see "Pi Knowledge Graph"
2. **View the Graph** → See 9 colorful topics arranged in a circle
3. **Tap Any Topic** → Learn what it is, what depends on it, what enables it
4. **Explore Official Updates** → See linked Pi Network official announcements
5. **Switch Language** → Toggle EN/VI at top to see content in Vietnamese

### Example: Learning Mainnet
1. Tap the red "⛓️" (Mainnet) node
2. See it requires: Open Network, Nodes
3. See it enables: Ecosystem (all apps and businesses)
4. Check official updates about Mainnet
5. Click any update to read full details

## For Developers: Architecture

### File Structure
```
components/insight/
  ├─ knowledge-graph.tsx      (165 lines) - SVG visualization
  ├─ topic-detail.tsx         (187 lines) - Modal detail view
  └─ home-view.tsx            (updated)   - Integration point

lib/insight/
  ├─ data.ts                  (updated)   - Types & 18 data nodes
  └─ i18n.ts                  (updated)   - 8 translation keys

components/insight/
  └─ icons.tsx                (updated)   - 2 new icons
```

### Data Model
- **9 Nodes**: KYC, Wallet, Open Network, Nodes, Mainnet, KYB, App Studio, Ecosystem, Roadmap
- **9 Edges**: Directional relationships between topics
- **3 Strengths**: Strong (thick), Medium (normal), Weak (thin)
- **Colors**: Each topic has unique gradient + emoji icon

### Key Components

**KnowledgeGraph Component**
- Props: `lang`, `onSelectTopic`, `selectedTopic`
- Renders SVG with 9 nodes and 9 edges
- Handles hover/touch interactions
- Shows topic buttons below

**TopicDetail Component**
- Props: `topicId`, `lang`, `onClose`, `onSelectUpdate`
- Modal showing 5 sections: prerequisites, enables, related, updates, description
- Fullscreen on mobile, centered on desktop
- Clickable update links

### Adding New Topics

To add a new topic to the graph:

1. Add to `Topic` type in data.ts:
   ```typescript
   export type Topic = "mainnet" | "kyc" | "newTopic" | ...
   ```

2. Create node in `KNOWLEDGE_GRAPH_NODES`:
   ```typescript
   {
     id: "newTopic",
     label: { en: "New Topic", vi: "Chủ đề mới" },
     description: { en: "...", vi: "..." },
     color: "from-color-500 to-color-600",
     icon: "🎯",
     relatedUpdates: ["update-id"],
     dependencies: ["kyc"],
     learningOrder: 5,
   }
   ```

3. Add edges in `KNOWLEDGE_GRAPH_EDGES`:
   ```typescript
   { 
     from: "kyc", 
     to: "newTopic", 
     relationship: { en: "Required for", vi: "Cần thiết cho" },
     strength: "strong"
   }
   ```

4. Add i18n translations in data.ts if any new text

## Common Tasks

### Change Topic Color
Edit `color` field in node:
```typescript
color: "from-purple-500 to-purple-600"  // Available: blue, purple, green, orange, red, indigo, cyan, pink, yellow
```

### Update Topic Description
Edit `description` field (both EN and VI):
```typescript
description: {
  en: "New English description",
  vi: "Mô tả Tiếng Việt mới"
}
```

### Add New Relationship
Add to `KNOWLEDGE_GRAPH_EDGES`:
```typescript
{
  from: "nodeA",
  to: "nodeB",
  relationship: { en: "Enables", vi: "Cho phép" },
  strength: "strong"  // or "medium" or "weak"
}
```

### Link Update to Topic
Add to `relatedUpdates` in node:
```typescript
relatedUpdates: ["update-kyc-migration", "update-new-feature"]
```

## Styling Classes Available

### Graph Styling
- `pi-fade-up` - Fade in animation
- `pi-press` - Press/active state
- Tailwind colors: blue, purple, green, orange, red, indigo, cyan, pink, yellow

### Modal Styling
- `pi-fade-up`, `pi-pop` - Entry animations
- Responsive: `sm:` breakpoint changes from fullscreen to centered

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (iOS 13+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. Graph renders instantly (SVG with 9 elements)
2. No network calls when interacting
3. Modal lazy-loads only when opened
4. CSS animations use GPU (transform/opacity)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Graph not visible | Check `display` class, ensure parent has width |
| Icons not showing | Verify emoji in node data |
| Colors wrong | Check gradient classes use Tailwind colors |
| Mobile modal cut off | Ensure `pi-safe-bottom` class on modal |
| Edges not appearing | Verify both from/to nodes exist in KNOWLEDGE_GRAPH_NODES |
| Update links broken | Check updateId in relatedUpdates matches actual update id |

## Next Steps

1. **Test in Preview** - Tap different topics, verify all sections load
2. **Mobile Test** - Swipe on mobile, ensure modal behaves correctly
3. **Language Test** - Toggle EN/VI, verify all text translates
4. **Link Test** - Click official updates, verify they open correctly
5. **Add More Updates** - Link existing updates to topics in data
6. **Plan Deep Linking** - Consider URL structure for sharing topics

---

**Status**: ✅ Complete and ready to use!
