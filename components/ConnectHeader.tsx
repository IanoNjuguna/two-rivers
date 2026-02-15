'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { IconWallet as Wallet, IconCopy as Copy, IconLogout } from '@tabler/icons-react'

import { useUser, useAuthModal, useSignerStatus, useLogout } from "@account-kit/react"

export default function ConnectHeader() {
  const user = useUser()
  const { openAuthModal } = useAuthModal()
  const { isConnected, isInitializing } = useSignerStatus()
  const { logout } = useLogout()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex items-center gap-3">
      {isConnected && user ? (
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 glass px-4 py-2 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-mono text-white/80">{formatAddress(user.address)}</span>
            <button
              onClick={() => navigator.clipboard.writeText(user.address)}
              className="p-1 hover:bg-white/[0.1] rounded transition"
              aria-label="Copy address"
              title="Copy address"
            >
              <Copy size={14} className="text-white/60" />
            </button>
            <button
              onClick={() => logout()}
              className="p-1 hover:bg-white/[0.1] rounded transition ml-1"
              aria-label="Disconnect"
              title="Disconnect"
            >
              <IconLogout size={14} className="text-white/60 hover:text-red-400" />
            </button>
          </div>
        </div>
      ) : (
        <Button
          onClick={openAuthModal}
          disabled={isInitializing}
          className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold"
        >
          {isInitializing ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            <>
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Sign In</span>
            </>
          )}
        </Button>
      )}
    </div>
  )
}
