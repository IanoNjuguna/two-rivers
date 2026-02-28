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
} from '@tabler/icons-react'
import { logger } from '@/lib/logger'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import type { useAudioPlayer } from '@/hooks/useAudioPlayer'

interface AudioPlayerProps {
  playerState: ReturnType<typeof useAudioPlayer>
}

export default function AudioPlayer({ playerState }: AudioPlayerProps) {
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

  // Local UI state
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off')
  const [isDragging, setIsDragging] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const locale = useLocale()

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
          className="flex items-center gap-3 w-[30%] min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
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
            onClick={() => router.push(`/${locale}/track/${currentTrack.id}`)}
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
          <div className="flex items-center gap-2 w-full">
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
                className="absolute w-3 h-3 rounded-full bg-white shadow-md transition-opacity -translate-x-1/2"
                style={{ left: `${progressPercent}%` } as React.CSSProperties}
              />
            </div>

            <span className="text-[10px] text-white/40 tabular-nums w-8 flex-shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* RIGHT: Volume */}
        <div className="flex items-center gap-2 w-[30%] justify-end">
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="p-1.5 text-white/40 hover:text-white/80 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0
              ? <IconVolumeOff size={18} />
              : <IconVolume2 size={18} />
            }
          </button>

          {/* Volume slider */}
          <div className="relative w-24 h-3 flex items-center group cursor-pointer">
            <div className="absolute inset-y-0 my-auto h-[3px] w-full rounded-full bg-white/10" />
            <div
              className="absolute inset-y-0 my-auto h-[3px] rounded-full bg-white/60 group-hover:bg-cyber-pink transition-colors"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` } as React.CSSProperties}
            />
            {/* Thumb dot — visible on hover */}
            <div
              className="absolute w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 pointer-events-none"
              style={{ left: `${(isMuted ? 0 : volume) * 100}%` } as React.CSSProperties}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {/* ─── MOBILE LAYOUT (< md) ─── */}
      <div className="flex md:hidden flex-col">
        {/* Main row */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
          onClick={() => router.push(`/${locale}/track/${currentTrack.id}`)}
        >
          {/* Album Art */}
          <div className="w-10 h-10 rounded-md flex-shrink-0 overflow-hidden bg-white/5">
            <img
              src={(currentTrack.cover || '').replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/')}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="marquee-container">
              <div className="marquee-content">
                <span className="text-sm font-semibold text-white pr-8">{currentTrack.title}</span>
              </div>
            </div>
            <p className="text-xs text-white/50 truncate mt-0.5">
              {currentTrack.creator}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={previous}
              className="p-2 text-white hover:text-white/70 transition-colors"
              aria-label="Previous"
            >
              <SkipBack size={18} className="fill-white" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-cyber-pink hover:bg-cyber-pink/80 active:scale-95 active:brightness-75"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause size={16} className="text-white fill-white" />
                : <Play size={16} className="text-white fill-white ml-0.5" />
              }
            </button>

            <button
              onClick={next}
              className="p-2 text-white hover:text-white/70 transition-colors"
              aria-label="Next"
            >
              <SkipForward size={18} className="fill-white" />
            </button>
          </div>
        </div>

        {/* Progress bar — flush to bottom, full width, no timestamps */}
        <div
          className="h-[3px] w-full cursor-pointer relative bg-white/10"
          onClick={handleProgressClick}
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
