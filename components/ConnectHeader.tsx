'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { IconWallet as Wallet, IconCopy as Copy, IconLogout } from '@tabler/icons-react'

interface ConnectHeaderProps {
  isConnected: boolean
  onConnect: () => void
}

export default function ConnectHeader({
  isConnected,
  onConnect,
}: ConnectHeaderProps) {
  const mockAddress = '0x1234...5678'

  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 glass px-4 py-2 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-mono text-white/80">{mockAddress}</span>
            <button className="p-1 hover:bg-white/[0.1] rounded transition">
              <Copy size={14} className="text-white/60" />
            </button>
          </div>
        </div>
      ) : (
        <Button
          onClick={onConnect}
          className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold shadow-lg shadow-cyber-pink/20"
        >
          <Wallet size={16} className="mr-2" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </Button>
      )}
    </div>
  )
}
