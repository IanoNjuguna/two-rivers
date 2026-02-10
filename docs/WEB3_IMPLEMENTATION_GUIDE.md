# Web3 Music NFT Dashboard - Implementation Guide

## Project Overview

A collaborative Music NFT marketplace dashboard built with React, TypeScript, Tailwind CSS, and shadcn/ui for Base Sepolia (Chain ID: 84532).

**Smart Contract:** `0xa5EF5D72eA368E8c76E9bC96Bf97a77d66cD0f7b`

## Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Fonts:** Neue Machina (heading), IBM Plex Mono (monospace)
- **Web3:** Wagmi v2 (to be integrated), OnChainKit, viem
- **Icons:** Lucide React

## Design System

### Color Palette

```
Background: #0D0D12 (Midnight Blue)
Primary CTA: #FF1F8A (Cyber Pink)
Secondary: #B794F4 (Soft Lavender)
Border: rgba(255, 255, 255, 0.08)
Glass effect: rgba(255, 255, 255, 0.02) with backdrop blur
```

### Typography

- **Headings & UI:** Neue Machina (fallback: Space Mono)
  - Light: weight 300
  - Regular: weight 400
  - Bold: weight 900

- **Monospace (addresses, prices):** IBM Plex Mono
  - Regular: weight 400
  - Medium: weight 500
  - Semibold: weight 600

### Glass Morphism

Translucent cards with subtle blur and soft borders:
```css
.glass {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(255, 31, 138, 0.15);
}
```

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx              # Root layout with font setup
│   ├── page.tsx                # Main dashboard page
│   └── globals.css             # Global styles and design tokens
├── components/
│   ├── SongCard.tsx            # Individual song NFT card
│   ├── MarketplaceGrid.tsx     # Marketplace grid layout
│   ├── MyStudioGrid.tsx        # User's owned NFTs grid
│   ├── ConnectHeader.tsx       # Wallet connection UI
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── web3.ts                 # Web3 constants & utilities
│   └── utils.ts                # Tailwind utilities
├── public/
│   └── fonts/                  # Custom font files
└── styles/
    └── globals.css             # Tailwind directives
```

## Component Descriptions

### Dashboard Layout (page.tsx)

Main page component featuring:
- Fixed header with wallet connection
- Responsive sidebar navigation
- Tab system for Marketplace & My Studio views
- Mobile menu toggle

**Features:**
- Responsive design (mobile-first)
- Glassmorphic UI elements
- Two main tabs: Music Marketplace and My Studio
- Wallet connection state management

### SongCard Component

Individual song NFT card displayed in marketplace grid.

**Props:**
```typescript
{
  id: number
  title: string
  creator: string
  price: string              // ETH amount as string
  cover: string              // Hex color for gradient
  collaborators: number      // Count of collaborators
}
```

**Features:**
- Gradient cover art placeholder
- Collaborators badge
- Price in ETH with monospace font
- Mint button with cyber pink styling
- Hover glow effect

### MarketplaceGrid Component

Responsive grid displaying song cards.

**Features:**
- Responsive columns: 1 (mobile) → 2 (tablet) → 3 (desktop) → 4 (xl)
- Automatic song card mapping
- Empty state handling

### MyStudioGrid Component

Grid of user-owned NFTs with revenue tracking.

**Features:**
- Displays owned NFTs
- Total earnings per NFT
- "View Revenue" button per NFT
- Revenue modal showing:
  - Total earned
  - Pending earnings
  - Revenue distribution (pie chart)
  - "Claim Earnings" button

### ConnectHeader Component

Wallet connection UI in header.

**Features:**
- Connect button when disconnected
- Shows address, network badge when connected
- Copy address functionality
- Network indicator (Base Sepolia)

## Smart Contract Integration

### Contract Functions

```typescript
// Read song price (returns wei)
songPrices(uint256 id) → uint256

// Mint NFT
mint(uint256 id, uint256 amount) → void

// Claim earnings from payment splitter
release(address payee) → void
```

### Events to Monitor

```typescript
// Single creator song published
SongPublished(
  indexed uint256 id,
  indexed address creator,
  string metadataURI
)

// Collaborative song published
CollaborativeSongPublished(
  indexed uint256 id,
  indexed address creator,
  string metadataURI,
  address[] collaborators
)
```

## Setup Instructions

### 1. Font Setup

**Option A: Using Neue Machina (Preferred)**

1. Download Neue Machina font files from [Pangram Pangram](https://pangrampangram.com/)
2. Place in `public/fonts/`:
   - `NeueMachina-Light.otf` (weight 300)
   - `NeueMachina-Regular.otf` (weight 400)
   - `NeueMachina-Ultrabold.otf` (weight 900)

**Option B: Fallback (Automatic)**

If font files aren't available, the app automatically uses Space Mono as fallback.

### 2. Environment Variables

No environment variables required for initial setup. When integrating with Wagmi/OnChainKit:

```env
# .env.local
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

### 3. Web3 Integration (Future)

Install required Web3 packages:

```bash
npm install wagmi viem @onchainkit/react
```

Update components to use:
- `useContractRead` for `songPrices()`
- `useContractWrite` for `mint()`
- Event listeners for SongPublished events

## Styling Implementation

### Tailwind Classes Reference

```typescript
// Backgrounds
bg-midnight              // #0D0D12
bg-cyber-pink            // #FF1F8A
bg-lavender              // #B794F4

// Glass effects
glass                    // Base glass effect
glass-hover              // Glass with hover state

// Shadows
shadow-pink-glow         // Pink glow effect
shadow-card-glow         // Card hover glow

// Gradients
gradient-text            // Pink to lavender gradient text

// Responsive
sm:hidden, lg:block       // Responsive classes
md:grid-cols-2           // Responsive grid
```

### Custom Utilities

```css
.glass {
  @apply bg-white/[0.02] backdrop-blur-md border border-white/[0.08] rounded-xl;
}

.glass-hover {
  @apply glass transition-all duration-300 hover:bg-white/[0.05] 
         hover:border-white/[0.12] hover:shadow-card-glow;
}

.gradient-text {
  @apply bg-gradient-to-r from-cyber-pink to-lavender 
         bg-clip-text text-transparent;
}
```

## UX/Accessibility Features

- ✓ Keyboard navigation support
- ✓ ARIA labels on interactive elements
- ✓ High contrast text for readability
- ✓ Responsive design for all screen sizes
- ✓ Loading states with skeletons
- ✓ Error handling and user feedback
- ✓ Mobile menu toggle

## Performance Optimizations

- Uses `next/image` for optimized images
- Lazy loading of components
- CSS-in-JS minimization via Tailwind
- No unused component imports
- Client components split from server logic

## Testing & Validation

### Manual Tests

1. ✓ Dashboard loads with correct styling
2. ✓ Marketplace displays song cards
3. ✓ Studio tab shows owned NFTs (when connected)
4. ✓ Modal opens for revenue details
5. ✓ Mobile responsiveness works
6. ✓ Sidebar toggles on mobile
7. ✓ Wallet connect button appears/hides correctly

### Acceptance Criteria

- [ ] All colors match design spec (#0D0D12, #FF1F8A, #B794F4)
- [ ] Typography uses Neue Machina + IBM Plex Mono
- [ ] Glass effect cards appear on all sections
- [ ] Responsive grid works 1/2/3/4 columns
- [ ] Pink glow effect on hover
- [ ] Wallet connection UI works
- [ ] Tab switching functional
- [ ] Modal revenue display correct

## Future Web3 Integration Checklist

- [ ] Setup Wagmi provider with Base Sepolia RPC
- [ ] Implement `useContractRead` hook for `songPrices(id)`
- [ ] Implement `useContractWrite` hook for `mint(id, amount)`
- [ ] Add event listener for SongPublished/CollaborativeSongPublished
- [ ] Fetch and cache metadata from IPFS/HTTP URLs
- [ ] Implement Payment Splitter `release()` call
- [ ] Add transaction notifications with Sonner
- [ ] Handle wallet switching & chain validation
- [ ] Add error boundaries and fallbacks

## File Locations Summary

- **Main App:** `/app/page.tsx`
- **Fonts Config:** `/app/layout.tsx`
- **Design Tokens:** `/app/globals.css`, `/tailwind.config.ts`
- **Components:** `/components/*.tsx`
- **Web3 Config:** `/lib/web3.ts`
- **Font Files:** `/public/fonts/*.otf`

## Deployment Notes

- Deploy to Vercel for optimal Next.js performance
- Ensure `NEXT_PUBLIC_*` env vars are set in Vercel dashboard
- Base Sepolia RPC endpoints are public, no auth needed initially
- Consider using Alchemy or Infura RPC in production

---

**Last Updated:** February 7, 2026
**Version:** 1.0.0 - MVP with design system
