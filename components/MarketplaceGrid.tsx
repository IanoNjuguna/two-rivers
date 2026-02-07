import React from 'react'
import SongCard from './SongCard'

interface Song {
  id: number
  title: string
  creator: string
  price: string
  cover: string
  collaborators: number
}

interface MarketplaceGridProps {
  songs: Song[]
  isConnected: boolean
}

export default function MarketplaceGrid({
  songs,
  isConnected,
}: MarketplaceGridProps) {
  if (!songs.length) {
    return (
      <div className="glass p-12 text-center rounded-xl">
        <p className="text-white/60">No songs available yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {songs.map((song) => (
        <SongCard key={song.id} {...song} />
      ))}
    </div>
  )
}
