'use client'

import {
  IconPlayerPlay as Play,
  IconPlayerPause as Pause,
  IconPlayerSkipBack as SkipBack,
  IconPlayerSkipForward as SkipForward,
  IconVolume2,
  IconVolumeOff,
  IconArrowsShuffle,
  IconRepeat,
  IconRepeatOnce,
  IconShoppingBag,
  IconLoader2,
  IconCheck,
} from '@tabler/icons-react'
import { logger } from '@/lib/logger'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import type { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { CONTRACT_ABI, ERC20_ABI, getAddressesForChain } from '@/lib/web3'
import { useChainId, useWalletClient, usePublicClient, useAccount } from 'wagmi'
import { encodeFunctionData, parseUnits } from 'viem'
import { toast } from 'sonner'

interface AudioPlayerProps {
  playerState: ReturnType<typeof useAudioPlayer>
  client?: any // SmartAccountClient
}

export default function AudioPlayer({ playerState, client }: AudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    togglePlayPause,
    next,
    previous,
    seek,
    setDuration,
    setCurrentTime,
    audioRef,
  } = playerState

  // Web3 Hooks
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { address: wagmiAddress } = useAccount()
  const effectiveAddress = client?.account?.address || wagmiAddress

  const {
    usdc: CURRENT_USDC,
    contract: CURRENT_CONTRACT,
    explorer: EXPLORER_URL
  } = getAddressesForChain(chainId || 42161)

  // Local UI & Web3 state
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off')
  const [isDragging, setIsDragging] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [hasOwned, setHasOwned] = useState(false)

  const progressBarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const locale = useLocale()

  // Real-time ownership checking for current track
  const checkOwnership = useCallback(async () => {
    if (!effectiveAddress || !currentTrack || !publicClient) return
    try {
      const activeClient = client || publicClient
      const balance = await activeClient.readContract({
        address: CURRENT_CONTRACT as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [effectiveAddress as `0x${string}`, BigInt(currentTrack.id)],
      }) as bigint
      setHasOwned(balance > 0n)
    } catch (e) {
      logger.error('AudioPlayer: Error checking ownership', e)
    }
  }, [effectiveAddress, currentTrack, client, publicClient, CURRENT_CONTRACT])

  useEffect(() => {
    checkOwnership()
  }, [currentTrack?.id, effectiveAddress, checkOwnership])

  const handleMint = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!effectiveAddress || !currentTrack) {
      toast.error("Please connect your wallet first")
      return
    }

    const priceInUnits = currentTrack.price ? parseUnits(currentTrack.price, 6) : 990000n
    setIsMinting(true)
    const mainToast = toast.loading(`Collecting "${currentTrack.title}"...`)

    try {
      const activeClient = client || publicClient

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
          args: [CURRENT_CONTRACT as `0x${string}`, 1000000000000n],
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
        args: [BigInt(currentTrack.id)],
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

      setHasOwned(true)
      toast.success(`"${currentTrack.title}" collected!`, { id: mainToast })
    } catch (error: any) {
      logger.error('AudioPlayer: Collection Error', error)
      toast.error(error.message || "Collection failed", { id: mainToast })
    } finally {
      setIsMinting(false)
    }
  }

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted, audioRef])

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime)
  }

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    if (e.currentTarget.duration && e.currentTarget.duration !== Infinity) {
      setDuration(e.currentTarget.duration)
    }
  }

  const handleDurationChange = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    if (e.currentTarget.duration && e.currentTarget.duration !== Infinity) {
      setDuration(e.currentTarget.duration)
    }
  }

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else {
      next()
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    // Sync source if changed
    if (currentTrack.url && audio.src !== currentTrack.url) {
      audio.src = currentTrack.url
      audio.load()
      setCurrentTime(0)
      setDuration(0)
    }

    if (isPlaying) {
      audio.play().catch((e) => logger.warn('[AudioPlayer] Play failed:', e))
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack, audioRef, setCurrentTime, setDuration])

  const formatTime = (time: number) => {
    if (!time || isNaN(time) || time === Infinity) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = (duration > 0 && duration !== Infinity) ? (currentTime / duration) * 100 : 0

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Allow seeking even if duration is 0 (browser might just have it cached)
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))

      const targetTime = percent * (duration || 0)
      if (duration && duration !== Infinity) {
        seek(targetTime)
      } else if (audioRef.current && audioRef.current.duration) {
        // Fallback to direct element duration if state is stale
        seek(percent * audioRef.current.duration)
      }
    },
    [seek, duration, audioRef]
  )

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (val > 0) setIsMuted(false)
  }

  const cycleRepeat = () => {
    setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'))
  }

  if (!currentTrack) return null

  const accentActive = 'text-[#FF1F8A]'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D12]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
        onPlay={handleDurationChange} /* Refresh duration on play start */
      />

      {/* ─── DESKTOP LAYOUT (md+) ─── */}
      <div className="hidden md:flex items-center gap-4 px-6 h-[90px] max-w-screen-2xl mx-auto">

        {/* LEFT: Track Info */}
        <div
          className="flex items-center gap-3 w-[25%] min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push(`/${locale}/track/${currentTrack.id}`)}
        >
          {/* Album Art */}
          <div className="w-12 h-12 rounded-md flex-shrink-0 overflow-hidden bg-white/5">
            <img
              src={(currentTrack.cover || '').replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/')}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title + Artist */}
          <div
            className="min-w-0 flex-1"
          >
            <div className="marquee-container">
              <div className="marquee-content">
                <span className="text-sm font-semibold text-white pr-12">{currentTrack.title}</span>
              </div>
            </div>
            <p className="text-xs text-white/50 truncate mt-0.5">
              {currentTrack.creator}
            </p>
          </div>

          {/* Playing indicator */}
          {isPlaying && (
            <div className="flex items-end gap-[2px] h-3 flex-shrink-0 ml-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-[#FF1F8A] equalizer-bar h-full"
                  style={{ animationDelay: `${i * 0.15}s` } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </div>

        {/* CENTER: Controls + Progress */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0 py-3">
          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            {/* Shuffle */}
            <button
              onClick={() => setIsShuffle((s) => !s)}
              className={`relative p-1.5 rounded-md transition-all hover:scale-110 ${isShuffle ? accentActive : 'text-white/40 hover:text-white/80'}`}
              aria-label="Shuffle"
            >
              <IconArrowsShuffle size={16} />
              {isShuffle && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF1F8A]" />}
            </button>

            {/* Previous */}
            <button
              onClick={previous}
              className="p-1.5 text-white hover:text-white/70 transition-all hover:scale-110"
              aria-label="Previous"
            >
              <SkipBack size={20} className="fill-white" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all bg-cyber-pink hover:bg-cyber-pink/80 active:scale-95 active:brightness-75"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause size={18} className="text-white fill-white" />
                : <Play size={18} className="text-white fill-white ml-0.5" />
              }
            </button>

            {/* Next */}
            <button
              onClick={next}
              className="p-1.5 text-white hover:text-white/70 transition-all hover:scale-110"
              aria-label="Next"
            >
              <SkipForward size={20} className="fill-white" />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeat}
              className={`relative p-1.5 rounded-md transition-all hover:scale-110 ${repeatMode !== 'off' ? accentActive : 'text-white/40 hover:text-white/80'}`}
              aria-label="Repeat"
            >
              {repeatMode === 'one' ? <IconRepeatOnce size={16} /> : <IconRepeat size={16} />}
              {repeatMode !== 'off' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF1F8A]" />}
            </button>
          </div>

          {/* Progress Bar + Timestamps */}
          <div className="flex items-center gap-2 w-full max-w-[500px]">
            <span className="text-[10px] text-white/40 tabular-nums w-8 text-right flex-shrink-0">
              {formatTime(currentTime)}
            </span>

            {/* Track */}
            <div
              ref={progressBarRef}
              className="group relative flex-1 h-3 flex items-center cursor-pointer"
              onClick={handleProgressClick}
              role="slider"
              aria-label="Track Progress"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration || 0)}
              aria-valuenow={Math.round(currentTime)}
            >
              {/* Background track */}
              <div className="absolute inset-y-0 my-auto h-[3px] w-full rounded-full bg-white/10" />
              {/* Filled */}
              <div
                className="absolute inset-y-0 my-auto h-[3px] rounded-full bg-cyber-pink"
                style={{ width: `${progressPercent}%` } as React.CSSProperties}
              />
              {/* Thumb */}
              <div
                className="absolute w-3 h-3 rounded-full bg-white shadow-md transition-opacity -translate-x-1/2 opacity-0 group-hover:opacity-100"
                style={{ left: `${progressPercent}%` } as React.CSSProperties}
              />
            </div>

            <span className="text-[10px] text-white/40 tabular-nums w-8 flex-shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* RIGHT: Quick Conversion + Volume */}
        <div className="flex items-center gap-4 w-[25%] justify-end">
          {/* QUICK COLLECT BUTTON */}
          {!hasOwned ? (
            <button
              onClick={handleMint}
              disabled={isMinting}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-pink hover:bg-cyber-pink/80 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,31,138,0.3)] disabled:opacity-50"
            >
              {isMinting ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconShoppingBag size={16} />
              )}
              <span className="whitespace-nowrap">
                {currentTrack.price ? `Collect for $${parseFloat(currentTrack.price).toFixed(2)}` : 'Collect Track'}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider">
              <IconCheck size={14} />
              Collected
            </div>
          )}

          <div className="flex items-center gap-2 min-w-[100px]">
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="p-1.5 text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0
                ? <IconVolumeOff size={18} />
                : <IconVolume2 size={18} />
              }
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-[#FF1F8A] h-[3px] bg-white/20 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ─── MOBILE LAYOUT (< md) ─── */}
      <div className="flex md:hidden flex-col">
        {/* Main row */}
        <div
          className="flex items-center gap-3 px-4 py-2.5"
        >
          {/* Album Art */}
          <div
            className="w-10 h-10 rounded-md flex-shrink-0 overflow-hidden bg-white/5 cursor-pointer"
            onClick={() => router.push(`/${locale}/track/${currentTrack.id}`)}
          >
            <img
              src={(currentTrack.cover || '').replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/')}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Track Info */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => router.push(`/${locale}/track/${currentTrack.id}`)}
          >
            <div className="marquee-container">
              <div className="marquee-content">
                <span className="text-sm font-semibold text-white pr-8">{currentTrack.title}</span>
              </div>
            </div>
            <p className="text-xs text-white/50 truncate mt-0.5">
              {currentTrack.creator}
            </p>
          </div>

          {/* Controls + Quick Collect */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile Quick Collect */}
            {!hasOwned && (
              <button
                onClick={handleMint}
                disabled={isMinting}
                className="p-2 text-cyber-pink active:scale-90 transition-transform"
                title="Collect Song"
              >
                {isMinting ? <IconLoader2 size={20} className="animate-spin" /> : <IconShoppingBag size={20} />}
              </button>
            )}

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white text-black active:scale-95 active:brightness-75"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause size={18} className="text-black fill-black" />
                : <Play size={18} className="text-black fill-black ml-0.5" />
              }
            </button>
          </div>
        </div>

        {/* Progress bar — flush to bottom, full width, no timestamps */}
        <div
          className="h-[3px] w-full cursor-pointer relative bg-white/10"
          onClick={handleProgressClick}
          role="slider"
          aria-label="Track Progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 0)}
          aria-valuenow={Math.round(currentTime)}
        >
          <div
            className="h-full rounded-full bg-cyber-pink"
            style={{ width: `${progressPercent}%` } as React.CSSProperties}
          />
        </div>
      </div>

    </div>
  )
}
