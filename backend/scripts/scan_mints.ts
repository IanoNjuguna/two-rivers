import { createPublicClient, http, parseAbiItem } from "viem";
import { arbitrum } from "viem/chains";

const DOBA_ADDRESS = "0xfb01a9d4b8702DE192844356EFcc157f7C5B3507";
const RPC_URL = "https://arb-mainnet.g.alchemy.com/v2/05d-rzkbC1t_Wv0Pv9czr";

const client = createPublicClient({ chain: arbitrum, transport: http(RPC_URL) });

const transferSingleEvent = parseAbiItem('event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)');

async function scanMints() {
	const startBlock = 436885000n;
	const endBlock = 436895000n;
	const step = 10n;

	console.log(`Scanning for Mints from ${DOBA_ADDRESS}...`);

	for (let current = startBlock; current < endBlock; current += step) {
		const toBlock = current + step - 1n > endBlock ? endBlock : current + step - 1n;
		try {
			const logs = await client.getLogs({
				address: DOBA_ADDRESS,
				event: transferSingleEvent,
				fromBlock: current,
				toBlock: toBlock
			});

			for (const log of logs) {
				console.log(`[Found] Mint!`);
				console.log(`Operator: ${log.args.operator}`);
				console.log(`From: ${log.args.from}`);
				console.log(`To: ${log.args.to}`);
				console.log(`ID: ${log.args.id}`);
				console.log(`Value: ${log.args.value}`);
				console.log(`TxHash: ${log.transactionHash}`);
				console.log(`Block: ${log.blockNumber}`);
				console.log('---');
			}
		} catch (e: any) {
			// Ignore range errors
		}
	}
}

scanMints();
