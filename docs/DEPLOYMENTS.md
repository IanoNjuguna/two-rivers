# Doba Deployment Registry

This document serves as the single source of truth for contract addresses and deployment configurations across all supported networks.

## 🚀 Mainnet (Verified Native USDC)

| Chain | LayerZero EID | Contract Address | USDC Address | Explorer |
| :--- | :--- | :--- | :--- | :--- |
| **Arbitrum One** | 30110 | TBD | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | [Arbiscan](https://arbiscan.io/) |
| **Base** | 30184 | TBD | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | [Basescan](https://basescan.org/) |
| **Avalanche** | 30106 | TBD | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | [Snowtrace](https://snowtrace.io/) |

---

## 🧪 Testnet (Active)

| Chain | LayerZero EID | Contract Address | USDC Address | Explorer |
| :--- | :--- | :--- | :--- | :--- |
| **Arbitrum One, Base & Avalanche** | 40231 | `0x3357f2c5d3f18bcbfa040663a0c27e0474f92aee` | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` | [Arbiscan](https://sepolia.arbiscan.io/) |
| **Base Sepolia** | 40245 | `0x9085DAEf74d3fBF233FCbf599d417E94E762b952` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | [Basescan](https://sepolia.basescan.org/) |
| **Avalanche Fuji** | 40106 | `0x9085DAEf74d3fBF233FCbf599d417E94E762b952` | `0x5425890298aed601595a70AB815c96711a31Bc65` | [Snowtrace](https://testnet.snowtrace.io/) |
| **Robinhood Testnet** | TBD | `0x9085DAEf74d3fBF233FCbf599d417E94E762b952` | `0x8689aFB9086734e12beA6b5DF541a1da252Ea32a` | [Blockscout](https://robinhood.blockscout.com/) |

---

## 🛠 Project Parameters

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Primary Artist BPS** | 9300 | 93% of primary sales to artist/collaborators |
| **Primary Platform BPS** | 700 | 7% of primary sales to platform |
| **Secondary Royalty BPS** | 1600 | 16% total secondary royalty |
| **Platform Royalty Share** | 12.5% | Platform takes 12.5% of the 16% royalty (2% of total) |
| **Default Mint Price** | 6.99 USDC | Standard price if artist doesn't specify |
| **Min Mint Price** | 0.99 USDC | Safety floor for mint prices |

## 🔗 External Infrastructure

### LayerZero V2 Endpoints

- **Arbitrum/Base/Avalanche (Testnet):** `0x6EDCE65403992e310A62460808c4b910D972f10f`
- **Arbitrum/Base/Avalanche (Mainnet):** `0x1a44795eca61f1155c415b49d94943719486c433`

### IPFS Strategy

- **Provider:** Pinata (Planned)
- **Metadata Standard:** ERC-721 / OpenSea Compatible
- **Storage:** Audio (WAV/FLAC) + Artwork (High-res PNG/JPG)

---

## 📝 Update Guide

When moving to mainnet or deploying new versions:

1. Update the `.env` file with new RPCs and addresses.
2. Update the tables above.
3. Replace `TBD` with the verified contract addresses.
4. Ensure `setPeer` and `setEnforcedOptions` are called on the new addresses.
