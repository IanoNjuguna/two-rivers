'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { IconWallet as Wallet, IconCopy as Copy, IconLogout } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'

import { useAccount, useDisconnect, useBalance, useReadContract, useConnect } from 'wagmi'
import { getAddressesForChain, ERC20_ABI } from "@/lib/web3"
import { sdk } from '@farcaster/miniapp-sdk'
import { formatUnits } from "viem"

export default function MiniAppHeader({ address: propAddress }: { address?: string }) {
	const t = useTranslations('header')
	const [mounted, setMounted] = useState(false)
	const [farcasterUser, setFarcasterUser] = useState<any>(null)

	const { address: wagmiAddress, isConnected, chainId } = useAccount()
	const { disconnect } = useDisconnect()
	const { connect, connectors } = useConnect()

	const address = propAddress || wagmiAddress

	// Auto-connect Farcaster Mini App
	useEffect(() => {
		if (!isConnected && connectors.length > 0) {
			const farcasterConnector = connectors.find((c: any) => c.id === 'farcasterMiniApp' || c.name === 'Farcaster')
			if (farcasterConnector) {
				connect({ connector: farcasterConnector })
			} else {
				// Fallback to the first available connector (which should be farcasterMiniApp anyway)
				connect({ connector: connectors[0] })
			}
		}
	}, [isConnected, connectors, connect])

	// Fetch Farcaster profile
	useEffect(() => {
		sdk.context.then((ctx: any) => {
			if (ctx?.user) {
				setFarcasterUser(ctx.user)
			}
		}).catch(console.error)
	}, [])

	// Fetch balances using wagmi hooks
	const { data: nativeBalanceData } = useBalance({
		address: address as `0x${string}`,
		chainId,
		query: {
			enabled: !!address,
			refetchInterval: 15000,
		}
	});

	const { data: usdcBalanceData } = useReadContract({
		address: chainId ? getAddressesForChain(chainId).usdc as `0x${string}` : undefined,
		abi: ERC20_ABI,
		functionName: 'balanceOf',
		args: address ? [address as `0x${string}`] : undefined,
		chainId,
		query: {
			enabled: !!address && !!chainId,
			refetchInterval: 15000,
		}
	});

	const nativeBalance = nativeBalanceData ? formatUnits(nativeBalanceData.value, 18) : '0.00'
	const usdcBalance = usdcBalanceData !== undefined ? formatUnits(usdcBalanceData as bigint, 6) : '0.00'

	useEffect(() => {
		setMounted(true)
	}, [])

	const formatAddress = (addr: string) => {
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`
	}

	// Display Name logic: use Farcaster username/displayName if available, else format address
	const displayName = farcasterUser?.username || farcasterUser?.displayName || (address ? formatAddress(address) : '')
	const avatarUrl = farcasterUser?.pfpUrl

	return (
		<div className="flex items-center gap-3">
			{!mounted ? (
				<Button
					disabled
					className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-semibold"
				>
					<span className="animate-pulse">{t('loading') || 'Loading...'}</span>
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
							{avatarUrl ? (
								<img src={avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full border border-white/20" />
							) : (
								<div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
							)}
							<span className="text-sm font-semibold text-white/90">{displayName}</span>
							<button
								onClick={() => navigator.clipboard.writeText(address || '')}
								className="p-1 hover:bg-white/[0.1] rounded transition ml-2"
								aria-label={t('copyAddress') || 'Copy Address'}
								title={t('copyAddress') || 'Copy Address'}
							>
								<Copy size={16} className="text-white/60" />
							</button>
							<button
								onClick={() => {
									disconnect()
									sdk.actions.close()
								}}
								className="p-1 hover:bg-white/[0.1] rounded transition ml-1"
								aria-label={t('disconnect') || 'Disconnect'}
								title={t('disconnect') || 'Disconnect'}
							>
								<IconLogout size={16} className="text-white/60 hover:text-red-400" />
							</button>
						</div>
					</div>
				</div>
			) : (
				<Button
					disabled
					className="bg-blue-600 hover:bg-blue-700 text-white font-semibold opacity-50"
				>
					<span className="animate-pulse">Connecting Base Account...</span>
				</Button>
			)}
		</div>
	)
}
