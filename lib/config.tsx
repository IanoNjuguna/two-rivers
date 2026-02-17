import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react";
import { arbitrumSepolia, alchemy } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

const uiConfig: AlchemyAccountsUIConfig = {
	illustrationStyle: "outline",
	auth: {
		sections: [
			[{ type: "email" }],
			[
				{ type: "passkey" },
				{ type: "social", authProviderId: "google", mode: "popup" },
				{ type: "social", authProviderId: "facebook", mode: "popup" },
				{ type: "social", authProviderId: "twitch", mode: "popup" },
				{
					type: "social",
					authProviderId: "auth0",
					mode: "popup",
					auth0Connection: "discord",
					displayName: "Discord",
					logoUrl: "/images/discord.svg",
					scope: "openid profile",
				},
				{
					type: "social",
					authProviderId: "auth0",
					mode: "popup",
					auth0Connection: "twitter",
					displayName: "Twitter",
					logoUrl: "/images/twitter.svg",
					logoUrlDark: "/images/twitter-dark.svg",
					scope: "openid profile",
				},
			],
			[
				{
					type: "external_wallets",
					walletConnect: {
						projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
					},
					wallets: ["wallet_connect", "coinbase wallet"],
					chainType: ["evm"],
					moreButtonText: "More wallets",
					hideMoreButton: false,
					numFeaturedWallets: 1,
				},
			],
		],
		addPasskeyOnSignup: true,
		header: <img src="/logo.png" alt="Logo" className="w-12 h-12" />,
	},
	supportUrl: "https://doba.world",
};

export const config = createConfig({
	// if you don't want to leak api keys, you can proxy to a backend and set the rpcUrl instead here
	// get this from the app config you create at https://dashboard.alchemy.com/apps/latest/services/smart-wallets?utm_source=demo_alchemy_com&utm_medium=referral&utm_campaign=demo_to_dashboard
	transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
	chain: arbitrumSepolia,
	ssr: true, // set to false if you're not using server-side rendering
	enablePopupOauth: true,
	// Enable gas sponsorship for seamless user experience
	policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID,
}, uiConfig);

export const queryClient = new QueryClient();
