import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { base, baseSepolia, arbitrumSepolia, arbitrum } from 'wagmi/chains';
export { base, baseSepolia };
import { coinbaseWallet } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { QueryClient } from '@tanstack/react-query';

export const activeChain = process.env.NEXT_PUBLIC_CHAIN_ID === '84532' ? baseSepolia : base;
export const chains = [base, baseSepolia, arbitrum, arbitrumSepolia] as const;

export const getConfig = () => {
	return createConfig({
		chains,
		multiInjectedProviderDiscovery: false,
		connectors: [
			coinbaseWallet({
				appName: 'doba',
				preference: 'smartWalletOnly',
			}),
			farcasterMiniApp(),
		],
		storage: createStorage({
			storage: cookieStorage,
		}),
		ssr: true,
		transports: {
			[base.id]: http(),
			[baseSepolia.id]: http(),
			[arbitrumSepolia.id]: http(),
		},
	});
};

export const config = getConfig();
export const queryClient = new QueryClient();
