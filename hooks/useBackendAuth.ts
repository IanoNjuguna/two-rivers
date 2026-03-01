'use client'

import { useState, useCallback, useEffect } from 'react'
import { useUser, useSmartAccountClient } from "@account-kit/react"
import { useAccount, useSignMessage } from 'wagmi'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

const API_URL = '/api-backend'

export function useBackendAuth() {
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
			const stored = localStorage.getItem(`doba_jwt_${effectiveAddress.toLowerCase()}`)
			if (stored) {
				// Potential: Verify expiration here if JWT payload is visible
				setAccessToken(stored)
			} else {
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
			localStorage.setItem(`doba_jwt_${effectiveAddress.toLowerCase()}`, data.accessToken)
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
			localStorage.removeItem(`doba_jwt_${effectiveAddress.toLowerCase()}`)
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
