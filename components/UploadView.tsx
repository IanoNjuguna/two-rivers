import { logger } from '@/lib/logger'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { IconUpload, IconX, IconPlus, IconMusic, IconPhoto, IconTrash, IconCheck, IconChevronDown } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { GENRES } from '@/constants/genres'

import { useSendUserOperation, useSmartAccountClient, useChain } from "@account-kit/react"
import { getAddressesForChain, getDstEid, CONTRACT_ABI, ERC20_ABI, LZ_SYNC_OPTIONS } from '@/lib/web3'
import { encodeFunctionData, parseUnits } from 'viem'
import { toast } from 'sonner'

interface Collaborator {
	address: string
	split: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function UploadView({ client: propClient }: { client?: any }) {
	const t = useTranslations('upload')
	const { chain } = useChain()
	const { usdc: USDC_ADDRESS, contract: CONTRACT_ADDRESS, paymaster: PAYMASTER_ADDRESS } = getAddressesForChain(chain.id)
	const DST_EID = getDstEid(chain.id)

	const client = propClient

	const [isSending, setIsSending] = useState(false)
	const [open, setOpen] = useState(false)
	const [title, setTitle] = useState('')
	const [artistName, setArtistName] = useState('')
	const [description, setDescription] = useState('')
	const [genre, setGenre] = useState('')
	const [price, setPrice] = useState('0.99')
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
	const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null)
	const [nativeBalance, setNativeBalance] = useState<bigint | null>(null)
	const [hasCollected, setHasCollected] = useState(false)

	// Background Fetch Balance
	React.useEffect(() => {
		const fetchBalance = async () => {
			if (!client || !client.account) {
				return;
			}


			try {
				const balance = await client.readContract({
					address: USDC_ADDRESS as `0x${string}`,
					abi: ERC20_ABI,
					functionName: 'balanceOf',
					args: [client.account.address],
				})

				setUsdcBalance(balance as bigint)

				// Also fetch native balance
				const nBalance = await client.getBalance({ address: client.account.address })
				setNativeBalance(nBalance)
			} catch (e) {
				logger.error('UploadView: Failed to fetch balances', e)
			}
		}
		fetchBalance()
	}, [client])

	// Background Fetch NFT Balance (to detect if already collected)
	React.useEffect(() => {
		const fetchNftBalance = async () => {
			if (!client || !client.account || publishedSongId === null) return;

			try {
				const balance = await client.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'balanceOf',
					args: [client.account.address, publishedSongId],
				})
				setHasCollected(balance > 0n)
			} catch (e) {
				logger.error('UploadView: Failed to fetch NFT balance', e)
			}
		}

		if (publishedSongId !== null) {
			fetchNftBalance()
		}
	}, [client, publishedSongId])

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
					headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '' },
					body: formData,
				})

				if (response.ok) {
					const data = await response.json()
					setAudioName(data.audioHash) // Store the hash
					setImageName(data.imageHash) // Store the hash

					// Use a separate state to flag that background is done
					setAssetsCid("READY")
				}
			} catch (e) {
				logger.error('Background upload failed', e)
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
			// We have removed the ERC20 Paymaster (Sponsored Gas) for now
			// users will pay with native ETH/AVAX
			const { hash } = await client.sendUserOperation({
				uo: params.uo
			})
			setLastUserOpHash(hash)

			toast.success(t('txSubmitted'))

			const txHash = await client.waitForUserOperationTransaction({ hash })

			const receipt = await client.getTransactionReceipt({ hash: txHash })

			toast.success(t('uploadSuccess'))
			return receipt
		} catch (error: any) {
			logger.error('UserOperation Error', error)
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

		if (!audioFile || !coverFile || !client) {
			const status = `audio: ${!!audioFile}, cover: ${!!coverFile}, client: ${!!client}`
			logger.warn('Missing prerequisites for mint', status)
			toast.error(`Please ensure you have selected both audio and cover files, and your wallet is connected. (${status})`)
			return
		}

		setIsUploading(true)
		const mainToast = toast.loading("Initiating upload process...")

		try {
			let currentAudioHash = audioName || ''
			let currentImageHash = imageName || ''
			let currentAudioName = ''
			let currentImageName = ''

			if (!assetsCid || assetsCid !== "READY" || !currentAudioHash) {

				toast.loading("Uploading media to IPFS...", { id: mainToast })
				const formData = new FormData()
				formData.append('audio', audioFile)
				formData.append('image', coverFile)
				formData.append('title', title)

				const assetRes = await fetch(`${API_URL}/upload-assets`, {
					method: 'POST',
					headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '' },
					body: formData,
				})

				if (!assetRes.ok) throw new Error(`Media upload failed: ${await assetRes.text()}`)
				const assetData = await assetRes.json()

				currentAudioHash = assetData.audioHash
				currentImageHash = assetData.imageHash
				currentAudioName = assetData.audioName
				currentImageName = assetData.imageName


			}

			// 2. Upload Metadata

			toast.loading("Generating NFT metadata...", { id: mainToast })
			const metaResponse = await fetch(`${API_URL}/upload-metadata`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
				},
				body: JSON.stringify({
					title: currentAudioName.replace('audio_', '').replace('.mp3', ''),
					description,
					artist: artistName || 'Unknown Artist',
					genre,
					audioHash: currentAudioHash,
					imageHash: currentImageHash,
					audioName: currentAudioName,
					imageName: currentImageName
				}),
			})

			if (!metaResponse.ok) throw new Error(`Metadata generation failed: ${await metaResponse.text()}`)
			const { metadataUri } = await metaResponse.json()


			// 3. Check Allowances (Gas Paymaster + Platform Fee)

			toast.loading("Checking permissions...", { id: mainToast })

			const [gasAllowance, platformAllowance, contractOwner, botFee, mintPrice] = await Promise.all([
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
				}),
				client.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'owner',
				}),
				client.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'botFee',
				}),
				client.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'MINT_PRICE',
				}),
			])

			const isOwner = client.account.address.toLowerCase() === (contractOwner as string).toLowerCase()
			const currentBotFee = isOwner ? 0n : BigInt(botFee as any)
			const currentMintPrice = BigInt(mintPrice as any)
			const totalUsdcNeeded = currentBotFee + currentMintPrice

			// Check Balance First
			const userBalance = await client.readContract({
				address: USDC_ADDRESS as `0x${string}`,
				abi: ERC20_ABI,
				functionName: 'balanceOf',
				args: [client.account.address],
			}) as bigint

			if (userBalance < totalUsdcNeeded) {
				const short = totalUsdcNeeded - userBalance
				const shortAmount = (Number(short) / 1e6).toFixed(2)
				throw new Error(`Insufficient USDC balance for batch operations. You need another ${shortAmount} USDC. Current: ${(Number(userBalance) / 1e6).toFixed(2)} / Needed: ${(Number(totalUsdcNeeded) / 1e6).toFixed(2)}`)
			}

			const minGasAllowance = parseUnits("0.20", 6)
			const minPlatformAllowance = totalUsdcNeeded
			const maxAllowance = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")

			if (gasAllowance < minGasAllowance || platformAllowance < minPlatformAllowance) {
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


				toast.loading("Propagation delay (3s)...", { id: mainToast })
				await new Promise(r => setTimeout(r, 3000)) // Wait for RPC propagation
			}

			// 4. PREPARE BATCH CALLS

			toast.loading("Preparing one-click publish batch...", { id: mainToast })

			const nextId = await client.readContract({
				address: CONTRACT_ADDRESS as `0x${string}`,
				abi: CONTRACT_ABI,
				functionName: 'nextCollectionId',
			})
			const tokenId = BigInt(nextId as any)

			let collaboratorsList = collaborators.map(c => c.address).filter(a => a !== '')
			let sharesList = collaborators.filter(c => c.address !== '').map(c => BigInt(Math.floor((Number(c.split) || 0) * 100)))

			if (collaboratorsList.length === 0) {
				collaboratorsList = [client.account.address]
				sharesList = [10000n]
			}

			const calls = []

			// A. Publish Call
			calls.push({
				target: CONTRACT_ADDRESS as `0x${string}`,
				data: encodeFunctionData({
					abi: CONTRACT_ABI,
					functionName: 'publish',
					args: [metadataUri, BigInt(supply || '5000'), collaboratorsList as `0x${string}`[], sharesList],
				})
			})

			// B. Initial Mint Call (Optional but highly recommended for UX)
			calls.push({
				target: CONTRACT_ADDRESS as `0x${string}`,
				data: encodeFunctionData({
					abi: CONTRACT_ABI,
					functionName: 'mint',
					args: [tokenId],
				})
			})

			// C. LayerZero Sync Call
			let messagingFee = 150000000000000n // 0.00015 ETH fallback
			try {
				const fee = await client.readContract({
					address: CONTRACT_ADDRESS as `0x${string}`,
					abi: CONTRACT_ABI,
					functionName: 'quoteSyncSong',
					args: [DST_EID, tokenId, LZ_SYNC_OPTIONS]
				}) as bigint
				messagingFee = fee
			} catch (e) {
				console.warn('[DEBUG] Quote for predicted ID failed (expected if it does not exist yet). Trying ID 0 as proxy...')
				try {
					const fallbackFee = await client.readContract({
						address: CONTRACT_ADDRESS as `0x${string}`,
						abi: CONTRACT_ABI,
						functionName: 'quoteSyncSong',
						args: [DST_EID, 0n, LZ_SYNC_OPTIONS]
					}) as bigint
					messagingFee = fallbackFee
				} catch (e2) {
					logger.warn('Both quote attempts failed. Using static fallback for messaging fee.')
				}
			}



			calls.push({
				target: CONTRACT_ADDRESS as `0x${string}`,
				data: encodeFunctionData({
					abi: CONTRACT_ABI,
					functionName: 'syncSong',
					args: [DST_EID, tokenId, LZ_SYNC_OPTIONS],
				}),
				value: messagingFee
			})

			// 5. SEND BATCH USER OPERATION

			toast.loading("Sending one-click publish batch...", { id: mainToast })

			const receipt = await sendUserOperation({
				uo: calls,
				useUSDC: false // Initial publish is sponsored
			})

			// Extract Splitter from logs
			let splitterAddress = ''
			try {
				const { decodeEventLog } = await import('viem')
				const log = receipt.logs.find((l: any) => l.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase())
				if (log) {
					const event = decodeEventLog({
						abi: CONTRACT_ABI,
						data: log.data,
						topics: log.topics,
					})
					if (event.eventName === 'CollectionPublished') {
						splitterAddress = (event.args as any).splitter
					}
				}
			} catch (e) {
				logger.warn('Failed to decode logs for splitter', e)
			}

			setPublishedSongId(tokenId)
			setSyncDone(true)
			setHasCollected(true)

			// 6. Register in Backend (Discovery Index)
			try {
				await fetch(`${API_URL}/tracks`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
					},
					body: JSON.stringify({
						token_id: Number(tokenId),
						name: title,
						description,
						artist: artistName || 'Unknown Artist',
						genre,
						image_url: `ipfs://${imageName}`,
						audio_url: `ipfs://${audioName}`,
						external_url: `https://doba.world/tracks/${tokenId}`,
						price: price || '0.99',
						max_supply: supply || '5000',
						splitter: splitterAddress,
						tx_hash: receipt.transactionHash,
						uploader_address: client.account.address
					}),
				})

				// 7. Register Collaborators in Backend
				if (collaborators.length > 0) {
					for (const collab of collaborators) {
						if (!collab.address) continue;
						await fetch(`${API_URL}/collaborators`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
							},
							body: JSON.stringify({
								track_id: Number(tokenId),
								wallet_address: collab.address,
								split_percentage: Number(collab.split) || 0
							}),
						})
					}

				}
			} catch (e) {
				logger.error('Backend indexing failed', e)
			}


			toast.success("Song published, minted, and synced successfully!", { id: mainToast })

		} catch (error: any) {
			logger.error('Submit Error', error)

			// Parse common blockchain errors into friendly messages
			let errorMessage = error.message || "An unexpected error occurred during upload"

			if (errorMessage.includes("transfer amount exceeds balance") || JSON.stringify(error).includes("insufficient funds")) {
				errorMessage = "Insufficient USDC balance. Please top up your Smart Account with at least 2 USDC to proceed."
			} else if (errorMessage.includes("User rejected the request")) {
				errorMessage = "Transaction was canceled. You need to sign the request to publish."
			}

			toast.error(errorMessage, { id: mainToast, duration: 5000 })
		} finally {
			setIsUploading(false)
		}
	}

	const handleSync = async () => {
		if (!client || publishedSongId === null) return

		setIsSyncing(true)
		const syncToast = toast.loading("Syncing song on-chain...")

		try {

			// 1. Quote Fee
			const messagingFee = await client.readContract({
				address: CONTRACT_ADDRESS as `0x${string}`,
				abi: CONTRACT_ABI,
				functionName: 'quoteSyncSong',
				args: [
					DST_EID,
					publishedSongId,
					LZ_SYNC_OPTIONS
				]
			}) as bigint



			// 2. Check Native Balance
			const nativeBalance = await client.getBalance({
				address: client.account.address
			})

			if (nativeBalance < messagingFee) {
				const needed = messagingFee - nativeBalance
				const neededEth = parseFloat(needed.toString()) / 1e18
				toast.error(
					`Insufficient native balance for cross-chain sync fee. You need ~${neededEth.toFixed(5)} more ${chain.name.includes('Arbitrum') ? 'ETH' : 'Native Token'}. Please fund your Smart Account: ${client.account.address}`,
					{ id: syncToast, duration: 10000 }
				)
				setIsSyncing(false)
				return
			}

			// 3. Send Sync UserOp
			const syncData = encodeFunctionData({
				abi: CONTRACT_ABI,
				functionName: 'syncSong',
				args: [
					DST_EID,
					publishedSongId,
					LZ_SYNC_OPTIONS
				]
			})

			await sendUserOperation({
				uo: {
					target: CONTRACT_ADDRESS as `0x${string}`,
					data: syncData,
					value: messagingFee // LZ Messaging fees must be sent as value
				},
				useUSDC: false // Sync is typically small enough to be sponsored by the project
			})

			setSyncDone(true)
			toast.success("Song synced successfully! It will appear on other networks shortly.", { id: syncToast })
		} catch (error: any) {
			logger.error('Sync Error', error)

			// Detect common L0 / Balance issues
			if (error.message?.includes('insufficient funds') || error.details?.includes('reverted')) {
				toast.error(`Sync failed: Insufficient native funds for LayerZero cross-chain fees. Please add a small amount of ETH to your Smart Account: ${client.account.address}`, { id: syncToast, duration: 8000 })
			} else {
				toast.error(`Sync failed: ${error.message}`, { id: syncToast })
			}
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

			setHasCollected(true)
			toast.success("First copy minted successfully!", { id: mintToast })
		} catch (error: any) {
			logger.error('Mint Error', error)
			if (error.message?.includes('Already Collected') || error.details?.includes('Already Collected')) {
				toast.error("You have already collected this edition. Only one edition per fan is allowed.", { id: mintToast })
			} else {
				toast.error(`Minting failed: ${error.message}`, { id: mintToast })
			}
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

			{usdcBalance !== null && usdcBalance < 1980000n && (
				<div className="bg-amber-500/10 border border-amber-500/50 p-6 flex items-start gap-4 animate-fade-in group mb-4">
					<div className="text-amber-500 mt-1">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
					</div>
					<div className="flex-1">
						<h4 className="text-sm font-bold text-amber-500 uppercase tracking-tight mb-1">USDC Balance Required</h4>
						<p className="text-xs text-white/70 leading-relaxed mb-3">
							To publish on <strong>Doba</strong>, you need <strong>1.98 USDC</strong>.
							Your balance: <strong>{(Number(usdcBalance) / 1e6).toFixed(2)} USDC</strong>.
						</p>
						<p className="text-[10px] text-white/40 italic">
							Top up Wallet: <span className="text-amber-500/80 font-mono">{client?.account?.address}</span>
						</p>
					</div>
				</div>
			)}

			{nativeBalance !== null && nativeBalance < 1000000000000000n && (
				<div className="bg-blue-500/10 border border-blue-500/50 p-6 flex items-start gap-4 animate-fade-in group mb-4">
					<div className="text-blue-500 mt-1">
						<IconMusic size={24} />
					</div>
					<div className="flex-1">
						<h4 className="text-sm font-bold text-blue-500 uppercase tracking-tight mb-1">Native Gas Required</h4>
						<p className="text-xs text-white/70 leading-relaxed mb-3">
							You need a small amount of <strong>{chain.name.includes('Arbitrum') ? 'ETH' : (chain.name.includes('Base') ? 'ETH' : 'AVAX')}</strong> for gas fees.
							Recommended: <strong>$1 - $2</strong>.
						</p>
						<p className="text-[10px] text-white/40 italic">
							Fund Wallet: <span className="text-blue-500/80 font-mono">{client?.account?.address}</span>
						</p>
					</div>
				</div>
			)}

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
							<label className="text-sm font-medium text-white/80">{t('artistNameLabel', { defaultMessage: 'Artist Name' })}</label>
							<input
								type="text"
								value={artistName}
								onChange={(e) => setArtistName(e.target.value)}
								placeholder={t('artistNamePlaceholder', { defaultMessage: 'Enter artist name' })}
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
								className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 pl-14 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all placeholder:text-white/20 opacity-60 cursor-not-allowed"
								readOnly
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
						<div>
							<h3 className="text-xl font-semibold flex items-center gap-2 text-white/90">
								<span className="w-1 h-6 bg-green-400 rounded-none"></span>
								{t('collaborators')}
							</h3>
							<p className="text-[10px] text-white/40 mt-1 font-medium">{t('collaboratorsWarning')}</p>
						</div>
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
								disabled={isMinting || hasCollected}
								onClick={handleMint}
								className={`flex-1 ${hasCollected ? 'bg-green-500/20 text-green-400 border border-green-500/30 font-bold' : 'bg-cyber-pink hover:bg-cyber-pink/90 text-white font-medium'} py-4 px-6 rounded-none flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50`}
							>
								{isMinting ? (
									<>
										<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										{t('minting')}
									</>
								) : hasCollected ? (
									<>
										<IconCheck size={20} />
										{t('alreadyCollected', { defaultMessage: 'ALREADY COLLECTED' })}
									</>
								) : (
									<>
										<IconMusic size={20} />
										{t('mintFirstCopy', { defaultMessage: 'MINT YOUR FIRST COPY' })}
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
							disabled={isUploading || isSending || !audioFile || !coverFile || !client}
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
