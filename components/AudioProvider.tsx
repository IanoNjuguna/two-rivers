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

	// Sync sidebar track with current player track if sidebar is open and follows player
	React.useEffect(() => {
		if (playerState.currentTrack && isSidebarOpen) {
			// Only update if we aren't explicitly viewing a different track from library
			if (!sidebarTrack || sidebarTrack.id === playerState.currentTrack.id) {
				// We need to map player track to full track info if possible
				// For now, just use player track but note it might lack some details like description
				// Actually, we'll handle this in the sidebar component by fetching full info if needed
				setSidebarTrack(playerState.currentTrack)
			}
		}
	}, [playerState.currentTrack, isSidebarOpen])

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
	}, [playerState, isConnected])

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
			{playerState.currentTrack && <AudioPlayer playerState={playerState} />}
		</AudioContext.Provider>
	)
}
