import React from 'react'
import SongCard from './SongCard'

interface Song {
  id: number
  title: string
  creator: string
  price: string
  cover: string
  collaborators: number
  url?: string
}

interface MarketplaceGridProps {
  songs: Song[]
  isConnected: boolean
  onPlay?: (song: Song) => void
}

export default function MarketplaceGrid({
  songs,
  isConnected,
  onPlay,
}: MarketplaceGridProps) {
  if (!songs.length) {
    return (
      <div className="glass p-12 text-center rounded-xl">
        <p className="text-white/60">No songs available yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
      {songs.map((song) => (
        <SongCard 
          key={song.id} 
          {...song} 
          onPlay={onPlay ? () => onPlay(song) : undefined}
        />
      ))}
    </div>
  )
}
