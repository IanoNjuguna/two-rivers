import { ethers } from 'hardhat';

/**
 * Check NFT ownership on a specific chain
 * 
 * Usage:
 *   bun hardhat run scripts/checkOwnership.ts --network base-sepolia
 *   bun hardhat run scripts/checkOwnership.ts --network arbitrum-sepolia
 */

async function main() {
  const [signer] = await ethers.getSigners();
  
  const contractAddresses: Record<string, string> = {
    'base-sepolia': '0x31744a29Fed5a948c714BAFbB3d9E4b514Ef90cb',
    'arbitrum-sepolia': '0xCAF0dBC8489D56Ac3Ff41370BB02575DFEDD2f74',
  };

  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = chainId === 84532 ? 'base-sepolia' : 'arbitrum-sepolia';
  const contractAddress = contractAddresses[networkName];

  console.log(`\n🔍 Checking NFT ownership on ${networkName}`);
  console.log(`Contract: ${contractAddress}`);
  console.log(`Checking address: ${signer.address}\n`);

  const Doba = await ethers.getContractAt('Doba', contractAddress);
  
  // Get total supply
  const nextTokenId = await Doba.nextTokenId();
  const totalMinted = Number(nextTokenId) - 1;
  
  console.log(`📊 Total minted: ${totalMinted} NFTs\n`);

  // Check ownership of each token
  const ownedTokens: number[] = [];
  
  for (let tokenId = 1; tokenId <= totalMinted; tokenId++) {
    try {
      const owner = await Doba.ownerOf(tokenId);
      
      console.log(`Token #${tokenId}:`);
      console.log(`  Owner: ${owner}`);
      
      if (owner.toLowerCase() === signer.address.toLowerCase()) {
        console.log(`  ✅ You own this token!`);
        ownedTokens.push(tokenId);
      }
      
      // Try to get token URI
      try {
        const tokenURI = await Doba.tokenURI(tokenId);
        console.log(`  URI: ${tokenURI}`);
      } catch {
        console.log(`  URI: (not set)`);
      }
      
      console.log('');
    } catch (error: any) {
      if (error.message.includes('ERC721NonexistentToken')) {
        console.log(`Token #${tokenId}: Does not exist\n`);
      } else {
        console.log(`Token #${tokenId}: Error - ${error.message}\n`);
      }
    }
  }

  console.log(`\n📋 Summary:`);
  console.log(`  Your address: ${signer.address}`);
  console.log(`  Owned tokens on ${networkName}: ${ownedTokens.length > 0 ? ownedTokens.join(', ') : 'None'}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
