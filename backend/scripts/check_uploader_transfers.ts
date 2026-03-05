import { createPublicClient, http, formatUnits, parseAbiItem } from "viem";
import { arbitrum } from "viem/chains";

const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const UPLOADER = "0x6469E6A42C275c7718F8A633BF61f19CB83ADDCD";
const RPC_URL = "https://arb-mainnet.g.alchemy.com/v2/05d-rzkbC1t_Wv0Pv9czr";

const client = createPublicClient({ chain: arbitrum, transport: http(RPC_URL) });

const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

async function checkUploaderTransfers() {
	const startBlock = 436885000n;
	const endBlock = 436895000n;
	const step = 10n;

	console.log(`Checking transfers from ${UPLOADER}...`);

	for (let current = startBlock; current < endBlock; current += step) {
		const toBlock = current + step - 1n > endBlock ? endBlock : current + step - 1n;
		try {
			const logs = await client.getLogs({
				address: USDC_ADDRESS,
				event: transferEvent,
				args: { from: UPLOADER },
				fromBlock: current,
				toBlock: toBlock
			});

			for (const log of logs) {
				console.log(`[Found] Transfer FROM Uploader!`);
				console.log(`To: ${log.args.to}`);
				console.log(`Amount: ${formatUnits(log.args.value || 0n, 6)} USDC`);
				console.log(`TxHash: ${log.transactionHash}`);
				console.log(`Block: ${log.blockNumber}`);
				console.log('---');
			}
		} catch (e: any) {
			// Ignore range errors
		}
	}
}

checkUploaderTransfers();
