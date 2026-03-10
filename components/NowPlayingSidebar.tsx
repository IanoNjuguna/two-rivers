'use client'

import React from 'react'
import { IconX, IconMicrophone, IconExternalLink } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { getAddressesForChain } from '@/lib/web3'
import { useChainId } from 'wagmi'
import { cn } from '@/lib/utils'

interface NowPlayingSidebarProps {
	track: any | null
	isVisible: boolean
	onClose: () => void
}

export default function NowPlayingSidebar({ track, isVisible, onClose }: NowPlayingSidebarProps) {
	const chainId = useChainId()
	const { contract: CONTRACT_ADDRESS, explorer: EXPLORER_URL } = getAddressesForChain(chainId || 84532)

	React.useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', handleEsc)
		return () => window.removeEventListener('keydown', handleEsc)
	}, [onClose])

	if (!isVisible || !track) return null

	const imageUrl = (track.image_url || track.cover || '').replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
	const audioUrl = track.streaming_url || (track.audio_url || track.url || '').replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')

	return (
		<aside className="hidden lg:flex flex-col w-80 border-l border-white/[0.08] bg-[#0D0D12] overflow-hidden animate-slide-in-right h-full border-t border-white/[0.08]">
			<div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 relative">
				{/* Top Label & Close Button */}
				<div className="flex items-center justify-between mb-2">
					<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Explore</p>
					<button
						onClick={onClose}
						className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
						title="Close"
					>
						<IconX size={16} />
					</button>
				</div>

				{/* Large Album Art */}
				<div className="aspect-square w-full rounded-none overflow-hidden border border-white/10 shadow-2xl group">
					<img
						src={imageUrl}
						alt={track.name || track.title}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				</div>

				{/* Track Info */}
				<div className="space-y-4">
					<div className="space-y-1">
						<h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
							{track.name || track.title}
						</h2>
						<div className="flex items-center gap-2 text-[#B794F4] font-bold">
							<IconMicrophone size={14} />
							<p className="text-sm uppercase tracking-widest">{track.artist || track.creator}</p>
						</div>
					</div>

					{/* Lyrics Section */}
					{(track.description || track.lyrics) && (
						<div className="space-y-3 pt-4 border-t border-white/5">
							<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Lyrics</p>
							<div className="bg-white/[0.03] p-4 border border-white/5 rounded-none">
								<p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
									{track.description || track.lyrics}
								</p>
							</div>
						</div>
					)}

					{/* Blockchain Info */}
					<div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
						<div>
							<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Genre</p>
							<p className="text-white text-sm">{track.genre || 'Ambient'}</p>
						</div>
						{track.token_id !== undefined && (
							<div>
								<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Token ID</p>
								<p className="text-white text-sm font-mono">#{track.token_id}</p>
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-3 pt-6">
					<Button
						className="w-full bg-[#FF1F8A] hover:bg-[#FF1F8A]/90 text-white font-bold py-6 rounded-none shadow-[0_0_20px_rgba(255,31,138,0.2)] transition-all duration-300"
						onClick={() => window.open(audioUrl, '_blank')}
					>
						Open Original File
					</Button>

					{track.token_id !== undefined && (
						<Button
							variant="outline"
							className="w-full border-white/10 hover:bg-white/5 text-[10px] uppercase font-bold text-white/60 tracking-widest py-4 rounded-none h-auto"
							onClick={() => {
								window.open(`${EXPLORER_URL}/nft/${CONTRACT_ADDRESS}/${track.token_id}`, '_blank')
							}}
						>
							<IconExternalLink size={14} className="mr-2" />
							View Provenance
						</Button>
					)}
				</div>
			</div>
		</aside>
	)
}
