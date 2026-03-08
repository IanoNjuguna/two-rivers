"use client";

import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type State } from "wagmi";
import { config, queryClient, activeChain } from "@/lib/config";
import { sdk } from "@farcaster/miniapp-sdk";
import { OnchainKitProvider } from "@coinbase/onchainkit";

export function Providers({
	children,
	initialState
}: {
	children: React.ReactNode;
	initialState?: State;
}) {
	const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null);

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
		<WagmiProvider config={config} initialState={initialState}>
			<QueryClientProvider client={queryClient}>
				<OnchainKitProvider
					apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
					chain={activeChain}
					config={{
						appearance: {
							mode: 'dark',
							theme: 'default',
						},
						wallet: {
							display: 'modal',
						}
					}}
				>
					{children}
				</OnchainKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
