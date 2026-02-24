"use client";

import React, { useState } from "react";
import { AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@account-kit/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { getConfig } from "@/lib/config";

export function Providers({
	children,
	initialState
}: {
	children: React.ReactNode;
	initialState?: AlchemyAccountsProviderProps["initialState"];
}) {
	// Create a new QueryClient instance for each session
	const [queryClient] = useState(() => new QueryClient());
	const [activeConfig] = useState(() => getConfig());

	return (
		<WagmiProvider config={(activeConfig as any)._internal.wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<AlchemyAccountProvider config={activeConfig} queryClient={queryClient} initialState={initialState}>
					{children}
				</AlchemyAccountProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
