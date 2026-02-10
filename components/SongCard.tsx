'use client'

import React from 'react'
import { IconPlayerPlay } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import Play from '@tabler/icons-react/IconPlayerPlay' // Import Play component

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
    <div className="group overflow-hidden">
      {/* Cover Image */}
      <div
        className="w-full aspect-square bg-gradient-to-br rounded-lg flex items-center justify-center relative overflow-hidden"
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
            aria-label={`Play ${title}`}
          >
            <div className="p-3 rounded-full bg-[#FF1F8A]">
              <IconPlayerPlay size={20} className="text-white fill-white" />
            </div>
          </button>
        )}
      </div>

      {/* Card Title */}
      <div className="pt-2">
        <h3 className="font-semibold text-xs text-white line-clamp-2">{title}</h3>
      </div>
    </div>
  )
}
