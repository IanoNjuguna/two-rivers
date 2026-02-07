# Quick Start Guide

## 🚀 Getting Started with the Web3 Music NFT Dashboard

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- (Optional) Neue Machina fonts for optimal branding

### Installation

1. **Clone/Download the Project**
   ```bash
   cd /vercel/share/v0-project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **(Optional) Add Neue Machina Fonts**
   - See [FONT_SETUP.md](./FONT_SETUP.md) for detailed instructions
   - Fonts go in `public/fonts/` directory
   - App works without them (uses Space Mono fallback)

### Running Locally

```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` to see your dashboard!

### What You Get

✅ **Complete Dashboard UI**
- Marketplace with song cards
- My Studio for owned NFTs
- Wallet connection interface
- Revenue tracking modal

✅ **Design System**
- Midnight blue dark theme (#0D0D12)
- Cyber pink accents (#FF1F8A)
- Soft lavender highlights (#B794F4)
- Glass morphism effects on all cards

✅ **Responsive Design**
- Mobile-first approach
- Adapts from 1 column (mobile) to 4 columns (desktop)
- Hamburger menu on mobile
- Touch-friendly interactions

✅ **Modern Typography**
- Neue Machina for headings (or Space Mono fallback)
- IBM Plex Mono for code/addresses
- Perfect for Web3 aesthetic

### Project Structure

```
components/
├── SongCard.tsx           # Individual NFT card
├── MarketplaceGrid.tsx    # Marketplace display
├── MyStudioGrid.tsx       # User NFTs grid
└── ConnectHeader.tsx      # Wallet UI

app/
├── page.tsx               # Main dashboard
├── layout.tsx             # Font configuration
└── globals.css            # Design tokens

lib/
├── web3.ts                # Contract constants
└── utils.ts               # Tailwind utilities

public/
└── fonts/                 # Custom font files
```

### Key Features to Explore

1. **Marketplace Tab**
   - Displays mock song cards
   - Shows price, creator, collaborators
   - Mint button on each card

2. **My Studio Tab**
   - Shows owned NFTs (when wallet connected)
   - Total earnings display
   - "View Revenue" modal with breakdown

3. **Wallet Connection**
   - Connect button in header (top right)
   - Mock connection for testing
   - Shows network badge

4. **Responsive Navigation**
   - Sidebar on desktop
   - Hamburger menu on mobile
   - Smooth transitions

### Styling System

All styling uses **Tailwind CSS** + **shadcn/ui** components:

```jsx
// Glass card example
<div className="glass p-4 rounded-xl">
  Content
</div>

// Pink button
<button className="bg-cyber-pink hover:bg-cyber-pink/90">
  Mint
</button>

// Secondary label
<span className="text-lavender text-sm">
  Collaborators
</span>
```

### Color Reference

- `bg-midnight` → #0D0D12 (background)
- `bg-cyber-pink` → #FF1F8A (primary button)
- `text-lavender` → #B794F4 (secondary)
- `.glass` → Glass morphism effect

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete reference.

### Web3 Integration (Next Steps)

Ready to connect to the blockchain? See [WEB3_IMPLEMENTATION_GUIDE.md](./WEB3_IMPLEMENTATION_GUIDE.md)

Installation:
```bash
npm install wagmi viem @onchainkit/react
```

### Customization

**Change Colors:**
Edit `app/globals.css` and `tailwind.config.ts`

**Modify Fonts:**
Update `app/layout.tsx` and add fonts to `public/fonts/`

**Update Contract:**
Edit `lib/web3.ts` with your contract address and ABI

**Add More Songs:**
Modify mock data in `app/page.tsx`

### Building for Production

```bash
npm run build
npm start
```

Or deploy directly to Vercel:
1. Push to GitHub
2. Connect repo to Vercel
3. Deploy with one click!

### Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**Tailwind styles not applying?**
- Restart dev server
- Check globals.css is imported in layout.tsx
- Verify tailwind.config.ts content paths

**Fonts not loading?**
- See [FONT_SETUP.md](./FONT_SETUP.md)
- Check browser console for errors
- Fonts will fallback gracefully

**Components missing?**
- shadcn/ui components are pre-installed
- Check `components/ui/` directory
- Run `npx shadcn-ui@latest add [component-name]` if needed

### Documentation

- **Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Web3 Guide:** [WEB3_IMPLEMENTATION_GUIDE.md](./WEB3_IMPLEMENTATION_GUIDE.md)
- **Font Setup:** [FONT_SETUP.md](./FONT_SETUP.md)

### Live Preview

The app is ready to preview! Key interactive elements:

- ✅ Click "Connect Wallet" button
- ✅ Browse song cards in marketplace
- ✅ Switch tabs (Marketplace ↔ My Studio)
- ✅ Click "View Revenue" on NFT cards
- ✅ Toggle sidebar on mobile

### Support

- Check documentation files first
- Review component code for implementation details
- See `WEB3_IMPLEMENTATION_GUIDE.md` for blockchain setup

### Next Milestones

1. ✅ Design system & UI complete
2. ⏳ Add Wagmi Web3 integration
3. ⏳ Connect to smart contract
4. ⏳ Add real song metadata from IPFS
5. ⏳ Implement transaction flows

---

**Happy building!** 🎵🚀

The dashboard is production-ready for the UI. Ready to add blockchain connectivity when needed.
