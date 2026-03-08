'use client';

import React, { useEffect, useState } from 'react';
import { getNFTsForOwner } from '@/lib/alchemy';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';

interface NFT {
	contract: {
		address: string;
	};
	tokenId: string;
	title: string;
	description: string;
	media: {
		gateway?: string;
		thumbnail?: string;
	}[];
}

export default function NFTGallery() {
	const { address: wagmiAddress } = useAccount();
	const { user } = usePrivy();
	const address = wagmiAddress || user?.wallet?.address;

	const [nfts, setNfts] = useState<NFT[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadNFTs() {
			if (!address) {
				setLoading(false);
				return;
			}
			setLoading(true);
			const fetchedNfts = await getNFTsForOwner(address) as NFT[];
			setNfts(fetchedNfts);
			setLoading(false);
		}
		loadNFTs();
	}, [address]);

	if (loading) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="glass rounded-xl h-64 animate-pulse relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
					</div>
				))}
			</div>
		);
	}

	if (!address) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center glass rounded-2xl mx-6 my-12">
				<div className="h-16 w-16 mb-4 text-white/20">
					<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
				</div>
				<h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
				<p className="text-white/60">Connect your wallet to view your private collection.</p>
			</div>
		);
	}

	if (nfts.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center glass rounded-2xl mx-6 my-12">
				<h3 className="text-xl font-bold text-white mb-2">No Music NFTs Found</h3>
				<p className="text-white/60">Your collection is empty on Base. Start collecting to see them here!</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-8">
				<h2 className="text-2xl font-bold text-white flex items-center gap-3">
					<span className="h-2 w-2 rounded-full bg-cyber-pink shadow-[0_0_8px_#FF1F8A]" />
					My Collection
				</h2>
				<span className="text-xs font-mono text-white/40 uppercase tracking-widest">
					{nfts.length} Items Found
				</span>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{nfts.map((nft, index) => (
					<motion.div
						key={`${nft.contract.address}-${nft.tokenId}`}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="group relative glass-hover rounded-xl overflow-hidden aspect-square border border-white/5"
					>
						{/* Image Section */}
						<div className="absolute inset-0 z-0">
							<img
								src={nft.media[0]?.gateway || '/placeholder-nft.png'}
								alt={nft.title}
								className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
						</div>

						{/* Content Section */}
						<div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform">
							<h3 className="text-sm font-bold text-white truncate mb-0.5">{nft.title || 'Untitled Song'}</h3>
							<p className="text-[10px] text-cyber-pink font-mono uppercase tracking-tight">#{nft.tokenId}</p>

							<div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<button className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-cyber-pink hover:text-white transition-colors">
									Play
								</button>
								<button className="glass text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">
									Details
								</button>
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
}
