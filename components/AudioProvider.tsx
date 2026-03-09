'use client'
import React, { createContext, useContext, useCallback, useMemo } from 'react'
import { useAudioPlayer, type Track } from '@/hooks/useAudioPlayer'
import AudioPlayer from './AudioPlayer'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { sdk } from '@farcaster/miniapp-sdk'

interface AudioContextType {
	playerState: ReturnType<typeof useAudioPlayer>
	handlePlayTrack: (track: Track, tracks?: any[]) => void
	effectiveAddress: string | undefined
	isConnected: boolean
	isAuthenticated: boolean
}

const AudioContext = createContext<AudioContextType | null>(null)

export const useAudio = () => {
	const context = useContext(AudioContext)
	if (!context) throw new Error('useAudio must be used within an AudioProvider')
	return context
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
	const playerState = useAudioPlayer()
	const { address, isConnected } = useAccount()

	const [isMiniApp, setIsMiniApp] = React.useState<boolean | null>(null)
	React.useEffect(() => {
		sdk.isInMiniApp().then(setIsMiniApp).catch(() => setIsMiniApp(false))
	}, [])

	const handlePlayTrack = useCallback((track: Track, tracks?: any[]) => {
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
		effectiveAddress: address,
		isConnected,
		isAuthenticated: isConnected
	}), [playerState, handlePlayTrack, address, isConnected])

	if (isMiniApp === null) {
		return <div className="h-screen bg-[#0D0D12]" />
	}

	return (
		<AudioContext.Provider value={value}>
			{children}
			{playerState.currentTrack && <AudioPlayer playerState={playerState} />}
		</AudioContext.Provider>
	)
}
