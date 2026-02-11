import { ethers } from 'hardhat';
import { Options } from '@layerzerolabs/lz-v2-utilities';

/**
 * Cross-Chain NFT Transfer Script
 * 
 * Transfers an NFT from one chain to another using LayerZero V2
 * 
 * Usage:
 * - From Base Sepolia to Arbitrum Sepolia:
 *   bun hardhat run scripts/crossChainTransfer.ts --network base-sepolia
 * 
 * - From Arbitrum Sepolia to Base Sepolia:
 *   bun hardhat run scripts/crossChainTransfer.ts --network arbitrum-sepolia
 */

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('Sending cross-chain transfer from account:', signer.address);

  // Configuration
  const BASE_SEPOLIA_ADDRESS = '0x31744a29Fed5a948c714BAFbB3d9E4b514Ef90cb';
  const ARBITRUM_SEPOLIA_ADDRESS = '0xCAF0dBC8489D56Ac3Ff41370BB02575DFEDD2f74';
  
  const BASE_SEPOLIA_EID = 40245;
  const ARBITRUM_SEPOLIA_EID = 40231;

  // Get network info
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  console.log(`Current network: ${network.name} (chainId: ${chainId})`);

  // Determine source and destination
  let sourceContract: any;
  let destinationEid: number;
  let destinationAddress: string;
  let networkName: string;

  if (chainId === 84532) { // Base Sepolia
    sourceContract = await ethers.getContractAt('Doba', BASE_SEPOLIA_ADDRESS);
    destinationEid = ARBITRUM_SEPOLIA_EID;
    destinationAddress = ARBITRUM_SEPOLIA_ADDRESS;
    networkName = 'Arbitrum Sepolia';
    console.log('📍 Sending FROM Base Sepolia TO Arbitrum Sepolia');
  } else if (chainId === 421614) { // Arbitrum Sepolia
    sourceContract = await ethers.getContractAt('Doba', ARBITRUM_SEPOLIA_ADDRESS);
    destinationEid = BASE_SEPOLIA_EID;
    destinationAddress = BASE_SEPOLIA_ADDRESS;
    networkName = 'Base Sepolia';
    console.log('📍 Sending FROM Arbitrum Sepolia TO Base Sepolia');
  } else {
    throw new Error(`Unsupported network: ${chainId}`);
  }

  // Get token ID to transfer (use latest minted token)
  const nextTokenId = await sourceContract.nextTokenId();
  const tokenId = Number(nextTokenId) - 1;
  
  console.log(`\n🎨 Token Details:`);
  console.log(`  Token ID: ${tokenId}`);
  
  // Check ownership
  const owner = await sourceContract.ownerOf(tokenId);
  console.log(`  Current owner: ${owner}`);
  console.log(`  Your address: ${signer.address}`);
  
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`You don't own token ID ${tokenId}. Owner is ${owner}`);
  }

  // Recipient address (sending to yourself on destination chain)
  const recipient = signer.address;
  
  // Prepare send parameters
  // Convert recipient address to bytes32 (pad with zeros on the left)
  const recipientBytes32 = recipient.toLowerCase().replace('0x', '').padStart(64, '0');
  const recipientBytes32Hex = '0x' + recipientBytes32;
  
  // Create options for the cross-chain message
  // Set gas limit for destination chain execution
  const options = Options.newOptions()
    .addExecutorLzReceiveOption(200000, 0) // 200k gas for receive on destination
    .toHex();

  const sendParam = {
    dstEid: destinationEid,
    to: recipientBytes32Hex,
    tokenId: tokenId,
    extraOptions: options,
    composeMsg: '0x', // No compose message
    onftCmd: '0x' // No ONFT command
  };

  console.log(`\n📦 Transfer Parameters:`);
  console.log(`  Destination Chain: ${networkName} (EID: ${destinationEid})`);
  console.log(`  Recipient: ${recipient}`);
  console.log(`  Token ID: ${tokenId}`);

  // Quote the messaging fee
  console.log(`\n💰 Quoting LayerZero messaging fee...`);
  const feeQuote = await sourceContract.quoteSend(sendParam, false);
  const nativeFee = feeQuote[0]; // nativeFee is first element of the tuple
  
  const nativeFeeEth = Number(nativeFee) / 1e18;
  console.log(`  Native fee: ${nativeFeeEth.toFixed(6)} ETH`);
  console.log(`  LZ token fee: 0 (not used)`);

  // Check balance
  const balance = await ethers.provider.getBalance(signer.address);
  const balanceEth = Number(balance) / 1e18;
  console.log(`  Your balance: ${balanceEth.toFixed(6)} ETH`);

  if (balance < nativeFee) {
    throw new Error('Insufficient balance to pay LayerZero messaging fee');
  }

  // Execute cross-chain transfer
  console.log(`\n🚀 Initiating cross-chain transfer...`);
  const tx = await sourceContract.send(
    sendParam,
    [nativeFee, 0], // [nativeFee, lzTokenFee]
    signer.address, // refund address
    { value: nativeFee }
  );

  console.log(`Transaction hash: ${tx.hash}`);
  console.log('Waiting for confirmation...');
  
  const receipt = await tx.wait();
  console.log(`✅ Transfer initiated successfully!`);
  console.log(`Gas used: ${receipt?.gasUsed.toString()}`);

  console.log(`\n⏳ Cross-chain transfer in progress...`);
  console.log(`This may take 1-5 minutes for LayerZero to relay the message.`);
  console.log(`\n🔍 Track your transfer:`);
  console.log(`  LayerZero Scan: https://testnet.layerzeroscan.com/tx/${tx.hash}`);
  console.log(`\n✅ Once complete, token ID ${tokenId} will be owned by ${recipient} on ${networkName}`);
  console.log(`\n📝 To verify arrival, run:`);
  
  if (chainId === 84532) {
    console.log(`  bun hardhat run scripts/checkOwnership.ts --network arbitrum-sepolia`);
  } else {
    console.log(`  bun hardhat run scripts/checkOwnership.ts --network base-sepolia`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
