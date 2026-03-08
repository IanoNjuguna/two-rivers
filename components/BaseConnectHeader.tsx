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

export default function BaseConnectHeader({ address: propAddress }: { address?: string }) {
  const t = useTranslations('header')
  const { address: wagmiAddress, chainId, isConnected } = useAccount()
  const address = propAddress || wagmiAddress

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
    <div className="flex items-center gap-3">
      <Wallet>
        <ConnectWallet
          className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold rounded-lg px-4 py-2 transition-all"
        >
          {isConnected ? (
            <>
              <Avatar className="h-6 w-6" />
              <Name className="text-white font-medium" />
            </>
          ) : (
            'Sign In'
          )}
        </ConnectWallet>
        <WalletModal />
        <WalletDropdown className="glass border border-white/10 rounded-xl mt-2 overflow-hidden shadow-2xl min-w-[300px]">
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address className="text-white/60" />
            <EthBalance className="text-white/80 font-mono" />
            <div className="flex flex-col mt-2 pt-2 border-t border-white/5">
              <span className="text-[10px] text-cyber-pink/60 font-bold uppercase leading-none mb-1">USDC Balance</span>
              <span className="text-sm font-mono text-cyber-pink leading-none">
                {parseFloat(usdcBalance).toFixed(2)}
              </span>
            </div>
          </Identity>
          <WalletDropdownLink
            icon="wallet"
            href="https://wallet.coinbase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-white/5 transition-colors"
          >
            Go to Wallet
          </WalletDropdownLink>
          <WalletDropdownDisconnect className="hover:bg-red-500/10 text-red-400 transition-colors" />
        </WalletDropdown>
      </Wallet>
    </div>
  )
}
