"use client";

import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type State } from "wagmi";
import { config, queryClient, activeChain } from "@/lib/config";
import { sdk } from "@farcaster/miniapp-sdk";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";

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
		<PrivyProvider
			appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "insert-your-privy-app-id-here"}
			config={{
				appearance: {
					theme: 'dark',
					accentColor: '#FF1F8A',
					showWalletLoginFirst: true,
				},
				embeddedWallets: {
					ethereum: {
						createOnLogin: 'users-without-wallets',
					},
				},
			}}
		>
			<QueryClientProvider client={queryClient}>
				<PrivyWagmiProvider config={config}>
					<OnchainKitProvider
						apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
						chain={activeChain}
						config={{
							appearance: {
								mode: 'dark',
								theme: 'default',
							},
						}}
					>
						{children}
					</OnchainKitProvider>
				</PrivyWagmiProvider>
			</QueryClientProvider>
		</PrivyProvider>
	);
}
