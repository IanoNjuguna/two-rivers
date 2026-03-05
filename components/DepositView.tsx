'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAccount } from 'wagmi'
import { IconCopy, IconCheck, IconChevronDown, IconWallet } from '@tabler/icons-react'
import { toast } from 'sonner'

export const DepositView: React.FC = () => {
	const { address } = useAccount()
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
				className="glass p-8 relative overflow-hidden text-center space-y-8"
				style={{
					clipPath: 'polygon(0% 0%, 100% 0%, 100% 90%, 95% 100%, 0% 100%)',
					background: 'linear-gradient(135deg, rgba(13, 13, 18, 0.95) 0%, rgba(20, 20, 25, 0.95) 100%)',
					border: '1px solid rgba(255, 255, 255, 0.08)'
				}}
			>
				{/* Header */}
				<div className="space-y-2">
					<h2 className="text-3xl font-bold tracking-tight text-white">Deposit USDC</h2>
					<p className="text-sm text-white/50">Scan or copy your wallet address to deposit</p>
				</div>

				{/* QR Code Section */}
				<div className="relative flex justify-center">
					<div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl relative">
						<div className="bg-white p-3 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
							<QRCodeSVG
								value={address}
								size={220}
								bgColor="#FFFFFF"
								fgColor="#7C3AED" // Vibrant purple like the image
								level="H"
								includeMargin={false}
								imageSettings={{
									src: "/favicon.ico", // Attempt to use favicon as center logo if exists
									x: undefined,
									y: undefined,
									height: 40,
									width: 40,
									excavate: true,
								}}
							/>
						</div>
					</div>
				</div>

				{/* Address Section */}
				<div className="space-y-4">
					<div
						onClick={handleCopy}
						className="group flex items-center justify-between gap-4 p-4 bg-black/40 border border-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
						style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 5% 100%, 0% 80%)' }}
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
							<span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Networks</span>
							<div className="h-[1px] w-12 bg-white/10"></div>
						</div>

						<div className="flex items-center justify-center gap-4">
							{/* Network Icons - Placeholder visuals for the logos in the screenshot */}
							<div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group cursor-help transition-transform hover:scale-110" title="Base">
								<div className="w-4 h-4 rounded-full bg-blue-500"></div>
							</div>
							<div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 group cursor-help transition-transform hover:scale-110" title="Polygon">
								<div className="w-4 h-4 rounded-full bg-purple-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
							</div>
							<div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center border border-blue-400/30 group cursor-help transition-transform hover:scale-110" title="Coinbase">
								<div className="w-4 h-4 bg-blue-400"></div>
							</div>
							<div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group cursor-help transition-transform hover:scale-110" title="Ethereum">
								<div className="w-3 h-5 bg-white/40" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
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
