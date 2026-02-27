'use client'

import React, { useState, useEffect } from 'react'
import { useChain as useAlchemyChain } from "@account-kit/react"
import { useChainId, useSwitchChain } from "wagmi"
import sdk from '@farcaster/miniapp-sdk'
import { arbitrum, base, avalancheChain as avalanche } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { IconChevronDown, IconCheck } from "@tabler/icons-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const CHAINS_METADATA = [
	{ id: 42161, name: 'Arbitrum', icon: '/images/arbitrum.png', color: '#28a0f0', chain: arbitrum },
	{ id: 8453, name: 'Base', icon: '/images/base.png', color: '#0052ff', chain: base },
	{ id: 43114, name: 'Avalanche', icon: '/images/avalanche.png', color: '#e84142', chain: avalanche }
]

export default function ChainSwitcher() {
	const [isMiniApp, setIsMiniApp] = useState(false)

	// Wagmi
	const wagmiChainId = useChainId()
	const { switchChain: wagmiSwitchChain } = useSwitchChain()

	// Alchemy (Conditionally safely used?)
	// Actually, we can't call useAlchemyChain conditionally. 
	// The safest way is to split into two inner components or rely on wagmi.
	// Since wagmi is our universal truth for chainId, let's just use wagmi completely
	// for the read state. For setting the chain, we'll try to use Wagmi's switchChain.

	useEffect(() => {
		sdk.isInMiniApp().then(res => setIsMiniApp(res)).catch(() => setIsMiniApp(false))
	}, [])

	// Use Number() for robust comparison
	const activeChainId = wagmiChainId || 42161
	const currentChainMetadata = CHAINS_METADATA.find(c => Number(c.id) === Number(activeChainId)) || CHAINS_METADATA[0]

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="glass p-2 border-white/10 hover:bg-white/5 text-white/80 h-10 w-10 rounded-full transition-all duration-300 flex items-center justify-center">
					<div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
						<img src={currentChainMetadata.icon} alt={currentChainMetadata.name} className="w-full h-full object-contain" />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-14 p-1 bg-[#0D0D12] border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl mt-1">
				<div className="space-y-1">
					{CHAINS_METADATA.map((c) => {
						return (
							<button
								key={c.id}
								onClick={() => {
									if (wagmiSwitchChain) wagmiSwitchChain({ chainId: c.id as any })
								}}
								title={c.name}
								className={cn(
									"w-full flex items-center justify-center p-2 transition-all duration-200 rounded-full group relative",
									Number(activeChainId) === Number(c.id) ? "bg-cyber-pink/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
								)}
							>
								<div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center p-0">
									<img src={c.icon} alt={c.name} className="w-full h-full object-contain" />
								</div>
								{Number(activeChainId) === Number(c.id) && (
									<div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-cyber-pink border border-[#0D0D12]" />
								)}
							</button>
						)
					})}
				</div>
			</PopoverContent>
		</Popover>
	)
}
