'use client'

import { logger } from '@/lib/logger'

import React from 'react'
import { IconPlayerPlay, IconMusic, IconLoader2, IconHeart, IconCheck, IconShare, IconCopy } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { CONTRACT_ABI, ERC20_ABI, getAddressesForChain } from '@/lib/web3'
import { useChainId, useWalletClient, usePublicClient, useAccount } from "wagmi"
import { encodeFunctionData, parseUnits } from 'viem'
import { toast } from 'sonner'
import sdk from '@farcaster/miniapp-sdk'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

interface SongCardProps {
  tokenId: number
  name: string
  artist: string
  imageUrl: string
  audioUrl: string
  genre?: string
  price?: string
  client?: any
  trackChainId?: string
  onPlay?: () => void
}

const CHAIN_BADGE: Record<string, { logo: string; label: string }> = {
  '42161': { logo: '/images/arbitrum.png', label: 'Arbitrum' },
  '8453': { logo: '/images/base.png', label: 'Base' },
  '43114': { logo: '/images/avalanche.png', label: 'Avalanche' },
}

export default function SongCard({
  tokenId,
  name,
  artist,
  imageUrl,
  audioUrl,
  genre,
  price,
  client,
  trackChainId,
  onPlay,
}: SongCardProps) {
  const chainId = useChainId()
  const router = useRouter()
  const locale = useLocale()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { address } = useAccount()

  // Standardize the active address
  const effectiveAddress = client?.account?.address || address

  const {
    usdc: CURRENT_USDC,
    contract: CURRENT_CONTRACT,
    explorer: EXPLORER_URL
  } = getAddressesForChain(chainId || 42161)

  const [isMinting, setIsMinting] = React.useState(false)
  const [hasOwned, setHasOwned] = React.useState(false)

  // Determine active reader for contracts
  const activeClient = client || publicClient

  // Check ownership
  const checkOwnership = React.useCallback(async () => {
    if (!effectiveAddress || !activeClient) return
    try {
      const balance = await activeClient.readContract({
        address: CURRENT_CONTRACT as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [effectiveAddress as `0x${string}`, BigInt(tokenId)],
      }) as bigint
      setHasOwned(balance > 0n)
      return balance > 0n
    } catch (e) {
      logger.error('Error checking ownership', e)
      return false
    }
  }, [client, tokenId])

  React.useEffect(() => {
    checkOwnership()
  }, [checkOwnership])

  const handleMint = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!effectiveAddress) {
      toast.error("Please connect your wallet first")
      return
    }

    // Double check locally first
    const currentlyOwned = await checkOwnership()
    if (currentlyOwned || hasOwned) {
      toast.info("You already own this track! Check your library.")
      return
    }

    const priceInUnits = price ? parseUnits(price, 6) : 990000n // Default to 0.99 for legacy
    setIsMinting(true)
    const mainToast = toast.loading(`Minting "${name}"...`)

    try {
      // 0. Check Native Balance for Gas
      let nativeBalance = 0n;
      if (client) {
        nativeBalance = await client.getBalance({ address: effectiveAddress as `0x${string}` })
      } else if (publicClient) {
        nativeBalance = await publicClient.getBalance({ address: effectiveAddress as `0x${string}` })
      }

      if (nativeBalance < parseUnits("0.0001", 18)) { // Rough estimate for a mint
        toast.error(
          `Insufficient native balance for gas. Please fund your Wallet: ${effectiveAddress}`,
          { id: mainToast, duration: 8000 }
        )
        setIsMinting(false)
        return
      }

      // 1. Check Allowance
      const allowance = await activeClient.readContract({
        address: CURRENT_USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [effectiveAddress as `0x${string}`, CURRENT_CONTRACT as `0x${string}`],
      }) as bigint

      // 2. Approve if needed
      if (allowance < priceInUnits) {
        toast.info("Approving USDC for purchase...", { id: mainToast })
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CURRENT_CONTRACT as `0x${string}`, 1000000000000n], // High allowance for better UX
        })

        if (client) {
          const { hash: approveHash } = await client.sendUserOperation({
            uo: { target: CURRENT_USDC as `0x${string}`, data: approveData }
          })
          await client.waitForUserOperationTransaction({ hash: approveHash })
        } else if (walletClient) {
          const tx = await walletClient.sendTransaction({
            to: CURRENT_USDC as `0x${string}`,
            data: approveData
          })
          await publicClient?.waitForTransactionReceipt({ hash: tx })
        }
      }

      // 3. Mint
      toast.loading(`Confirming purchase...`, { id: mainToast })
      const mintData = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [BigInt(tokenId)],
      })

      let txReceipt;

      if (client) {
        const { hash: mintHash } = await client.sendUserOperation({
          uo: { target: CURRENT_CONTRACT as `0x${string}`, data: mintData }
        })
        txReceipt = await client.waitForUserOperationTransaction({ hash: mintHash })
      } else if (walletClient) {
        const tx = await walletClient.sendTransaction({
          to: CURRENT_CONTRACT as `0x${string}`,
          data: mintData
        })
        const receipt = await publicClient?.waitForTransactionReceipt({ hash: tx })
        txReceipt = receipt?.transactionHash || tx
      }

      // Update local state immediately
      setHasOwned(true)
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold">"{name}" collected!</p>
          <a
            href={`${EXPLORER_URL}/tx/${txReceipt}`}
            target="_blank"
            className="text-[10px] text-cyber-pink hover:underline flex items-center gap-1"
          >
            View Transaction Hash
          </a>
        </div>,
        { id: mainToast }
      )
    } catch (error: any) {
      logger.error('Mint Error', error)

      let errorMessage = error.message || "Minting failed"
      if (errorMessage.includes("Already Collected") || JSON.stringify(error).includes("Already Collected")) {
        errorMessage = "You've already collected this track! It should appear in your library soon."
        setHasOwned(true)
      } else if (errorMessage.includes("transfer amount exceeds balance")) {
        errorMessage = "Insufficient USDC balance to collect this song."
      } else if (errorMessage.includes("User rejected the request")) {
        errorMessage = "Purchase canceled."
      }

      toast.error(errorMessage, { id: mainToast })
    } finally {
      setIsMinting(false)
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = `Check out "${name}" by ${artist} on Doba! 🎵`
    const embedUrl = `https://doba.world` // We use root URL so Warpcast loads the frame correctly

    // Construct the Warpcast intent URL
    const warpcastIntentUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(embedUrl)}`

    const isIframe = window.self !== window.top

    if (isIframe) {
      try {
        // Try to open via SDK if we're inside the Mini App
        sdk.actions.openUrl(warpcastIntentUrl)
      } catch (error) {
        window.open(warpcastIntentUrl, '_blank')
      }
    } else {
      // Fast fallback to standard window open if definitely not in Farcaster context
      window.open(warpcastIntentUrl, '_blank')
    }
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    // For now, it copies the root. In the future, this could be a specific track route like /track/${tokenId}
    const url = `https://doba.world`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  const [showHeart, setShowHeart] = React.useState(false)
  const lastTapRef = React.useRef<number>(0)

  const handleDoubleTap = async (e: React.MouseEvent | React.TouchEvent) => {
    if (hasOwned) {
      toast('Collected', {
        position: 'top-center',
        duration: 1500,
        style: {
          background: 'rgba(255, 31, 138, 0.1)',
          color: '#FF1F8A',
          border: '1px solid rgba(255, 31, 138, 0.3)',
          backdropFilter: 'blur(8px)',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderRadius: '4px',
        }
      })
      return
    }
    if (isMinting) return

    // Visual feedback
    setShowHeart(true)
    setTimeout(() => setShowHeart(false), 800)

    // Trigger Mint
    handleMint(e as any)
  }

  const handleClick = (e: React.MouseEvent) => {
    // Single tap/click -> Play
    onPlay?.()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleDoubleTap(e)
    }
    lastTapRef.current = now
  }

  return (
    <div
      className="group relative aspect-square overflow-hidden bg-white/[0.03] border border-white/5 hover:border-cyber-pink/30 transition-all duration-300 cursor-pointer"
      onDoubleClick={handleDoubleTap}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      {/* Cover Image - fills entire square */}
      <img
        src={(imageUrl || '').replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/')}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Heart Pop Animation Overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center z-30 pointer-events-none transition-all duration-500",
        showHeart ? "opacity-100 scale-125" : "opacity-0 scale-75"
      )}>
        <IconHeart
          size={80}
          className="text-cyber-pink fill-cyber-pink drop-shadow-[0_0_30px_rgba(255,31,138,0.8)]"
        />
      </div>

      {/* Centered Play Action - appears on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        <div className="bg-cyber-pink/90 text-white p-3 rounded-full shadow-[0_0_20px_rgba(255,31,138,0.4)] transform transition-transform group-hover:scale-110">
          <IconPlayerPlay size={24} className="fill-white" />
        </div>
      </div>

      {/* Genre Tag - top right */}
      <div className="absolute top-0 right-0 z-20">
        <div className="bg-cyber-pink text-[8px] font-bold px-2 py-0.5 text-white tracking-widest uppercase clip-tag">
          {genre || 'RARE'}
        </div>
      </div>

      {/* Chain Badge - top left */}
      {trackChainId && CHAIN_BADGE[trackChainId] && (
        <div className="absolute top-2 left-2 z-20" title={CHAIN_BADGE[trackChainId].label}>
          <img
            src={CHAIN_BADGE[trackChainId].logo}
            alt={CHAIN_BADGE[trackChainId].label}
            className="w-5 h-5 rounded-full ring-1 ring-white/20 shadow-md"
          />
        </div>
      )}

      {/* Price Badge */}
      <div className="absolute top-2 right-2 z-20 mt-5">
        <div className="text-[9px] text-white font-bold bg-black/60 backdrop-blur-sm border border-cyber-pink/30 px-1.5 py-0.5 rounded-sm">
          {(() => {
            const currentPrice = price ? parseFloat(price) : 0.99;
            if (currentPrice === 0) return 'FREE';
            if (currentPrice < 1) return `${Math.round(currentPrice * 100)}¢`;
            return `$${currentPrice.toFixed(2)}`;
          })()}
        </div>
      </div>

      {/* Bottom gradient overlay - always visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Title & Artist - always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
        <h3 className="font-bold text-sm text-white truncate drop-shadow-lg">
          {name}
        </h3>
        <p className="text-[10px] text-white/60 font-medium truncate uppercase tracking-wider mt-0.5">
          {artist}
        </p>
      </div>

      {/* Progress/Minting Overlay */}
      {isMinting && (
        <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
          <IconLoader2 size={32} className="text-cyber-pink animate-spin" />
          <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Minting...</span>
        </div>
      )}

      {/* Owned Badge */}
      {hasOwned && (
        <div className="absolute top-2 left-2 z-30 bg-green-500 text-white rounded-full p-1 shadow-lg">
          <IconCheck size={12} />
        </div>
      )}
    </div>
  )
}
