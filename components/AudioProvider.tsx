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
	sidebarTrack: any | null
	isSidebarOpen: boolean
	handleOpenSidebar: (track: any) => void
	toggleSidebar: () => void
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
	const [sidebarTrack, setSidebarTrack] = React.useState<any | null>(null)
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

	React.useEffect(() => {
		sdk.isInMiniApp().then(setIsMiniApp).catch(() => setIsMiniApp(false))
	}, [])

	// Sync sidebar track with current player track if sidebar is open
	React.useEffect(() => {
		if (playerState.currentTrack && isSidebarOpen) {
			// Always sync if sidebar is open and doesn't match current track
			if (!sidebarTrack || sidebarTrack.id !== playerState.currentTrack.id) {
				setSidebarTrack(playerState.currentTrack)
			}
		}
	}, [playerState.currentTrack?.id, isSidebarOpen])

	const handleOpenSidebar = useCallback((track: any) => {
		setSidebarTrack(track)
		setIsSidebarOpen(true)
	}, [])

	const toggleSidebar = useCallback(() => {
		setIsSidebarOpen(prev => !prev)
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

		// If sidebar is open, update it to the track being played
		if (isSidebarOpen) {
			setSidebarTrack(track)
		}
	}, [playerState, isConnected, isSidebarOpen])

	const value = useMemo(() => ({
		playerState,
		handlePlayTrack,
		effectiveAddress: address,
		isConnected,
		isAuthenticated: isConnected,
		sidebarTrack,
		isSidebarOpen,
		handleOpenSidebar,
		toggleSidebar
	}), [playerState, handlePlayTrack, address, isConnected, sidebarTrack, isSidebarOpen, handleOpenSidebar, toggleSidebar])

	if (isMiniApp === null) {
		return <div className="h-screen bg-[#0D0D12]" />
	}

	return (
		<AudioContext.Provider value={value}>
			{children}
		</AudioContext.Provider>
	)
}
