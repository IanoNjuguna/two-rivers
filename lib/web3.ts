import { logger } from './logger'
import { getAddress, createPublicClient, http, fallback } from 'viem'
import { base, baseSepolia, arbitrumSepolia, arbitrum } from 'wagmi/chains'

/**
 * Web3 Contract Configuration
 * 
 * Contract Address: 0x636d43f3c7b15289f795b3e5f36caf30524ceb01 (Home)
 * Contract Address: 0x4f8ef3fa5d64c2804480f2c323c922862001bcfc (Satellite)
 * Chain: Multi-chain (On-chain)
 */

export const PAYMASTER_SERVICE_URL = `https://api.coinbase.com/rpc/v1/base/${process.env.NEXT_PUBLIC_CDP_API_KEY}`

const ADDRESSES: Record<number, any> = {
  8453: {
    name: 'Base',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    paymaster: '0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633',
    lzEid: 30184,
    contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    explorer: 'https://basescan.org'
  },
  84532: {
    name: 'Base',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    paymaster: '0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633',
    lzEid: 40245,
    contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    explorer: 'https://sepolia.basescan.org'
  },
  421614: {
    name: 'Arbitrum Sepolia',
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    paymaster: '0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633',
    lzEid: 40231,
    contract: process.env.NEXT_PUBLIC_ARBITRUM_CONTRACT_ADDRESS as `0x${string}`,
    explorer: 'https://sepolia.arbiscan.io'
  }
}

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453)

export const getAddressesForChain = (chainId: number) => {
  return ADDRESSES[chainId] || ADDRESSES[8453]
}

const currentConfig = getAddressesForChain(CHAIN_ID)

export const CHAIN_NAME = currentConfig.name

export const CONTRACT_ADDRESS = currentConfig.contract

// Legacy exports for components that don't support dynamic yet
// Legacy exports for components that don't support dynamic yet
export const USDC_ADDRESS = getAddress(currentConfig.usdc)
export const PAYMASTER_ADDRESS = getAddress(currentConfig.paymaster)
export const LZ_EID = currentConfig.lzEid

// Logic to determine destination EID for sync
export const getDstEid = (chainId: number) => {
  if (chainId === 8453 || chainId === 84532) return 40231 // Sync to Arbitrum
  return 40245 // Sync to Base
}

export const DST_EID = getDstEid(CHAIN_ID)
export const LZ_SYNC_OPTIONS = "0x00030100110100000000000000000000000000030d40" // Type 3 options: [Execution: 200,000 gas]

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
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

// Minimal ABI for the Doba audio streaming contract (ERC-1155)
export const CONTRACT_ABI = [
  {
    type: 'function',
    name: 'publish',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_songName', type: 'string' },
      { name: '_baseUri', type: 'string' },
      { name: '_maxSupply', type: 'uint256' },
      { name: '_collaborators', type: 'address[]' },
      { name: '_shares', type: 'uint256[]' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_collectionId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'collections',
    stateMutability: 'view',
    inputs: [{ name: 'collectionId', type: 'uint256' }],
    outputs: [
      { name: 'artist', type: 'address' },
      { name: 'splitter', type: 'address' },
      { name: 'baseUri', type: 'string' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'exists', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'nextCollectionId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'uri',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'splitterImplementation',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'quoteSyncSong',
    stateMutability: 'view',
    inputs: [
      { name: '_dstEid', type: 'uint32' },
      { name: '_collectionId', type: 'uint256' },
      { name: '_options', type: 'bytes' },
    ],
    outputs: [{ name: 'nativeFee', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'syncSong',
    stateMutability: 'payable',
    inputs: [
      { name: '_dstEid', type: 'uint32' },
      { name: '_collectionId', type: 'uint256' },
      { name: '_options', type: 'bytes' },
    ],
    outputs: [
      {
        name: 'receipt',
        type: 'tuple',
        components: [
          { name: 'guid', type: 'bytes32' },
          { name: 'nonce', type: 'uint64' },
          {
            name: 'fee',
            type: 'tuple',
            components: [
              { name: 'nativeFee', type: 'uint256' },
              { name: 'lzTokenFee', type: 'uint256' },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'event',
    name: 'CollectionPublished',
    inputs: [
      { name: 'collectionId', type: 'uint256', indexed: true },
      { name: 'artist', type: 'address', indexed: true },
      { name: 'splitter', type: 'address', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'SongMinted',
    inputs: [
      { name: 'collectionId', type: 'uint256', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'buyer', type: 'address', indexed: true },
    ],
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'botFee',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'tokenToCollection',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'collectionMinted',
    stateMutability: 'view',
    inputs: [{ name: 'collectionId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
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
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOfBatch',
    stateMutability: 'view',
    inputs: [
      { name: 'accounts', type: 'address[]' },
      { name: 'ids', type: 'uint256[]' },
    ],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
] as const

export const SPLITTER_ABI = [
  {
    type: 'function',
    name: 'totalShares',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'shares',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalReleasedERC20',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'releasedERC20',
    stateMutability: 'view',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'releaseERC20',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'account', type: 'address' },
    ],
    outputs: [],
  },
] as const



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

// Multi-chain Public Clients (using Alchemy nodes with public fallbacks)
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;

const getTransport = (chainId: number) => {
  const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;

  if (chainId === 84532) return http(`https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`);
  if (chainId === 421614) return http(`https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`);
  if (chainId === 42161) return http(`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`);

  // Default to Base Mainnet
  return http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`);
}

export const publicClients: Record<number, any> = {
  8453: createPublicClient({
    chain: base,
    transport: fallback([
      http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
      http('https://mainnet.base.org')
    ])
  }),
  84532: createPublicClient({
    chain: baseSepolia,
    transport: fallback([
      http(`https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`),
      http('https://sepolia.base.org')
    ])
  }),
  421614: createPublicClient({
    chain: arbitrumSepolia,
    transport: fallback([
      http(`https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`),
      http('https://sepolia-rollup.arbitrum.io/rpc')
    ])
  }),
  42161: createPublicClient({
    chain: arbitrum,
    transport: fallback([
      http(`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
      http('https://arb1.arbitrum.io/rpc')
    ])
  }),
}


export type ChainBalances = {
  chainId: number;
  chainName: string;
  native: string;
  usdc: string;
  nativeSymbol: string;
}

export async function fetchAllBalances(address: string): Promise<ChainBalances[]> {
  const chains = [
    { id: CHAIN_ID, name: CHAIN_NAME, symbol: 'ETH' }
  ];

  return Promise.all(chains.map(async (c) => {
    const client = publicClients[c.id];
    const addrs = getAddressesForChain(c.id);

    try {
      const [nativeBalance, usdcBalance] = await Promise.all([
        client.getBalance({ address: address as `0x${string}` }),
        client.readContract({
          address: addrs.usdc as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        })
      ]);

      return {
        chainId: c.id,
        chainName: c.name,
        native: formatUnits(nativeBalance, 18),
        usdc: formatUnits(usdcBalance as bigint, 6),
        nativeSymbol: c.symbol
      };
    } catch (err) {
      logger.error(`Failed to fetch balances for chain ${c.id}`, err);
      return {
        chainId: c.id,
        chainName: c.name,
        native: '0.00',
        usdc: '0.00',
        nativeSymbol: c.symbol
      };
    }
  }));
}

import { formatUnits } from 'viem'
