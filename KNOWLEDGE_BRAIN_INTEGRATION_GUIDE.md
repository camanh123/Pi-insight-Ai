# Knowledge Brain Integration Guide

## Using the Components

### Basic Integration

```tsx
import { KnowledgeBrain } from "@/components/insight/knowledge-brain"
import { AILearningPath } from "@/components/insight/ai-learning-path"
import { useInsight } from "@/contexts/insight-context"

export function MyPage() {
  const { lang, t } = useInsight()

  return (
    <div className="space-y-6">
      {/* AI Knowledge Brain */}
      <KnowledgeBrain lang={lang} t={t} />

      {/* OR AI Learning Path */}
      <AILearningPath lang={lang} t={t} />
    </div>
  )
}
```

### In Navigation/Tabs

```tsx
import { KnowledgeBrain } from "@/components/insight/knowledge-brain"

function TabContent({ activeTab, lang, t }) {
  return (
    <>
      {activeTab === "knowledge-brain" && <KnowledgeBrain lang={lang} t={t} />}
      {/* Other tabs... */}
    </>
  )
}
```

## Customization Options

### Adjust Topic Grid Columns

```tsx
// In knowledge-brain.tsx line 290:
// Change: <div className="grid grid-cols-2 gap-2">
// To:     <div className="grid grid-cols-3 gap-2">
```

### Modify Learning Paths

Add custom paths to `LEARNING_PATHS` array:

```tsx
{
  userType: "researcher",
  path: ["knowledge-graph", "smart-contracts", "consensus", "tokenomics"],
  reasoning: {
    en: "Deep dive into Pi's technical architecture",
    vi: "Đi sâu vào kiến trúc kỹ thuật của Pi"
  },
  estimatedTime: 6,
  description: {
    en: "For researchers - Master Pi internals in 6 hours",
    vi: "Dành cho nhà nghiên cứu - Làm chủ nội bộ Pi trong 6 giờ"
  }
}
```

### Adjust Zoom Range

```tsx
// Minimum zoom (currently 0.8):
Math.max(0.5, zoomLevel - 0.2)

// Maximum zoom (currently 1.6):
Math.min(2, zoomLevel + 0.2)
```

### Change Health Score Thresholds

```tsx
// In getHealthColor() function (line ~150):
// Modify these values:
if (health >= 80) return "text-emerald-600"  // Change 80 threshold
if (health >= 60) return "text-blue-600"     // Change 60 threshold
if (health >= 40) return "text-amber-600"    // Change 40 threshold
```

## Data Updates

### Adding a New Topic

Edit `/lib/insight/data.ts` around line 350-500 (KNOWLEDGE_GRAPH_NODES):

```tsx
{
  id: "my-new-topic",
  label: { en: "My Topic", vi: "Chủ đề của tôi" },
  description: { 
    en: "Description here",
    vi: "Mô tả ở đây"
  },
  color: "from-cyan-500 to-cyan-600",
  icon: "🚀",
  relatedUpdates: ["update-id-1"],
  dependencies: ["kyc"],
  learningOrder: 5,
  importanceScore: 8,
  updateCount: 2,
  lastUpdated: "2025-02-20",
  whyMatters: {
    en: "Why it matters text...",
    vi: "Tại sao nó quan trọng..."
  },
  affectedGroups: ["pioneers", "developers"],
  aiAnalysis: {
    en: "AI Analysis: Your analysis here...",
    vi: "Phân tích AI: Phân tích của bạn tại đây..."
  },
  aiPredictions: {
    en: "AI Prediction (speculation): Your prediction...",
    vi: "Dự đoán AI (suy đoán): Dự đoán của bạn..."
  },
  recommendedActions: [
    {
      en: "Action 1",
      vi: "Hành động 1"
    }
  ]
}
```

### Updating Metrics

```tsx
// Increase updateCount when new official update is released:
updateCount: 3  // Was 2, now 3

// Update lastUpdated to today:
lastUpdated: "2025-02-21"

// Adjust importanceScore based on community feedback:
importanceScore: 9  // Scale 1-10
```

## Styling & Theming

### Custom Colors

All color classes use Tailwind's standard palette. Change gradient colors:

```tsx
// In topic object:
color: "from-[your-color-1] to-[your-color-2]"

// Examples:
"from-emerald-500 to-emerald-600"
"from-rose-500 to-rose-600"
"from-indigo-500 to-indigo-600"
```

### Typography Adjustments

```tsx
// Topic title size (currently text-lg):
<h3 className="text-xl font-bold text-foreground">
  
// Section title size (currently text-xs):
<p className="text-xs font-semibold uppercase">

// Body text size (currently text-sm):
<p className="text-sm text-foreground">
```

## API Integration Hooks

### Connect to External Updates

When official Pi updates are released, update topic metrics:

```tsx
// API endpoint handler:
export async function updateTopicMetrics(topicId: string) {
  const topic = KNOWLEDGE_GRAPH_NODES.find(n => n.id === topicId)
  if (!topic) return

  // Fetch from official Pi sources
  const updates = await fetchOfficialUpdates(topicId)
  
  // Update the node
  topic.updateCount = updates.length
  topic.lastUpdated = new Date().toISOString()
  
  // Recalculate health
  const health = getTopicHealth(topic)
  
  return { topic, health }
}
```

### Real-time Health Updates

```tsx
// In a useEffect or subscription:
const unsubscribe = subscribeToTopicUpdates(selectedTopic.id, (updates) => {
  // Re-render component to show updated metrics
  setTopicHealth(calculateHealth(updates))
})
```

## Search Optimization

### Extend Search Index

```tsx
// Add more searchable fields:
// In filteredTopics calculation (line ~115):
topics.filter(t =>
  t.label[lang].toLowerCase().includes(query) ||
  t.description[lang].toLowerCase().includes(query) ||
  t.whyMatters[lang].toLowerCase().includes(query) ||  // Add this
  t.aiAnalysis[lang].toLowerCase().includes(query)      // Add this
)
```

## Performance Optimization

### Memoization

```tsx
// For large topic lists, memoize filtering:
import { useMemo } from "react"

const filteredTopics = useMemo(() => {
  // expensive filtering logic
}, [searchQuery, activeFilter, lang])
```

### Lazy Loading

```tsx
// Load related topics on demand:
const [relatedTopicsLoaded, setRelatedTopicsLoaded] = useState(false)

// Load when section expands:
const toggleSection = (section) => {
  if (section === "related" && !relatedTopicsLoaded) {
    loadRelatedTopics()
    setRelatedTopicsLoaded(true)
  }
}
```

## Accessibility Enhancements

### Keyboard Navigation

```tsx
// Add to topic grid buttons:
onKeyDown={(e) => {
  if (e.key === "Enter") setSelectedTopic(node.id)
  if (e.key === "Escape") setSelectedTopic(null)
}}
```

### Screen Reader Labels

```tsx
// Add aria-labels:
<button
  aria-label={`${node.label[lang]}, importance ${node.importanceScore} out of 10, health ${health} percent`}
>
```

## Testing

### Unit Test Example

```tsx
import { render, screen } from "@testing-library/react"
import { KnowledgeBrain } from "@/components/insight/knowledge-brain"

describe("KnowledgeBrain", () => {
  it("renders all topics", () => {
    render(<KnowledgeBrain lang="en" t={mockT} />)
    expect(screen.getAllByRole("button")).toHaveLength(8) // 8 topics
  })

  it("filters by importance", async () => {
    render(<KnowledgeBrain lang="en" t={mockT} />)
    fireEvent.click(screen.getByText("High Priority"))
    expect(screen.getAllByRole("button")).toHaveLength(5) // Fewer topics
  })

  it("displays AI Analysis with correct badge", () => {
    render(<KnowledgeBrain lang="en" t={mockT} />)
    fireEvent.click(screen.getByText("KYC"))
    expect(screen.getByText("AI Analysis")).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Topic Not Showing

1. Check `KNOWLEDGE_GRAPH_NODES` includes the topic
2. Verify topic ID matches filter criteria
3. Clear browser cache
4. Check console for errors

### Metrics Not Updating

1. Verify `lastUpdated` date format: `YYYY-MM-DD`
2. Check `updateCount` is a number
3. Check `importanceScore` is 1-10 range
4. Force component re-render

### Search Not Working

1. Check language setting matches `lang` prop
2. Verify search term exists in topic names/descriptions
3. Check for special characters in search
4. Test with simple queries first

## Support

For issues or questions:
1. Check component source code comments
2. Review data structure in `lib/insight/data.ts`
3. Test in isolation before integrating
4. Check browser console for errors
5. Verify all required props are passed
