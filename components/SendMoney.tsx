'use client';

import React, { useState } from 'react';
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
import { type Address, parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

export function SendMoney() {
	const [recipient, setRecipient] = useState<string>('');
	const [amount, setAmount] = useState<string>('');
	const t = useTranslations('nav');

	const calls = [
		{
			to: recipient as Address,
			value: amount ? parseEther(amount) : 0n,
			data: '0x' as `0x${string}`,
		},
	];

	const isValid = recipient.startsWith('0x') && recipient.length === 42 && amount && !isNaN(Number(amount));

	return (
		<div className="space-y-6 animate-fade-in max-w-md mx-auto p-6 glass rounded-xl text-white">
			<div>
				<h2 className="text-2xl font-bold mb-2">{t('sendMoney')}</h2>
				<p className="text-white/60 text-sm mb-6">Send funds to any wallet address on the current network.</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="recipient">Recipient Address</Label>
					<Input
						id="recipient"
						placeholder="0x..."
						value={recipient}
						onChange={(e) => setRecipient(e.target.value)}
						className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="amount">Amount</Label>
					<Input
						id="amount"
						type="number"
						step="0.0001"
						placeholder="0.0"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
					/>
				</div>
			</div>

			<div className="pt-4">
				{isValid ? (
					<Transaction
						calls={calls}
						onSuccess={(response: TransactionResponseType) => console.log('Transaction successful', response)}
						onError={(error) => console.error('Transaction failed', error)}
					>
						<TransactionButton className="w-full bg-[#FF1F8A] hover:bg-[#FF1F8A]/90 text-white font-bold py-3 rounded-lg transition-all shadow-pink-glow" />
						<TransactionStatus>
							<TransactionStatusLabel />
							<TransactionStatusAction />
						</TransactionStatus>
						<TransactionToast>
							<TransactionToastIcon />
							<TransactionToastLabel />
							<TransactionToastAction />
						</TransactionToast>
					</Transaction>
				) : (
					<Button disabled className="w-full bg-white/10 text-white/40 cursor-not-allowed">
						Enter Details
					</Button>
				)}
			</div>
		</div>
	);
}
