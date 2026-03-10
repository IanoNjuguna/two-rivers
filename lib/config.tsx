import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
export { base, baseSepolia };
import { coinbaseWallet } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { QueryClient } from '@tanstack/react-query';

export const activeChain = process.env.NEXT_PUBLIC_CHAIN_ID === '84532' ? baseSepolia : base;
export const chains = [activeChain] as const;

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
			[baseSepolia.id]: http(),
		},
	});
};

export const config = getConfig();
export const queryClient = new QueryClient();
