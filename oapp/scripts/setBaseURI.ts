import { ethers } from 'hardhat'

/**
 * Set Base URI for Doba NFT metadata
 * 
 * Base Sepolia: 0x410dd768fD79530859e3100586b7d6218CcF0519
 * Arbitrum Sepolia: 0x5C1244373Dc747f6B23B956212c796673A0Aa77f
 */

const BASE_URI = 'https://api.dobamusic.com/metadata/'

async function main() {
    const BASE_SEPOLIA_ADDRESS = '0x31744a29Fed5a948c714BAFbB3d9E4b514Ef90cb'
    const ARBITRUM_SEPOLIA_ADDRESS = '0xCAF0dBC8489D56Ac3Ff41370BB02575DFEDD2f74'
    
    const [deployer] = await ethers.getSigners()
    console.log(`Setting base URI with account: ${deployer.address}`)
    
    // Get current network
    const network = await ethers.provider.getNetwork()
    console.log(`Current network: ${network.name} (chainId: ${network.chainId})`)
    
    // Get contract address based on network
    let contractAddress: string
    
    if (network.chainId === 84532) { // Base Sepolia
        contractAddress = BASE_SEPOLIA_ADDRESS
        console.log('📍 Base Sepolia contract')
    } else if (network.chainId === 421614) { // Arbitrum Sepolia
        contractAddress = ARBITRUM_SEPOLIA_ADDRESS
        console.log('📍 Arbitrum Sepolia contract')
    } else {
        throw new Error(`Unsupported network: ${network.name}`)
    }
    
    const doba = await ethers.getContractAt('Doba', contractAddress)
    
    console.log(`\nSetting base URI to: ${BASE_URI}`)
    
    const tx = await doba.setBaseURI(BASE_URI)
    console.log(`Transaction hash: ${tx.hash}`)
    console.log('Waiting for confirmation...')
    
    await tx.wait()
    console.log('✅ Base URI set successfully!')
    
    // Test with a sample token ID
    console.log('\nTesting URI generation:')
    console.log(`  Token #1 URI would be: ${BASE_URI}1`)
    console.log(`  Token #100 URI would be: ${BASE_URI}100`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
