'use client'

import { logger } from '@/lib/logger'

import React, { useEffect, useState } from 'react'
import SongCard from './SongCard'
import { useTranslations } from 'next-intl'

interface Track {
  token_id: number
  name: string
  artist: string
  image_url: string
  audio_url: string
  genre?: string
  price?: string
  chain_id?: string
}

const API_URL = '/api-backend'

export default function MarketplaceGrid({
  onPlay,
  currentTrackId,
  isPlaying,
  searchQuery = '',
  genre = '',
  chainId = '',
  limit = 24
}: {
  onPlay?: (track: Track, tracks: Track[]) => void,
  currentTrackId?: number | null,
  isPlaying?: boolean,
  searchQuery?: string,
  genre?: string,
  chainId?: string,
  limit?: number
}) {
  const t = useTranslations('marketplace')
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const fetchTracks = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true)
    else setLoading(true)

    try {
      const currentOffset = isLoadMore ? offset + limit : 0
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (genre && genre !== 'All') params.append('genre', genre)
      if (chainId && chainId !== 'All') params.append('chain_id', chainId)
      params.append('limit', limit.toString())
      params.append('offset', currentOffset.toString())

      const fetchUrl = `${API_URL.replace(/\/$/, '')}/songs?${params.toString()}`
      const res = await fetch(fetchUrl)
      if (res.ok) {
        const data = await res.json()
        if (isLoadMore) {
          setTracks(prev => [...prev, ...data])
          setOffset(currentOffset)
        } else {
          setTracks(data)
          setOffset(0)
        }
        setHasMore(data.length === limit)
      } else {
        logger.error(`Failed to fetch tracks: ${res.status} ${res.statusText}`)
      }
    } catch (error: any) {
      logger.error('Failed to fetch tracks:', error?.message || error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchTracks()
  }, [searchQuery, genre, chainId])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!tracks.length) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-20 text-center">
        <p className="text-white/40 italic text-sm">{t('noSongs')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {tracks.map((track) => (
          <SongCard
            key={`${track.token_id}-${track.chain_id}`}
            tokenId={track.token_id}
            name={track.name}
            artist={track.artist}
            imageUrl={track.image_url}
            audioUrl={track.audio_url}
            genre={track.genre}
            price={track.price}
            trackChainId={track.chain_id}
            onPlay={onPlay ? () => onPlay(track, tracks) : undefined}
            isPlaying={isPlaying && currentTrackId === track.token_id}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => fetchTracks(true)}
            disabled={loadingMore}
            className="px-8 py-3 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
