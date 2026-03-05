import { createPublicClient, http, formatUnits, parseAbiItem } from "viem";
import { arbitrum } from "viem/chains";

const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const TREASURY = "0xeeeee90971B6264C53175D3Af6840a8dD5dc7b6C";
const OWNER = "0xDbb7f8380DDA6209eD3143Ded6A0E7cFbAD0646D";
const RPC_URL = "https://arb-mainnet.g.alchemy.com/v2/05d-rzkbC1t_Wv0Pv9czr";

const client = createPublicClient({ chain: arbitrum, transport: http(RPC_URL) });

const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

async function scan() {
	const startBlock = 436885000n;
	const endBlock = 436895000n;
	const step = 10n;

	console.log(`Scanning blocks ${startBlock} to ${endBlock}...`);

	for (let current = startBlock; current < endBlock; current += step) {
		const toBlock = current + step - 1n > endBlock ? endBlock : current + step - 1n;
		try {
			const logs = await client.getLogs({
				address: USDC_ADDRESS,
				event: transferEvent,
				args: { to: TREASURY },
				fromBlock: current,
				toBlock: toBlock
			});

			for (const log of logs) {
				console.log(`[Found] Transfer to Treasury!`);
				console.log(`From: ${log.args.from}`);
				console.log(`Amount: ${formatUnits(log.args.value || 0n, 6)} USDC`);
				console.log(`TxHash: ${log.transactionHash}`);
				console.log(`Block: ${log.blockNumber}`);
				console.log('---');
			}

			// Also check transfers FROM the owner
			const ownerLogs = await client.getLogs({
				address: USDC_ADDRESS,
				event: transferEvent,
				args: { from: OWNER },
				fromBlock: current,
				toBlock: toBlock
			});

			for (const log of ownerLogs) {
				console.log(`[Found] Transfer FROM Owner!`);
				console.log(`To: ${log.args.to}`);
				console.log(`Amount: ${formatUnits(log.args.value || 0n, 6)} USDC`);
				console.log(`TxHash: ${log.transactionHash}`);
				console.log(`Block: ${log.blockNumber}`);
				console.log('---');
			}

		} catch (e: any) {
			// console.error(`Error scanning blocks ${current}-${toBlock}: ${e.message}`);
		}
	}
}

scan();
