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
        <Wallet>
          <ConnectWallet
            className="flex items-center justify-center p-0 h-9 w-9 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyber-pink/30 transition-all duration-300 rounded-lg overflow-hidden"
          >
            <div className="w-5 h-5 bg-[#0052ff] rounded-sm overflow-hidden">
              <img src="/images/base.png" alt="Base" className="w-full h-full object-contain" />
            </div>
          </ConnectWallet>
          <WalletDropdown className="absolute right-0 top-full glass border border-white/10 rounded-xl mt-2 overflow-hidden shadow-2xl min-w-[300px] z-[100]">
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
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Disconnect
            </button>
          </WalletDropdown>
        </Wallet>
      )}
    </div>
  )
}
