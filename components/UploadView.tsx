'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { IconUpload, IconX, IconPlus, IconMusic, IconPhoto, IconTrash, IconCheck, IconChevronDown } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { GENRES } from '@/constants/genres'

interface Collaborator {
	address: string
	split: number
}

export default function UploadView() {
	const t = useTranslations('upload')

	const [open, setOpen] = useState(false)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [genre, setGenre] = useState('')
	const [price, setPrice] = useState('')
	const [audioFile, setAudioFile] = useState<File | null>(null)
	const [coverFile, setCoverFile] = useState<File | null>(null)
	const [collaborators, setCollaborators] = useState<Collaborator[]>([])
	const [isPublishing, setIsPublishing] = useState(false)

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
		setIsPublishing(true)

		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 2000))

		console.log({
			title,
			description,
			genre,
			price,
			audioFile,
			coverFile,
			collaborators
		})

		setIsPublishing(false)
		alert('Track published! (Mock)')
	}

	return (
		<div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-20">
			<div className="border-b border-white/10 pb-6">
				<h2 className="text-3xl font-bold mb-2 text-white">{t('title')}</h2>
				<p className="text-lavender italic text-sm mt-1">
					album support coming soon
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
												<CommandEmpty>No genre found.</CommandEmpty>
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
					<div className="w-full md:w-1/2 space-y-2">
						<label className="text-sm font-medium text-white/80">{t('priceLabel')}</label>
						<div className="relative">
							<input
								type="number"
								step="0.0001"
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
									<p className="text-xs text-white/40 mb-4">{audioFile ? (audioFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'WAV, FLAC, MP3 (Max 50MB)'}</p>
									<label className="cursor-pointer inline-block">
										<span className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-none text-sm font-medium transition-colors">
											{audioFile ? 'Change File' : t('chooseFile')}
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
											<p className="text-xs text-white/30 mb-4">JPG, PNG (Max 5MB)</p>
										</div>
									</>
								)}

								<div className="relative z-10 text-center">
									<label className="cursor-pointer inline-block">
										<span className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-none text-sm font-medium transition-colors backdrop-blur-sm">
											{coverFile ? 'Change Cover' : t('chooseFile')}
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
								<p className="text-sm text-white/40 italic">Add collaborators to split revenue automatically.</p>
							</div>
						)}
					</div>
				</div>

				{/* Action Bar */}
				<div className="pt-8 flex justify-end">
					<Button
						type="submit"
						disabled={isPublishing || !title || !price || !audioFile || !coverFile}
						className={`
                px-8 py-6 text-lg rounded-none font-bold tracking-wide shadow-lg transition-all transform hover:-translate-y-1
                ${!title || !price || !audioFile || !coverFile
								? 'bg-gray-600 cursor-not-allowed opacity-50'
								: 'bg-gradient-to-r from-cyber-pink to-purple-600 hover:shadow-cyber-pink/25 text-white'}
            `}
					>
						{isPublishing ? (
							<span className="flex items-center gap-2">
								<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
								{t('publishing')}
							</span>
						) : t('publish')}
					</Button>
				</div>
			</form>
		</div>
	)
}
