import { Alchemy, Network } from 'alchemy-sdk';

const settings = {
	apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
	network: Network.BASE_MAINNET, // Defaulting to Base Mainnet
};

export const alchemy = new Alchemy(settings);

/**
 * Fetch NFTs for a specific owner
 * @param owner The wallet address to fetch NFTs for
 * @returns List of NFTs owned by the address
 */
export const getNFTsForOwner = async (owner: string) => {
	try {
		const nfts = await alchemy.nft.getNftsForOwner(owner);
		return nfts.ownedNfts;
	} catch (error) {
		console.error('Error fetching NFTs from Alchemy:', error);
		return [];
	}
};
