import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { QueryClient } from '@tanstack/react-query';

export const miniAppWagmiConfig = createConfig({
	chains: [base],
	transports: { [base.id]: http() },
	connectors: [farcasterMiniApp()],
});

export const miniAppQueryClient = new QueryClient();
