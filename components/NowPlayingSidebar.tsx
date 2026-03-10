'use client'

import React from 'react'
import { IconX, IconMicrophone, IconExternalLink, IconShare, IconCopy, IconHeart, IconCheck, IconLoader2 } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { getAddressesForChain, CONTRACT_ABI, ERC20_ABI } from '@/lib/web3'
import { useChainId, usePublicClient, useAccount, useWriteContract } from 'wagmi'
import { cn } from '@/lib/utils'
import { parseUnits, encodeFunctionData } from 'viem'
import { toast } from 'sonner'
import { useAudio } from '@/components/AudioProvider'

interface NowPlayingSidebarProps {
	track: any | null
	isVisible: boolean
	onClose: () => void
}

export default function NowPlayingSidebar({ track, isVisible, onClose }: NowPlayingSidebarProps) {
	const chainId = useChainId()
	const { address } = useAccount()
	const publicClient = usePublicClient()
	const { writeContractAsync } = useWriteContract()
	const { contract: CONTRACT_ADDRESS, explorer: EXPLORER_URL, usdc: USDC_ADDRESS } = getAddressesForChain(chainId || 84532)

	const [mintData, setMintData] = React.useState<{ minted: number, max: number }>({ minted: 0, max: 0 })
	const [hasOwned, setHasOwned] = React.useState(false)
	const [isMinting, setIsMinting] = React.useState(false)

	const fetchMintData = React.useCallback(async () => {
		const tokenId = track?.id !== undefined ? track.id : track?.token_id
		if (!publicClient || !track || tokenId === undefined) return
		try {
			const [minted, collectionInfo] = await Promise.all([
				publicClient.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'collectionMinted',
					args: [BigInt(tokenId)],
				}),
				publicClient.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'collections',
					args: [BigInt(tokenId)],
				})
			])
			setMintData({ minted: Number(minted), max: Number(collectionInfo[4]) })

			if (address) {
				const balance = await publicClient.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'balanceOf',
					args: [address as `0x${string}`, BigInt(tokenId)],
				})
				setHasOwned(Number(balance) > 0)
			}
		} catch (err) {
			console.error('Sidebar: Error fetching mint data', err)
		}
	}, [publicClient, track, CONTRACT_ADDRESS, address])

	React.useEffect(() => {
		fetchMintData()
	}, [fetchMintData])

	const handleMint = async () => {
		if (!address || !track) {
			toast.error("Please connect your wallet")
			return
		}

		const priceInUnits = track.price ? parseUnits(track.price, 6) : 990000n
		setIsMinting(true)
		const mainToast = toast.loading(`Collecting "${track.name || track.title}"...`)

		try {
			if (!publicClient) throw new Error("Public client not found")

			const allowance = await publicClient.readContract({
				address: USDC_ADDRESS as `0x${string}`,
				abi: ERC20_ABI,
				functionName: 'allowance',
				args: [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
			}) as bigint

			if (allowance < priceInUnits) {
				toast.info("Approving USDC...", { id: mainToast })
				const tx = await writeContractAsync({
					address: USDC_ADDRESS as `0x${string}`,
					abi: ERC20_ABI,
					functionName: 'approve',
					args: [CONTRACT_ADDRESS as `0x${string}`, 1000000000000n],
				})
				await publicClient.waitForTransactionReceipt({ hash: tx })
			}

			toast.loading(`Confirming purchase...`, { id: mainToast })
			const tx = await writeContractAsync({
				address: CONTRACT_ADDRESS as `0x${string}`,
				abi: CONTRACT_ABI,
				functionName: 'mint',
				args: [BigInt(track.id || track.token_id)],
			})
			await publicClient.waitForTransactionReceipt({ hash: tx })

			setHasOwned(true)
			fetchMintData()
			toast.success(`"${track.name || track.title}" collected!`, { id: mainToast })
		} catch (error: any) {
			toast.error(error.message || "Collection failed", { id: mainToast })
		} finally {
			setIsMinting(false)
		}
	}

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: track.name || track.title,
				text: `Check out ${track.name || track.title} by ${track.artist || track.creator} on doba`,
				url: window.location.href,
			})
		} else {
			navigator.clipboard.writeText(window.location.href)
			toast.success("Link copied to clipboard!")
		}
	}

	const handleCopyLink = () => {
		const tokenId = track?.id !== undefined ? track.id : track?.token_id
		const shareUrl = `https://www.doba.world/track/${tokenId}`
		navigator.clipboard.writeText(shareUrl)
		toast.success("Track link copied!")
	}

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
		<aside className="fixed inset-0 z-[100] bg-[#0D0D12] lg:static lg:z-0 lg:flex flex-col lg:w-80 border-l border-white/[0.08] overflow-hidden animate-slide-in-right h-full border-t lg:border-t-0 border-white/[0.08]">
			<div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 relative pb-[120px]">
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

					{/* Price & Mint Info */}
					<div className="space-y-2 pt-2">
						<div className="flex items-center justify-between">
							<span className="text-cyber-pink font-bold text-lg">99¢</span>
							<span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
								{mintData.max === 0
									? `${mintData.minted} Collected`
									: `${mintData.minted} / ${mintData.max} Edition`}
							</span>
						</div>
						<div className="h-[2px] w-full bg-white/5 relative overflow-hidden">
							<div
								className="absolute inset-y-0 left-0 bg-cyber-pink transition-all duration-1000"
								style={{ width: mintData.max === 0 ? '100%' : `${(mintData.minted / (mintData.max || 1)) * 100}%` }}
							/>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2 pt-2">
						<Button
							className={cn(
								"flex-1 h-12 rounded-none font-bold uppercase tracking-widest text-xs transition-all duration-300",
								hasOwned
									? "bg-[#1DB954]/10 border border-[#1DB954]/20 text-[#1DB954] hover:bg-[#1DB954]/20"
									: "bg-cyber-pink hover:bg-cyber-pink/90 text-black"
							)}
							onClick={!hasOwned && !isMinting ? handleMint : undefined}
							disabled={isMinting}
						>
							{isMinting ? (
								<IconLoader2 size={16} className="animate-spin mr-2" />
							) : hasOwned ? (
								<IconCheck size={16} className="mr-2" />
							) : null}
							{hasOwned ? 'Collected' : 'Collect'}
						</Button>

						<Button
							variant="outline"
							className="w-12 h-12 p-0 border-white/10 hover:bg-white/5 rounded-none"
							onClick={handleShare}
							title="Share"
						>
							<IconShare size={18} className="text-white/60" />
						</Button>

						<Button
							variant="outline"
							className="w-12 h-12 p-0 border-white/10 hover:bg-white/5 rounded-none"
							onClick={handleCopyLink}
							title="Copy Link"
						>
							<IconCopy size={18} className="text-white/60" />
						</Button>
					</div>

					{/* Lyrics Section */}
					{(track.description || track.lyrics) && (
						<div className="space-y-3 pt-6 border-t border-white/5">
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
						className="w-full bg-[#B794F4] hover:bg-[#B794F4]/90 text-black font-bold py-6 rounded-none transition-all duration-300"
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
							Provenance
						</Button>
					)}
				</div>
			</div>
		</aside>
	)
}
