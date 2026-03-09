'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { IconCopy, IconCheck, IconWallet, IconExternalLink } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAudio } from '@/components/AudioProvider'

export function DepositView() {
	const { effectiveAddress: address } = useAudio()
	const [copied, setCopied] = useState(false)

	const handleCopy = () => {
		if (address) {
			navigator.clipboard.writeText(address)
			setCopied(true)
			toast.success('Address copied to clipboard')
			setTimeout(() => setCopied(false), 2000)
		}
	}

	if (!address) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
				<IconWallet className="w-16 h-16 text-white/20 mb-4" />
				<h2 className="text-xl font-bold text-white mb-2">Connect your wallet</h2>
				<p className="text-white/60">Please connect your wallet to view your deposit address.</p>
			</div>
		)
	}

	const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

	return (
		<div className="max-w-md mx-auto animate-fade-in">
			<div className="glass p-8 relative overflow-hidden text-center space-y-8 bg-[#0D0D12]/80 border border-white/10">
				<div className="relative flex justify-center">
					<div className="p-4 bg-white/[0.03] border border-white/10 rounded-none relative">
						<div className="bg-[#0D0D12] p-4 overflow-hidden shadow-[0_0_30px_rgba(183,148,244,0.1)] border border-white/5 rounded-none">
							<QRCodeSVG
								value={address}
								size={220}
								bgColor="#0D0D12"
								fgColor="#B794F4"
								level="H"
								includeMargin={false}
							/>
						</div>
					</div>
				</div>

				{/* Address Section */}
				<div className="space-y-4 flex flex-col items-center">
					<div
						onClick={handleCopy}
						className="group flex items-center justify-center gap-4 p-4 bg-black/40 border border-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden rounded-none w-full"
					>
						<code className="text-[13px] font-mono text-white/80">
							{truncatedAddress}
						</code>
						<div className="flex items-center gap-2">
							<div className="flex-shrink-0">
								{copied ? (
									<IconCheck className="w-4 h-4 text-green-400" />
								) : (
									<IconCopy className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
								)}
							</div>
							<a
								href={`https://basescan.org/address/${address}`}
								target="_blank"
								rel="noopener noreferrer"
								className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
								onClick={(e) => e.stopPropagation()}
								title="View on BaseScan"
							>
								<IconExternalLink className="w-4 h-4" />
							</a>
						</div>
					</div>

					<div className="flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-wider justify-center">
						<img src="/images/base.png" alt="Base" className="w-4 h-4 object-contain" />
						<span>Send Funds on Base</span>
					</div>
				</div>
			</div>

			{/* Decorative Elements */}
			<div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[60px] pointer-events-none"></div>
			<div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 blur-[60px] pointer-events-none"></div>
		</div>
	)
}

export default DepositView
