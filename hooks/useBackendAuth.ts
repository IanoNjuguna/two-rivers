'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

const API_URL = '/api-backend'

import { sdk } from '@farcaster/miniapp-sdk'
import { usePrivy } from '@privy-io/react-auth'

export function useBackendAuth() {
	const { login: privyLogin, getAccessToken, authenticated, user } = usePrivy()
	const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)

	// Safely detect environment
	useEffect(() => {
		sdk.isInMiniApp()
			.then(setIsMiniApp)
			.catch(() => setIsMiniApp(false))
	}, [])

	const { address: wagmiAddress } = useAccount()
	const [accessToken, setAccessToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const effectiveAddress = (wagmiAddress || user?.wallet?.address) as string | undefined

	// Handle token synchronization
	useEffect(() => {
		async function syncToken() {
			if (authenticated) {
				const token = await getAccessToken()
				setAccessToken(token)
			} else {
				setAccessToken(null)
			}
		}
		syncToken()
	}, [authenticated, getAccessToken])

	const login = useCallback(async () => {
		if (!authenticated) {
			privyLogin()
			return null
		}

		setIsLoading(true)
		try {
			const token = await getAccessToken()
			setAccessToken(token)
			return token
		} catch (e: any) {
			logger.error('Failed to get Privy access token', e)
			return null
		} finally {
			setIsLoading(false)
		}
	}, [authenticated, privyLogin, getAccessToken])

	const getValidToken = useCallback(async () => {
		if (!authenticated) return null
		return await getAccessToken()
	}, [authenticated, getAccessToken])

	const logout = useCallback(() => {
		// Privy logout is handled by usePrivy().logout() at the component level or via its own side effects
		setAccessToken(null)
	}, [])

	return {
		accessToken,
		login,
		getValidToken,
		logout,
		isLoading,
		isAuthenticated: authenticated,
		effectiveAddress
	}
}
