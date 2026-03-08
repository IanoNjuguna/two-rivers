import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { base, arbitrum, avalanche } from 'wagmi/chains';
export { base, arbitrum, avalanche };
import { coinbaseWallet } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { QueryClient } from '@tanstack/react-query';

export const activeChain = base;
export const chains = [base, arbitrum, avalanche] as const;

export const getConfig = () => {
	return createConfig({
		chains,
		multiInjectedProviderDiscovery: true,
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
			[arbitrum.id]: http(),
			[avalanche.id]: http(),
		},
	});
};

export const config = getConfig();
export const queryClient = new QueryClient();
