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

export default function MarketplaceGrid({ client, onPlay }: { client?: any, onPlay?: (track: Track, tracks: Track[]) => void }) {
  const t = useTranslations('marketplace')
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const fetchUrl = `${API_URL.replace(/\/$/, '')}/tracks`
        const res = await fetch(fetchUrl)
        if (res.ok) {
          const data = await res.json()
          setTracks(data)
        } else {
          logger.error(`Failed to fetch tracks: ${res.status} ${res.statusText}`)
        }
      } catch (error: any) {
        logger.error('Failed to fetch tracks:', error?.message || error)
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
  }, [])

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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {tracks.map((track) => (
        <SongCard
          key={track.token_id}
          tokenId={track.token_id}
          name={track.name}
          artist={track.artist}
          imageUrl={track.image_url}
          audioUrl={track.audio_url}
          genre={track.genre}
          price={track.price}
          trackChainId={track.chain_id}
          client={client}
          onPlay={onPlay ? () => onPlay(track, tracks) : undefined}
        />
      ))}
    </div>
  )
}
