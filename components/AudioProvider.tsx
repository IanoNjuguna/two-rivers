'use client'
import React, { createContext, useContext, useCallback, useMemo } from 'react'
import { useAudioPlayer, type Track } from '@/hooks/useAudioPlayer'
import AudioPlayer from './AudioPlayer'
import { watchSmartAccountClient, getSmartAccountClient } from "@account-kit/core"
import { useSignerStatus, useUser, useAccount, useAlchemyAccountContext, useAuthModal } from "@account-kit/react"
import { toast } from 'sonner'
import { useAccount as useWagmiAccount } from 'wagmi'
import { accountConfig } from '@/lib/config'
import { sdk } from '@farcaster/miniapp-sdk'

interface AudioContextType {
	playerState: ReturnType<typeof useAudioPlayer>
	handlePlayTrack: (track: Track, tracks?: any[]) => void
	client: any
	effectiveAddress: string | undefined
	isConnected: boolean
	userEmail: string | undefined
}

const AudioContext = createContext<AudioContextType | null>(null)

export const useAudio = () => {
	const context = useContext(AudioContext)
	if (!context) throw new Error('useAudio must be used within an AudioProvider')
	return context
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
	const playerState = useAudioPlayer()

	const [isMiniApp, setIsMiniApp] = React.useState<boolean | null>(null)
	React.useEffect(() => {
		sdk.isInMiniApp().then(setIsMiniApp).catch(() => setIsMiniApp(false))
	}, [])

	return (
		<AudioProviderInner isMiniApp={isMiniApp} playerState={playerState}>
			{children}
		</AudioProviderInner>
	)
}

function AudioProviderInner({ children, isMiniApp, playerState }: { children: React.ReactNode, isMiniApp: boolean | null, playerState: any }) {
	// 1. Universal Wagmi State (Safe everywhere)
	const { address: wagmiAddress, isConnected: isWagmiConnected } = useWagmiAccount()

	// 2. Alchemy State (Only call hooks if NOT in Mini App to avoid context errors)
	// hooks must be called at top level, so we use the Inner component pattern 
	// but even here, they might throw if the Provider is absent.
	// We'll use a safer approach: render a different Inner component for each mode.

	if (isMiniApp === null) return <>{children}</> // Wait for detection

	return isMiniApp ? (
		<MiniAppAudioProvider playerState={playerState}>
			{children}
		</MiniAppAudioProvider>
	) : (
		<AlchemyAudioProvider playerState={playerState}>
			{children}
		</AlchemyAudioProvider>
	)
}

function MiniAppAudioProvider({ children, playerState }: { children: React.ReactNode, playerState: any }) {
	const { address, isConnected } = useWagmiAccount()

	const handlePlayTrack = useCallback((track: Track, tracks?: any[]) => {
		// In Mini App, we might not have the same AuthModal, so we just check connection
		if (!isConnected) {
			toast.error("Please connect your wallet to stream music")
			return
		}

		if (playerState.currentTrack?.id === track.id) {
			playerState.togglePlayPause()
			return
		}

		if (playerState.audioRef.current) {
			playerState.audioRef.current.src = track.url || ''
		}
		playerState.play(track, tracks)
	}, [playerState, isConnected])

	const value = useMemo(() => ({
		playerState,
		handlePlayTrack,
		client: null,
		effectiveAddress: address,
		isConnected,
		userEmail: undefined
	}), [playerState, handlePlayTrack, address, isConnected])

	return (
		<AudioContext.Provider value={value}>
			{children}
			<AudioPlayer playerState={playerState} client={null} />
		</AudioContext.Provider>
	)
}

function AlchemyAudioProvider({ children, playerState }: { children: React.ReactNode, playerState: any }) {
	const { isConnected: isSignerConnected } = useSignerStatus()
	const user = useUser()
	const { config } = useAlchemyAccountContext()
	const { address: scaAddress } = useAccount(accountConfig)
	const { address: wagmiAddress, isConnected: isWagmiConnected } = useWagmiAccount()
	const { openAuthModal } = useAuthModal()

	const { client } = React.useSyncExternalStore(
		watchSmartAccountClient(accountConfig, config),
		() => getSmartAccountClient(accountConfig, config),
		() => getSmartAccountClient(accountConfig, config)
	)

	const effectiveAddress = scaAddress || user?.address || wagmiAddress
	const isAuthenticated = !!user?.address
	const isConnected = !!(isSignerConnected && client) || isWagmiConnected

	const handlePlayTrack = useCallback((track: Track, tracks?: any[]) => {
		if (!isAuthenticated) {
			toast.error("Please sign in to stream music")
			openAuthModal()
			return
		}

		if (playerState.currentTrack?.id === track.id) {
			playerState.togglePlayPause()
			return
		}

		if (playerState.audioRef.current) {
			playerState.audioRef.current.src = track.url || ''
		}
		playerState.play(track, tracks)
	}, [playerState, isAuthenticated, openAuthModal])

	const value = useMemo(() => ({
		playerState,
		handlePlayTrack,
		client,
		effectiveAddress,
		isConnected,
		userEmail: user?.email
	}), [playerState, handlePlayTrack, client, effectiveAddress, isConnected, user?.email])

	return (
		<AudioContext.Provider value={value}>
			{children}
			<AudioPlayer playerState={playerState} client={client} />
		</AudioContext.Provider>
	)
}
