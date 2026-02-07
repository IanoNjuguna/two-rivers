/**
 * Web3 Contract Configuration
 * 
 * Contract Address: 0xa5EF5D72eA368E8c76E9bC96Bf97a77d66cD0f7b
 * Chain: Base Sepolia (Chain ID: 84532)
 */

export const CONTRACT_ADDRESS = '0xa5EF5D72eA368E8c76E9bC96Bf97a77d66cD0f7b'
export const CHAIN_ID = 84532
export const CHAIN_NAME = 'Base Sepolia'

// Minimal ABI for the Music NFT contract
export const CONTRACT_ABI = [
  {
    type: 'function',
    name: 'songPrices',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'payable',
    inputs: [
      { name: 'id', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'release',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [],
  },
  {
    type: 'event',
    name: 'SongPublished',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'metadataURI', type: 'string' },
    ],
  },
  {
    type: 'event',
    name: 'CollaborativeSongPublished',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'metadataURI', type: 'string' },
      { name: 'collaborators', type: 'address[]' },
    ],
  },
]

export const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatEther(wei: string | number): string {
  const weiNum = typeof wei === 'string' ? BigInt(wei) : BigInt(wei)
  const ethNum = parseFloat(weiNum.toString()) / 1e18
  return ethNum.toFixed(4)
}

export function formatEtherShort(wei: string | number): string {
  const eth = formatEther(wei)
  return parseFloat(eth).toFixed(2)
}
