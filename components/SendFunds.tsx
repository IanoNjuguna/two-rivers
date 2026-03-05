'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
	Transaction,
	TransactionButton,
	TransactionResponseType,
	TransactionStatus,
	TransactionStatusLabel,
	TransactionStatusAction,
	TransactionToast,
	TransactionToastIcon,
	TransactionToastLabel,
	TransactionToastAction,
} from '@coinbase/onchainkit/transaction';
import { type Address, parseEther, parseUnits, encodeFunctionData } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { useAudio } from '@/components/AudioProvider';
import { getAddressesForChain, ERC20_ABI, publicClients } from '@/lib/web3';
import { formatUnits } from 'viem';
import { IconChevronDown } from '@tabler/icons-react';

type TokenOption = {
	symbol: string;
	name: string;
	decimals: number;
	address?: string;
	image: string;
};

export function SendFunds() {
	const [recipient, setRecipient] = useState<string>('');
	const [amount, setAmount] = useState<string>('');
	const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDC'>('ETH');
	const [balance, setBalance] = useState<string>('0.00');
	const [isLoadingBalance, setIsLoadingBalance] = useState(false);

	const t = useTranslations('nav');
	const { effectiveAddress, client } = useAudio();

	const chainId = client?.chain?.id || 8453;
	const addresses = getAddressesForChain(chainId);

	const tokens: Record<'ETH' | 'USDC', TokenOption> = useMemo(() => ({
		ETH: {
			symbol: 'ETH',
			name: 'Ethereum',
			decimals: 18,
			image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
		},
		USDC: {
			symbol: 'USDC',
			name: 'USDC',
			decimals: 6,
			address: addresses.usdc,
			image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
		},
	}), [addresses.usdc]);

	useEffect(() => {
		async function fetchBalance() {
			if (!effectiveAddress || !chainId) return;

			setIsLoadingBalance(true);
			try {
				const publicClient = publicClients[chainId as keyof typeof publicClients];
				if (!publicClient) return;

				if (selectedToken === 'ETH') {
					const bal = await publicClient.getBalance({ address: effectiveAddress as Address });
					setBalance(formatUnits(bal, 18));
				} else {
					const bal = await publicClient.readContract({
						address: addresses.usdc as Address,
						abi: ERC20_ABI,
						functionName: 'balanceOf',
						args: [effectiveAddress as Address],
					});
					setBalance(formatUnits(bal as bigint, 6));
				}
			} catch (error) {
				console.error('Error fetching balance:', error);
			} finally {
				setIsLoadingBalance(false);
			}
		}

		fetchBalance();
	}, [effectiveAddress, chainId, selectedToken, addresses.usdc]);

	const handlePercentage = (percent: number) => {
		const balNum = parseFloat(balance);
		if (isNaN(balNum)) return;

		let calculated = (balNum * percent).toString();
		// Round down to avoid insufficient funds due to floating point or tiny gas leftovers if ETH
		if (selectedToken === 'ETH') {
			calculated = Math.max(0, balNum * percent - 0.001).toString();
			if (parseFloat(calculated) < 0) calculated = '0';
		}

		setAmount(calculated);
	};

	const calls = useMemo(() => {
		if (!recipient || !amount || isNaN(Number(amount))) return [];

		if (selectedToken === 'ETH') {
			return [
				{
					to: recipient as Address,
					value: parseEther(amount),
					data: '0x' as `0x${string}`,
				},
			];
		} else {
			// USDC Transfer
			const data = encodeFunctionData({
				abi: ERC20_ABI,
				functionName: 'transfer',
				args: [recipient as Address, parseUnits(amount, 6)],
			});
			return [
				{
					to: addresses.usdc as Address,
					data,
				},
			];
		}
	}, [recipient, amount, selectedToken, addresses.usdc]);

	const isValid = recipient.startsWith('0x') && recipient.length === 42 && amount && !isNaN(Number(amount)) && parseFloat(amount) > 0;

	return (
		<div
			className="space-y-6 animate-fade-in max-w-md mx-auto p-6 glass text-white bg-[#0D0D12]/80 border-white/10 relative overflow-hidden"
			style={{
				clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)'
			}}
		>
			<div className="flex justify-between items-start">
				<div>
					<h2 className="text-2xl font-bold mb-1">{t('sendMoney')}</h2>
					<p className="text-white/60 text-xs">Send funds safely on the current network.</p>
				</div>
				<div className="flex bg-white/5 p-1 border border-white/10">
					<button
						onClick={() => setSelectedToken('ETH')}
						className={`px-3 py-1 text-xs font-bold transition-all ${selectedToken === 'ETH' ? 'bg-[#FF1F8A] text-white' : 'text-white/40 hover:text-white'}`}
					>
						ETH
					</button>
					<button
						onClick={() => setSelectedToken('USDC')}
						className={`px-3 py-1 text-xs font-bold transition-all ${selectedToken === 'USDC' ? 'bg-[#FF1F8A] text-white' : 'text-white/40 hover:text-white'}`}
					>
						USDC
					</button>
				</div>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="recipient" className="text-white/60 text-xs font-bold uppercase tracking-wider">Recipient Address</Label>
					<Input
						id="recipient"
						placeholder="0x..."
						value={recipient}
						onChange={(e) => setRecipient(e.target.value)}
						className="bg-white/5 border-white/10 text-sm h-12 text-white placeholder:text-white/30 focus:border-[#FF1F8A]/50 transition-colors rounded-none"
					/>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between items-end">
						<Label htmlFor="amount" className="text-white/60 text-xs font-bold uppercase tracking-wider">
							Amount ({selectedToken})
						</Label>
						<span className="text-[10px] text-white/40">
							Balance: <span className={isLoadingBalance ? 'animate-pulse' : ''}>{parseFloat(balance).toFixed(selectedToken === 'ETH' ? 4 : 2)} {selectedToken}</span>
						</span>
					</div>
					<div className="relative">
						<Input
							id="amount"
							type="text"
							inputMode="decimal"
							placeholder="0.0"
							value={amount}
							onChange={(e) => {
								const val = e.target.value;
								if (val === '' || /^\d*\.?\d*$/.test(val)) {
									setAmount(val);
								}
							}}
							className="bg-white/5 border-white/10 text-lg h-14 pl-4 pr-12 text-white placeholder:text-white/30 focus:border-[#FF1F8A]/50 transition-colors"
						/>
						<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
							<img src={tokens[selectedToken].image} alt={selectedToken} className="w-6 h-6 bg-white/10" />
						</div>
					</div>

					<div className="grid grid-cols-3 gap-2 mt-2">
						<Button
							variant="outline"
							className="bg-white/5 border-white/10 text-[10px] h-8 hover:bg-white/10 hover:text-white text-white/60 rounded-none"
							onClick={() => handlePercentage(0.25)}
						>
							25%
						</Button>
						<Button
							variant="outline"
							className="bg-white/5 border-white/10 text-[10px] h-8 hover:bg-white/10 hover:text-white text-white/60 rounded-none"
							onClick={() => handlePercentage(0.5)}
						>
							50%
						</Button>
						<Button
							variant="outline"
							className="bg-white/5 border-white/10 text-[10px] h-8 hover:bg-[#FF1F8A]/20 hover:text-[#FF1F8A] text-[#FF1F8A]/80 border-[#FF1F8A]/20 rounded-none"
							onClick={() => handlePercentage(1)}
						>
							MAX
						</Button>
					</div>
				</div>
			</div>

			<div className="pt-2">
				{isValid ? (
					<Transaction
						calls={calls}
						onSuccess={(response: TransactionResponseType) => console.log('Transaction successful', response)}
						onError={(error) => console.error('Transaction failed', error)}
					>
						<TransactionButton className="w-full h-14 bg-[#FF1F8A] hover:bg-[#FF1F8A]/90 text-white font-bold text-lg transition-all shadow-pink-glow rounded-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }} />
						<TransactionStatus>
							<TransactionStatusLabel className="text-white/70" />
							<TransactionStatusAction className="text-[#FF1F8A] hover:text-[#FF1F8A]/80" />
						</TransactionStatus>
						<TransactionToast className="bg-[#1e1e24] border border-white/10">
							<TransactionToastIcon />
							<TransactionToastLabel className="text-white" />
							<TransactionToastAction className="text-[#FF1F8A]" />
						</TransactionToast>
					</Transaction>
				) : (
					<Button disabled className="w-full h-14 bg-white/10 text-white/40 cursor-not-allowed font-bold text-lg rounded-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
						Enter Details
					</Button>
				)}
			</div>
		</div>
	);
}
