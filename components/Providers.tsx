"use client";

import React, { useState } from "react";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from "@/lib/config";

export function Providers({ children }: { children: React.ReactNode }) {
	// Create a new QueryClient instance for each session
	// This ensures that the data is not shared between different users/requests
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<AlchemyAccountProvider config={config} queryClient={queryClient}>
				{children}
			</AlchemyAccountProvider>
		</QueryClientProvider>
	);
}
