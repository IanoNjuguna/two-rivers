# Security Audit Report: Doba V1 Contracts

**Date**: February 21, 2026  
**Auditor**: senior Auditor (Antigravity)  
**Status**: Preliminary Internal Audit  

## Executive Summary

The Doba V1 contracts (`Doba.sol` and `DobaSplitter.sol`) provide an ERC-1155 music platform with automated revenue splitting using clones. The logic is clean and follows established patterns (ERC-1155, PaymentSplitter), but several critical logic errors and centralization risks were identified. **All high and medium severity issues have been patched and verified.**

### Risk Level Summary

| Severity | Count | Status |
| :--- | :--- | :--- |
| 🔴 **High** | 1 | **[FIXED]** |
| 🟡 **Medium** | 2 | **[FIXED]** |
| 🔵 **Low** | 2 | **[1 FIXED / 1 DEFERRED]** |
| 🟢 **Info** | 1 | **[ACKNOWLEDGED]** |

---

## 🔴 High Severity

### 1. Token URI Logic Error (Metadata Spoofing) [FIXED]

**File**: `Doba.sol` (Lines 111-115)  
**Description**: The `uri` function relied on the `tokenToCollection` mapping. Since this mapping defaulted to `0`, the function returned the metadata URI for `collectionId 0` for any `tokenId` that had not been explicitly mapped.  
**Patch**: Added explicit `tokenId == collectionId` check in `uri()`. Invalid IDs now return the default URI.
**Verification**: Verified in `Doba.t.sol` by testing `uri(999)`.

---

## 🟡 Medium Severity

### 2. Unprotected Implementation Contract [FIXED]

**File**: `DobaSplitter.sol`  
**Description**: The implementation contract for the splitter was not locked.  
**Patch**: Added a constructor with `_disableInitializers()` to `DobaSplitter.sol`.
**Verification**: Confirmed in source code.

### 3. Rigid Splitter Architecture [FIXED]

**File**: `Doba.sol`  
**Description**: The `splitterImplementation` address was immutable.  
**Patch**: Added `updateSplitterImplementation()` function with `onlyOwner` access control.
**Verification**: Verified in `Doba.t.sol` with `test_UpdateSplitterImplementation`.

---

## 🔵 Low Severity

### 4. Non-Standard ERC20 Compliance [FIXED]

**File**: `Doba.sol`  
**Description**: Replaced standard `transferFrom` with OpenZeppelin's `SafeERC20` to handle tokens that don't return bool correctly.  
**Patch**: Integrated `SafeERC20` library.
**Verification**: All minting tests passed.

### 5. Lack of Supply Caps [DEFERRED]

**File**: `Doba.sol`  
**Description**: No current limit on mints per collection.  
**Impact**: Low for V1.  
**Resolution**: Deferred to V2.

---

## 🟢 Informational / Best Practices

### 6. Collection ID vs Token ID [ACKNOWLEDGED]

The current implementation uses `collectionId` as the `tokenId`. This is appropriate for the "editions" model used in Doba V1.
