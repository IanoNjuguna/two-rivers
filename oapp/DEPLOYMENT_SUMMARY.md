# Doba NFT Deployment Summary

**Date**: February 11, 2026  
**Networks**: Base Sepolia ↔ Arbitrum Sepolia  
**Status**: ✅ DEPLOYED & CONFIGURED

---

## 📍 Deployed Contracts

### Base Sepolia

- **Contract Address**: `0x410dd768fD79530859e3100586b7d6218CcF0519`
- **Chain ID**: 84532
- **LayerZero EID**: 40245
- **Chainlink Price Feed**: `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1` (ETH/USD)
- **Gas Used**: 3,966,861
- **Block Explorer**: <https://sepolia.basescan.org/address/0x410dd768fD79530859e3100586b7d6218CcF0519>

### Arbitrum Sepolia

- **Contract Address**: `0x5C1244373Dc747f6B23B956212c796673A0Aa77f`
- **Chain ID**: 421614
- **LayerZero EID**: 40231
- **Chainlink Price Feed**: `0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165` (ETH/USD)
- **Gas Used**: 4,279,585
- **Block Explorer**: <https://sepolia.arbiscan.io/address/0x5C1244373Dc747f6B23B956212c796673A0Aa77f>

---

## ✅ Configuration Status

- [x] Base Sepolia deployed
- [x] Arbitrum Sepolia deployed
- [x] Base URI set on Base Sepolia (`https://api.dobamusic.com/metadata/`)
- [x] Base URI set on Arbitrum Sepolia (`https://api.dobamusic.com/metadata/`)
- [x] Cross-chain peer configured (Base → Arbitrum)
- [x] Cross-chain peer configured (Arbitrum → Base)

---

## 🔗 Cross-Chain Configuration

**Base Sepolia knows about**:

- Peer EID: 40231 (Arbitrum Sepolia)
- Peer Address: `0x5C1244373Dc747f6B23B956212c796673A0Aa77f`

**Arbitrum Sepolia knows about**:

- Peer EID: 40245 (Base Sepolia)
- Peer Address: `0x410dd768fD79530859e3100586b7d6218CcF0519`

---

## 🧪 Testing Checklist

### Basic Functions

- [ ] Mint NFT on Base Sepolia
- [ ] Mint NFT on Arbitrum Sepolia
- [ ] Verify price feed is working
- [ ] Check NFT metadata URI
- [ ] Test overpayment refund
- [ ] Withdraw pending refund (if any)

### Cross-Chain Transfer

- [ ] Mint on Base Sepolia
- [ ] Transfer from Base → Arbitrum
- [ ] Verify NFT burned on Base
- [ ] Verify NFT minted on Arbitrum
- [ ] Transfer back Arbitrum → Base

### Security Features

- [ ] Pause contract (Base)
- [ ] Verify minting blocked when paused
- [ ] Unpause contract
- [ ] Test emergency withdraw
- [ ] Update price feed (test only)

### Price Feed

- [ ] Get current mint price on Base
- [ ] Get current mint price on Arbitrum
- [ ] Verify price is reasonable ($5 in ETH)

---

## 💰 Test Minting

### On Base Sepolia

```bash
# Get current price
bun hardhat console --network base-sepolia
const doba = await ethers.getContractAt('Doba', '0x410dd768fD79530859e3100586b7d6218CcF0519')
const price = await doba.getMintPriceInETH()
console.log('Mint price:', ethers.utils.formatEther(price), 'ETH')

# Mint NFT
const [signer] = await ethers.getSigners()
const tx = await doba.mint(signer.address, { value: price })
await tx.wait()
console.log('Minted token #1')
```

### On Arbitrum Sepolia

```bash
# Get current price
bun hardhat console --network arbitrum-sepolia
const doba = await ethers.getContractAt('Doba', '0x5C1244373Dc747f6B23B956212c796673A0Aa77f')
const price = await doba.getMintPriceInETH()
console.log('Mint price:', ethers.utils.formatEther(price), 'ETH')

# Mint NFT
const [signer] = await ethers.getSigners()
const tx = await doba.mint(signer.address, { value: price })
await tx.wait()
console.log('Minted token #1')
```

---

## 🌉 Cross-Chain Transfer

```bash
# On Base Sepolia (source chain)
bun hardhat console --network base-sepolia

const doba = await ethers.getContractAt('Doba', '0x410dd768fD79530859e3100586b7d6218CcF0519')
const [signer] = await ethers.getSigners()
const { Options } = require('@layerzerolabs/lz-v2-utilities')

const tokenId = 1
const destEid = 40231 // Arbitrum Sepolia
const destAddress = ethers.utils.zeroPad(signer.address, 32)

// Create options for cross-chain transfer
const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex()

// Create send parameters
const sendParam = [
    destEid,
    destAddress,
    tokenId,
    options,
    '0x', // compose message (none)
    '0x'  // onftCompose message (none)
]

// Get quote for fees
const [nativeFee] = await doba.quoteSend(sendParam, false)
console.log('Transfer fee:', ethers.utils.formatEther(nativeFee), 'ETH')

// Send NFT
const tx = await doba.send(sendParam, [nativeFee, 0], signer.address, { value: nativeFee })
await tx.wait()
console.log('NFT sent to Arbitrum Sepolia!')
```

---

## 🔧 Utility Scripts

All scripts are in `/oapp/scripts/`:

- **setBaseURI.ts** - Set NFT metadata base URI
- **configurePeers.ts** - Configure cross-chain peers

Run with:

```bash
bun hardhat run scripts/SCRIPT_NAME.ts --network NETWORK_NAME
```

---

## 🎛️ Admin Functions

### Contract Owner

- **Address**: `0xa5EF5D72eA368E8c76E9bC96Bf97a77d66cD0f7b`

### Available Admin Functions

- `setBaseURI(string)` - Update metadata URI
- `withdraw()` - Withdraw contract balance
- `emergencyWithdraw(address)` - Emergency fund recovery
- `updatePriceFeed(address)` - Update Chainlink oracle
- `pause()` - Pause minting
- `unpause()` - Resume minting
- `setPeer(uint32 eid, bytes32 peer)` - Configure cross-chain peer

---

## 📊 Contract Parameters

### Constants

- **MINT_PRICE_USD**: $5.00 (5e8 in 8 decimals)
- **MAX_SUPPLY**: 100,000 NFTs
- **PRICE_STALENESS_THRESHOLD**: 1 hour (3600 seconds)
- **MIN_ETH_PRICE**: $100 (prevents extreme low prices)
- **MAX_ETH_PRICE**: $100,000 (prevents extreme high prices)

### Royalties

- **Royalty Receiver**: `0xa5EF5D72eA368E8c76E9bC96Bf97a77d66cD0f7b`
- **Royalty Percentage**: 5% (500 basis points)

---

## 🔐 Security Features Enabled

✅ Reentrancy Protection (`nonReentrant`)  
✅ Pausable (emergency stop)  
✅ Price Feed Validation (staleness + bounds)  
✅ Pending Refunds System (failed refund recovery)  
✅ Cross-Chain Token ID Collision Prevention  
✅ Safe External Calls (`.call()` instead of `.transfer()`)  
✅ Access Control (`onlyOwner`)  

---

## 📈 Next Steps

1. **Test all functions** on both chains
2. **Monitor price feeds** for accuracy
3. **Test cross-chain transfers** both directions
4. **Document any issues** encountered
5. **Run for 2+ weeks** before mainnet consideration
6. **Get professional audit** (required for mainnet)

---

## 🆘 Emergency Contacts

- **LayerZero Support**: <https://layerzero.network/>
- **LayerZero Scan**: <https://layerzeroscan.com/>
- **Chainlink Status**: <https://status.chain.link/>

---

## 📝 Notes

- Base URI points to `https://api.dobamusic.com/metadata/` (ensure this endpoint is ready)
- Both contracts use same deployer as owner
- Cross-chain messages use LayerZero V2 protocol
- Gas costs on Arbitrum are typically lower than Base
- Always test with small amounts first

---

**Deployment Complete! Ready for testing.** 🚀
