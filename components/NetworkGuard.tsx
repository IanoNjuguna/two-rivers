'use client'

import { useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { activeChain } from '@/lib/config'

/**
 * Automatically switches the connected wallet to the app's active chain
 * (Base Sepolia / Base) whenever it detects a chain mismatch.
 */
export default function NetworkGuard() {
	const chainId = useChainId()
	const { isConnected } = useAccount()
	const { switchChain } = useSwitchChain()

	useEffect(() => {
		if (isConnected && chainId !== activeChain.id) {
			switchChain({ chainId: activeChain.id })
		}
	}, [isConnected, chainId, switchChain])

	return null
}
