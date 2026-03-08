'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { IconCopy, IconCheck, IconChevronDown, IconWallet } from '@tabler/icons-react'
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

	return (
		<div className="max-w-md mx-auto animate-fade-in">
			<div
				className="glass p-8 relative overflow-hidden text-center space-y-8 clip-angular-br bg-premium-gradient border border-white/08"
			>
				{/* Header */}
				<div className="space-y-2">
					<h2 className="text-3xl font-bold tracking-tight text-white">Deposit USDC</h2>
					<p className="text-sm text-white/50">Scan or copy your wallet address to deposit</p>
				</div>

				{/* QR Code Section */}
				<div className="relative flex justify-center">
					<div className="p-4 bg-white/[0.03] border border-white/10 clip-angular-qr rounded-none relative">
						<div className="bg-[#0D0D12] p-4 overflow-hidden shadow-[0_0_30px_rgba(183,148,244,0.1)] border border-white/5 clip-angular-qr rounded-none">
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
				<div className="space-y-4">
					<div
						onClick={handleCopy}
						className="group flex items-center justify-between gap-4 p-4 bg-black/40 border border-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden clip-angular-bl-sm"
					>
						<code className="text-[13px] font-mono text-white/80 truncate">
							{address}
						</code>
						<div className="flex-shrink-0">
							{copied ? (
								<IconCheck className="w-5 h-5 text-green-400" />
							) : (
								<IconCopy className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
							)}
						</div>
					</div>

					<div className="pt-4 space-y-4">
						<div className="flex items-center justify-center gap-3">
							<span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Supported Network</span>
							<div className="h-[1px] w-12 bg-white/10"></div>
						</div>

						<div className="flex items-center justify-center">
							<div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center clip-angular-br-sm shadow-[0_0_20px_rgba(0,82,255,0.15)]">
								<div className="w-7 h-7 bg-[#0052ff] rounded-sm overflow-hidden shadow-[0_0_15px_rgba(0,82,255,0.4)]">
									<img src="/images/base.png" alt="Base Logo" className="w-full h-full object-contain p-1" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Decorative Elements */}
				<div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[60px] pointer-events-none"></div>
				<div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 blur-[60px] pointer-events-none"></div>
			</div>
		</div>
	)
}

export default DepositView
