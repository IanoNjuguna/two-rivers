'use client'
import { useSignMessage } from 'wagmi'
import { logger } from '@/lib/logger'

import React, { useState, useEffect } from 'react'
import { IconCopy, IconEdit, IconCheck, IconX } from '@tabler/icons-react'
import { toast } from 'sonner'
import MyUploadsGrid from '@/components/MyUploadsGrid'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface UserProfile {
	address: string
	username: string | null
	bio: string | null
	avatar_url: string | null
	farcaster_fid: number | null
}

const formatAddress = (addr: string) => {
	if (!addr) return ''
	return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
}

export function ProfileEditor({ address, client, userEmail, tProfile }: any) {
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [isEditing, setIsEditing] = useState(false)
	const [isLinking, setIsLinking] = useState(false)
	const [username, setUsername] = useState('')
	const [bio, setBio] = useState('')
	const [avatarUrl, setAvatarUrl] = useState('')
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const { signMessageAsync } = useSignMessage()

	const handleLinkFarcaster = async () => {
		try {
			setIsLinking(true)
			const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36)
			const message = `doba.world wants you to sign in with your Ethereum account:\n${address}\n\nLink your Farcaster account to doba.\n\nURI: https://doba.world\nVersion: 1\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`

			// Request signature from the connected wallet (Alchemy EOA)
			const signature = await signMessageAsync({ message })

			const res = await fetch(`${API_URL.replace(/\/$/, '')}/auth/siwf`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message,
					signature,
					nonce,
					skipLink: false
				})
			})

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || errorData.error || 'SIWF Verification failed')
			}

			const data = await res.json()

			if (data.linked) {
				toast.success('Successfully linked Farcaster Account!')
				// Refresh the profile page to show linked status
				setTimeout(() => window.location.reload(), 1000)
			} else {
				// We need to implement the Alchemy Email Link step here if not linked
				toast.info('SIWF pending: Needs Email link signature next. Check console.')
				console.log('Pending SIWF Token:', data.pendingSiwfToken)
			}

		} catch (err: any) {
			logger.error('Farcaster linking failed', err)
			toast.error('Failed to link Farcaster account: ' + (err.message || 'Unknown error'))
		} finally {
			setIsLinking(false)
		}
	}

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await fetch(`${API_URL.replace(/\/$/, '')}/users/${address}`)
				if (res.ok) {
					const data = await res.json()
					setProfile(data)
					setUsername(data.username || '')
					setBio(data.bio || '')
					setAvatarUrl(data.avatar_url || '')
				}
			} catch (err) {
				logger.error('Failed to fetch profile', err)
			} finally {
				setIsLoading(false)
			}
		}

		if (address) {
			fetchProfile()
		}
	}, [address])
	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0]
			const reader = new FileReader()
			reader.onloadend = () => {
				setAvatarUrl(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSaving(true)

		try {
			const res = await fetch(`${API_URL.replace(/\/$/, '')}/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
				},
				body: JSON.stringify({
					address,
					username,
					bio,
					avatar_url: avatarUrl
				})
			})

			if (!res.ok) throw new Error('Failed to save profile')

			setProfile({ address, username, bio, avatar_url: avatarUrl, farcaster_fid: profile?.farcaster_fid || null })
			setIsEditing(false)
			toast.dismiss()
			toast.success('Profile updated successfully!')
		} catch (err) {
			logger.error('Failed to save profile', err)
			toast.dismiss()
			toast.error('Failed to update profile')
		} finally {
			setIsSaving(false)
		}
	}

	if (isLoading) {
		return <div className="p-8 rounded-xl bg-white-2 border border-white/[0.08] animate-pulse h-64"></div>
	}

	if (isEditing) {
		return (
			<form onSubmit={handleSave} className="p-8 rounded-xl bg-[rgba(26,26,36,0.5)] border border-cyber-pink/30 space-y-6 animate-fade-in relative overflow-hidden">
				{/* Decorative elements to match premium design */}
				<div className="absolute -top-24 -right-24 w-48 h-48 bg-cyber-pink/10 rounded-full blur-3xl pointer-events-none" />
				<div className="absolute -bottom-24 -left-24 w-48 h-48 bg-lavender/10 rounded-full blur-3xl pointer-events-none" />

				<div className="flex justify-between items-center relative z-10">
					<h3 className="text-xl font-bold text-white">Edit Profile</h3>
					<button
						type="button"
						onClick={() => setIsEditing(false)}
						className="text-white/40 hover:text-white transition-colors"
						title="Close"
					>
						<IconX size={24} />
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
					{/* Avatar Edit */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-white/80">Avatar</label>
						<div className="flex gap-4 items-center">
							<label
								className="relative cursor-pointer group overflow-hidden w-16 h-16 border-2 border-white/10 shrink-0 clip-angular-avatar"
								title="Upload Avatar"
							>
								{avatarUrl ? (
									<img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full bg-gradient-to-tr from-[#FF1F8A]/40 to-[#B794F4]/40 flex items-center justify-center text-white/50" />
								)}
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
									<IconEdit size={20} className="text-white" />
								</div>
								<input
									type="file"
									accept="image/*"
									onChange={handleAvatarChange}
									className="hidden"
								/>
							</label>
							<div className="text-sm text-white/60">
								<p className="font-medium text-white/80 mb-0.5">Profile Picture</p>
								<p className="text-xs text-white/40">Click the circle to upload. Square aspect ratio recommended.</p>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-white/80">Username</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Your Artist Name"
							className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-cyber-pink focus:ring-1 focus:ring-cyber-pink/50 transition-all placeholder:text-white/20"
						/>
					</div>
				</div>

				<div className="space-y-2 relative z-10">
					<label className="text-sm font-medium text-white/80">Bio</label>
					<textarea
						value={bio}
						onChange={(e) => setBio(e.target.value)}
						placeholder="Tell us about yourself..."
						rows={4}
						className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-cyber-pink focus:ring-1 focus:ring-cyber-pink/50 transition-all resize-none placeholder:text-white/20"
					/>
				</div>

				<div className="flex justify-end gap-4 pt-4 relative z-10">
					<button
						type="button"
						onClick={() => setIsEditing(false)}
						className="px-6 py-2 border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium clip-tag"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isSaving}
						className="bg-cyber-pink hover:bg-cyber-pink/90 text-white font-medium py-2 px-8 flex items-center justify-center gap-2 transition-all disabled:opacity-50 clip-tag"
					>
						{isSaving ? 'Saving...' : (
							<>
								<IconCheck size={18} />
								Save Profile
							</>
						)}
					</button>
				</div>
			</form>
		)
	}

	return (
		<div className="p-8 bg-white-2 border border-white/[0.08] relative group overflow-hidden clip-angular-card">
			{/* Decorative gradient match */}
			<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lavender via-lavender/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			<button
				onClick={() => setIsEditing(true)}
				className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-30"
				title="Edit Profile"
			>
				<IconEdit size={18} />
			</button>

			<div className="flex items-start gap-6 mb-8">
				{profile?.avatar_url ? (
					<img src={profile.avatar_url} alt="Profile" className="w-24 h-24 object-cover border-4 border-white/5 shadow-2xl clip-angular-avatar" />
				) : (
					<div className="w-24 h-24 bg-gradient-to-tr from-[#FF1F8A] to-[#B794F4] shadow-[0_0_30px_rgba(255,31,138,0.3)] border-2 border-white/10 clip-angular-avatar" />
				)}

				<div className="pt-2">
					<h3 className="text-2xl font-bold text-white mb-1">
						{profile?.username || 'Anonymous Artist'}
					</h3>
					{userEmail && <p className="text-white/60 text-sm mb-3">{userEmail}</p>}

					{profile?.bio && (
						<p className="text-white/70 text-sm mt-4 italic leading-relaxed">
							"{profile.bio}"
						</p>
					)}
				</div>
			</div>

			{/* Wallet Address Display */}
			<div className="flex flex-col md:flex-row gap-4 mb-12">
				<div className="flex-1 p-4 bg-black/40 border border-white/5 flex items-center justify-between clip-tag">
					<div>
						<p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">{tProfile('walletAddress')}</p>
						<span className="text-sm font-mono text-white/90">{formatAddress(address)}</span>
					</div>
					<button
						onClick={() => {
							navigator.clipboard.writeText(address)
							toast.success('Address copied!')
						}}
						className="p-2.5 bg-white/5 hover:bg-white/10 transition text-white/70 hover:text-white"
						title={tProfile('copyFull')}
					>
						<IconCopy size={16} />
					</button>
				</div>

				<div className="flex-1 p-4 bg-black/40 border border-white/5 flex items-center justify-between clip-tag">
					<div>
						<p className="text-[#8a63d2]/60 text-[10px] uppercase tracking-widest font-bold mb-1">Farcaster</p>
						<span className="text-sm font-mono text-white/90">
							{profile?.farcaster_fid ? `FID: ${profile.farcaster_fid}` : 'Not Linked'}
						</span>
					</div>
					{profile?.farcaster_fid ? (
						<div className="text-green-400 p-2.5 flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold bg-white/5">
							<IconCheck size={16} /> Linked
						</div>
					) : (
						<button
							onClick={handleLinkFarcaster}
							disabled={isLinking}
							className="text-xs px-4 py-2 border border-[#8a63d2] text-[#8a63d2] hover:bg-[#8a63d2] hover:text-white transition-all font-bold clip-tag disabled:opacity-50"
						>
							{isLinking ? 'Connecting...' : 'Link Account'}
						</button>
					)}
				</div>
			</div>

			{/* Uploads Grid */}
			<div className="pt-8 border-t border-white/10 relative z-10">
				<h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
					<span className="w-1 h-6 bg-cyber-pink rounded-none inline-block"></span>
					My Uploads
				</h4>
				<MyUploadsGrid address={address} />
			</div>
		</div>
	)
}
