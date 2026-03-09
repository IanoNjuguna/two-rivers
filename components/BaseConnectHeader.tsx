'use client'

import React from 'react'
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
  WalletModal,
} from '@coinbase/onchainkit/wallet'
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity'
import { useTranslations } from 'next-intl'
import { useAccount } from 'wagmi'
import { getAddressesForChain, ERC20_ABI, publicClients } from "@/lib/web3"
import { formatUnits } from "viem"
import { logger } from '@/lib/logger'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from './ui/button'
import { IconCopy, IconCheck, IconExternalLink } from '@tabler/icons-react'

const formatAddress = (address: string, chars: number = 10): string => {
  if (!address || address.length <= chars) {
    return address
  }
  return address.slice(0, chars)
}

export default function BaseConnectHeader({ address: propAddress }: { address?: string }) {
  const t = useTranslations('header')
  const { login, logout, authenticated, user } = usePrivy()
  const { address: wagmiAddress, chainId, isConnected } = useAccount()
  const address = propAddress || wagmiAddress || user?.wallet?.address

  const [usdcBalance, setUsdcBalance] = React.useState('0.00')

  React.useEffect(() => {
    async function fetchUsdcBalance() {
      if (!address || !chainId) return

      try {
        const client = publicClients[chainId as keyof typeof publicClients];
        if (!client) return;

        const usdc = await client.readContract({
          address: getAddressesForChain(chainId).usdc as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        })

        setUsdcBalance(formatUnits(usdc as bigint, 6))
      } catch (e) {
        logger.error('Failed to fetch header USDC balance', e)
      }
    }

    fetchUsdcBalance()
    const interval = setInterval(fetchUsdcBalance, 15000)
    return () => clearInterval(interval)
  }, [address, chainId])

  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 relative">
      {!authenticated ? (
        <Button
          onClick={login}
          className="bg-lavender hover:bg-lavender/90 text-midnight font-bold h-10 px-6 transition-all rounded-lg"
        >
          {t('signIn') || 'Sign In'}
        </Button>
      ) : (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:border-white/20 transition-all group">
          <span className="text-xs font-mono text-white/70 group-hover:text-white/90 transition-colors select-all">
            {formatAddress(address || '')}
          </span>
          <button
            onClick={handleCopy}
            className="p-0.5 rounded text-white/40 hover:text-white/80 transition-colors"
            title="Copy address"
          >
            {copied
              ? <IconCheck size={13} className="text-green-400" />
              : <IconCopy size={13} />}
          </button>
          <a
            href={`https://basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-0.5 rounded text-white/40 hover:text-white/80 transition-colors"
            title="View on Basescan"
          >
            <IconExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  )
}
