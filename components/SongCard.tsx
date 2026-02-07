import React from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SongCardProps {
  id: number
  title: string
  creator: string
  price: string
  cover: string
  collaborators: number
}

export default function SongCard({
  id,
  title,
  creator,
  price,
  cover,
  collaborators,
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

        {/* Collaborators Badge */}
        {collaborators > 0 && (
          <div className="relative z-10 bg-lavender/20 border border-lavender/40 px-3 py-1 rounded-full text-xs font-medium text-lavender">
            {collaborators} collab{collaborators > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-base text-white line-clamp-1">{title}</h3>
          <p className="text-xs text-white/60">{creator}</p>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <div>
            <p className="text-xs text-white/60">Price</p>
            <p className="font-mono text-sm font-semibold text-cyber-pink">
              {price} ETH
            </p>
          </div>
          <Button
            size="sm"
            className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold shadow-lg shadow-cyber-pink/20"
          >
            Mint
          </Button>
        </div>
      </div>
    </div>
  )
}
