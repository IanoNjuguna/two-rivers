# doba Development TODO

## Pre-Smart Contract Integration Checklist

### 1. Complete Core UI Flows

- [ ] Artist upload flow
- [ ] Form for music details (title, artist, description, genre)
- [ ] File upload interface (audio + artwork)
- [ ] Price setting UI
- [ ] Collaborator management (add wallet addresses, set split percentages)
- [ ] **Marketplace refinements**
  - [ ] Advanced filtering (genre, price range, artist)
  - [ ] Search functionality
  - [ ] Pagination for large datasets
- [ ] Individual song/album detail pages
  - [ ] Full metadata display
  - [ ] Purchase interface
  - [ ] Ownership transfer UI
- [ ] User profile pages
  - [ ] Owned music collection view
  - [ ] Uploaded music (for artists)
  - [ ] Profile editing (username, bio, avatar)
- [ ] Transaction history/earnings dashboard
  - [ ] Artist earnings view
  - [ ] Transaction list with block explorer links
  - [ ] Revenue split breakdown for collaborations
- [x] **Internationalization (i18n)**
  - [x] Setup `next-intl`
  - [x] Create language dictionary files (en, fr, es, etc.)
  - [x] Add Language Switcher

### 2. Wallet Integration

- [x] Choose wallet library: **Alchemy Account Kit** (Implemented)
- [x] Install dependencies (`@account-kit/react`, `@account-kit/infra`, `viem`)
- [x] Setup wallet providers (AlchemyAccountProvider)
- [x] Handle wallet states
  - [x] Connecting state
  - [x] Connected state (show address)
  - [x] Disconnected state
- [x] Network switching UI
  - [x] Configured for **Arbitrum Sepolia**

### 3. Backend/Data Infrastructure

- [x] Choose database solution: **SQLite** (via `bun:sqlite`)
- [x] Database schema design
  - [x] **Tracks table** (Basic implementation in `api/src/database.ts`)
  - [ ] Users table
  - [ ] Collaborators table
  - [ ] Transactions table
  - [ ] NFT_Ownership table
- [ ] File storage solution
  - [ ] Choose IPFS provider (Pinata, NFT.Storage, or self-hosted)
  - [ ] Setup API keys
  - [ ] Implement upload functions
  - [ ] Audio file upload (WAV/FLAC)
  - [ ] Artwork upload (PNG/JPG)
  - [ ] Metadata JSON upload (ERC-721 standard)
- [x] API routes (Basic Hono Setup)
  - [ ] POST /api/upload (files to IPFS)
  - [ ] POST /api/music (create music record)
  - [x] GET /tracks (list all music)
  - [x] GET /metadata/:tokenId (single music details)
  - [x] POST /admin/tracks (add track)
  - [ ] GET /api/user/:address (user profile)

### 4. Smart Contract Requirements

- [x] Define contract specifications
  - [x] **Music NFT minting**
  - [x] **Collaborative revenue splits**
  - [x] **Royalty enforcement**
  - [x] **Platform fee collection**
  - [ ] **Omnichain functionality** (LayerZero logic planned/in-progress)
- [x] Choose contract framework
  - [x] OpenZeppelin contracts
  - [x] Foundry/Hardhat
- [x] Write contract tests
- [x] **Deploy to testnets**
  - [x] **Arbitrum Sepolia** (Contract Address: `0xa5EF5D72eA368E8c76E9bC96Bf97a77d66cD0f7b`)

### 5. Testing Environment Setup

- [x] Setup testnet accounts
- [x] Deploy to testnets
- [ ] Test full user flows
  - [x] Wallet connection
  - [ ] Music upload and minting
  - [ ] NFT purchase

### 6. User Experience Enhancements

- [ ] Gas estimation
- [ ] Transaction loading states
- [ ] Error handling
- [ ] Success confirmations
- [ ] Optimistic UI updates

### 7. Security & Best Practices

- [ ] Security measures
- [ ] File validation
- [ ] DMCA takedown system
- [ ] Smart contract security

### 8. Legal/Compliance

- [ ] Finalize Terms of Service
- [ ] Copyright verification strategy
- [ ] DMCA agent registration
- [ ] Privacy policy compliance

### 9. Performance Optimization

- [ ] Frontend optimization
- [ ] Audio streaming
- [ ] Database optimization
- [ ] IPFS optimization

### 10. Development Roadmap (Recommended Order)

#### Phase 1: Foundation (Week 1-2)

- [x] Footer pages (DONE)
- [x] Wallet connection (Alchemy Account Kit)
- [x] Basic database setup (SQLite + Hono)
- [x] Internationalization (next-intl)
- [ ] IPFS file upload setup

#### Phase 2: Core Features (Week 3-4)

- [ ] Artist upload flow (UI only, no contract)
- [ ] Marketplace refinements (filtering, search, pagination)
- [ ] User profile pages
- [ ] File upload to IPFS integration

#### Phase 3: Smart Contract (Week 5-6)

- [x] Write smart contract (Doba.sol)
- [x] Deploy to testnet (Arbitrum Sepolia)
- [ ] Connect upload flow to contract

#### Phase 4: Integration & Testing (Week 7-8)

- [ ] Full integration testing on testnet
- [ ] Bug fixes and refinements

#### Phase 5: Launch Prep (Week 9-10)

- [ ] Security review
- [ ] Mainnet deployment

## Immediate Next Steps (Start Here)

1. [ ] **Build artist upload form** (UI implementation in `app/publish` or similar)
2. [ ] **Set up IPFS** (Pinata integration for file storage)
3. [ ] **Expand Database Schema** (Add Users, Collaborators tables)
4. [ ] **Connect UI to Smart Contract** (Minting flow)
5. [ ] **Implement Marketplace Grid** (Fetch from API/Contract)

---

## Notes

- Using **Bun** as package manager (enforced via .bunfig.toml)
- Next.js 16.1.6 with React 19
- Target: Web2 users (normie-friendly language required)
- Revenue: 7% primary, 1% secondary, artist keeps 93% primary + 10-15% secondary
- Omnichain NFTs (multi-network support)
- Free streaming, pay to own and download
- Honor system for copyright (MVP), DMCA for takedowns

## Resources

- **Wallet**: <https://www.rainbowkit.com/>
- **IPFS**: <https://www.pinata.cloud/>
- **Smart Contracts**: <https://docs.openzeppelin.com/contracts/>
- **LayerZero** (omnichain): <https://layerzero.network/>
- **EIP-2981** (royalties): <https://eips.ethereum.org/EIPS/eip-2981>
