import { getAddress } from 'viem'

/**
 * Web3 Contract Configuration
 * 
 * Contract Address: 0x3c51e9deec4cb9dc69e261d63228e4fae62ae606 (Home)
 * Contract Address: 0xb550fcd9ad1630c17ba5a96934f8893b795b4801 (Satellite)
 * Chain: Multi-chain (On-chain)
 */

const ADDRESSES = {
  421614: {
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    paymaster: '0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633', // Alchemy v0.7 Singleton
    lzEid: 40231,
    contract: '0x3c51e9deec4cb9dc69e261d63228e4fae62ae606'
  },
  84532: {
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    paymaster: '0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633', // Alchemy v0.7 Singleton
    lzEid: 40245,
    contract: '0xb550fcD9aD1630C17Ba5a96934F8893B795b4801'
  }
}

export const CHAIN_ID = process.env.NEXT_PUBLIC_ACTIVE_CHAIN === 'base-sepolia' ? 84532 : 421614
export const CHAIN_NAME = process.env.NEXT_PUBLIC_ACTIVE_CHAIN === 'base-sepolia' ? 'On-chain' : 'On-chain'

const currentAddresses = ADDRESSES[CHAIN_ID as keyof typeof ADDRESSES]

export const CONTRACT_ADDRESS = getAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || currentAddresses.contract)
export const USDC_ADDRESS = getAddress(currentAddresses.usdc)
export const PAYMASTER_ADDRESS = getAddress(currentAddresses.paymaster)
export const LZ_EID = currentAddresses.lzEid
export const DST_EID = process.env.NEXT_PUBLIC_ACTIVE_CHAIN === 'base-sepolia' ? 40231 : 40245 // Arbi if Base, Base if Arbi

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'nonces',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'permit',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
] as const

// Minimal ABI for the Doba Music NFT contract (ERC721 OApp)
export const CONTRACT_ABI = [
  {
    type: 'function',
    name: 'publish',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'uri', type: 'string' },
      { name: 'supply', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'collaborators', type: 'address[]' },
      { name: 'shares', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable', // Changed to nonpayable (USDC transfer)
    inputs: [{ name: 'songId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'songs',
    stateMutability: 'view',
    inputs: [{ name: 'songId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'artist', type: 'address' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'minted', type: 'uint256' },
      { name: 'uri', type: 'string' },
    ],
  },
  {
    type: 'function',
    name: 'artistSplitters',
    stateMutability: 'view',
    inputs: [{ name: 'artist', type: 'address' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'usdc',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'MINT_PRICE',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'nextSongId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'tokenURI',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'event',
    name: 'SongPublished',
    inputs: [
      { name: 'songId', type: 'uint256', indexed: true },
      { name: 'artist', type: 'address', indexed: true },
      { name: 'uri', type: 'string', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'supply', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'SongMinted',
    inputs: [
      { name: 'songId', type: 'uint256', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'buyer', type: 'address', indexed: true },
    ],
  },
]

export const ARBITRUM_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc'

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
