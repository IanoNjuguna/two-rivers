'use client';

import React from 'lucide-react'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SongCardProps {
  id: number
  title: string
  creator: string
  price: string
  cover: string
  collaborators: number
  onPlay?: () => void
}

export default function SongCard({
  id,
  title,
  creator,
  price,
  cover,
  collaborators,
  onPlay,
}: SongCardProps) {
  return (
    <div className="glass-hover group overflow-hidden">
      {/* Cover Image */}
      <div
        className="w-full aspect-square bg-gradient-to-br rounded-t-lg flex items-end justify-between p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${cover}40, ${cover}10)`,
        }}
      >
        {/* Decorative element */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Play Button Overlay */}
        {onPlay && (
          <button
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          >
            <div
              className="p-4 rounded-full"
              style={{ backgroundColor: '#FF1F8A' }}
            >
              <Play size={24} className="text-white fill-white" />
            </div>
          </button>
        )}

        {/* Collaborators Badge */}
        {collaborators > 0 && (
          <div className="relative z-10 bg-lavender/20 border border-lavender/40 px-3 py-1 rounded-full text-xs font-medium text-lavender">
            {collaborators} collab{collaborators > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-bold text-sm text-white line-clamp-1">{title}</h3>
          <p className="text-xs text-white/60 line-clamp-1">{creator}</p>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.08]">
          <div>
            <p className="text-xs text-white/60">Price</p>
            <p className="font-mono text-xs font-semibold text-cyber-pink">
              {price} ETH
            </p>
          </div>
          <Button
            size="sm"
            className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold shadow-lg shadow-cyber-pink/20 text-xs h-7 px-2"
          >
            Mint
          </Button>
        </div>
      </div>
    </div>
  )
}

