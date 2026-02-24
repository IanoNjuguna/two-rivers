import { AlchemyAccountsUIConfig, createConfig, cookieStorage } from "@account-kit/react";
import { arbitrum, base, alchemy, defineAlchemyChain } from "@account-kit/infra";
export { arbitrum, base, alchemy, defineAlchemyChain };
import { avalanche as viemAvalanche } from "viem/chains";
import { http } from "viem";
import { QueryClient } from "@tanstack/react-query";

const uiConfig: AlchemyAccountsUIConfig = {
	illustrationStyle: "outline",
	auth: {
		sections: [
			[{ type: "email" }],
			[{ type: "passkey" }],
			[{ type: "external_wallets", walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "" }],
		],
		addPasskeyOnSignup: true,
		header: <img src="/logo.png" alt="Logo" className="w-12 h-12" />,
	},
	supportUrl: "https://doba.world",
};

export const avalancheChain = defineAlchemyChain({
	chain: viemAvalanche,
	rpcBaseUrl: "https://avax-mainnet.g.alchemy.com/v2",
});

const getActiveChain = () => {
	const chain = process.env.NEXT_PUBLIC_ACTIVE_CHAIN;
	if (chain === 'base') return base;
	if (chain === 'avalanche') return avalancheChain;
	return arbitrum;
};

const activeChain = getActiveChain();

export const chains = [arbitrum, base, avalancheChain];

const getPolicyId = (chainId: number) => {
	if (chainId === 8453) return process.env.NEXT_PUBLIC_ALCHEMY_BASE_POLICY_ID;
	if (chainId === 43114) return process.env.NEXT_PUBLIC_ALCHEMY_AVAX_POLICY_ID;
	return process.env.NEXT_PUBLIC_ALCHEMY_ARB_POLICY_ID;
};

if (typeof window === 'undefined') {
	// Mock indexedDB for server-side rendering to prevent WalletConnect/Wagmi from crashing
	(global as any).indexedDB = {
		open: () => ({ onupgradeneeded: null, onsuccess: null, onerror: null }),
	};
}

import { injected } from "@wagmi/core";
import { walletConnect } from "wagmi/connectors";

const globalForConfig = globalThis as unknown as { _config: ReturnType<typeof createConfig> | undefined };

export const getConfig = () => {
	if (globalForConfig._config) return globalForConfig._config;

	const newConfig = createConfig({
		transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
		chain: activeChain,
		chains: [
			{
				chain: arbitrum,
				transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
				policyId: process.env.NEXT_PUBLIC_ALCHEMY_ARB_POLICY_ID,
			},
			{
				chain: base,
				transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
				policyId: process.env.NEXT_PUBLIC_ALCHEMY_BASE_POLICY_ID,
			},
			{
				chain: avalancheChain,
				transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
				policyId: process.env.NEXT_PUBLIC_ALCHEMY_AVAX_POLICY_ID,
			},
		],
		ssr: true,
		storage: cookieStorage,
		enablePopupOauth: true,
		connectors: [
			injected(),
			walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "" })
		],
	}, uiConfig);

	if (process.env.NODE_ENV !== "production") {
		globalForConfig._config = newConfig;
	}

	return newConfig;
};

// NextJS expects this fallback `config` export for some Next pages
export const config = getConfig();

export const queryClient = new QueryClient();
