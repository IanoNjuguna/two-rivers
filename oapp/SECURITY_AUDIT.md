# Security Audit Report: Doba NFT Contract

**Contract:** Doba (MyONFT721.sol)
**Date:** February 11, 2026
**Auditor:** GitHub Copilot
**Severity Scale:** Critical > High > Medium > Low

---

## Executive Summary

The Doba NFT contract has **14 identified issues** ranging from Critical to Low severity. The most critical vulnerabilities involve **reentrancy attacks**, **unsafe fund transfers**, and **stale price data risks**. A secure version (`DobaSecure.sol`) has been created with all issues resolved.

### Issue Summary
- 🔴 **Critical:** 3 issues
- 🟠 **High:** 3 issues  
- 🟡 **Medium:** 4 issues
- 🔵 **Low:** 4 issues

---

## Detailed Findings

### 🔴 CRITICAL

#### C-1: Reentrancy Vulnerability in `mint()`
**Location:** Lines 48-61  
**Severity:** Critical  
**Description:** The `_safeMint()` function triggers `onERC721Received()` callback on recipient contract BEFORE refunding excess payment. A malicious contract can re-enter `mint()` during this callback.

**Attack Scenario:**
```solidity
contract Attacker {
    function attack(Doba target) external payable {
        target.mint{value: msg.value}(address(this));
    }
    
    function onERC721Received(...) external returns (bytes4) {
        // Re-enter during callback, mint more tokens
        if (target.balanceOf(address(this)) < 10) {
            target.mint{value: 0}(address(this));
        }
        return this.onERC721Received.selector;
    }
}
```

**Impact:** Attacker can mint unlimited NFTs for price of one

**Fix:** Add `nonReentrant` modifier from OpenZeppelin's ReentrancyGuard

---

#### C-2: Unsafe External Call in Constructor
**Location:** Line 31  
**Severity:** Critical  
**Description:** Using `this.setBaseURI(baseURI_)` creates external call in constructor, which is anti-pattern and can cause issues.

**Impact:** 
- Higher gas costs
- Potential initialization order issues
- May fail in some deployment scenarios

**Fix:** Call internal `setBaseURI()` directly or use assembly to set storage

---

#### C-3: No Stale Price Data Protection
**Location:** Lines 37-44  
**Severity:** Critical  
**Description:** Contract doesn't check `updatedAt` timestamp or `answeredInRound` from Chainlink feed.

**Impact:**
- Using hours/days old price data
- Price manipulation if oracle fails
- Incorrect mint prices (potentially $0 or very low)

**Fix:** Add staleness checks:
```solidity
if (block.timestamp - updatedAt > STALENESS_THRESHOLD) revert StalePriceData();
if (answeredInRound < roundId) revert InvalidData();
```

---

### 🟠 HIGH

#### H-1: DoS via Failed Transfer
**Location:** Lines 57-59  
**Severity:** High  
**Description:** `transfer()` can fail if recipient has expensive fallback function, reverting entire transaction.

**Impact:** Users unable to mint NFTs, broken UX

**Fix:** Either:
1. Don't revert on refund failure (emit event instead)
2. Store failed refunds for manual withdrawal
3. Use pull-over-push pattern

---

#### H-2: Unsafe `transfer()` in `withdraw()`
**Location:** Line 73  
**Severity:** High  
**Description:** Using `transfer()` with 2300 gas limit. Fails if owner is contract with expensive receive/fallback.

**Impact:** Platform revenue permanently locked

**Fix:** Use `.call{value: amount}("")` instead:
```solidity
(bool success, ) = payable(owner()).call{value: balance}("");
require(success, "Transfer failed");
```

---

#### H-3: Integer Overflow Risk
**Location:** Line 44  
**Severity:** High  
**Description:** Expression `(MINT_PRICE_USD * 1e18)` could theoretically overflow if price is extremely low.

**Impact:** Incorrect pricing, potential arithmetic errors

**Fix:** Use SafeMath or validate bounds (Solidity 0.8+ has overflow protection but edge cases exist)

---

### 🟡 MEDIUM

#### M-1: No Price Feed Validation
**Location:** Line 27  
**Severity:** Medium  
**Description:** Missing zero-address check for `_priceFeed` parameter

**Fix:**
```solidity
require(_priceFeed != address(0), "Invalid price feed");
```

---

#### M-2: No Royalty Receiver Validation  
**Location:** Line 26  
**Severity:** Medium  
**Description:** Missing zero-address check for `_royaltyReceiver`

**Impact:** Royalties sent to burn address, permanent loss

**Fix:** Add validation check

---

#### M-3: No Price Feed Update Function
**Location:** Line 12  
**Severity:** Medium  
**Description:** If Chainlink deprecates feed or it becomes malicious, no way to update

**Impact:** Contract becomes unusable

**Fix:** Add owner function to update feed

---

#### M-4: Incomplete Price Data Validation
**Location:** Line 38  
**Severity:** Medium  
**Description:** Only checks `price > 0`, doesn't validate other return values

**Fix:** Validate all return values from `latestRoundData()`

---

### 🔵 LOW / GAS OPTIMIZATIONS

#### L-1: Mutable Price Feed
- Make `priceFeed` immutable to save gas

#### L-2: Missing Events
- Add events for mint, withdraw, price changes

#### L-3: No Maximum Supply
- Add max supply cap to prevent unlimited minting

#### L-4: Missing totalSupply()
- Add convenience function for total minted

---

## Secure Implementation

A fully secured version has been created: `DobaSecure.sol`

### Key Improvements:
✅ ReentrancyGuard protection  
✅ Staleness checks on price data (1 hour threshold)  
✅ Custom errors (gas efficient)  
✅ Safe `.call()` for ETH transfers  
✅ Input validation (zero address checks)  
✅ Maximum supply cap (100,000 NFTs)  
✅ Comprehensive events  
✅ Immutable price feed  
✅ Emergency withdraw function  
✅ Failed refund handling  
✅ Full validation of Chainlink data  

---

## Recommendations

### Immediate Actions (Before Deployment):
1. ✅ **Replace contract with `DobaSecure.sol`**
2. ✅ **Add comprehensive tests for edge cases**
3. ✅ **Get professional audit from reputable firm**
4. ✅ **Deploy to testnet first for 2+ weeks**
5. ✅ **Set up monitoring for price feed**

### Additional Considerations:
- **Pausable:** Consider adding pause functionality for emergencies
- **Access Control:** Use OpenZeppelin's AccessControl for role-based permissions  
- **Upgradeable:** Consider proxy pattern for future updates
- **Price Bounds:** Add min/max price sanity checks
- **Rate Limiting:** Prevent spam minting

### Testing Requirements:
```
- Reentrancy attack tests
- Price feed failure scenarios
- Stale data handling
- Gas limit edge cases
- Max supply enforcement
- Refund mechanism validation
- Cross-chain transfer tests
```

---

## Disclaimer

This audit identifies potential vulnerabilities but does not guarantee complete security. Professional third-party audit recommended before mainnet deployment.

**Recommended Audit Firms:**
- Trail of Bits
- OpenZeppelin  
- Consensys Diligence
- Certora
- Quantstamp
