'use client'

import { logger } from '@/lib/logger'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { IconWallet as Wallet, IconCopy as Copy, IconLogout } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'

import { useUser, useAuthModal, useSignerStatus, useLogout, useChain, useAuthenticate, useAlchemyAccountContext } from "@account-kit/react"
import { watchSmartAccountClient, getSmartAccountClient } from "@account-kit/core"
import { getAddressesForChain, ERC20_ABI, publicClients } from "@/lib/web3"
import { formatUnits } from "viem"

export default function ConnectHeader({ address: propAddress }: { address?: string }) {
  const t = useTranslations('header')
  const [mounted, setMounted] = useState(false)
  const { chain } = useChain()
  const user = useUser()
  const { openAuthModal, isOpen } = useAuthModal()
  const { isConnected: isSignerConnected, isInitializing } = useSignerStatus()
  const { logout } = useLogout()
  const { authenticate } = useAuthenticate()
  const { config } = useAlchemyAccountContext()
  const accountConfig = React.useMemo(() => ({ type: "LightAccount" as const }), [])

  // Retrieve client directly from the Alchemy core store to bypass EOA guards
  const client = React.useSyncExternalStore(
    watchSmartAccountClient(accountConfig, config),
    () => getSmartAccountClient(accountConfig, config),
    () => getSmartAccountClient(accountConfig, config)
  )

  const isConnected = !!(isSignerConnected && client)

  const [nativeBalance, setNativeBalance] = useState('0.00')
  const [usdcBalance, setUsdcBalance] = useState('0.00')
  const [isBridging, setIsBridging] = useState(false)
  const isBridgingRef = React.useRef(false)

  // @ts-ignore - Bypass LightAccount deep account type discrepancy
  const address = client?.account?.address || propAddress || user?.address

  // Auto-Bridging Effect: 
  // If a signer is connected (e.g. MetaMask) but there is no Alchemy session (client),
  // we trigger the bridging signature request.
  useEffect(() => {
    if (isSignerConnected && !client && !isBridgingRef.current) {

      const triggerBridge = async () => {
        isBridgingRef.current = true;

        // Wait 1 second to allow things to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!isSignerConnected || client) {
          isBridgingRef.current = false;
          return;
        }

        setIsBridging(true);
        try {
          // @ts-ignore - Account Kit deep types request a 'bundle' string which is not strictly necessary here
          openAuthModal();
        } catch (error) {
          logger.error('ConnectHeader: Auto-bridging failed', error);
        } finally {
          setIsBridging(false);
          isBridgingRef.current = false;
        }
      };

      triggerBridge();
    }
  }, [isSignerConnected, client, authenticate]);

  useEffect(() => {
    async function fetchBalances() {
      if (!address || !chain) return

      try {
        const chainId = Number(chain.id);
        const client = publicClients[chainId as keyof typeof publicClients];
        if (!client) return;

        const [native, usdc] = await Promise.all([
          client.getBalance({ address: address as `0x${string}` }),
          client.readContract({
            address: getAddressesForChain(chainId).usdc as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
          })
        ]);

        setNativeBalance(formatUnits(native, 18))
        setUsdcBalance(formatUnits(usdc as bigint, 6))
      } catch (e) {
        logger.error('Failed to fetch header balances', e)
      }
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 15000)
    return () => clearInterval(interval)
  }, [address, chain])

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex items-center gap-3">
      {!mounted || isInitializing ? (
        <Button
          disabled
          className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold"
        >
          <span className="animate-pulse">{t('loading')}</span>
        </Button>
      ) : isConnected ? (
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-4 glass px-4 py-2 rounded-lg">
            <div className="flex items-center gap-3 pr-3 border-r border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/40 font-bold uppercase leading-none mb-1">Native</span>
                <span className="text-sm font-mono text-white/90 leading-none">
                  {parseFloat(nativeBalance).toFixed(3)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-cyber-pink/40 font-bold uppercase leading-none mb-1">USDC</span>
                <span className="text-sm font-mono text-cyber-pink leading-none">
                  {parseFloat(usdcBalance).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-mono text-white/80">{formatAddress(address || user?.address || '')}</span>
              <button
                onClick={() => navigator.clipboard.writeText(address || user?.address || '')}
                className="p-1 hover:bg-white/[0.1] rounded transition"
                aria-label={t('copyAddress')}
                title={t('copyAddress')}
              >
                <Copy size={14} className="text-white/60" />
              </button>
              <button
                onClick={() => logout()}
                className="p-1 hover:bg-white/[0.1] rounded transition ml-1"
                aria-label={t('disconnect')}
                title={t('disconnect')}
              >
                <IconLogout size={14} className="text-white/60 hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      ) : isSignerConnected && !client ? (
        <Button
          onClick={() => {
            openAuthModal();
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          disabled={isBridging}
        >
          {isBridging ? (
            <span className="animate-pulse">{t('signingIn') || 'Signing in...'}</span>
          ) : (
            <>
              <Wallet className="mr-2" size={18} />
              <span>{t('enterApp') || 'Enter App'}</span>
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={() => {
            openAuthModal();
          }}
          className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold"
        >
          <span className="hidden sm:inline">{t('signIn')}</span>
          <span className="sm:hidden">{t('signIn')}</span>
        </Button>
      )}
    </div>
  )
}
