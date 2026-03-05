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
		image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png', // WETH logo often used for ETH
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
		<div
			className="space-y-6 animate-fade-in max-w-md mx-auto p-6 glass text-white bg-[#0D0D12]/90 border-white/10 relative overflow-hidden"
			style={{
				clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)'
			}}
		>
			<div className="relative z-10">
				<h2 className="text-2xl font-bold mb-1 uppercase tracking-tight">{t('swap') || 'Swap'}</h2>
				<p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-6">Seamless Cross-Asset Exchange</p>
			</div>

			<div className="onchainkit-swap-container relative z-10">
				<Swap>
					<div className="space-y-1">
						<div className="bg-white/5 border border-white/5 p-1 transition-colors hover:border-white/10">
							<SwapAmountInput
								label="Sell"
								swappableTokens={swappableTokens}
								type="from"
								className="!bg-transparent !border-none !text-white"
							/>
						</div>

						<div className="flex justify-center -my-4 relative z-20">
							<div className="bg-[#0D0D12] border border-white/10 p-1 hover:border-[#FF1F8A]/50 transition-colors shadow-xl">
								<SwapToggleButton className="!bg-white/5 !border-none !rounded-none p-2 hover:!bg-white/10" />
							</div>
						</div>

						<div className="bg-white/5 border border-white/5 p-1 transition-colors hover:border-white/10">
							<SwapAmountInput
								label="Buy"
								swappableTokens={swappableTokens}
								type="to"
								className="!bg-transparent !border-none !text-white"
							/>
						</div>
					</div>

					<div className="mt-8 relative" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
						<SwapButton
							className="!w-full !bg-[#FF1F8A] hover:!bg-[#FF1F8A]/90 !text-white !font-black !py-4 !uppercase !tracking-[0.2em] !transition-all !shadow-pink-glow !border-none !rounded-none"
						/>
					</div>

					<SwapMessage className="mt-4 text-[10px] text-white/30 text-center uppercase tracking-widest font-bold" />
					<SwapToast />
				</Swap>
			</div>
		</div>
	);
}
