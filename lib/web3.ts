import { logger } from './logger'
import { getAddress, createPublicClient, http } from 'viem'
import { arbitrum, base, avalanche } from 'viem/chains'

/**
 * Web3 Contract Configuration
 * 
 * Contract Address: 0x636d43f3c7b15289f795b3e5f36caf30524ceb01 (Home)
 * Contract Address: 0x4f8ef3fa5d64c2804480f2c323c922862001bcfc (Satellite)
 * Chain: Multi-chain (On-chain)
 */

const ADDRESSES = {
  42161: {
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    paymaster: '0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633',
    lzEid: 30110,
    contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    explorer: 'https://arbiscan.io'
  },
  8453: {
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    paymaster: '0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633',
    lzEid: 30184,
    contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    explorer: 'https://basescan.org'
  },
  43114: {
    usdc: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    paymaster: '0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633',
    lzEid: 30106,
    contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    explorer: 'https://snowscan.xyz'
  }
}

export const getAddressesForChain = (chainId: number) => {
  return ADDRESSES[chainId as keyof typeof ADDRESSES] || ADDRESSES[42161]
}

export const CHAIN_ID = process.env.NEXT_PUBLIC_ACTIVE_CHAIN === 'base' ? 8453 :
  process.env.NEXT_PUBLIC_ACTIVE_CHAIN === 'avalanche' ? 43114 : 42161

export const CHAIN_NAME = process.env.NEXT_PUBLIC_ACTIVE_CHAIN?.toUpperCase() || 'ARBITRUM'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

// Legacy exports for components that don't support dynamic yet
const currentAddresses = ADDRESSES[CHAIN_ID as keyof typeof ADDRESSES]
export const USDC_ADDRESS = getAddress(currentAddresses.usdc)
export const PAYMASTER_ADDRESS = getAddress(currentAddresses.paymaster)
export const LZ_EID = currentAddresses.lzEid

// Logic to determine destination EID for sync
export const getDstEid = (chainId: number) => {
  if (chainId === 42161) return 30184 // Arb -> Base
  if (chainId === 8453) return 30110  // Base -> Arbi
  return 30110 // Default to Arbi from Avalanche
}

export const DST_EID = getDstEid(CHAIN_ID)
export const LZ_SYNC_OPTIONS = "0x00030100110100000000000000000000000000030d40" // Type 3 options: [Execution: 200,000 gas]

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

// Minimal ABI for the Doba audio streaming contract (ERC-1155)
export const CONTRACT_ABI = [
  {
    type: 'function',
    name: 'publish',
    stateMutability: 'nonpayable',
    inputs: [
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
      { name: 'id', type: 'uint256' },
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
  const alchemyUrl = chainId === 42161 ? `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` :
    chainId === 8453 ? `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` :
      `https://avax-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;

  const publicUrl = chainId === 42161 ? 'https://rpc.ankr.com/arbitrum' :
    chainId === 8453 ? 'https://rpc.ankr.com/base' :
      'https://rpc.ankr.com/avalanche';

  // Use both transports in a fallback pattern (viem supports fallback)
  // Actually, for simplicity and to avoid the 403 error entirely on localhost, 
  // we can check if we are on localhost and use the public RPC.
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return http(publicUrl);
  }

  return http(alchemyUrl);
}

export const publicClients = {
  42161: createPublicClient({ chain: arbitrum, transport: http(`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`) }),
  8453: createPublicClient({ chain: base, transport: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`) }),
  43114: createPublicClient({ chain: avalanche, transport: http(`https://avax-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`) }),
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
    { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
    { id: 8453, name: 'Base', symbol: 'ETH' },
    { id: 43114, name: 'Avalanche', symbol: 'AVAX' }
  ];

  return Promise.all(chains.map(async (c) => {
    const client = publicClients[c.id as keyof typeof publicClients];
    const addrs = ADDRESSES[c.id as keyof typeof ADDRESSES];

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
