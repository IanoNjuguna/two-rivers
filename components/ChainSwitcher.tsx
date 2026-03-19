'use client'

import * as React from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { base, baseSepolia } from 'wagmi/chains'
import { toast } from 'sonner'

export function ChainSwitcher() {
	const { chainId, isConnected } = useAccount()
	const { switchChain, isPending } = useSwitchChain()

	if (!isConnected) return null

	const supportedChains = [
		{ id: base.id, name: 'Base', icon: '/images/base.png' },
		{ id: baseSepolia.id, name: 'Base Sepolia', icon: '/images/base.png' },
	]

	const currentChain = supportedChains.find((c) => c.id === chainId) || supportedChains[0]

	const handleSwitch = (value: string) => {
		const targetId = parseInt(value)
		if (targetId === chainId) return

		switchChain({ chainId: targetId }, {
			onSuccess: () => toast.success(`Switched to ${supportedChains.find(c => c.id === targetId)?.name}`),
			onError: (error) => toast.error(`Failed to switch network: ${error.message}`),
		})
	}

	return (
		<div className="flex items-center gap-2">
			<Select value={chainId?.toString()} onValueChange={handleSwitch}>
				<SelectTrigger className="w-[145px] h-9 bg-white/5 border-white/10 text-white/90 hover:bg-white/10 transition-colors rounded-lg">
					<SelectValue placeholder="Select Network" />
				</SelectTrigger>
				<SelectContent className="bg-[#16161D] border-white/10 text-white">
					{supportedChains.map((chain) => (
						<SelectItem key={chain.id} value={chain.id.toString()} className="focus:bg-white/10 focus:text-white cursor-pointer">
							<div className="flex items-center gap-2">
								<img src={chain.icon} alt={chain.name} className="w-4 h-4 object-contain" />
								<span>{chain.name}</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
