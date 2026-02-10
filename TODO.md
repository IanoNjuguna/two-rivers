# doba Development TODO

## Pre-Smart Contract Integration Checklist

### 1. Complete Core UI Flows

  - [ ] Artist upload flow
  - [ ] Form for music details (title, artist, description, genre)
  - [ ] File upload interface (audio + artwork)
  - [ ] Price setting UI
  - [ ] Collaborator management (add wallet addresses, set split percentages)
- [ ] Marketplace refinements
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

### 2. Wallet Integration
- [ ] Choose wallet library: **RainbowKit** (recommended) or ConnectKit or wagmi
- [ ] Install dependencies
  ```bash
  bun add @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query
  ```
- [ ] Setup wallet providers
  - [ ] MetaMask support
  - [ ] Coinbase Wallet support
  - [ ] WalletConnect support
- [ ] Handle wallet states
  - [ ] Connecting state
  - [ ] Connected state (show address, balance)
  - [ ] Wrong network state
  - [ ] Disconnected state
- [ ] Network switching UI
  - [ ] Support for multiple chains (omnichain)
  - [ ] Auto-prompt to switch networks
  - [ ] Display current network

### 3. Backend/Data Infrastructure
- [ ] Choose database solution (PostgreSQL, MongoDB, Supabase, etc.)
- [ ] Database schema design
  - [ ] **Users table**
    - wallet_address (primary key)
    - username
    - bio
    - avatar_url
    - created_at
  - [ ] **Music table**
    - id (primary key)
    - title
    - artist_name
    - description
    - genre
    - audio_file_url (IPFS)
    - artwork_url (IPFS)
    - metadata_uri (IPFS)
    - price
    - creator_wallet_address
    - contract_address
    - token_id
    - created_at
  - [ ] **Collaborators table**
    - id (primary key)
    - music_id (foreign key)
    - wallet_address
    - split_percentage
  - [ ] **Transactions table**
    - id (primary key)
    - music_id (foreign key)
    - from_address
    - to_address
    - transaction_hash
    - block_number
    - price
    - transaction_type (mint, sale, transfer)
    - timestamp
  - [ ] **NFT_Ownership table**
    - token_id (primary key)
    - contract_address
    - owner_wallet_address
    - music_id (foreign key)
    - updated_at
- [ ] File storage solution
  - [ ] Choose IPFS provider (Pinata, NFT.Storage, or self-hosted)
  - [ ] Setup API keys
  - [ ] Implement upload functions
  - [ ] Audio file upload (WAV/FLAC)
  - [ ] Artwork upload (PNG/JPG)
  - [ ] Metadata JSON upload (ERC-721 standard)
- [ ] API routes
  - [ ] POST /api/upload (files to IPFS)
  - [ ] POST /api/music (create music record)
  - [ ] GET /api/music (list all music)
  - [ ] GET /api/music/:id (single music details)
  - [ ] GET /api/user/:address (user profile)
  - [ ] POST /api/user (update profile)
  - [ ] GET /api/user/:address/owned (owned NFTs)
  - [ ] GET /api/user/:address/created (created NFTs)
  - [ ] GET /api/transactions/:address (transaction history)

### 4. Smart Contract Requirements
- [ ] Define contract specifications
  - [ ] **Music NFT minting**
    - Mint with metadata URI
    - Support for multiple editions (1 of 1 or limited editions)
  - [ ] **Collaborative revenue splits**
    - Multiple payees per NFT
    - Percentage-based splits
    - Automatic distribution on sale
  - [ ] **Royalty enforcement**
    - 10-15% on secondary sales
    - EIP-2981 compliance
  - [ ] **Platform fee collection**
    - 7% on primary sales
    - 1% on secondary sales
    - Withdrawable by platform owner
  - [ ] **Omnichain functionality**
    - LayerZero integration (research required)
    - Or deploy same contract to multiple chains
  - [ ] **Price setting**
    - Artists can set/update NFT price
    - Fixed price sales
    - (Optional) Auction mechanism
  - [ ] **Transfer/sale mechanics**
    - Safe transfer with payment
    - Ownership updates
    - Event emissions for indexing
- [ ] Choose contract framework
  - [ ] OpenZeppelin contracts (recommended for security)
  - [ ] Foundry or Hardhat for development
- [ ] Write contract tests
  - [ ] Minting tests
  - [ ] Payment distribution tests
  - [ ] Royalty tests
  - [ ] Access control tests

### 5. Testing Environment Setup
- [ ] Setup testnet accounts
  - [ ] Get test wallets
  - [ ] Get testnet ETH from faucets
- [ ] Deploy to testnets
  - [ ] Base Sepolia (recommended for Base ecosystem)
  - [ ] Sepolia (Ethereum testnet)
  - [ ] Arbitrum Sepolia
  - [ ] (Optional) Other L2 testnets
- [ ] Test full user flows
  - [ ] Wallet connection
  - [ ] Music upload and minting
  - [ ] NFT purchase
  - [ ] Secondary sale with royalties
  - [ ] Collaborative minting with splits
- [ ] Create mock data
  - [ ] Test users
  - [ ] Test music uploads
  - [ ] Test transactions

### 6. User Experience Enhancements
- [ ] Gas estimation
  - [ ] Show estimated gas before transactions
  - [ ] Display in USD equivalent
- [ ] Transaction loading states
  - [ ] Pending state (show spinner)
  - [ ] Confirmed state (show success)
  - [ ] Failed state (show error)
- [ ] Error handling
  - [ ] Insufficient funds error
  - [ ] User rejected transaction
  - [ ] Network congestion
  - [ ] Smart contract errors (custom messages)
- [ ] Success confirmations
  - [ ] Success modals/toasts
  - [ ] Block explorer links
  - [ ] Share functionality
- [ ] Optimistic UI updates
  - [ ] Show changes immediately
  - [ ] Revert on failure
  - [ ] Sync with blockchain state

### 7. Security & Best Practices
- [ ] Security measures
  - [ ] Never store private keys
  - [ ] Input validation (file types, sizes, pricing)
  - [ ] Rate limiting for uploads
  - [ ] XSS protection
  - [ ] CSRF protection
- [ ] File validation
  - [ ] Audio file type check (WAV, FLAC, MP3)
  - [ ] File size limits (e.g., 100MB max)
  - [ ] Artwork validation (PNG, JPG, max 10MB)
- [ ] DMCA takedown system
  - [ ] DMCA form page
  - [ ] Email notification to iano@doba.world
  - [ ] Admin dashboard for takedown requests
- [ ] Smart contract security
  - [ ] Use OpenZeppelin audited contracts
  - [ ] Reentrancy guards
  - [ ] Access control
  - [ ] (Before mainnet) Get professional audit

### 8. Legal/Compliance
- [ ] Finalize Terms of Service
  - [ ] Copyright policy (honor system for MVP)
  - [ ] DMCA process
  - [ ] Liability disclaimers
- [ ] Copyright verification strategy
  - [ ] MVP: Honor system with DMCA takedowns
  - [ ] Future: Content ID-like system
- [ ] DMCA agent registration
  - [ ] Register with US Copyright Office
  - [ ] Designate iano@doba.world as contact
- [ ] Privacy policy compliance
  - [ ] Data collection disclosure
  - [ ] Wallet address privacy notice
  - [ ] Cookie policy
- [ ] (Future) Consult legal counsel for crypto regulations

### 9. Performance Optimization
- [ ] Frontend optimization
  - [ ] Lazy loading for marketplace grids
  - [ ] Next.js Image component for all images
  - [ ] Code splitting
  - [ ] Bundle size optimization
- [ ] Audio streaming
  - [ ] Progressive loading
  - [ ] Buffering optimization
  - [ ] Audio CDN (CloudFlare, etc.)
- [ ] Database optimization
  - [ ] Indexes on frequently queried fields
  - [ ] Query optimization
  - [ ] Caching strategy (Redis)
- [ ] IPFS optimization
  - [ ] Pin important content
  - [ ] Use IPFS gateway with CDN
  - [ ] Backup to centralized storage

### 10. Development Roadmap (Recommended Order)

#### Phase 1: Foundation (Week 1-2)
- [x] Footer pages (DONE)
- [ ] Wallet connection (RainbowKit + wagmi)
- [ ] Basic database setup
- [ ] IPFS file upload setup

#### Phase 2: Core Features (Week 3-4)
- [ ] Artist upload flow (UI only, no contract)
- [ ] Marketplace refinements (filtering, search, pagination)
- [ ] User profile pages
- [ ] File upload to IPFS integration

#### Phase 3: Smart Contract (Week 5-6)
- [ ] Write smart contract
- [ ] Write comprehensive tests
- [ ] Deploy to testnet
- [ ] Connect upload flow to contract

#### Phase 4: Integration & Testing (Week 7-8)
- [ ] Full integration testing on testnet
- [ ] Bug fixes and refinements
- [ ] UX improvements
- [ ] Performance optimization

#### Phase 5: Launch Prep (Week 9-10)
- [ ] Security review
- [ ] Final legal review
- [ ] Mainnet deployment
- [ ] Launch!

## Immediate Next Steps (Start Here)
1. [ ] **Set up wallet integration** (RainbowKit + wagmi)
2. [ ] **Build artist upload form** (without blockchain, just UI/UX)
3. [ ] **Set up IPFS** (Pinata account, upload functions)
4. [ ] **Database schema** (choose DB, create tables)
5. [ ] **Define smart contract specs** (write detailed requirements document)

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
- **Wallet**: https://www.rainbowkit.com/
- **IPFS**: https://www.pinata.cloud/
- **Smart Contracts**: https://docs.openzeppelin.com/contracts/
- **LayerZero** (omnichain): https://layerzero.network/
- **EIP-2981** (royalties): https://eips.ethereum.org/EIPS/eip-2981
