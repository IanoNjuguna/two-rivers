'use client'
import React, { createContext, useContext, useCallback, useMemo } from 'react'
import { useAudioPlayer, type Track } from '@/hooks/useAudioPlayer'
import AudioPlayer from './AudioPlayer'
import { watchSmartAccountClient, getSmartAccountClient } from "@account-kit/core"
import { useSignerStatus, useUser, useAccount, useAlchemyAccountContext, useAuthModal } from "@account-kit/react"
import { toast } from 'sonner'
import { useAccount as useWagmiAccount } from 'wagmi'
import { accountConfig } from '@/lib/config'

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

	// Alchemy / Web3 State for AudioPlayer
	const { isConnected: isSignerConnected } = useSignerStatus()
	const user = useUser()
	const { config } = useAlchemyAccountContext()

	const { address: scaAddress } = useAccount(accountConfig)
	const { address: wagmiAddress, isConnected: isWagmiConnected } = useWagmiAccount()

	const { client } = React.useSyncExternalStore(
		watchSmartAccountClient(accountConfig, config),
		() => getSmartAccountClient(accountConfig, config),
		() => getSmartAccountClient(accountConfig, config)
	)

	const effectiveAddress = scaAddress || user?.address || wagmiAddress
	const isAuthenticated = !!user?.address
	const isConnected = !!(isSignerConnected && client) || isWagmiConnected

	const { openAuthModal } = useAuthModal()

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
