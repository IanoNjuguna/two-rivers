'use client'

import { logger } from '@/lib/logger'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink
} from '@coinbase/onchainkit/wallet'
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity'
import { useSignerStatus, useAlchemyAccountContext, useUser } from "@account-kit/react"
import { watchSmartAccountClient, getSmartAccountClient } from "@account-kit/core"
import { publicClients, getAddressesForChain, ERC20_ABI } from "@/lib/web3"
import { formatUnits } from "viem"

export default function AlchemyConnectHeader({ address: propAddress }: { address?: string }) {
  const t = useTranslations('header')
  const [mounted, setMounted] = useState(false)
  const { config } = useAlchemyAccountContext()
  const accountConfig = React.useMemo(() => ({ type: "LightAccount" as const }), [])
  const user = useUser()
  const { isConnected: isSignerConnected, isInitializing } = useSignerStatus()

  // Retrieve client directly from the Alchemy core store to bypass EOA guards
  const client = React.useSyncExternalStore(
    watchSmartAccountClient(accountConfig, config),
    () => getSmartAccountClient(accountConfig, config),
    () => getSmartAccountClient(accountConfig, config)
  )

  const isConnected = !!(isSignerConnected && client)
  const address = client?.account?.address || propAddress || user?.address

  const [usdcBalance, setUsdcBalance] = useState('0.00')

  useEffect(() => {
    async function fetchUsdcBalance() {
      if (!address || !client?.chain) return

      try {
        const chainId = Number(client.chain.id);
        const publicClient = publicClients[chainId as keyof typeof publicClients];
        if (!publicClient) return;

        const usdc = await publicClient.readContract({
          address: getAddressesForChain(chainId).usdc as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        })

        setUsdcBalance(formatUnits(usdc as bigint, 6))
      } catch (e) {
        logger.error('Failed to fetch USDC balance for header', e)
      }
    }

    if (isConnected) {
      fetchUsdcBalance()
      const interval = setInterval(fetchUsdcBalance, 15000)
      return () => clearInterval(interval)
    }
  }, [address, client?.chain, isConnected])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-10 w-24 bg-white/5 animate-pulse rounded-lg" />
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Wallet>
        <ConnectWallet className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold rounded-lg">
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown className="bg-[#1e1e24] border border-white/10 rounded-xl shadow-2xl">
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address className="text-white/60" />
            <EthBalance />
            {isConnected && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-cyber-pink/60 font-bold uppercase">USDC</span>
                <span className="text-xs font-mono text-cyber-pink">
                  {parseFloat(usdcBalance).toFixed(2)}
                </span>
              </div>
            )}
          </Identity>
          <WalletDropdownBasename />
          <WalletDropdownFundLink text="Add Funds" />
          <WalletDropdownLink
            icon="wallet"
            href="https://keys.coinbase.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wallet Dashboard
          </WalletDropdownLink>
          <WalletDropdownDisconnect className="hover:bg-red-500/10 hover:text-red-400 transition-colors" />
        </WalletDropdown>
      </Wallet>
    </div>
  )
}
