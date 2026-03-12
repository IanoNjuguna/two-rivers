'use client'
import React, { createContext, useContext, useCallback, useMemo } from 'react'
import { useAudioPlayer, type Track } from '@/hooks/useAudioPlayer'
import AudioPlayer from './AudioPlayer'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { sdk } from '@farcaster/miniapp-sdk'
import { useBackendAuth } from '@/hooks/useBackendAuth'

interface AudioContextType {
	playerState: ReturnType<typeof useAudioPlayer>
	handlePlayTrack: (track: Track, tracks?: any[]) => void
	effectiveAddress: string | undefined
	isConnected: boolean
	isAuthenticated: boolean
	accessToken: string | null
	getValidToken: () => Promise<string | null>
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
	const { accessToken, getValidToken, login, isAuthenticated: isAuth } = useBackendAuth()

	const [isMiniApp, setIsMiniApp] = React.useState<boolean | null>(null)
	const [sidebarTrack, setSidebarTrack] = React.useState<any | null>(null)
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

	// In AudioProvider.tsx
	React.useEffect(() => {
		sdk.isInMiniApp().then(setIsMiniApp).catch(() => setIsMiniApp(false))
	}, [])

	const [recordedTracks, setRecordedTracks] = React.useState<Set<number>>(new Set())

	// 1-minute stream rule implementation
	React.useEffect(() => {
		const track = playerState.currentTrack as any
		if (!track || !playerState.isPlaying) return

		const trackId = track.id ?? track.token_id
		if (recordedTracks.has(trackId)) return

		// If the track has been playing for at least 60 seconds (or if it's shorter and finished, but let's stick to 60s rule as requested)
		if (playerState.currentTime >= 60) {
			const recordPlay = async () => {
				try {
					const token = await getValidToken()
					await fetch(`/api-backend/songs/${trackId}/play`, {
						method: 'POST',
						headers: {
							'Authorization': token ? `Bearer ${token}` : ''
						}
					})
					setRecordedTracks(prev => new Set(prev).add(trackId))
				} catch (err) {
					console.error('Failed to record play after 1 minute', err)
				}
			}
			recordPlay()
		}
	}, [playerState.currentTime, playerState.isPlaying, playerState.currentTrack, recordedTracks, getValidToken])

	// Reset recorded tracks when the authenticated user changes or periodically? 
	// For now, let's just keep track of what's been recorded in this session.
	// We might want to clear it when the track changes if we want to allow re-recording same track?
	// The requirement is "1 stream equals every stream greater than 1 minute".
	// If they play for 1 min, stop, and play again, should it count as another stream? 
	// Usually yes. So let's clear the recorded flag if the track ID changes.
	const [lastTrackId, setLastTrackId] = React.useState<number | null>(null)
	React.useEffect(() => {
		const track = playerState.currentTrack as any
		const currentId = track?.id ?? track?.token_id
		if (currentId !== lastTrackId) {
			setLastTrackId(currentId)
		}
	}, [playerState.currentTrack, lastTrackId])

	// Sync sidebar track with current player track if sidebar is open
	React.useEffect(() => {
		if (playerState.currentTrack && isSidebarOpen) {
			// Always sync if sidebar is open and doesn't match current track
			const sidebarId = sidebarTrack?.id ?? sidebarTrack?.token_id
			const currentTrack = playerState.currentTrack as any
			const currentId = currentTrack?.id ?? currentTrack?.token_id

			if (!sidebarTrack || sidebarId !== currentId) {
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

	const handlePlayTrack = useCallback(async (track: Track, tracks?: any[]) => {
		if (!isAuth) {
			login()
			return
		}

		if (playerState.currentTrack?.id === track.id) {
			playerState.togglePlayPause()
			return
		}

		// Clear recorded flag if playing a different track
		const trackId = track.id
		if (trackId !== lastTrackId) {
			setRecordedTracks(prev => {
				const next = new Set(prev)
				next.delete(trackId)
				return next
			})
		}

		playerState.play(track, tracks)

		// If sidebar is open, update it to the track being played
		if (isSidebarOpen) {
			setSidebarTrack(track)
		}
	}, [playerState, isAuth, login, isSidebarOpen, lastTrackId])

	const value = useMemo(() => ({
		playerState,
		handlePlayTrack,
		effectiveAddress: address,
		isConnected,
		isAuthenticated: isAuth || isConnected,
		accessToken,
		getValidToken,
		sidebarTrack,
		isSidebarOpen,
		handleOpenSidebar,
		toggleSidebar
	}), [playerState, handlePlayTrack, address, isConnected, isAuth, accessToken, getValidToken, sidebarTrack, isSidebarOpen, handleOpenSidebar, toggleSidebar])

	if (isMiniApp === null) {
		return <div className="h-screen bg-[#0D0D12]" />
	}

	return (
		<AudioContext.Provider value={value}>
			{children}
		</AudioContext.Provider>
	)
}
