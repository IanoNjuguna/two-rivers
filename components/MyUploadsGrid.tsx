import { logger } from '@/lib/logger'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { IconEye, IconMusic, IconMicrophone } from '@tabler/icons-react'
import { CONTRACT_ABI, getAddressesForChain } from '@/lib/web3'
import { useChainId } from "wagmi"

interface Track {
	token_id: number
	name: string
	artist: string
	image_url: string
	audio_url: string
	description?: string
	genre?: string
	tx_hash?: string
}

interface MyUploadsGridProps {
	address?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function MyUploadsGrid({ address }: MyUploadsGridProps) {
	const chainId = useChainId()
	const { contract: CONTRACT_ADDRESS, explorer: EXPLORER_URL } = getAddressesForChain(chainId || 42161)
	const [uploads, setUploads] = useState<Track[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

	useEffect(() => {
		const fetchUploads = async () => {
			if (!address) {
				setLoading(false)
				return
			}

			try {
				const fetchUrl = `${API_URL.replace(/\/$/, '')}/tracks?artist=${address}`
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
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-48 glass animate-pulse rounded-xl" />
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
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{uploads.map((track) => (
					<div
						key={track.token_id}
						className="group relative bg-[#16161E] border border-white/[0.08] hover:border-cyber-pink/50 transition-all duration-300 rounded-xl overflow-hidden"
					>
						{/* Cover Image */}
						<div className="aspect-square w-full relative overflow-hidden">
							<img
								src={track.image_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
								alt={track.name}
								className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

							{/* Badge for Upload */}
							<div className="absolute top-3 right-3 bg-cyber-pink/90 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider text-white">
								Original
							</div>
						</div>

						{/* Content */}
						<div className="p-4 space-y-3">
							<div>
								<h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-cyber-pink transition-colors">
									{track.name}
								</h3>
								<div className="flex items-center gap-1.5 mt-1">
									<IconMicrophone size={12} className="text-cyber-pink" />
									<p className="text-xs text-white/60 truncate">{track.artist}</p>
								</div>
							</div>

							<div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
								<div className="flex gap-2">
									<div className="bg-white/5 py-1 px-2 rounded text-[10px] text-white/40">
										ID #{track.token_id}
									</div>
								</div>
								<Button
									size="sm"
									variant="ghost"
									className="h-8 w-8 p-0 hover:bg-cyber-pink/20 text-cyber-pink"
									onClick={() => setSelectedTrack(track)}
								>
									<IconEye size={18} />
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Track Details Modal */}
			<Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
				<DialogContent className="bg-[#0D0D12] border border-white/[0.1] text-white max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
							{selectedTrack?.name}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6 py-2">
						<div className="aspect-square w-full rounded-xl overflow-hidden border border-white/10">
							<img
								src={selectedTrack?.image_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
								alt={selectedTrack?.name}
								className="w-full h-full object-cover"
							/>
						</div>

						<div className="space-y-4">
							<div className="space-y-1">
								<p className="text-[10px] uppercase tracking-widest text-cyber-pink font-bold">Artist</p>
								<p className="text-white text-lg font-medium">{selectedTrack?.artist}</p>
							</div>

							{selectedTrack?.description && (
								<div className="space-y-1">
									<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Description</p>
									<p className="text-white/70 text-sm leading-relaxed">{selectedTrack.description}</p>
								</div>
							)}

							<div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
								<div>
									<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Genre</p>
									<p className="text-white text-sm">{selectedTrack?.genre || 'Ambient'}</p>
								</div>
								<div>
									<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Token ID</p>
									<p className="text-white text-sm font-mono">#{selectedTrack?.token_id}</p>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-2 pt-2">
							<Button
								className="w-full bg-[#FF1F8A] hover:bg-[#FF1F8A]/90 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(255,31,138,0.3)] transition-all duration-300"
								onClick={() => {
									window.open(selectedTrack?.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'), '_blank')
								}}
							>
								Open Audio File
							</Button>
							<div className="flex gap-2">
								<Button
									variant="outline"
									className="flex-1 border-white/10 hover:bg-white/5 text-[10px] uppercase font-bold text-white/60"
									onClick={() => {
										window.open(`${EXPLORER_URL}/nft/${CONTRACT_ADDRESS}/${selectedTrack?.token_id}`, '_blank')
									}}
								>
									View Provenance
								</Button>
								{selectedTrack?.tx_hash && (
									<Button
										variant="outline"
										className="flex-1 border-white/10 hover:bg-white/5 text-[10px] uppercase font-bold text-white/60"
										onClick={() => {
											window.open(`${EXPLORER_URL}/tx/${selectedTrack.tx_hash}`, '_blank')
										}}
									>
										Original Publish
									</Button>
								)}
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
