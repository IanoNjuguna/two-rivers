'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { IconUpload, IconX, IconPlus, IconMusic, IconPhoto, IconTrash, IconCheck, IconChevronDown } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { GENRES } from '@/constants/genres'

import { useSendUserOperation, useSmartAccountClient } from "@account-kit/react"
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDC_ADDRESS, PAYMASTER_ADDRESS, ERC20_ABI, DST_EID } from '@/lib/web3'
import { encodeFunctionData, parseUnits } from 'viem'
import { toast } from 'sonner'

interface Collaborator {
	address: string
	split: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function UploadView({ client: propClient }: { client?: any }) {
	const t = useTranslations('upload')

	const client = propClient

	const [isSending, setIsSending] = useState(false)
	const [open, setOpen] = useState(false)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [genre, setGenre] = useState('')
	const [price, setPrice] = useState('')
	const [supply, setSupply] = useState('5000')
	const [audioFile, setAudioFile] = useState<File | null>(null)
	const [coverFile, setCoverFile] = useState<File | null>(null)
	const [collaborators, setCollaborators] = useState<Collaborator[]>([])
	const [isUploading, setIsUploading] = useState(false)
	const [assetsCid, setAssetsCid] = useState<string | null>(null)
	const [audioName, setAudioName] = useState<string>('')
	const [imageName, setImageName] = useState<string>('')
	const [isAssetsUploading, setIsAssetsUploading] = useState(false)
	const [publishedSongId, setPublishedSongId] = useState<bigint | null>(null)
	const [isSyncing, setIsSyncing] = useState(false)
	const [syncDone, setSyncDone] = useState(false)
	const [isMinting, setIsMinting] = useState(false)
	const [lastUserOpHash, setLastUserOpHash] = useState<string | null>(null)

	// Background Upload Effect
	React.useEffect(() => {
		const triggerBackgroundUpload = async () => {
			if (!audioFile || !coverFile || assetsCid || isAssetsUploading) return

			setIsAssetsUploading(true)
			try {
				const formData = new FormData()
				formData.append('audio', audioFile)
				formData.append('image', coverFile)
				formData.append('title', title || 'Untitled')

				const response = await fetch(`${API_URL}/upload-assets`, {
					method: 'POST',
					body: formData,
				})

				if (response.ok) {
					const data = await response.json()
					setAssetsCid(data.assetsCid)
					setAudioName(data.audioName)
					setImageName(data.imageName)
					console.log('Background upload complete:', data.assetsCid)
				}
			} catch (e) {
				console.error('Background upload failed:', e)
			} finally {
				setIsAssetsUploading(false)
			}
		}

		triggerBackgroundUpload()
	}, [audioFile, coverFile, title])

	const sendUserOperation = async (params: { uo: any, useUSDC?: boolean }) => {
		if (!client) {
			toast.error("Wallet not initialized")
			return
		}

		setIsSending(true)
		try {
			const context = params.useUSDC ? {
				erc20Context: {
					tokenAddress: USDC_ADDRESS as `0x${string}`,
					maxTokenAmount: parseUnits("0.20", 6) // Low friction ceiling: 0.20 USDC
				}
			} : undefined;

			// If using USDC, we might need to override the policy ID if it's different from default
			const overrides = params.useUSDC ? {
				paymasterAndData: {
					policyId: process.env.NEXT_PUBLIC_ALCHEMY_ERC20_POLICY_ID
				}
			} : undefined;

			const { hash } = await client.sendUserOperation({
				uo: params.uo,
				context,
				overrides: overrides as any
			})
			setLastUserOpHash(hash)

			if (!params.useUSDC) {
				toast.info("Preparing gas-free setup...")
			} else {
				toast.success(t('txSubmitted'))
			}

			console.log('UserOp Hash:', hash)
			const txHash = await client.waitForUserOperationTransaction({ hash })
			console.log('Transaction confirmed:', txHash)

			if (params.useUSDC) {
				toast.success(t('uploadSuccess'))
			}
		} catch (error: any) {
			console.error('UserOperation Error:', error)
			toast.error(t('txFailed', { error: error.message || error }))
			throw error
		} finally {
			setIsSending(false)
		}
	}

	const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setAudioFile(e.target.files[0])
		}
	}

	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setCoverFile(e.target.files[0])
		}
	}

	const addCollaborator = () => {
		setCollaborators([...collaborators, { address: '', split: 0 }])
	}

	const updateCollaborator = (index: number, field: keyof Collaborator, value: string | number) => {
		const newCollaborators = [...collaborators]
		if (field === 'split') {
			newCollaborators[index].split = Number(value)
		} else {
			newCollaborators[index].address = String(value)
		}
		setCollaborators(newCollaborators)
	}

	const removeCollaborator = (index: number) => {
		const newCollaborators = collaborators.filter((_, i) => i !== index)
		setCollaborators(newCollaborators)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		console.log('--- Start Publish Flow ---')
		if (!audioFile || !coverFile || !client) {
			console.error('Missing prerequisites:', { audio: !!audioFile, cover: !!coverFile, client: !!client })
			return
		}

		setIsUploading(true)
		const mainToast = toast.loading("Initiating upload process...")

		try {
			// 1. Ensure assets are uploaded
			let currentAssetsCid = assetsCid
			let currentAudioName = audioName
			let currentImageName = imageName

			if (!currentAssetsCid) {
				console.log('Uploading assets to IPFS...')
				toast.loading("Uploading media to IPFS...", { id: mainToast })
				const formData = new FormData()
				formData.append('audio', audioFile)
				formData.append('image', coverFile)
				formData.append('title', title)

				const assetRes = await fetch(`${API_URL}/upload-assets`, {
					method: 'POST',
					body: formData,
				})

				if (!assetRes.ok) throw new Error(`Media upload failed: ${await assetRes.text()}`)
				const assetData = await assetRes.json()
				currentAssetsCid = assetData.assetsCid
				currentAudioName = assetData.audioName
				currentImageName = assetData.imageName
				console.log('Assets uploaded:', currentAssetsCid)
			}

			// 2. Upload Metadata
			console.log('Generating metadata...')
			toast.loading("Generating NFT metadata...", { id: mainToast })
			const metaResponse = await fetch(`${API_URL}/upload-metadata`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					description,
					artist: 'Artist Name',
					genre,
					assetsCid: currentAssetsCid,
					audioName: currentAudioName,
					imageName: currentImageName
				}),
			})

			if (!metaResponse.ok) throw new Error(`Metadata generation failed: ${await metaResponse.text()}`)
			const { metadataUri } = await metaResponse.json()
			console.log('Metadata URI:', metadataUri)

			// 3. Check Allowances (Gas Paymaster + Platform Fee)
			console.log('Checking USDC allowances...')
			toast.loading("Checking permissions...", { id: mainToast })

			const [gasAllowance, platformAllowance] = await Promise.all([
				client.readContract({
					address: USDC_ADDRESS as `0x${string}`,
					abi: ERC20_ABI,
					functionName: 'allowance',
					args: [client.account.address, PAYMASTER_ADDRESS as `0x${string}`],
				}),
				client.readContract({
					address: USDC_ADDRESS as `0x${string}`,
					abi: ERC20_ABI,
					functionName: 'allowance',
					args: [client.account.address, CONTRACT_ADDRESS as `0x${string}`],
				})
			])

			const minGasAllowance = parseUnits("0.20", 6)
			const minPlatformAllowance = parseUnits("2", 6) // Covers 1.99 USDC fee
			const maxAllowance = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")

			console.log('Allowances - Gas:', gasAllowance.toString(), 'Platform:', platformAllowance.toString())

			if (gasAllowance < minGasAllowance || platformAllowance < minPlatformAllowance) {
				console.log('Insufficient allowances. Starting batch Approve UserOp...')
				toast.loading("Step 1/2: Approving platform & gas services...", { id: mainToast })

				const calls = []
				if (gasAllowance < minGasAllowance) {
					calls.push({
						target: USDC_ADDRESS as `0x${string}`,
						data: encodeFunctionData({
							abi: ERC20_ABI,
							functionName: 'approve',
							args: [PAYMASTER_ADDRESS as `0x${string}`, maxAllowance],
						})
					})
				}
				if (platformAllowance < minPlatformAllowance) {
					calls.push({
						target: USDC_ADDRESS as `0x${string}`,
						data: encodeFunctionData({
							abi: ERC20_ABI,
							functionName: 'approve',
							args: [CONTRACT_ADDRESS as `0x${string}`, maxAllowance],
						})
					})
				}

				await sendUserOperation({
					uo: calls,
					useUSDC: false // Sponsored Approve
				})

				console.log('Approve batch confirmed.')
				toast.loading("Propagation delay (3s)...", { id: mainToast })
				await new Promise(r => setTimeout(r, 3000)) // Wait for RPC propagation
			}

			// 4. Final Publish Transaction
			console.log('Preparing Publish UserOp...')
			toast.loading("Step 2/2: Publishing your song...", { id: mainToast })

			let collaboratorsList = collaborators.map(c => c.address).filter(a => a !== '')
			let sharesList = collaborators.filter(c => c.address !== '').map(c => BigInt(Math.floor((Number(c.split) || 0) * 100)))

			if (collaboratorsList.length === 0) {
				collaboratorsList = [client.account.address]
				sharesList = [10000n]
			}

			// Safety check for supply and price
			const safeSupply = BigInt(supply || '1')
			const safePrice = parseUnits(price || '0', 6)

			const publishData = encodeFunctionData({
				abi: CONTRACT_ABI,
				functionName: 'publish',
				args: [
					metadataUri,
					safeSupply,
					safePrice,
					collaboratorsList,
					sharesList
				],
			})

			console.log('Sending Publish UserOp...')
			await sendUserOperation({
				uo: { target: CONTRACT_ADDRESS as `0x${string}`, data: publishData },
				useUSDC: true
			})

			// Capture the song ID for syncing
			const nextId = await client.readContract({
				address: CONTRACT_ADDRESS as `0x${string}`,
				abi: CONTRACT_ABI,
				functionName: 'nextSongId',
			})
			setPublishedSongId(BigInt(nextId as any) - 1n)

			console.log('--- Publish Flow Complete ---')
			toast.success("Song published successfully!", { id: mainToast })

		} catch (error: any) {
			console.error('Submit Error:', error)
			toast.error(error.message || "An unexpected error occurred during upload", { id: mainToast })
		} finally {
			setIsUploading(false)
		}
	}

	const handleSync = async () => {
		if (!client || publishedSongId === null) return

		setIsSyncing(true)
		const syncToast = toast.loading("Syncing song on-chain...")

		try {
			const collaboratorsList = collaborators.map(c => c.address).filter(a => a !== '')
			const sharesList = collaborators.filter(c => c.address !== '').map(c => BigInt(Math.floor((Number(c.split) || 0) * 100)))

			// 1. Quote Fee
			const messagingFee = await client.readContract({
				address: CONTRACT_ADDRESS as `0x${string}`,
				abi: CONTRACT_ABI,
				functionName: 'quoteSyncSong',
				args: [
					DST_EID,
					publishedSongId,
					collaboratorsList,
					sharesList,
					"0x" // no options for now
				]
			}) as { nativeFee: bigint, lzTokenFee: bigint }

			console.log('LZ Messaging Fee:', messagingFee.nativeFee.toString())

			// 2. Send Sync UserOp
			const syncData = encodeFunctionData({
				abi: CONTRACT_ABI,
				functionName: 'syncSong',
				args: [
					DST_EID,
					publishedSongId,
					collaboratorsList,
					sharesList,
					"0x"
				]
			})

			await sendUserOperation({
				uo: {
					target: CONTRACT_ADDRESS as `0x${string}`,
					data: syncData,
					value: messagingFee.nativeFee // LZ Messaging fees must be sent as value
				},
				useUSDC: false // Sync is typically small enough to be sponsored by the project
			})

			setSyncDone(true)
			toast.success("Song synced successfully! It will appear on other networks shortly.", { id: syncToast })
		} catch (error: any) {
			console.error('Sync Error:', error)
			toast.error(`Sync failed: ${error.message}`, { id: syncToast })
		} finally {
			setIsSyncing(false)
		}
	}

	const handleMint = async () => {
		if (!client || publishedSongId === null) return

		setIsMinting(true)
		const mintToast = toast.loading("Minting your first copy...")

		try {
			const mintData = encodeFunctionData({
				abi: CONTRACT_ABI,
				functionName: 'mint',
				args: [publishedSongId],
			})

			await sendUserOperation({
				uo: { target: CONTRACT_ADDRESS as `0x${string}`, data: mintData },
				useUSDC: true
			})

			toast.success("First copy minted successfully!", { id: mintToast })
		} catch (error: any) {
			console.error('Mint Error:', error)
			toast.error(`Minting failed: ${error.message}`, { id: mintToast })
		} finally {
			setIsMinting(false)
		}
	}


	return (
		<div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-20">
			<div className="border-b border-white/10 pb-6">
				<h2 className="text-3xl font-bold mb-2 text-white">{t('title')}</h2>
				<p className="text-lavender italic text-sm mt-1">
					{t('albumSupportSoon')}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-10">
				{/* Track Details */}
				<div className="space-y-6">
					<h3 className="text-xl font-semibold flex items-center gap-2 text-white/90">
						<span className="w-1 h-6 bg-cyber-pink rounded-none"></span>
						{t('details')}
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label className="text-sm font-medium text-white/80">{t('trackTitleLabel')}</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder={t('trackTitlePlaceholder')}
								className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-cyber-pink focus:ring-1 focus:ring-cyber-pink/50 transition-all placeholder:text-white/20"
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-white/80">{t('genreLabel')}</label>
							<div className="relative">
								<Popover open={open} onOpenChange={setOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={open}
											className="w-full justify-between bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white text-base hover:bg-white/10 hover:text-white h-auto"
										>
											{genre
												? GENRES.find((g) => g === genre)
												: t('genrePlaceholder')}
											<IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#0D0D12] border-white/10 rounded-none">
										<Command className="bg-[#0D0D12] text-white rounded-none">
											<CommandInput placeholder="Search genre..." className="h-9 text-white" />
											<CommandList>
												<CommandEmpty>{t('noGenre')}</CommandEmpty>
												<CommandGroup>
													{GENRES.map((g) => (
														<CommandItem
															key={g}
															value={g}
															onSelect={(currentValue) => {
																setGenre(currentValue === genre ? "" : currentValue)
																setOpen(false)
															}}
															className="text-white hover:bg-white/10 aria-selected:bg-white/10 cursor-pointer"
														>
															<IconCheck
																className={cn(
																	"mr-2 h-4 w-4",
																	genre === g ? "opacity-100" : "opacity-0"
																)}
															/>
															{g}
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-white/80">{t('descriptionLabel')}</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder={t('descriptionPlaceholder')}
							rows={4}
							className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-cyber-pink focus:ring-1 focus:ring-cyber-pink/50 transition-all resize-none placeholder:text-white/20"
						/>
					</div>
				</div>

				{/* Pricing */}
				<div className="space-y-6">
					<h3 className="text-xl font-semibold flex items-center gap-2 text-white/90">
						<span className="w-1 h-6 bg-purple-400 rounded-none"></span>
						{t('pricing')}
					</h3>
					<div className="space-y-2">
						<label className="text-sm font-medium text-white/80">{t('priceLabel')}</label>
						<div className="relative">
							<input
								type="number"
								step="0.01"
								min="0"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								placeholder={t('pricePlaceholder')}
								className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 pl-14 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all placeholder:text-white/20"
								required
							/>
							<div className="absolute left-4 top-1/2 -translate-y-1/2">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000" className="w-6 h-6">
									<path d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z" fill="#2775ca" />
									<path d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z" fill="#fff" />
									<path d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z" fill="#fff" />
								</svg>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-white/80">{t('maxSupplyLabel')}</label>
						<input
							type="number"
							min="1"
							value={supply}
							onChange={(e) => setSupply(e.target.value)}
							placeholder={t('maxSupplyPlaceholder')}
							className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all placeholder:text-white/20"
							required
						/>
						<p className="text-[10px] text-white/40 italic">{t('maxSupplyHint')}</p>
					</div>
				</div>

				{/* Media */}
				<div className="space-y-6">
					<h3 className="text-xl font-semibold flex items-center gap-2 text-white/90">
						<span className="w-1 h-6 bg-blue-400 rounded-none"></span>
						{t('media')}
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Audio Upload */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-white/80">{t('audioLabel')}</label>
							<div
								className={`border-2 border-dashed rounded-none h-64 flex flex-col items-center justify-center gap-4 transition-all bg-white/[0.02] group
                ${audioFile ? 'border-cyber-pink/50 bg-cyber-pink/[0.05]' : 'border-white/10 hover:border-white/30 hover:bg-white/[0.05]'}`}
							>
								<div className={`p-4 rounded-none transition-colors ${audioFile ? 'bg-cyber-pink/20 text-cyber-pink' : 'bg-white/5 text-white/40 group-hover:text-white/60'}`}>
									<IconMusic size={32} />
								</div>
								<div className="text-center px-4">
									<p className="text-sm text-white/80 mb-1 font-medium truncate max-w-[200px]">
										{audioFile ? audioFile.name : t('dragDrop')}
									</p>
									<p className="text-xs text-white/40 mb-4">{audioFile ? (audioFile.size / 1024 / 1024).toFixed(2) + ' MB' : t('audioHint')}</p>
									<label className="cursor-pointer inline-block">
										<span className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-none text-sm font-medium transition-colors">
											{audioFile ? t('changeFile') : t('chooseFile')}
										</span>
										<input type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" />
									</label>
								</div>
							</div>
						</div>

						{/* Cover Art Upload */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-white/80">{t('coverArtLabel')}</label>
							<div
								className={`border-2 border-dashed rounded-none h-64 flex flex-col items-center justify-center gap-4 transition-all bg-white/[0.02] group relative overflow-hidden
                ${coverFile ? 'border-purple-400/50' : 'border-white/10 hover:border-white/30 hover:bg-white/[0.05]'}`}
							>
								{coverFile ? (
									<>
										<div className="absolute inset-0 w-full h-full">
											<img
												src={URL.createObjectURL(coverFile)}
												alt="Preview"
												className="w-full h-full object-cover opacity-50 blur-sm"
											/>
											<div className="absolute inset-0 bg-black/40"></div>
										</div>
										<div className="relative z-10 flex flex-col items-center">
											<img
												src={URL.createObjectURL(coverFile)}
												alt="Preview"
												className="w-32 h-32 object-cover rounded-none shadow-2xl mb-4 border border-white/20"
											/>
											<p className="text-xs text-white/60 mb-2 truncate max-w-[200px]">{coverFile.name}</p>
										</div>
									</>
								) : (
									<>
										<div className="p-4 rounded-none bg-white/5 text-white/40 group-hover:text-white/60 transition-colors">
											<IconPhoto size={32} />
										</div>
										<div className="text-center">
											<p className="text-sm text-white/60 mb-1">{t('dragDrop')}</p>
											<p className="text-xs text-white/30 mb-4">{t('coverArtHint')}</p>
										</div>
									</>
								)}

								<div className="relative z-10 text-center">
									<label className="cursor-pointer inline-block">
										<span className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-none text-sm font-medium transition-colors backdrop-blur-sm">
											{coverFile ? t('changeCover') : t('chooseFile')}
										</span>
										<input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
									</label>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Collaborators */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-semibold flex items-center gap-2 text-white/90">
							<span className="w-1 h-6 bg-green-400 rounded-none"></span>
							{t('collaborators')}
						</h3>
						<button
							type="button"
							onClick={addCollaborator}
							className="text-sm text-green-400 hover:text-green-300 bg-green-400/10 hover:bg-green-400/20 px-3 py-1.5 rounded-none flex items-center gap-1.5 transition-colors font-medium"
						>
							<IconPlus size={16} />
							{t('addCollaborator')}
						</button>
					</div>

					<div className="space-y-3">
						{collaborators.map((collaborator, index) => (
							<div key={index} className="flex gap-3 items-start animate-fade-in group">
								<div className="flex-1">
									<input
										type="text"
										value={collaborator.address}
										onChange={(e) => updateCollaborator(index, 'address', e.target.value)}
										placeholder={t('walletAddress')}
										className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/50 transition-all font-mono"
									/>
								</div>
								<div className="w-28 relative">
									<input
										type="number"
										value={collaborator.split}
										onChange={(e) => updateCollaborator(index, 'split', e.target.value)}
										placeholder={t('splitPercentage')}
										className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/50 transition-all text-center"
									/>
									<div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold">%</div>
								</div>
								<button
									type="button"
									onClick={() => removeCollaborator(index)}
									className="p-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-none transition-colors"
									aria-label={t('remove')}
								>
									<IconTrash size={20} />
								</button>
							</div>
						))}
						{collaborators.length === 0 && (
							<div className="text-center py-8 border border-white/5 rounded-none bg-white/[0.02]">
								<p className="text-sm text-white/40 italic">{t('collaboratorsHint')}</p>
							</div>
						)}
					</div>
				</div>

				{/* Status & Tracking */}
				{(lastUserOpHash || publishedSongId !== null) && (
					<div className="bg-white/[0.02] border border-white/10 p-4 space-y-3">
						<div className="flex items-center justify-between text-xs">
							<span className="text-white/40 uppercase tracking-wider font-bold">Transaction Status</span>
							{lastUserOpHash && (
								<a
									href={`https://jiffyscan.xyz/userOpHash/${lastUserOpHash}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-cyber-pink hover:underline flex items-center gap-1"
								>
									Track on Jiffyscan
								</a>
							)}
						</div>
						{publishedSongId !== null && (
							<div className="flex items-center justify-between">
								<span className="text-sm text-white/80">Song ID: {publishedSongId.toString()}</span>
								<span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-none font-bold">PUBLISHED</span>
							</div>
						)}
					</div>
				)}

				{/* Action Bar */}
				<div className="pt-8 flex flex-col gap-4">
					{syncDone ? (
						<div className="flex gap-4">
							<button
								type="button"
								disabled={isMinting}
								onClick={handleMint}
								className="flex-1 bg-cyber-pink hover:bg-cyber-pink/90 text-white font-medium py-4 px-6 rounded-none flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
							>
								{isMinting ? (
									<>
										<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										MINTING...
									</>
								) : (
									<>
										<IconMusic size={20} />
										MINT 1ST COPY (TEST)
									</>
								)}
							</button>
							<div className="flex-1 bg-[#2ecc71]/10 border border-[#2ecc71] text-[#2ecc71] font-medium py-4 px-6 rounded-none flex items-center justify-center gap-2 cursor-default">
								<IconCheck size={20} />
								{t('syncedOnchain', { defaultMessage: "SYNCED ON-CHAIN" })}
							</div>
						</div>
					) : publishedSongId !== null ? (
						<button
							onClick={handleSync}
							type="button"
							disabled={isSyncing}
							className="w-full bg-[#3498db] hover:bg-[#3498db]/90 text-white font-medium py-4 px-6 rounded-none flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
						>
							{isSyncing ? (
								<>
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									{t('syncing', { defaultMessage: "SYNCING..." })}
								</>
							) : (
								<>
									<IconMusic size={20} />
									{t('syncOnchain', { defaultMessage: "SYNC ON-CHAIN" })}
								</>
							)}
						</button>
					) : (
						<button
							type="submit"
							disabled={isUploading || isSending}
							className="w-full bg-cyber-pink hover:bg-cyber-pink/90 text-white font-medium py-4 px-6 rounded-none flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
						>
							{isUploading ? (
								<>
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									{t('uploadingMedia')}
								</>
							) : isSending ? (
								<>
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									{t('confirmingTx', { defaultMessage: "Confirming Transaction..." })}
								</>
							) : (
								<>
									<IconUpload size={20} className="group-hover:-translate-y-0.5 transition-transform" />
									{t('publishNow')}
								</>
							)}
						</button>
					)}
				</div>
			</form>
		</div>
	)
}
