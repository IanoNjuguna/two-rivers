import { createPublicClient, http } from 'viem';
import { arbitrum } from 'viem/chains';

// Using public rpc for Arbitrum
const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http()
});

const CONTRACT_ADDRESS = '0xfb01a9d4b8702DE192844356EFcc157f7C5B3507';

const abi = [
  { "inputs": [], "name": "nextCollectionId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "collectionId", "type": "uint256" }], "name": "collections", "outputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address", "name": "artist", "type": "address" }, { "internalType": "address", "name": "splitter", "type": "address" }, { "internalType": "string", "name": "baseUri", "type": "string" }, { "internalType": "uint256", "name": "maxSupply", "type": "uint256" }, { "internalType": "bool", "name": "exists", "type": "bool" }], "stateMutability": "view", "type": "function" }
];

async function main() {
  try {
    const nextId = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'nextCollectionId'
    }) as bigint;
    console.log(`Total Collections on Arbitrum: ${nextId}\n`);

    for (let i = 0n; i < nextId; i++) {
      const info = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'collections',
        args: [i]
      }) as any;

      const id = info[0];
      const artist = info[1];
      const splitter = info[2];
      const uri = info[3];
      const maxSupply = info[4];
      const exists = info[5];

      if (!exists) continue;

      console.log(`--- Token ${i} ---`);
      console.log(`URI: ${uri}`);
      console.log(`Artist (Owner): ${artist}`);
      console.log(`Splitter: ${splitter}`);
      console.log(`Max Supply: ${maxSupply}`);

      if (uri.startsWith('ipfs://')) {
        const httpUri = uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        try {
          const res = await fetch(httpUri);
          const metadata = await res.json();
          console.log(`Title: ${metadata.title || metadata.name}`);
          console.log(`Description: ${metadata.description || ''}`);
          console.log(`Artist Name: ${metadata.artist || 'Unknown'}`);
          console.log(`Genre: ${metadata.genre || 'Unknown'}`);
          console.log(`Image: ${metadata.imageHash || metadata.image}`);
          console.log(`Audio: ${metadata.audioHash || metadata.animation_url}`);
        } catch (e) {
          console.log(`Failed to fetch metadata from IPFS: ${e}`);
        }
      }
      console.log('');
    }
  } catch (e) {
    console.error(`Failed to read contract: ${e}`);
  }
}
main();
