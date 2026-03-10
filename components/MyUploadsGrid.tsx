import { logger } from '@/lib/logger'
import React, { useEffect, useState } from 'react'
import { IconMusic } from '@tabler/icons-react'
import SongCard from './SongCard'
import { useAudio } from './AudioProvider'

interface Track {
	token_id: number
	name: string
	artist: string
	image_url: string
	audio_url: string
	streaming_url?: string
	description?: string
	genre?: string
	tx_hash?: string
	chain_id?: string
	price?: string
}

interface MyUploadsGridProps {
	address?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://doba-api-494043112081.us-central1.run.app'

export default function MyUploadsGrid({ address }: MyUploadsGridProps) {
	const { playerState, handlePlayTrack, client } = useAudio()
	const [uploads, setUploads] = useState<Track[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchUploads = async () => {
			if (!address) {
				setLoading(false)
				return
			}

			try {
				const fetchUrl = `${API_URL.replace(/\/$/, '')}/songs?artist=${address}`
				const res = await fetch(fetchUrl)
				if (!res.ok) throw new Error('Failed to fetch user uploads')
				const userTracks: Track[] = await res.json()
				setUploads(userTracks)
			} catch (error) {
				logger.error('Profile: Error fetching uploads', error)
			} finally {
				setLoading(false)
			}
		}

		fetchUploads()
	}, [address])

	if (loading) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
				{[...Array(6)].map((_, i) => (
					<div key={i} className="aspect-square bg-white/5 animate-pulse" />
				))}
			</div>
		)
	}

	if (!uploads.length) {
		return (
			<div className="glass p-12 text-center rounded-xl bg-white/[0.02] border border-white/[0.08]">
				<IconMusic className="w-12 h-12 mx-auto mb-4 text-white/20" />
				<h3 className="text-xl font-semibold mb-2">No Uploads Yet</h3>
				<p className="text-white/40 italic text-sm">You haven't published any songs on Doba. Head to the Upload tab to mint your first track!</p>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
			{uploads.map((track) => (
				<SongCard
					key={track.token_id}
					tokenId={track.token_id}
					name={track.name}
					artist={track.artist}
					imageUrl={track.image_url}
					audioUrl={track.audio_url}
					genre={track.genre}
					price={track.price}
					trackChainId={track.chain_id}
					client={client}
					navigateOnClick={true}
					onPlay={() => handlePlayTrack({
						id: track.token_id,
						title: track.name,
						creator: track.artist,
						cover: track.image_url,
						url: track.streaming_url || track.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
						collaborators: 0,
						price: track.price
					}, uploads.map(t => ({
						id: t.token_id,
						title: t.name,
						creator: t.artist,
						cover: t.image_url,
						url: t.streaming_url || t.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
						collaborators: 0,
						price: t.price
					})))}
					isPlaying={playerState.isPlaying && playerState.currentTrack?.id === track.token_id}
				/>
			))}
		</div>
	)
}
