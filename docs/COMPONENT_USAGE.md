# Component Usage Guide

## Overview

This guide shows how to use and customize the dashboard components.

---

## 1. SongCard Component

### Purpose

Displays a single NFT song card with cover art, price, and mint button.

### Props

```typescript
interface SongCardProps {
  id: number                  // Unique song ID
  title: string              // Song title
  creator: string            // Creator address (formatted)
  price: string              // Price in ETH
  cover: string              // Hex color for gradient
  collaborators: number      // Number of collaborators
}
```

### Example Usage

```jsx
import SongCard from '@/components/SongCard'

<SongCard
  id={1}
  title="Neon Dreams"
  creator="0x1234...5678"
  price="0.5"
  cover="#FF1F8A"
  collaborators={2}
/>
```

### Features

- ✅ Gradient cover art placeholder
- ✅ Collaborators badge (if > 0)
- ✅ Price display in ETH
- ✅ Pink glow on hover
- ✅ Responsive sizing
- ✅ Mint button with hover state

### Styling

- Glass card effect with backdrop blur
- Cyber pink button
- Lavender collaborators badge
- Smooth transitions on hover

---

## 2. MarketplaceGrid Component

### Purpose

Displays a responsive grid of song cards.

### Props

```typescript
interface MarketplaceGridProps {
  songs: Song[]              // Array of songs
  isConnected: boolean       // Wallet connection state
}

interface Song {
  id: number
  title: string
  creator: string
  price: string
  cover: string
  collaborators: number
}
```

### Example Usage

```jsx
import MarketplaceGrid from '@/components/MarketplaceGrid'

const songs = [
  {
    id: 1,
    title: "Neon Dreams",
    creator: "0x1234...5678",
    price: "0.5",
    cover: "#FF1F8A",
    collaborators: 2,
  },
  // ... more songs
]

<MarketplaceGrid songs={songs} isConnected={true} />
```

### Features

- ✅ Responsive columns (1 → 2 → 3 → 4)
- ✅ Auto-generates SongCard for each song
- ✅ Empty state handling
- ✅ Gap spacing consistent
- ✅ Mobile-friendly

### Responsive Behavior

```
Mobile (< 640px):     1 column
Tablet (640-1024px):  2 columns
Desktop (1024-1280px): 3 columns
Wide (> 1280px):      4 columns
```

---

## 3. MyStudioGrid Component

### Purpose

Displays user's owned NFTs with revenue tracking and claim modal.

### Props

```typescript
interface MyStudioGridProps {
  nfts: NFT[]  // Array of owned NFTs
}

interface NFT {
  id: number
  title: string
  creator: string
  earnings: string         // Total earnings in ETH
  cover: string           // Hex color for gradient
}
```

### Example Usage

```jsx
import MyStudioGrid from '@/components/MyStudioGrid'

const myNFTs = [
  {
    id: 101,
    title: "My First Track",
    creator: "You",
    earnings: "2.5",
    cover: "#FF1F8A",
  },
]

<MyStudioGrid nfts={myNFTs} />
```

### Features

- ✅ Display owned NFTs in grid
- ✅ Show total earnings per NFT
- ✅ "View Revenue" button per card
- ✅ Revenue modal with breakdown
- ✅ Claim Earnings button
- ✅ Revenue distribution visualization

### Modal Content

The revenue modal shows:

```
┌─────────────────────────────────────┐
│ Song Title - Revenue Details        │
├─────────────────────────────────────┤
│                                     │
│  Total Earned    │ Pending          │
│  2.5 ETH         │ 0.2 ETH          │
│                                     │
│  Revenue Distribution               │
│  ├─ You: 60%                        │
│  └─ Collaborators: 40%              │
│                                     │
│  [Claim Earnings]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 4. ConnectHeader Component

### Purpose

Displays wallet connection UI in the header.

### Props

```typescript
interface ConnectHeaderProps {
  isConnected: boolean    // Connection state
  onConnect: () => void   // Connect callback
}
```

### Example Usage

```jsx
import ConnectHeader from '@/components/ConnectHeader'

const [isConnected, setIsConnected] = useState(false)

<ConnectHeader
  isConnected={isConnected}
  onConnect={() => setIsConnected(true)}
/>
```

### Features

- ✅ Connect Wallet button when disconnected
- ✅ Shows address when connected
- ✅ Copy address functionality
- ✅ Network badge (Arbitrum One, Base & Avalanche)
- ✅ Green status indicator
- ✅ Responsive text (hidden on mobile)

### Display States

**Disconnected:**

```
[🔗 Connect Wallet]
```

**Connected:**

```
🟢 0x1234...5678 [📋] | Arbitrum One, Base & Avalanche
```

---

## Dashboard Layout

### Structure

```jsx
<div className="min-h-screen bg-midnight">
  {/* Fixed Header */}
  <header className="fixed top-0 z-50">
    <Logo /> <ConnectHeader />
  </header>

  {/* Sidebar */}
  <aside className="fixed lg:static w-64">
    <Navigation />
  </aside>

  {/* Main Content */}
  <main className="flex-1">
    <Tabs>
      <TabContent value="marketplace">
        <MarketplaceGrid />
      </TabContent>
      <TabContent value="studio">
        <MyStudioGrid />
      </TabContent>
    </Tabs>
  </main>
</div>
```

### Layout Behavior

| Screen Size | Header | Sidebar | Main |
|------------|--------|---------|------|
| Mobile | Full | Hamburger | Full |
| Tablet | Full | Side | Main |
| Desktop | Full | Side | Main |

---

## Styling Reference

### Glass Cards

```jsx
// Base glass effect
<div className="glass p-4 rounded-xl">
  Content
</div>

// With hover state
<div className="glass-hover">
  Hover me!
</div>
```

### Buttons

```jsx
// Primary (Mint, Connect)
<button className="bg-cyber-pink hover:bg-cyber-pink/90">
  Mint
</button>

// Secondary (Outline)
<button className="border border-white/[0.12] hover:bg-white/[0.05]">
  View Revenue
</button>
```

### Text Colors

```jsx
// Primary text
<p className="text-white">Main content</p>

// Secondary text
<p className="text-white/60">Muted text</p>

// Price/Address
<p className="text-cyber-pink font-mono">0.5 ETH</p>

// Labels
<p className="text-lavender text-sm">Collaborators</p>
```

### Responsive Grid

```jsx
// Responsive columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Items automatically adjust */}
</div>
```

---

## Common Patterns

### Loading State

```jsx
<div className="glass p-12 text-center">
  <Spinner />
  <p className="text-white/60">Loading...</p>
</div>
```

### Empty State

```jsx
<div className="glass p-12 text-center rounded-xl">
  <Music className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
  <h3 className="text-xl font-semibold">No NFTs</h3>
  <p className="text-white/60">Create one to get started</p>
</div>
```

### Modal

```jsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="bg-midnight border border-white/[0.08]">
    <DialogHeader>
      <DialogTitle className="text-white">Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

## Integration Examples

### Adding More Songs

```jsx
// In app/page.tsx
const mockSongs = [
  {
    id: 1,
    title: "Neon Dreams",
    creator: "0x1234...5678",
    price: "0.5",
    cover: "#FF1F8A",
    collaborators: 2,
  },
  {
    id: 2,
    title: "Cyber Pulse",
    creator: "0x2345...6789",
    price: "0.75",
    cover: "#B794F4",
    collaborators: 1,
  },
  // Add more here
]
```

### Changing Colors

```jsx
// In tailwind.config.ts
colors: {
  midnight: '#0D0D12',          // Background
  'cyber-pink': '#FF1F8A',      // Primary
  lavender: '#B794F4',          // Secondary
}
```

### Custom Variants

```jsx
// In tailwind.config.ts or globals.css
.gradient-card {
  @apply glass p-6 bg-gradient-to-r 
         from-cyber-pink/10 to-lavender/10;
}
```

---

## Accessibility

All components include:

- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ High contrast (7:1+ ratio)
- ✅ Focus indicators
- ✅ Semantic HTML

### Example

```jsx
<button
  aria-label="Mint this NFT"
  onClick={handleMint}
  className="focus:ring-2 ring-cyber-pink"
>
  Mint
</button>
```

---

## Performance Tips

- ✅ Use React.memo for card components
- ✅ Lazy load images with next/image
- ✅ Virtualize long lists with react-window
- ✅ Use SWR for data fetching
- ✅ Code split with dynamic imports

---

## Component Tree

```
Dashboard (page.tsx)
├── Header
│   ├── Logo
│   └── ConnectHeader
├── Sidebar
│   └── NavItems
└── Main Content
    └── Tabs
        ├── MarketplaceTab
        │   └── MarketplaceGrid
        │       └── SongCard (x many)
        └── StudioTab
            └── MyStudioGrid
                └── StudioNFTCard (x many)
                    └── RevenueModal (dialog)
```

---

## Testing Components

```jsx
// Example test
import { render, screen } from '@testing-library/react'
import SongCard from '@/components/SongCard'

test('renders song card', () => {
  render(
    <SongCard
      id={1}
      title="Test Song"
      creator="0x123...456"
      price="0.5"
      cover="#FF1F8A"
      collaborators={1}
    />
  )
  
  expect(screen.getByText('Test Song')).toBeInTheDocument()
  expect(screen.getByText('0.5 ETH')).toBeInTheDocument()
})
```

---

## Quick Reference Table

| Component | Props | Displays | Returns |
|-----------|-------|----------|---------|
| SongCard | Song data | Single NFT card | Nothing |
| MarketplaceGrid | Songs[], connected flag | Grid of cards | Nothing |
| MyStudioGrid | NFTs[] | User's NFT grid + modal | Selected NFT state |
| ConnectHeader | isConnected, onConnect | Wallet UI | None (controlled) |

---

For more details, see:

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Colors & styling
- [WEB3_IMPLEMENTATION_GUIDE.md](./WEB3_IMPLEMENTATION_GUIDE.md) - Web3 integration
- Component source files in `/components/`
