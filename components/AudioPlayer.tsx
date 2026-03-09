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
  IconHeart,
  IconLoader2,
} from '@tabler/icons-react'
import { logger } from '@/lib/logger'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import type { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { CONTRACT_ABI, ERC20_ABI, getAddressesForChain } from '@/lib/web3'
import { useChainId, usePublicClient, useAccount, useWriteContract } from 'wagmi'
import { encodeFunctionData, parseUnits } from 'viem'
import { toast } from 'sonner'

interface AudioPlayerProps {
  playerState: ReturnType<typeof useAudioPlayer>
}

export default function AudioPlayer({ playerState }: AudioPlayerProps) {
  const { address: effectiveAddress, isConnected: isAuthenticated } = useAccount()
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
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const {
    usdc: CURRENT_USDC,
    contract: CURRENT_CONTRACT,
    explorer: EXPLORER_URL
  } = getAddressesForChain(chainId || 8453)

  // Local UI & Web3 state
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off')
  const [isMinting, setIsMinting] = useState(false)
  const [hasOwned, setHasOwned] = useState(false)

  const progressBarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const locale = useLocale()

  // Real-time ownership checking for current track
  const checkOwnership = useCallback(async () => {
    if (!effectiveAddress || !currentTrack || !publicClient) return
    try {
      const balance = await publicClient.readContract({
        address: CURRENT_CONTRACT as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [effectiveAddress as `0x${string}`, BigInt(currentTrack.id)],
      }) as bigint
      setHasOwned(balance > 0n)
    } catch (e) {
      logger.error('AudioPlayer: Error checking ownership', e)
    }
  }, [effectiveAddress, currentTrack, publicClient, CURRENT_CONTRACT])

  useEffect(() => {
    checkOwnership()
  }, [currentTrack?.id, effectiveAddress, checkOwnership])

  const handleMint = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated || !currentTrack) {
      toast.error("Please connect your wallet to collect this track")
      return
    }

    const priceInUnits = currentTrack.price ? parseUnits(currentTrack.price, 6) : 990000n
    setIsMinting(true)
    const mainToast = toast.loading(`Collecting "${currentTrack.title}"...`)

    try {
      if (!publicClient) throw new Error("Public client not found")

      // 1. Check Allowance
      const allowance = await publicClient.readContract({
        address: CURRENT_USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [effectiveAddress as `0x${string}`, CURRENT_CONTRACT as `0x${string}`],
      }) as bigint

      // 2. Approve if needed
      if (allowance < priceInUnits) {
        toast.info("Approving USDC for purchase...", { id: mainToast })
        const tx = await writeContractAsync({
          address: CURRENT_USDC as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CURRENT_CONTRACT as `0x${string}`, 1000000000000n],
        })
        await publicClient.waitForTransactionReceipt({ hash: tx })
      }

      // 3. Mint
      toast.loading(`Confirming purchase...`, { id: mainToast })
      const tx = await writeContractAsync({
        address: CURRENT_CONTRACT as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [BigInt(currentTrack.id)],
      })
      await publicClient.waitForTransactionReceipt({ hash: tx })

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
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))

      const targetTime = percent * (duration || 0)
      if (duration && duration !== Infinity) {
        seek(targetTime)
      } else if (audioRef.current && audioRef.current.duration) {
        seek(percent * audioRef.current.duration)
      }
    },
    [seek, duration, audioRef]
  )

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setVolume(val)
    if (val > 0) setIsMuted(false)
  }

  const cycleRepeat = () => {
    setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'))
  }

  if (!currentTrack) return null

  const accentActive = 'text-[#FF1F8A]'

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-[#0D0D12] border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
        onPlay={handleDurationChange}
      />

      {/* ─── DESKTOP LAYOUT (md+) ─── */}
      <div className="hidden md:flex items-center gap-4 px-6 h-[90px] max-w-screen-2xl mx-auto">
        <div
          className="flex items-center gap-3 w-[25%] min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push(`/${locale}/track/${currentTrack.id}`)}
        >
          <div className="w-12 h-12 rounded-md flex-shrink-0 overflow-hidden bg-white/5 text-xs">
            <img
              src={(currentTrack.cover || '').replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/')}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="marquee-container">
              <div className="marquee-content">
                <span className="text-sm font-semibold text-white pr-12">{currentTrack.title}</span>
              </div>
            </div>
            <p className="text-xs text-white/50 truncate mt-0.5">
              {currentTrack.creator}
            </p>
          </div>

          {isPlaying && (
            <div className="flex items-end gap-[2px] h-3 flex-shrink-0 ml-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-[3px] bg-[#FF1F8A] equalizer-bar h-full"
                  style={{ '--delay': `${i * 0.15}s` } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsShuffle((s) => !s)}
              className={`relative p-1.5 transition-all hover:scale-110 ${isShuffle ? accentActive : 'text-white/40 hover:text-white/80'}`}
              aria-label="Shuffle"
            >
              <IconArrowsShuffle size={16} />
              {isShuffle && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FF1F8A]" />}
            </button>

            <button
              onClick={previous}
              className="p-1.5 text-white hover:text-white/70 transition-all hover:scale-110"
              aria-label="Previous"
            >
              <SkipBack size={20} className="fill-white" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all bg-white hover:bg-white/90 text-black active:scale-95 active:brightness-75 rounded-none"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause size={18} className="fill-black" />
                : <Play size={18} className="fill-black ml-0.5" />
              }
            </button>

            <button
              onClick={next}
              className="p-1.5 text-white hover:text-white/70 transition-all hover:scale-110"
              aria-label="Next"
            >
              <SkipForward size={20} className="fill-white" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`relative p-1.5 transition-all hover:scale-110 ${repeatMode !== 'off' ? accentActive : 'text-white/40 hover:text-white/80'}`}
              aria-label="Repeat"
            >
              {repeatMode === 'one' ? <IconRepeatOnce size={16} /> : <IconRepeat size={16} />}
              {repeatMode !== 'off' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FF1F8A]" />}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full max-w-[500px]">
            <span className="text-[10px] text-white/40 tabular-nums w-8 text-right flex-shrink-0">
              {formatTime(currentTime)}
            </span>

            <div
              ref={progressBarRef}
              className="group relative flex-1 h-3 flex items-center cursor-pointer"
              onClick={handleProgressClick}
              role="slider"
              aria-label="Track Progress"
            >
              <div className="absolute inset-y-0 my-auto h-[3px] w-full bg-white/10" />
              <div
                className="absolute inset-y-0 my-auto h-[3px] bg-cyber-pink"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute w-3 h-3 bg-white shadow-md transition-opacity -translate-x-1/2 opacity-0 group-hover:opacity-100 clip-diamond"
                style={{ left: `${progressPercent}%` }}
              />
            </div>

            <span className="text-[10px] text-white/40 tabular-nums w-8 flex-shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-[25%] justify-end">
          <button
            onClick={!hasOwned ? handleMint : undefined}
            disabled={isMinting}
            className={cn(
              "p-2 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 flex items-center justify-center flex-shrink-0 group/heart",
              hasOwned ? "text-cyber-pink" : "text-white/40 hover:text-white"
            )}
          >
            {isMinting ? (
              <IconLoader2 size={22} className="animate-spin text-cyber-pink" />
            ) : (
              <IconHeart
                size={22}
                className={cn(
                  "transition-colors",
                  hasOwned ? "fill-cyber-pink text-cyber-pink" : "fill-none"
                )}
              />
            )}
          </button>

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
            <div
              className="group relative flex-1 h-3 flex items-center cursor-pointer"
              onClick={handleVolumeClick}
              role="slider"
              aria-label="Volume"
            >
              <div className="absolute inset-y-0 my-auto h-[3px] w-full bg-white/20" />
              <div
                className="absolute inset-y-0 my-auto h-[3px] bg-[#FF1F8A]"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <div
                className="absolute w-3 h-3 bg-white shadow-md transition-opacity -translate-x-1/2 opacity-0 group-hover:opacity-100 clip-diamond"
                style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOBILE LAYOUT (< md) ─── */}
      <div className="flex md:hidden flex-col">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div
            className="w-10 h-10 flex-shrink-0 overflow-hidden bg-white/5 cursor-pointer clip-angular-br-sm"
            onClick={() => router.push(`/${locale}/track/${currentTrack.id}`)}
          >
            <img
              src={(currentTrack.cover || '').replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/')}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

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

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={!hasOwned ? handleMint : undefined}
              disabled={isMinting}
              className={cn(
                "p-2 active:scale-90 transition-transform",
                hasOwned ? "text-cyber-pink" : "text-white/40"
              )}
            >
              {isMinting ? (
                <IconLoader2 size={22} className="animate-spin text-cyber-pink" />
              ) : (
                <IconHeart
                  size={22}
                  className={cn(hasOwned && "fill-cyber-pink")}
                />
              )}
            </button>

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 flex items-center justify-center transition-all bg-white text-black active:scale-95 active:brightness-75 rounded-none"
            >
              {isPlaying
                ? <Pause size={18} className="fill-black" />
                : <Play size={18} className="fill-black ml-0.5" />
              }
            </button>
          </div>
        </div>

        <div
          className="h-[3px] w-full cursor-pointer relative bg-white/10"
          onClick={handleProgressClick}
          role="slider"
        >
          <div
            className="h-full bg-cyber-pink"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
