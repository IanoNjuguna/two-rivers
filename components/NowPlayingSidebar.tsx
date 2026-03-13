'use client'

import React from 'react'
import { IconX, IconMicrophone, IconExternalLink, IconShare, IconCopy, IconHeart, IconSquareCheckFilled, IconLoader2 } from '@tabler/icons-react'
import { DobaVisualizer } from '@/components/icons/DobaVisualizer'
import { Button } from '@/components/ui/button'
import { getAddressesForChain, CONTRACT_ABI, ERC20_ABI, CHAIN_ID, publicClients } from '@/lib/web3'
import { useChainId, usePublicClient, useAccount, useWriteContract } from 'wagmi'
import { cn } from '@/lib/utils'
import { parseUnits, encodeFunctionData } from 'viem'
import { toast } from 'sonner'
import { useAudio } from '@/components/AudioProvider'
import { IconPlayerPlay as Play, IconPlayerPause as Pause, IconPlayerSkipBack as SkipBack, IconPlayerSkipForward as SkipForward } from '@tabler/icons-react'

const formatTokenId = (id: string | number) => {
	const s = String(id)
	if (s.length <= 10) return s
	return `${s.slice(0, 4)}...${s.slice(-4)}`
}

interface NowPlayingSidebarProps {
	track: any | null
	isVisible: boolean
	onClose: () => void
}

export default function NowPlayingSidebar({ track, isVisible, onClose }: NowPlayingSidebarProps) {
	const chainId = useChainId()
	const { playerState, effectiveAddress, isAuthenticated, getValidToken } = useAudio()
	const publicClient = usePublicClient({ chainId: CHAIN_ID })
	const { writeContractAsync } = useWriteContract()
	const { contract: CONTRACT_ADDRESS, explorer: EXPLORER_URL, usdc: USDC_ADDRESS } = getAddressesForChain(CHAIN_ID)

	const {
		isPlaying,
		duration,
		currentTime,
		togglePlayPause,
		next,
		previous,
		seek,
		audioRef
	} = playerState

	const [mintData, setMintData] = React.useState<{ minted: number, max: number }>({ minted: 0, max: 0 })
	const [hasOwned, setHasOwned] = React.useState(track?.is_owned ?? false)
	const [isMinting, setIsMinting] = React.useState(false)

	const fetchMintData = React.useCallback(async () => {
		const tokenId = track?.id !== undefined ? track.id : track?.token_id
		const readClient = publicClients[CHAIN_ID] || publicClient
		if (!readClient || !track || tokenId === undefined) return
		try {
			const [minted, collectionInfo] = await Promise.all([
				readClient.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'collectionMinted',
					args: [BigInt(tokenId)],
				}),
				readClient.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'collections',
					args: [BigInt(tokenId)],
				})
			])
			setMintData({ minted: Number(minted), max: Number(collectionInfo[3]) })

			if (effectiveAddress) {
				const balance = await readClient.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'balanceOf',
					args: [effectiveAddress as `0x${string}`, BigInt(tokenId)],
				})
				setHasOwned(Number(balance) > 0)
			}
		} catch (err) {
			console.error('Sidebar: Error fetching mint data', err)
		}
	}, [publicClient, track, CONTRACT_ADDRESS, effectiveAddress])

	React.useEffect(() => {
		fetchMintData()
	}, [fetchMintData])

	const handleMint = async () => {
		if (!isAuthenticated || !effectiveAddress || !track) {
			toast.error("Please connect your wallet")
			return
		}

		const priceInUnits = track.price ? parseUnits(track.price, 6) : 500000n
		setIsMinting(true)
		const mainToast = toast.loading(`Collecting "${track.name || track.title}"...`)

		try {
			if (!publicClient) throw new Error("Public client not found")

			// Check Native Balance for Gas
			const nativeBalance = await publicClient.getBalance({ address: effectiveAddress as `0x${string}` })
			if (nativeBalance < parseUnits("0.0001", 18)) {
				toast.error(
					`Insufficient native balance for gas. Please fund your Wallet: ${effectiveAddress}`,
					{ id: mainToast, duration: 8000 }
				)
				setIsMinting(false)
				return
			}

			const allowance = await publicClient.readContract({
				address: USDC_ADDRESS as `0x${string}`,
				abi: ERC20_ABI,
				functionName: 'allowance',
				args: [effectiveAddress as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
			}) as bigint

			if (allowance < priceInUnits) {
				toast.info("Approving USDC...", { id: mainToast })
				const tx = await writeContractAsync({
					address: USDC_ADDRESS as `0x${string}`,
					abi: ERC20_ABI,
					functionName: 'approve',
					args: [CONTRACT_ADDRESS as `0x${string}`, priceInUnits],
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

			// Record mint in backend
			try {
				const authData = localStorage.getItem('doba_auth_data')
				if (authData && authData !== 'null') {
					const parsedAuth = JSON.parse(authData)
					if (parsedAuth && parsedAuth.accessToken) {
						const { accessToken } = parsedAuth
						const tokenId = track.id !== undefined ? track.id : track.token_id
						await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mints`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${accessToken}`
							},
							body: JSON.stringify({
								track_id: tokenId,
								tx_hash: tx
							})
						})
					}
				}
			} catch (err) {
				console.error('Sidebar: Failed to record mint in backend', err)
			}
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

	const handleDownload = async () => {
		const tokenId = track?.id !== undefined ? track.id : track?.token_id

		if (!effectiveAddress || !hasOwned) {
			return
		}

		const mainToast = toast.loading(`Preparing download...`)

		try {
			const accessToken = await getValidToken()

			if (!accessToken) throw new Error("Authentication failed. Please try logging in again.")

			const response = await fetch(`/api-backend/songs/${tokenId}/download`, {
				headers: {
					'Authorization': `Bearer ${accessToken}`
				}
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: "Download failed" }))
				throw new Error(errorData.message || "Failed to download file")
			}

			const blob = await response.blob()

			const url = window.URL.createObjectURL(blob)

			// Create a temporary anchor element to trigger download
			const a = document.createElement('a')
			a.href = url
			a.download = `${track.artist || track.creator || 'Artist'} - ${track.name || track.title || 'Track'}.mp3`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			window.URL.revokeObjectURL(url)

			toast.success("Download started!", { id: mainToast })
		} catch (error: any) {
			toast.error(error.message || "Download failed", { id: mainToast })
		}
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

	const formatTime = (time: number) => {
		if (!time || isNaN(time) || time === Infinity) return '0:00'
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
	}

	const progressPercent = (duration > 0 && duration !== Infinity) ? (currentTime / duration) * 100 : 0

	const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
		const targetTime = percent * (duration || 0)
		if (duration && duration !== Infinity) {
			seek(targetTime)
		}
	}

	return (
		<aside className="fixed inset-0 z-[100] bg-[#0D0D12] flex flex-col lg:static lg:z-0 lg:w-80 border-l border-white/[0.08] overflow-hidden animate-slide-in-right h-[100dvh] lg:h-full border-t lg:border-t-0 border-white/[0.08]">
			<div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 relative pb-32">
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

				{/* Mobile Audio Controls */}
				<div className="lg:hidden space-y-6 pt-2">
					<div className="space-y-2">
						<div
							className="h-1.5 w-full bg-white/10 relative cursor-pointer group"
							onClick={handleProgressClick}
							role="slider"
							aria-label="Track Progress"
							aria-valuenow={Math.round(progressPercent)}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<div
								className="absolute inset-y-0 left-0 bg-cyber-pink transition-all h-full"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
						<div className="flex items-center justify-between text-[10px] text-white/40 tabular-nums font-bold uppercase tracking-widest">
							<span>{formatTime(currentTime)}</span>
							<span>{formatTime(duration)}</span>
						</div>
					</div>

					<div className="flex items-center justify-center gap-10">
						<button
							onClick={previous}
							className="p-2 text-white/60 active:text-white active:scale-95 transition-all"
							aria-label="Previous"
						>
							<SkipBack size={28} className="fill-white" />
						</button>

						<button
							onClick={togglePlayPause}
							className="w-14 h-14 bg-white text-black flex items-center justify-center active:scale-90 active:brightness-90 transition-all shadow-xl shadow-black/40"
							aria-label={isPlaying ? 'Pause' : 'Play'}
						>
							{isPlaying ? <Pause size={28} className="fill-black" /> : <Play size={28} className="fill-black ml-1" />}
						</button>

						<button
							onClick={next}
							className="p-2 text-white/60 active:text-white active:scale-95 transition-all"
							aria-label="Next"
						>
							<SkipForward size={28} className="fill-white" />
						</button>
					</div>
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
							{hasOwned ? (
								<div className="flex items-center gap-1.5 text-[#1DB954]">
									<IconSquareCheckFilled size={18} />
								</div>
							) : (
								<span className="text-cyber-pink font-bold text-lg">50¢</span>
							)}
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
									: (mintData.max > 0 && mintData.minted >= mintData.max)
										? "bg-white/5 border border-white/10 cursor-not-allowed disabled:opacity-100"
										: "bg-[#B794F4] hover:bg-[#A080E0] text-black"
							)}
							onClick={!hasOwned && !isMinting && !(mintData.max > 0 && mintData.minted >= mintData.max) ? handleMint : undefined}
							disabled={isMinting || (mintData.max > 0 && mintData.minted >= mintData.max)}
						>
							{isMinting ? (
								<IconLoader2 size={16} className="animate-spin mr-2" />
							) : hasOwned ? (
								<IconSquareCheckFilled size={16} className="mr-2" />
							) : (mintData.max > 0 && mintData.minted >= mintData.max) ? (
								<DobaVisualizer size={16} className="mr-2 text-[#FF1F8A]" />
							) : null}
							{hasOwned ? 'Collected' : (mintData.max > 0 && mintData.minted >= mintData.max) ? <span className="text-lavender">Sold Out</span> : 'Collect'}
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
							<p className="text-white text-sm">{track.genre || 'RARE'}</p>
						</div>
						{track.token_id !== undefined && (
							<div>
								<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Token ID</p>
								<p className="text-white text-sm font-mono">#{formatTokenId(track.token_id)}</p>
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-3 pt-6">
					<Button
						className={cn(
							"w-full font-bold py-6 rounded-none transition-all duration-300",
							hasOwned
								? "bg-[#B794F4] hover:bg-[#B794F4]/90 text-black"
								: "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
						)}
						onClick={hasOwned ? handleDownload : undefined}
						disabled={!hasOwned}
					>
						{hasOwned ? 'Download' : 'Collect to Download'}
					</Button>

					{(() => {
						const tokenId = track.id !== undefined ? track.id : track.token_id;
						if (tokenId === undefined) return null;
						return (
							<Button
								variant="outline"
								className="w-full border-white/10 hover:bg-white/5 text-[10px] uppercase font-bold text-white/60 tracking-widest py-4 rounded-none h-auto"
								onClick={() => {
									window.open(`${EXPLORER_URL}/nft/${CONTRACT_ADDRESS}/${tokenId}`, '_blank')
								}}
							>
								<IconExternalLink size={14} className="mr-2" />
								Provenance
							</Button>
						);
					})()}
				</div>
			</div>
		</aside>
	)
}
