'use client'

import { logger } from '@/lib/logger'

import React from 'react'
import { IconPlayerPlay, IconMusic, IconLoader2, IconShoppingBag, IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { CONTRACT_ABI, ERC20_ABI, getAddressesForChain } from '@/lib/web3'
import { useChainId } from "wagmi"
import { encodeFunctionData, parseUnits } from 'viem'
import { toast } from 'sonner'

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
  '42161': { logo: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg', label: 'Arbitrum' },
  '8453': { logo: 'https://icons.llamao.fi/icons/chains/rsz_base.jpg', label: 'Base' },
  '43114': { logo: 'https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg', label: 'Avalanche' },
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
  const {
    usdc: CURRENT_USDC,
    contract: CURRENT_CONTRACT,
    explorer: EXPLORER_URL
  } = getAddressesForChain(chainId || 42161)
  const [isMinting, setIsMinting] = React.useState(false)
  const [hasOwned, setHasOwned] = React.useState(false)

  // Check ownership
  const checkOwnership = React.useCallback(async () => {
    if (!client || !client.account) return
    try {
      const balance = await client.readContract({
        address: CURRENT_CONTRACT as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [client.account.address, BigInt(tokenId)],
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
    if (!client) {
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
      const nativeBalance = await client.getBalance({ address: client.account.address })
      if (nativeBalance < parseUnits("0.0001", 18)) { // Rough estimate for a mint
        toast.error(
          `Insufficient native balance for gas. Please fund your Wallet: ${client.account.address}`,
          { id: mainToast, duration: 8000 }
        )
        setIsMinting(false)
        return
      }

      // 1. Check Allowance

      const allowance = await client.readContract({
        address: CURRENT_USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [client.account.address, CURRENT_CONTRACT as `0x${string}`],
      }) as bigint

      // 2. Approve if needed
      if (allowance < priceInUnits) {
        toast.info("Approving USDC for purchase...", { id: mainToast })
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CURRENT_CONTRACT as `0x${string}`, 1000000000000n], // High allowance for better UX
        })

        const { hash: approveHash } = await client.sendUserOperation({
          uo: { target: CURRENT_USDC as `0x${string}`, data: approveData }
        })
        await client.waitForUserOperationTransaction({ hash: approveHash })
      }

      // 3. Mint
      toast.loading(`Confirming purchase...`, { id: mainToast })
      const mintData = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [BigInt(tokenId)],
      })

      const { hash: mintHash } = await client.sendUserOperation({
        uo: { target: CURRENT_CONTRACT as `0x${string}`, data: mintData }
      })

      const txReceipt = await client.waitForUserOperationTransaction({ hash: mintHash })

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

  return (
    <div className="group relative flex flex-col bg-white/[0.03] border border-white/5 hover:border-cyber-pink/30 transition-all duration-300">
      {/* Angular Corner Tag */}
      <div className="absolute top-0 right-0 z-20">
        <div className="bg-cyber-pink text-[8px] font-bold px-2 py-0.5 text-white tracking-widest uppercase clip-tag">
          {genre || 'RARE'}
        </div>
      </div>

      {/* Cover Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white/5">
        <img
          src={imageUrl.replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/')}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay with Glossy effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-transparent opacity-60" />

        {/* Chain Badge */}
        {trackChainId && CHAIN_BADGE[trackChainId] && (
          <div className="absolute bottom-2 left-2 z-10" title={CHAIN_BADGE[trackChainId].label}>
            <img
              src={CHAIN_BADGE[trackChainId].logo}
              alt={CHAIN_BADGE[trackChainId].label}
              className="w-5 h-5 rounded-full ring-1 ring-white/20 shadow-md"
            />
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={onPlay}
            aria-label={`Play ${name}`}
            className="bg-cyber-pink hover:bg-cyber-pink/90 text-white p-4 shadow-[0_0_20px_rgba(255,31,138,0.4)] transition-transform hover:scale-110 clip-hex-btn"
          >
            <IconPlayerPlay size={24} className="fill-white" />
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-1 bg-gradient-to-b from-transparent to-white/[0.02]">
        <h3 className="font-bold text-sm text-white truncate group-hover:text-cyber-pink transition-colors">
          {name}
        </h3>
        <p className="text-xs text-white/40 font-medium truncate uppercase tracking-tighter">
          {artist}
        </p>

        <div className="pt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/20">
              <IconMusic size={12} />
              <span className="text-[10px] font-mono">#{tokenId}</span>
            </div>
            <div className="text-[10px] text-cyber-pink font-bold border border-cyber-pink/20 px-1.5 py-0.5">
              USDC {price || '0.99'}
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={isMinting || hasOwned}
            className={cn(
              "w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all",
              hasOwned
                ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                : "bg-[#B794F4]/10 hover:bg-[#B794F4] text-[#B794F4] hover:text-white border border-[#B794F4]/20",
              isMinting && "opacity-50 cursor-not-allowed"
            )}
          >
            {isMinting ? (
              <IconLoader2 size={14} className="animate-spin" />
            ) : hasOwned ? (
              <IconCheck size={14} />
            ) : (
              <IconShoppingBag size={14} />
            )}
            {isMinting ? 'Minting...' : hasOwned ? 'Collected' : 'Collect Song'}
          </button>
        </div>
      </div>

      {/* Aesthetic Border Bottom */}
      <div className="h-0.5 w-full bg-white/5 group-hover:bg-cyber-pink transition-colors duration-300" />
    </div>
  )
}
