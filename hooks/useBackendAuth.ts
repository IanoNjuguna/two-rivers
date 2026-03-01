'use client'

import { useState, useCallback, useEffect } from 'react'
import { useUser, useSmartAccountClient } from "@account-kit/react"
import { useAccount, useSignMessage } from 'wagmi'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

const API_URL = '/api-backend'

import { sdk } from '@farcaster/miniapp-sdk'

export function useBackendAuth() {
	const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)

	// Safely detect environment
	useEffect(() => {
		sdk.isInMiniApp()
			.then(setIsMiniApp)
			.catch(() => setIsMiniApp(false))
	}, [])

	// Use hooks but handle their absence/usage carefully
	// Note: We MUST call hooks at top level, but some might throw if Provider is missing.
	// We'll wrap them or use proxies if needed, but for now let's just use them 
	// and ensure downstream logic is guarded.
	const user = useUser()
	const { address: wagmiAddress } = useAccount()
	const { client: smartAccountClient } = useSmartAccountClient({ type: "LightAccount" })
	const { signMessageAsync } = useSignMessage()

	const [accessToken, setAccessToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const effectiveAddress = (smartAccountClient?.account?.address || wagmiAddress || user?.address) as string | undefined

	// Load from localStorage on mount or address change
	useEffect(() => {
		if (effectiveAddress) {
			try {
				const stored = localStorage.getItem(`doba_jwt_${effectiveAddress.toLowerCase()}`)
				if (stored) {
					setAccessToken(stored)
				} else {
					setAccessToken(null)
				}
			} catch (e) {
				logger.warn('localStorage access blocked in this environment', e)
				setAccessToken(null)
			}
		} else {
			setAccessToken(null)
		}
	}, [effectiveAddress])

	const login = useCallback(async () => {
		if (!effectiveAddress) {
			toast.error("Please connect your wallet first")
			return null
		}

		setIsLoading(true)
		try {
			const nonce = Math.random().toString(36).substring(2)
			const message = `Login to Doba\n\nAddress: ${effectiveAddress}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`

			let signature: string
			if (smartAccountClient) {
				// Sign via Smart Account (ERC-1271 compatible)
				signature = await smartAccountClient.signMessage({ message })
			} else {
				// Sign via EOA
				signature = await signMessageAsync({ message })
			}

			const res = await fetch(`${API_URL.replace(/\/$/, '')}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ address: effectiveAddress, signature, message })
			})

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || errorData.error || 'Backend login failed')
			}

			const data = await res.json()
			try {
				localStorage.setItem(`doba_jwt_${effectiveAddress.toLowerCase()}`, data.accessToken)
			} catch (e) {
				logger.warn('Failed to save JWT to localStorage', e)
			}
			setAccessToken(data.accessToken)

			logger.info(`Backend login successful for ${effectiveAddress}`)
			return data.accessToken as string
		} catch (e: any) {
			logger.error('Backend login error', e)
			toast.error('Authentication failed: ' + (e.message || 'Unknown error'))
			return null
		} finally {
			setIsLoading(false)
		}
	}, [effectiveAddress, smartAccountClient, signMessageAsync])

	const getValidToken = useCallback(async () => {
		// If we have a token, return it
		if (accessToken) return accessToken

		// Otherwise, attempt login
		return await login()
	}, [accessToken, login])

	const logout = useCallback(() => {
		if (effectiveAddress) {
			try {
				localStorage.removeItem(`doba_jwt_${effectiveAddress.toLowerCase()}`)
			} catch (e) {
				// ignore
			}
		}
		setAccessToken(null)
	}, [effectiveAddress])

	return {
		accessToken,
		login,
		getValidToken,
		logout,
		isLoading,
		isAuthenticated: !!accessToken,
		effectiveAddress
	}
}
