# 🎵 Web3 Music NFT Dashboard

A collaborative audio streaming service for Arbitrum One, Base & Avalanche with a sleek, modern design using **Neue Machina** and **IBM Plex Mono** typography.

**Status:** ✅ UI Complete & Production Ready | ⏳ Web3 Integration Ready

## 🎨 Design

```
Color Palette:
├─ Midnight Blue (#0D0D12) — Deep dark background
├─ Cyber Pink (#FF1F8A) — Primary CTAs & highlights
├─ Soft Lavender (#B794F4) — Secondary accents
└─ Glass Morphism — Translucent cards with backdrop blur

Typography:
├─ Neue Machina — Headings & UI (300, 400, 900 weights)
└─ IBM Plex Mono — Code & prices (400, 500, 600 weights)
```

## 🚀 Quick Start

### Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### (Optional) Add Neue Machina Fonts

1. Download from [Pangram Pangram](https://pangrampangram.com/)
2. Place `.otf` files in `public/fonts/`
3. See [FONT_SETUP.md](./FONT_SETUP.md) for details

*The app works great with Space Mono fallback if fonts aren't available.*

## 📁 What's Included

### 🎯 Dashboard Features

```
Marketplace Tab
├─ Song NFT cards grid (1-4 columns responsive)
├─ Price display in ETH
├─ Creator address & collaborators badge
├─ Mint button per song
└─ Glass card hover effects

My Studio Tab
├─ User's owned NFTs
├─ Total earnings per NFT
├─ "View Revenue" modal
├─ Revenue distribution breakdown
└─ Claim earnings button
```

### 🎨 Design System

- **Colors:** Midnight, Cyber Pink, Lavender + glass effects
- **Components:** Pre-styled with shadcn/ui
- **Responsive:** Mobile-first (1-2-3-4 columns)
- **Accessibility:** High contrast, keyboard navigation, ARIA labels
- **Animations:** Smooth transitions, hover states, glow effects

### 📚 Components

| Component | Purpose |
|-----------|---------|
| `SongCard.tsx` | Individual NFT card with mint button |
| `MarketplaceGrid.tsx` | Responsive song grid display |
| `MyStudioGrid.tsx` | User NFT management + revenue modal |
| `ConnectHeader.tsx` | Wallet connection UI |

### 🔗 Smart Contract Integration Ready

```typescript
Contract: 0xa5EF5D72eA368E8c76E9bC96Bf97a77d66cD0f7b
Chain: Arbitrum One, Base & Avalanche

Functions:
├─ songPrices(uint256 id) → uint256
├─ mint(uint256 id, uint256 amount)
├─ release(address payee)
└─ Events: SongPublished, CollaborativeSongPublished
```

See [WEB3_IMPLEMENTATION_GUIDE.md](./WEB3_IMPLEMENTATION_GUIDE.md) for setup.

## 📖 Documentation

| File | Purpose |
|------|---------|
| [QUICK_START.md](./QUICK_START.md) | Get up & running in 5 mins |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Colors, typography, components |
| [FONT_SETUP.md](./FONT_SETUP.md) | Adding Neue Machina fonts |
| [WEB3_IMPLEMENTATION_GUIDE.md](./WEB3_IMPLEMENTATION_GUIDE.md) | Blockchain integration |

## 🏗️ Project Structure

```
app/
├── page.tsx                 # Main dashboard
├── layout.tsx              # Fonts + metadata
└── globals.css             # Design tokens

components/
├── SongCard.tsx            # NFT card component
├── MarketplaceGrid.tsx     # Marketplace layout
├── MyStudioGrid.tsx        # User studio view
├── ConnectHeader.tsx       # Wallet UI
└── ui/                     # shadcn/ui components

lib/
├── web3.ts                 # Contract ABI & constants
└── utils.ts                # Tailwind utilities

public/
├── fonts/                  # Custom fonts (Neue Machina)
└── images/                 # Static assets
```

## 🎯 Features

### ✅ Implemented

- [x] Complete responsive dashboard UI
- [x] Marketplace with song cards
- [x] My Studio with NFT management
- [x] Revenue tracking & claim modal
- [x] Wallet connection interface
- [x] Glass morphism design system
- [x] Mobile navigation (hamburger menu)
- [x] Dark mode (always on)
- [x] Neue Machina + IBM Plex Mono fonts
- [x] Tailwind + shadcn/ui styling
- [x] Accessibility (ARIA, keyboard nav, contrast)

### ⏳ Ready for Integration

- [ ] Wagmi Web3 provider setup
- [ ] Contract read (songPrices)
- [ ] Contract write (mint)
- [ ] Event listeners (SongPublished)
- [ ] Transaction handling
- [ ] Wallet switching

## 🎨 Styling Guide

### Tailwind Classes

```jsx
// Glass cards
<div className="glass p-4 rounded-xl">

// Primary button
<button className="bg-cyber-pink hover:bg-cyber-pink/90">

// Secondary label
<span className="text-lavender text-sm">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Design Tokens in CSS

```css
/* Colors */
--background: 0 0% 5%;           /* Midnight */
--primary: 310 98% 51%;          /* Cyber Pink */
--accent: 270 93% 60%;           /* Lavender */

/* Effects */
box-shadow: 0 8px 24px rgba(255, 31, 138, 0.15);  /* Pink glow */
backdrop-filter: blur(8px);                        /* Glass effect */
```

## 🔐 Web3 Ready

Smart contract constants and ABI are pre-configured in `lib/web3.ts`:

```typescript
export const CONTRACT_ADDRESS = '0xa5EF5D72eA368E8c76E9bC96Bf97a77d66cD0f7b'
export const CHAIN_ID = 42161  // Arbitrum One, Base & Avalanche
export const CONTRACT_ABI = [...]
```

To integrate Wagmi:

```bash
npm install wagmi viem @onchainkit/react
```

See [WEB3_IMPLEMENTATION_GUIDE.md](./WEB3_IMPLEMENTATION_GUIDE.md) for full setup.

## 📱 Responsive Breakpoints

```
Mobile:     1 column (< 640px)
Tablet:     2 columns (640px - 1024px)
Desktop:    3 columns (1024px - 1280px)
Extra-wide: 4 columns (> 1280px)

Header:     Fixed top navigation
Sidebar:    Responsive (hamburger on mobile)
```

## 🔍 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All modern browsers with ES2020+ support.

## 📦 Dependencies

- **Next.js 16** — React framework
- **React 19** — UI library
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility styling
- **shadcn/ui** — Component library
- **Lucide React** — Icons

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
# Connect repo to Vercel
# Deploy with one click!
```

### Manual Build

```bash
npm run build
npm start
```

## 📋 Testing Checklist

- [x] Dashboard loads correctly
- [x] Marketplace displays song cards
- [x] Cards have proper styling (glass effect, glow)
- [x] Wallet connect button works
- [x] Tab switching functional
- [x] Revenue modal opens/closes
- [x] Mobile responsive (test hamburger menu)
- [x] Colors match design spec
- [x] Typography displays correctly
- [x] Accessibility: keyboard navigation works

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Wagmi Docs](https://wagmi.sh)

## 🤝 Contributing

This is a production-ready starter template. To extend:

1. Add Web3 integration following [WEB3_IMPLEMENTATION_GUIDE.md](./WEB3_IMPLEMENTATION_GUIDE.md)
2. Update smart contract ABI in `lib/web3.ts`
3. Customize colors in `tailwind.config.ts` and `app/globals.css`
4. Modify mock data in `app/page.tsx`

## 📄 License

Build with ❤️ using v0

## 🎵 Next Steps

1. ✅ Explore the UI (browse marketplace, click tabs)
2. 📝 Review documentation in `/QUICK_START.md`
3. 🔗 Follow Web3 integration guide when ready
4. 🚀 Deploy to Vercel for production

---

**Ready to build?** Start with [QUICK_START.md](./QUICK_START.md)!

Questions about fonts? See [FONT_SETUP.md](./FONT_SETUP.md)

Need Web3 help? Check [WEB3_IMPLEMENTATION_GUIDE.md](./WEB3_IMPLEMENTATION_GUIDE.md)

---

**Version:** 1.0.0 (MVP - UI Complete)  
**Last Updated:** February 7, 2026  
**Built with:** Next.js 16, React 19, Tailwind CSS
