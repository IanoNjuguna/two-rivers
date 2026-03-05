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
		image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
		chainId: 8453,
	};

	const swappableTokens: Token[] = [ETHToken, USDCToken];

	return (
	return (
		<div
			className="space-y-6 animate-fade-in max-w-md mx-auto p-6 glass text-white bg-[#0D0D12]/80 border-white/10 relative overflow-hidden"
			style={{
				clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)'
			}}
		>
			<div>
				<h2 className="text-2xl font-bold mb-2">{t('swap') || 'Swap'}</h2>
				<p className="text-white/60 text-sm mb-6">Swap your tokens seamlessly on the current network.</p>
			</div>

			<div className="onchainkit-swap-container p-4 bg-white/5 border border-white/10">
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
							className="bg-transparent border-none text-white focus:ring-0 !bg-white/5"
						/>
						<div className="flex justify-center -my-3 relative z-10">
							<SwapToggleButton className="bg-[#1e1e24] border border-white/10 p-2 hover:bg-[#2a2a32] transition-colors" />
						</div>
						<SwapAmountInput
							label="Buy"
							swappableTokens={swappableTokens}
							type="to"
							className="bg-transparent border-none text-white focus:ring-0 !bg-white/5"
						/>
					</div>

					<div className="mt-6">
						<SwapButton
							className="w-full bg-[#FF1F8A] hover:bg-[#FF1F8A]/90 text-white font-bold py-3 transition-all shadow-pink-glow"
							style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
						/>
					</div>

					<SwapMessage className="mt-4 text-xs text-white/60 text-center" />
					<SwapToast />
				</Swap>
			</div>
		</div>
	);
}
