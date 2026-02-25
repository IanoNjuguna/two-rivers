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
		],
		addPasskeyOnSignup: false,
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

	const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
	const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;

	const getTransport = (chainId?: number) => {
		if (typeof window !== 'undefined') {
			console.log(`[Alchemy] Transport for ${chainId || 'default'}: API Key prefix ${apiKey.slice(0, 5)}...`);
		}
		return alchemy({ apiKey });
	};



	const newConfig = createConfig({
		transport: getTransport(),
		chain: activeChain,
		chains: [
			{
				chain: arbitrum,
				transport: getTransport(42161),
				policyId: process.env.NEXT_PUBLIC_ALCHEMY_ARB_POLICY_ID,
			},
			{
				chain: base,
				transport: getTransport(8453),
				policyId: process.env.NEXT_PUBLIC_ALCHEMY_BASE_POLICY_ID,
			},
			{
				chain: avalancheChain,
				transport: getTransport(43114),
				policyId: process.env.NEXT_PUBLIC_ALCHEMY_AVAX_POLICY_ID,
			},
		],
		ssr: true,
		storage: cookieStorage,
		enablePopupOauth: false,
		connectors: [],
	}, uiConfig);

	if (typeof window !== 'undefined') {
		console.log("[Alchemy] Config created with Policy IDs:", {
			arb: process.env.NEXT_PUBLIC_ALCHEMY_ARB_POLICY_ID?.slice(0, 8),
			base: process.env.NEXT_PUBLIC_ALCHEMY_BASE_POLICY_ID?.slice(0, 8),
			avax: process.env.NEXT_PUBLIC_ALCHEMY_AVAX_POLICY_ID?.slice(0, 8),
		});
	}


	if (process.env.NODE_ENV !== "production") {
		globalForConfig._config = newConfig;
	}

	return newConfig;
};

// NextJS expects this fallback `config` export for some Next pages
export const config = getConfig();

export const queryClient = new QueryClient();
