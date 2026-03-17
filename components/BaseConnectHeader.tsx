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
import { IconCopy, IconCheck, IconExternalLink } from '@tabler/icons-react'
import { useAudio } from './AudioProvider'

import { ChainSwitcher } from './ChainSwitcher'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

const formatAddress = (address: string, startChars: number = 10, endChars: number = 9): string => {
  if (!address || address.length <= startChars + endChars) {
    return address
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export default function BaseConnectHeader({ address: propAddress, logout }: { address?: string, logout?: () => void }) {
  const t = useTranslations('header')
  const { login: privyLogin, logout: privyLogout, authenticated, user } = usePrivy()
  const { login: dobaLogin, isAuthenticated } = useAudio()
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
          onClick={privyLogin}
          className="bg-lavender hover:bg-lavender/90 text-midnight font-bold h-10 px-6 transition-all rounded-lg"
        >
          {t('signIn') || 'Sign In'}
        </Button>
      ) : !isAuthenticated ? (
        <Button
          onClick={dobaLogin}
          className="bg-lavender/20 hover:bg-lavender/30 text-lavender font-bold h-10 px-6 transition-all rounded-lg border border-lavender/30"
        >
          Complete Sign-In
        </Button>
      ) : (
        <ChainSwitcher />
      )}
    </div>
  )
}
