"use client";

import React, { useState, useEffect } from "react";
import { AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@account-kit/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { getConfig } from "@/lib/config";
import { sdk } from "@farcaster/miniapp-sdk";
import { miniAppWagmiConfig, miniAppQueryClient } from "@/lib/miniapp-config";

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
		sdk.isInMiniApp().then(setIsMiniApp).catch(() => setIsMiniApp(false));
	}, []);

	// Render a minimal shell while detecting context
	if (isMiniApp === null) {
		return <>{children}</>;
	}

	if (isMiniApp) {
		return (
			<WagmiProvider config={miniAppWagmiConfig}>
				<QueryClientProvider client={miniAppQueryClient}>
					{children}
				</QueryClientProvider>
			</WagmiProvider>
		);
	}

	return (
		<WagmiProvider config={(alchemyConfig as any)._internal.wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient} initialState={initialState}>
					{children}
				</AlchemyAccountProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
