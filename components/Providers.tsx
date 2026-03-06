"use client";

import React, { useState, useEffect } from "react";
import { AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@account-kit/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { getConfig, activeChain } from "@/lib/config";
import { sdk } from "@farcaster/miniapp-sdk";
import { OnchainKitProvider } from "@coinbase/onchainkit";

export function Providers({
	children,
	initialState
}: {
	children: React.ReactNode;
	initialState?: AlchemyAccountsProviderProps["initialState"];
}) {
	const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null);
	const [queryClient] = useState(() => new QueryClient());
	const [alchemyConfig] = useState(() => getConfig());

	useEffect(() => {
		sdk.isInMiniApp()
			.then(setIsMiniApp)
			.catch(() => setIsMiniApp(false));
	}, []);

	// Render a minimal shell while detecting context
	if (isMiniApp === null) {
		return <div className="h-screen bg-[#0D0D12]" />;
	}

	return (
		<WagmiProvider config={(alchemyConfig as any)._internal.wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient} initialState={initialState}>
					<OnchainKitProvider
						apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}
						chain={activeChain}
					>
						{children}
					</OnchainKitProvider>
				</AlchemyAccountProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
