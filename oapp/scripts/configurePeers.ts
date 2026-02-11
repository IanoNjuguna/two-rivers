import { ethers } from 'hardhat'

/**
 * Configure Cross-Chain Peers for Doba NFT
 * 
 * Base Sepolia: 0x410dd768fD79530859e3100586b7d6218CcF0519
 * Arbitrum Sepolia: 0x5C1244373Dc747f6B23B956212c796673A0Aa77f
 * 
 * LayerZero Endpoint IDs:
 * - Base Sepolia: 40245
 * - Arbitrum Sepolia: 40231
 */

async function main() {
    const BASE_SEPOLIA_ADDRESS = '0x31744a29Fed5a948c714BAFbB3d9E4b514Ef90cb'
    const ARBITRUM_SEPOLIA_ADDRESS = '0xCAF0dBC8489D56Ac3Ff41370BB02575DFEDD2f74'
    
    const BASE_SEPOLIA_EID = 40245
    const ARBITRUM_SEPOLIA_EID = 40231
    
    const [deployer] = await ethers.getSigners()
    console.log(`Configuring peers with account: ${deployer.address}`)
    
    // Get current network
    const network = await ethers.provider.getNetwork()
    console.log(`Current network: ${network.name} (chainId: ${network.chainId})`)
    
    // Get contract instance based on current network
    let dobaContract: any
    let peerAddress: string
    let peerEid: number
    
    if (network.chainId === 84532) { // Base Sepolia
        console.log('\n📍 Configuring Base Sepolia contract...')
        dobaContract = await ethers.getContractAt('Doba', BASE_SEPOLIA_ADDRESS)
        peerAddress = ARBITRUM_SEPOLIA_ADDRESS
        peerEid = ARBITRUM_SEPOLIA_EID
    } else if (network.chainId === 421614) { // Arbitrum Sepolia
        console.log('\n📍 Configuring Arbitrum Sepolia contract...')
        dobaContract = await ethers.getContractAt('Doba', ARBITRUM_SEPOLIA_ADDRESS)
        peerAddress = BASE_SEPOLIA_ADDRESS
        peerEid = BASE_SEPOLIA_EID
    } else {
        throw new Error(`Unsupported network: ${network.name}`)
    }
    
    // Convert peer address to bytes32
    const peerBytes32 = ethers.utils.zeroPad(peerAddress, 32)
    
    console.log(`Setting peer:`)
    console.log(`  Peer EID: ${peerEid}`)
    console.log(`  Peer Address: ${peerAddress}`)
    console.log(`  Peer Bytes32: ${peerBytes32}`)
    
    // Set peer
    const tx = await dobaContract.setPeer(peerEid, peerBytes32)
    console.log(`\nTransaction hash: ${tx.hash}`)
    console.log('Waiting for confirmation...')
    
    await tx.wait()
    console.log('✅ Peer configured successfully!')
    
    // Verify peer was set
    const storedPeer = await dobaContract.peers(peerEid)
    const peerBytes32Hex = typeof peerBytes32 === 'string' ? peerBytes32 : ethers.utils.hexlify(peerBytes32)
    console.log(`\nVerification:`)
    console.log(`  Stored peer: ${storedPeer}`)
    console.log(`  Expected: ${peerBytes32Hex}`)
    console.log(`  Match: ${storedPeer.toLowerCase() === peerBytes32Hex.toLowerCase()}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
