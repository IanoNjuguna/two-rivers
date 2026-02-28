'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { IconPlayerPlay, IconPlayerPause, IconArrowLeft, IconShare, IconCopy, IconShoppingBag, IconLoader2, IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { CONTRACT_ABI, ERC20_ABI, getAddressesForChain } from '@/lib/web3'
import { useChainId, useWalletClient, usePublicClient, useAccount } from 'wagmi'
import { encodeFunctionData, parseUnits } from 'viem'
import { toast } from 'sonner'
import sdk from '@farcaster/miniapp-sdk'

const CHAIN_BADGE: Record<string, { logo: string; label: string }> = {
	'42161': { logo: '/images/arbitrum.png', label: 'Arbitrum' },
	'8453': { logo: '/images/base.png', label: 'Base' },
	'43114': { logo: '/images/avalanche.png', label: 'Avalanche' },
}

const API_URL = '/api-backend'

interface Track {
	token_id: number
	name: string
	artist: string
	image_url: string
	audio_url: string
	genre?: string
	price?: string
	description?: string
	chain_id?: string
	max_supply?: string
	uploader_address?: string
}

export default function TrackDetailPage() {
	const params = useParams()
	const router = useRouter()
	const id = params?.id as string

	const [track, setTrack] = useState<Track | null>(null)
	const [loading, setLoading] = useState(true)
	const [isPlaying, setIsPlaying] = useState(false)
	const [isMinting, setIsMinting] = useState(false)
	const [hasOwned, setHasOwned] = useState(false)
	const audioRef = React.useRef<HTMLAudioElement | null>(null)

	const chainId = useChainId()
	const { data: walletClient } = useWalletClient()
	const publicClient = usePublicClient()
	const { address } = useAccount()
	const effectiveAddress = address

	const {
		usdc: CURRENT_USDC,
		contract: CURRENT_CONTRACT,
		explorer: EXPLORER_URL
	} = getAddressesForChain(chainId || 42161)

	const activeClient = publicClient

	// Fetch track data
	useEffect(() => {
		if (!id) return
		const fetchTrack = async () => {
			try {
				const res = await fetch(`${API_URL.replace(/\/$/, '')}/tracks/${id}`)
				if (res.ok) {
					const data = await res.json()
					setTrack(data)
				}
			} catch (e) {
				console.error('Failed to fetch track', e)
			} finally {
				setLoading(false)
			}
		}
		fetchTrack()
	}, [id])

	// Check ownership
	useEffect(() => {
		if (!effectiveAddress || !activeClient || !track) return
		const check = async () => {
			try {
				const balance = await activeClient.readContract({
					address: CURRENT_CONTRACT as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'balanceOf',
					args: [effectiveAddress as `0x${string}`, BigInt(track.token_id)],
				}) as bigint
				setHasOwned(balance > 0n)
			} catch (e) {
				console.error('Error checking ownership', e)
			}
		}
		check()
	}, [effectiveAddress, activeClient, track])

	const resolveIpfs = (url: string) =>
		(url || '').replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/')

	const togglePlay = () => {
		if (!audioRef.current || !track) return
		if (isPlaying) {
			audioRef.current.pause()
		} else {
			audioRef.current.src = resolveIpfs(track.audio_url)
			audioRef.current.play()
		}
		setIsPlaying(!isPlaying)
	}

	const handleMint = async () => {
		if (!effectiveAddress) {
			toast.error("Please connect your wallet first")
			return
		}
		if (!track) return

		const priceInUnits = track.price ? parseUnits(track.price, 6) : 990000n
		setIsMinting(true)
		const mainToast = toast.loading(`Minting "${track.name}"...`)

		try {
			// Check allowance
			const allowance = await activeClient!.readContract({
				address: CURRENT_USDC as `0x${string}`,
				abi: ERC20_ABI,
				functionName: 'allowance',
				args: [effectiveAddress as `0x${string}`, CURRENT_CONTRACT as `0x${string}`],
			}) as bigint

			// Approve if needed
			if (allowance < priceInUnits && walletClient) {
				toast.info("Approving USDC for purchase...", { id: mainToast })
				const approveData = encodeFunctionData({
					abi: ERC20_ABI,
					functionName: 'approve',
					args: [CURRENT_CONTRACT as `0x${string}`, 1000000000000n],
				})
				const tx = await walletClient.sendTransaction({
					to: CURRENT_USDC as `0x${string}`,
					data: approveData,
				})
				await publicClient?.waitForTransactionReceipt({ hash: tx })
			}

			// Mint
			toast.loading(`Confirming purchase...`, { id: mainToast })
			const mintData = encodeFunctionData({
				abi: CONTRACT_ABI,
				functionName: 'mint',
				args: [BigInt(track.token_id)],
			})

			if (walletClient) {
				const tx = await walletClient.sendTransaction({
					to: CURRENT_CONTRACT as `0x${string}`,
					data: mintData,
				})
				const receipt = await publicClient?.waitForTransactionReceipt({ hash: tx })
				const txReceipt = receipt?.transactionHash || tx

				setHasOwned(true)
				toast.success(
					<div className="flex flex-col gap-1">
						<p className="font-bold">"{track.name}" collected!</p>
						<a
							href={`${EXPLORER_URL}/tx/${txReceipt}`}
							target="_blank"
							className="text-[10px] text-cyber-pink hover:underline"
						>
							View Transaction
						</a>
					</div>,
					{ id: mainToast }
				)
			}
		} catch (error: any) {
			let errorMessage = error.message || "Minting failed"
			if (errorMessage.includes("Already Collected")) {
				errorMessage = "You've already collected this track!"
				setHasOwned(true)
			} else if (errorMessage.includes("transfer amount exceeds balance")) {
				errorMessage = "Insufficient USDC balance."
			} else if (errorMessage.includes("User rejected")) {
				errorMessage = "Purchase canceled."
			}
			toast.error(errorMessage, { id: mainToast })
		} finally {
			setIsMinting(false)
		}
	}

	const handleShare = () => {
		const text = `Check out "${track?.name}" by ${track?.artist} on Doba! 🎵`
		const embedUrl = `https://doba.world`
		const warpcastIntentUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(embedUrl)}`
		const isIframe = window.self !== window.top
		if (isIframe) {
			try { sdk.actions.openUrl(warpcastIntentUrl) } catch { window.open(warpcastIntentUrl, '_blank') }
		} else {
			window.open(warpcastIntentUrl, '_blank')
		}
	}

	const handleCopyLink = () => {
		navigator.clipboard.writeText(`https://doba.world`)
		toast.success('Link copied to clipboard!')
	}

	const formatPrice = (p?: string) => {
		const v = p ? parseFloat(p) : 0.99
		if (v === 0) return 'FREE'
		if (v < 1) return `${Math.round(v * 100)}¢`
		return `$${v.toFixed(2)}`
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0D0D12] flex items-center justify-center">
				<IconLoader2 size={32} className="animate-spin text-cyber-pink" />
			</div>
		)
	}

	if (!track) {
		return (
			<div className="min-h-screen bg-[#0D0D12] flex flex-col items-center justify-center gap-4">
				<p className="text-white/40">Track not found</p>
				<button onClick={() => router.back()} className="text-cyber-pink text-sm underline">Go back</button>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-[#0D0D12] text-white">
			<audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

			{/* Hero Section */}
			<div className="relative w-full aspect-square max-h-[60vh] overflow-hidden">
				<img
					src={resolveIpfs(track.image_url)}
					alt={track.name}
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/40 to-transparent" />

				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="absolute top-4 left-4 z-20 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white transition-colors"
				>
					<IconArrowLeft size={20} />
				</button>

				{/* Chain Badge */}
				{track.chain_id && CHAIN_BADGE[track.chain_id] && (
					<div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
						<img
							src={CHAIN_BADGE[track.chain_id].logo}
							alt={CHAIN_BADGE[track.chain_id].label}
							className="w-4 h-4 rounded-full"
						/>
						<span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{CHAIN_BADGE[track.chain_id].label}</span>
					</div>
				)}

				{/* Play Button */}
				<button
					onClick={togglePlay}
					className="absolute bottom-6 right-6 z-20 bg-cyber-pink hover:bg-cyber-pink/90 text-white p-4 rounded-full shadow-[0_0_30px_rgba(255,31,138,0.5)] transition-transform hover:scale-105 active:scale-95"
				>
					{isPlaying ? <IconPlayerPause size={24} className="fill-white" /> : <IconPlayerPlay size={24} className="fill-white" />}
				</button>
			</div>

			{/* Content Section */}
			<div className="px-5 pb-32 -mt-4 relative z-10">
				{/* Title & Artist */}
				<div className="mb-6">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-[9px] font-bold text-cyber-pink bg-cyber-pink/10 border border-cyber-pink/20 px-2 py-0.5 uppercase tracking-widest rounded-sm">
							{track.genre || 'RARE'}
						</span>
						<span className="text-[9px] font-bold text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 uppercase tracking-widest rounded-sm">
							#{track.token_id}
						</span>
					</div>
					<h1 className="text-2xl font-bold mt-2">{track.name}</h1>
					<p className="text-sm text-white/50 uppercase tracking-wider mt-1">{track.artist}</p>
				</div>

				{/* Price & Collect */}
				<div className="space-y-3 mb-6">
					<div className="flex items-center justify-between">
						<span className="text-lg font-bold text-cyber-pink">{formatPrice(track.price)}</span>
						{track.max_supply && (
							<span className="text-[10px] text-white/30 font-mono">{track.max_supply} editions</span>
						)}
					</div>

					<button
						onClick={handleMint}
						disabled={isMinting || hasOwned}
						className={cn(
							"w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm",
							hasOwned
								? "bg-green-500/10 text-green-400 border border-green-500/20 cursor-default"
								: "bg-[#B794F4] hover:bg-[#B794F4]/80 text-white border border-[#B794F4]/20",
							isMinting && "opacity-50 cursor-not-allowed"
						)}
					>
						{isMinting ? (
							<IconLoader2 size={16} className="animate-spin" />
						) : hasOwned ? (
							<IconCheck size={16} />
						) : (
							<IconShoppingBag size={16} />
						)}
						{isMinting ? 'Minting...' : hasOwned ? 'Collected' : 'Collect Song'}
					</button>

					<div className="flex items-center gap-2">
						<button
							onClick={handleShare}
							className="flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-sm"
						>
							<IconShare size={14} />
							Share
						</button>
						<button
							onClick={handleCopyLink}
							title="Copy Link"
							className="px-4 py-2.5 flex items-center justify-center transition-all bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-sm"
						>
							<IconCopy size={14} />
						</button>
					</div>
				</div>

				{/* Description */}
				{track.description && (
					<div className="border-t border-white/5 pt-5">
						<h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">About</h2>
						<p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{track.description}</p>
					</div>
				)}
			</div>
		</div>
	)
}
