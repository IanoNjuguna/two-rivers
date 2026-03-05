'use client';

import React from 'react';
import {
	Swap,
	SwapAmountInput,
	SwapToggleButton,
	SwapButton,
	SwapMessage,
	SwapToast
} from '@coinbase/onchainkit/swap';
import { useTranslations } from 'next-intl';
import { Token } from '@coinbase/onchainkit/token';

export function SwapComponent() {
	const t = useTranslations('nav');

	// Define USDC and ETH tokens for OnchainKit
	const ETHToken: Token = {
		name: 'ETH',
		address: '',
		symbol: 'ETH',
		decimals: 18,
		image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
		chainId: 8453, // Default to Base, will be overridden by provider's chain if activeChain is different
	};

	const USDCToken: Token = {
		name: 'USDC',
		address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
		symbol: 'USDC',
		decimals: 6,
		image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/usdc_288.png',
		chainId: 8453,
	};

	const swappableTokens: Token[] = [ETHToken, USDCToken];

	return (
		<div className="space-y-6 animate-fade-in max-w-md mx-auto p-6 glass rounded-xl text-white">
			<div>
				<h2 className="text-2xl font-bold mb-2">{t('swap') || 'Swap'}</h2>
				<p className="text-white/60 text-sm mb-6">Swap your tokens seamlessly on the current network.</p>
			</div>

			<div className="onchainkit-swap-container p-4 bg-white/5 rounded-xl border border-white/10">
				<Swap
					initialState={{
						fromToken: USDCToken,
						toToken: ETHToken,
					}}
				>
					<div className="space-y-2">
						<SwapAmountInput
							label="Sell"
							swappableTokens={swappableTokens}
							type="from"
							className="bg-transparent border-none text-white focus:ring-0"
						/>
						<div className="flex justify-center -my-3 relative z-10">
							<SwapToggleButton className="bg-[#1e1e24] border border-white/10 rounded-full p-2 hover:bg-[#2a2a32] transition-colors" />
						</div>
						<SwapAmountInput
							label="Buy"
							swappableTokens={swappableTokens}
							type="to"
							className="bg-transparent border-none text-white focus:ring-0"
						/>
					</div>

					<div className="mt-6">
						<SwapButton className="w-full bg-[#FF1F8A] hover:bg-[#FF1F8A]/90 text-white font-bold py-3 rounded-lg transition-all shadow-pink-glow" />
					</div>

					<SwapMessage className="mt-4 text-xs text-white/60 text-center" />
					<SwapToast />
				</Swap>
			</div>
		</div>
	);
}
