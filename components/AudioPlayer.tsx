'use client'

import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useEffect } from 'react'
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

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      next()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [setCurrentTime, setDuration, next, audioRef])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      audio.play().catch(() => {
        console.log('[v0] Audio playback prevented')
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack, audioRef])

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!currentTrack) return null

  return (
    <div
      className="fixed bottom-0 lg:bottom-16 left-0 right-0 z-40 border-t border-white/[0.08] p-4"
      style={{
        backgroundColor: 'rgba(24, 24, 28, 0.95)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <audio ref={audioRef} crossOrigin="anonymous" />

      <div className="max-w-7xl mx-auto">
        {/* Single Row: Track Info - Progress Bar - Controls */}
        <div className="flex items-center gap-4">
          {/* Album Cover + Track Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-lg flex-shrink-0"
              style={{ backgroundColor: currentTrack.cover }}
            />
            <div className="hidden sm:block flex-shrink-0 text-xs text-white/50 w-8 text-right">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Progress Bar - Centered */}
          <div
            className="flex-1 h-1 bg-white/[0.1] rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const percent = (e.clientX - rect.left) / rect.width
              seek(percent * duration)
            }}
          >
            <div
              className="h-1 bg-gradient-to-r from-[#FF1F8A] to-[#B794F4] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Duration */}
          <div className="hidden sm:block flex-shrink-0 text-xs text-white/50 w-8">
            {formatTime(duration)}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={previous}
              className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-white/70 hover:text-white"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: '#FF1F8A',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E01A73'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF1F8A'
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              onClick={next}
              className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-white/70 hover:text-white"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>

        {/* Track Title and Creator - Below on mobile, can be added if needed */}
        <div className="hidden sm:flex items-center gap-3 mt-2 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-white/60 truncate">
              {currentTrack.creator}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
