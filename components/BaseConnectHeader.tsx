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

  return (
    <div className="flex items-center gap-3 relative">
      {!authenticated ? (
        <Button
          onClick={login}
          className="glass border border-white/10 hover:bg-white/5 text-white/80 font-bold h-10 px-6 transition-all rounded-full"
        >
          {t('signIn') || 'Sign In'}
        </Button>
      ) : (
        <div className="flex items-center justify-center p-0 h-9 w-9 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <div className="w-5 h-5 bg-[#0052ff] rounded-sm overflow-hidden">
            <img src="/images/base.png" alt="Base" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
