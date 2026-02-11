import { ethers } from 'hardhat';

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('Minting with account:', signer.address);

  // Get contract addresses from command line or use defaults
  const network = process.env.HARDHAT_NETWORK || 'base-sepolia';
  const contractAddresses: Record<string, string> = {
    'base-sepolia': '0x31744a29Fed5a948c714BAFbB3d9E4b514Ef90cb',
    'arbitrum-sepolia': '0xCAF0dBC8489D56Ac3Ff41370BB02575DFEDD2f74',
  };

  const contractAddress = contractAddresses[network];
  if (!contractAddress) {
    throw new Error(`No contract address for network: ${network}`);
  }

  console.log(`Network: ${network}`);
  console.log(`Contract: ${contractAddress}`);

  // Get contract instance
  const Doba = await ethers.getContractAt('Doba', contractAddress);

  // Get mint price
  const mintPrice = await Doba.getMintPriceInETH();
  const mintPriceEth = Number(mintPrice) / 1e18;
  console.log(`\nMint price: ${mintPriceEth.toFixed(6)} ETH`);
  console.log(`Mint price (USD): $5.00`);

  // Check signer balance
  const balance = await ethers.provider.getBalance(signer.address);
  const balanceEth = Number(balance) / 1e18;
  console.log(`Your balance: ${balanceEth.toFixed(6)} ETH`);

  if (balance < mintPrice) {
    throw new Error('Insufficient balance to mint NFT');
  }

  // Get current supply before minting
  const currentSupply = await Doba.nextTokenId();
  console.log(`\nCurrent token ID: ${currentSupply}`);

  // Mint NFT
  console.log('\n🎨 Minting NFT...');
  const tx = await Doba.mint(signer.address, { value: mintPrice });
  console.log(`Transaction hash: ${tx.hash}`);
  
  console.log('Waiting for confirmation...');
  const receipt = await tx.wait();
  
  console.log(`✅ NFT minted successfully!`);
  console.log(`Gas used: ${receipt?.gasUsed.toString()}`);

  // Get the minted token ID from events
  const mintedEvent = receipt?.logs
    .map((log: any) => {
      try {
        return Doba.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((event: any) => event?.name === 'Minted');

  if (mintedEvent) {
    const pricePaidEth = Number(mintedEvent.args.pricePaid) / 1e18;
    console.log(`Token ID: ${mintedEvent.args.tokenId}`);
    console.log(`Price paid: ${pricePaidEth.toFixed(6)} ETH`);
  }

  // Verify ownership
  const newSupply = await Doba.nextTokenId();
  const tokenId = Number(newSupply) - 1;
  const owner = await Doba.ownerOf(tokenId);
  
  console.log(`\n📋 Verification:`);
  console.log(`  Token ID: ${tokenId}`);
  console.log(`  Owner: ${owner}`);
  console.log(`  Your address: ${signer.address}`);
  console.log(`  Ownership confirmed: ${owner.toLowerCase() === signer.address.toLowerCase()}`);

  // Get token URI
  try {
    const tokenURI = await Doba.tokenURI(tokenId);
    console.log(`  Token URI: ${tokenURI}`);
  } catch (error) {
    console.log(`  Token URI: (base URI may not be set yet)`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
