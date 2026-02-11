# Security Implementation Guide

## Testing Security Features

### Run All Tests

```bash
cd oapp
bun hardhat test
```

### Run Specific Test Suites

```bash
# Original tests
bun hardhat test test/hardhat/Doba.test.ts

# Security features tests
bun hardhat test test/hardhat/Doba.security.test.ts

# Pending refunds tests
bun hardhat test test/hardhat/Doba.refunds.test.ts
```

### Run with Gas Reporting

```bash
REPORT_GAS=true bun hardhat test
```

### Run with Coverage

```bash
bun hardhat coverage
```

## Deployment Steps

### 1. Testnet Deployment (Recommended: Sepolia + Arbitrum Sepolia)

#### Setup Environment Variables

```bash
# Create .env file in oapp/ directory
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ARBITRUM_SEPOLIA_RPC_URL=https://arb-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
ARBISCAN_API_KEY=your_arbiscan_key
```

#### Deploy to Sepolia

```bash
bun hardhat run deploy/MyONFT721.ts --network sepolia
```

#### Deploy to Arbitrum Sepolia

```bash
bun hardhat run deploy/MyONFT721.ts --network arbitrum-sepolia
```

### 2. Verify Contracts

```bash
bun hardhat verify --network sepolia DEPLOYED_ADDRESS "Doba Music NFT" "DOBA" ENDPOINT_ADDRESS OWNER_ADDRESS ROYALTY_RECEIVER PRICE_FEED_ADDRESS
```

### 3. Post-Deployment Setup

#### Set Base URI (REQUIRED)

```javascript
const doba = await ethers.getContractAt('Doba', DEPLOYED_ADDRESS)
await doba.setBaseURI('https://api.dobamusic.com/metadata/')
```

#### Configure Cross-Chain Peers

```javascript
// On Sepolia contract
await dobaSepolcontract.setPeer(
    ARBITRUM_SEPOLIA_EID, // 40231
    ethers.utils.zeroPad(ARBITRUM_ADDRESS, 32)
)

// On Arbitrum Sepolia contract
await dobaArbitrum.setPeer(
    SEPOLIA_EID, // 40161
    ethers.utils.zeroPad(SEPOLIA_ADDRESS, 32)
)
```

#### Transfer Ownership to Multisig (RECOMMENDED)

```javascript
const MULTISIG_ADDRESS = "0x..." // Gnosis Safe address
await doba.transferOwnership(MULTISIG_ADDRESS)
```

## Mainnet Deployment Checklist

- [ ] **All tests passing** (run `npx hardhat test`)
- [ ] **Security audit completed** by professional firm
- [ ] **2+ weeks testnet testing** with no critical issues
- [ ] **Multisig wallet created** (Gnosis Safe recommended)
- [ ] **Price feed addresses confirmed**:
  - Ethereum Mainnet ETH/USD: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
  - Arbitrum ETH/USD: `0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612`
  - Optimism ETH/USD: `0x13e3Ee699D1909E989722E753853AE30b17e08c5`
- [ ] **LayerZero endpoints confirmed**:
  - Ethereum: `0x1a44076050125825900e736c501f859c50fE728c`
  - Arbitrum: `0x1a44076050125825900e736c501f859c50fE728c`
  - Optimism: `0x1a44076050125825900e736c501f859c50fE728c`
- [ ] **Base URI endpoint ready** and tested
- [ ] **Monitoring setup**:
  - Chainlink price feed alerts
  - LayerZero bridge transaction monitoring
  - Contract balance alerts
- [ ] **Emergency procedures documented**
- [ ] **Insurance/bug bounty considered**

## Mainnet Deployment Commands

```bash
# Deploy to Ethereum Mainnet
bun hardhat run deploy/MyONFT721.ts --network ethereum

# Deploy to Arbitrum
bun hardhat run deploy/MyONFT721.ts --network arbitrum

# Deploy to Optimism
bun hardhat run deploy/MyONFT721.ts --network optimism

# Verify all deployments
bun hardhat verify --network ethereum DEPLOYED_ADDRESS ...args
bun hardhat verify --network arbitrum DEPLOYED_ADDRESS ...args
bun hardhat verify --network optimism DEPLOYED_ADDRESS ...args
```

## Security Monitoring

### Set Up Alerts

#### 1. Chainlink Price Feed Monitoring

```javascript
// Check price feed health every 5 minutes
const checkPriceFeed = async () => {
  const roundData = await priceFeed.latestRoundData()
  const updatedAt = roundData.updatedAt
  const staleness = Date.now()/1000 - updatedAt
  
  if (staleness > 3600) {
    // Alert: Price feed stale!
    sendAlert('Price feed stale for ' + staleness + ' seconds')
  }
}
```

#### 2. Contract Balance Monitoring

```javascript
// Monitor unexpected balance changes
const monitorBalance = async () => {
  const balance = await ethers.provider.getBalance(DOBA_ADDRESS)
  const expectedMinimum = await calculateExpectedBalance()
  
  if (balance < expectedMinimum) {
    sendAlert('Contract balance lower than expected')
  }
}
```

#### 3. Pause Status Monitoring

```javascript
// Alert if contract is paused
const checkPaused = async () => {
  const isPaused = await doba.paused()
  
  if (isPaused) {
    sendAlert('Contract is PAUSED - investigate immediately')
  }
}
```

## Emergency Procedures

### If Price Feed Fails

```bash
# 1. Pause minting immediately
await doba.pause()

# 2. Deploy new price feed or find alternative
# 3. Update price feed
await doba.updatePriceFeed(NEW_PRICE_FEED_ADDRESS)

# 4. Verify new feed works
await doba.getMintPriceInETH()

# 5. Resume minting
await doba.unpause()
```

### If Security Issue Discovered

```bash
# 1. Pause immediately
await doba.pause()

# 2. Assess severity
# 3. Emergency withdraw if needed
await doba.emergencyWithdraw(SECURE_ADDRESS)

# 4. Communicate with users
# 5. Plan fix/migration
```

### If Cross-Chain Message Stuck

```bash
# Check LayerZero dashboard: https://layerzeroscan.com
# Contact LayerZero support if needed
# Document affected token IDs
```

## Gas Optimization Tips

### For Users

- Mint with exact payment (no overpayment = no refund needed)
- Batch operations when possible

### For Contract Owner

- Update price feed only when necessary
- Batch administrative operations
- Use multicall for cross-chain configurations

## Support Resources

- **LayerZero Docs**: <https://docs.layerzero.network/>
- **Chainlink Docs**: <https://docs.chain.link/>
- **OpenZeppelin**: <https://docs.openzeppelin.com/>
- **Hardhat**: <https://hardhat.org/>

## Next Steps After Deployment

1. **Week 1-2**: Monitor closely, test all functions
2. **Week 3-4**: Gather user feedback, monitor gas costs
3. **Month 2**: Review security, plan upgrades if needed
4. **Ongoing**: Regular security reviews, dependency updates

---

**IMPORTANT**: Never deploy to mainnet without professional security audit!
