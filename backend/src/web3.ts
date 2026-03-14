import { createPublicClient, http, fallback, getAddress } from 'viem'
import { base, baseSepolia, arbitrumSepolia, arbitrum } from 'viem/chains'
import { logger } from './lib/logger'

// Minimal ABI for balanceOf(address account, uint256 id)
export const CONTRACT_ABI = [
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
] as const

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY;

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

export async function verifyOwnershipOnChain(userAddress: string, tokenId: number, chainId: number): Promise<boolean> {
	const client = publicClients[chainId] || publicClients[8453]
	const contractAddress = (chainId === 421614 || chainId === 42161)
		? process.env.NEXT_PUBLIC_ARBITRUM_CONTRACT_ADDRESS
		: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

	if (!contractAddress) {
		logger.warn(`Contract address not configured for chain ${chainId}`)
		return false
	}

	try {
		const balance = await client.readContract({
			address: contractAddress as `0x${string}`,
			abi: CONTRACT_ABI,
			functionName: 'balanceOf',
			args: [userAddress as `0x${string}`, BigInt(tokenId)]
		})

		return Number(balance) > 0
	} catch (err) {
		logger.error(`Failed to verify ownership on-chain for ${userAddress} on track ${tokenId}`, err)
		return false
	}
}
