'use client';

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye } from 'lucide-react'

interface NFT {
  id: number
  title: string
  creator: string
  earnings: string
  cover: string
}

interface MyStudioGridProps {
  nfts: NFT[]
}

export default function MyStudioGrid({ nfts }: MyStudioGridProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)

  if (!nfts.length) {
    return (
      <div className="glass p-12 text-center rounded-xl">
        <p className="text-white/60">You haven't created any NFTs yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div
            key={nft.id}
            className="glass-hover group overflow-hidden"
          >
            {/* Cover */}
            <div
              className="w-full aspect-square bg-gradient-to-br rounded-t-lg flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${nft.cover}40, ${nft.cover}10)`,
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-base text-white line-clamp-1">
                  {nft.title}
                </h3>
                <p className="text-xs text-white/60">{nft.creator}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <div>
                  <p className="text-xs text-white/60">Total Earnings</p>
                  <p className="font-mono text-sm font-semibold text-lavender">
                    {nft.earnings} ETH
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyber-pink/40 text-cyber-pink hover:bg-cyber-pink/10 bg-transparent"
                  onClick={() => setSelectedNFT(nft)}
                >
                  <Eye size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Modal */}
      <Dialog open={!!selectedNFT} onOpenChange={() => setSelectedNFT(null)}>
        <DialogContent className="bg-midnight border border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedNFT?.title} - Revenue Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Revenue Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-lg">
                <p className="text-xs text-white/60 mb-1">Total Earned</p>
                <p className="font-mono text-lg font-bold text-cyber-pink">
                  {selectedNFT?.earnings} ETH
                </p>
              </div>
              <div className="glass p-4 rounded-lg">
                <p className="text-xs text-white/60 mb-1">Pending</p>
                <p className="font-mono text-lg font-bold text-lavender">
                  0.2 ETH
                </p>
              </div>
            </div>

            {/* Revenue Share */}
            <div className="glass p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-white">Revenue Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">You</span>
                  <span className="text-white font-semibold">60%</span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-cyber-pink to-lavender" />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Collaborators</span>
                  <span className="text-white font-semibold">40%</span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full w-2/5 bg-gradient-to-r from-lavender to-cyber-pink" />
                </div>
              </div>
            </div>

            {/* Claim Button */}
            <Button className="w-full bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold">
              Claim Earnings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
