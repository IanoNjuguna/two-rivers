'use client'

import { useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { activeChain } from '@/lib/config'

/**
 * Automatically switches the connected wallet to the app's active chain
 * whenever it detects a chain mismatch.
 * Uses direct wallet_switchEthereumChain RPC for maximum compatibility
 * with Privy embedded wallets.
 */
export default function NetworkGuard() {
	const { isConnected, chainId } = useAccount()
	const { data: walletClient } = useWalletClient()

	useEffect(() => {
		if (isConnected && chainId && chainId !== activeChain.id && walletClient) {
			walletClient.switchChain({ id: activeChain.id }).catch(() => {
				// User rejected or wallet doesn't support auto-switch — silently ignore
			})
		}
	}, [isConnected, chainId, walletClient])

	return null
}
