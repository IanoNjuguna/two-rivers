import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'Doba'

// Chainlink Price Feed addresses for ETH/USD
const PRICE_FEEDS: Record<string, string> = {
    // Mainnets
    ethereum: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    arbitrum: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
    optimism: '0x13e3Ee699D1909E989722E753853AE30b17e08c5',
    base: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
    polygon: '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
    
    // Testnets
    sepolia: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
    'arbitrum-sepolia': '0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165',
    'optimism-sepolia': '0x61Ec26aA57019C486B10502285c5A3D4A4750AD7',
    'base-sepolia': '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1',
    'polygon-amoy': '0xF0d50568e3A7e8259E16663972b11910F89BD8e7',
}

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    // This is an external deployment pulled in from @layerzerolabs/lz-evm-sdk-v2
    //
    // @layerzerolabs/toolbox-hardhat takes care of plugging in the external deployments
    // from @layerzerolabs packages based on the configuration in your hardhat config
    //
    // For this to work correctly, your network config must define an eid property
    // set to `EndpointId` as defined in @layerzerolabs/lz-definitions
    //
    // For example:
    //
    // networks: {
    //   fuji: {
    //     ...
    //     eid: EndpointId.AVALANCHE_V2_TESTNET
    //   }
    // }
    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    // If the onft721Adapter configuration is defined on a network that is deploying an ONFT721,
    // the deployment will log a warning and skip the deployment
    if (hre.network.config.onft721Adapter != null) {
        console.warn(`onft721Adapter configuration found on OFT deployment, skipping ONFT721 deployment`)
        return
    }

    // Get the price feed address for the current network
    const priceFeedAddress = PRICE_FEEDS[hre.network.name]
    if (!priceFeedAddress) {
        throw new Error(`No Chainlink ETH/USD price feed configured for network: ${hre.network.name}`)
    }

    console.log(`Using Chainlink Price Feed: ${priceFeedAddress}`)

    // Set artist and platform addresses for primary sale split (95%/5%)
    // TODO: Update with actual artist and platform addresses
    const artistAddress = deployer
    const platformAddress = deployer
    
    console.log(`Artist address (95% of mints): ${artistAddress}`)
    console.log(`Platform address (5% of mints): ${platformAddress}`)

    // Get RoyaltySplitter deployment for royalty receiver
    // If not deployed, fall back to deployer address
    let royaltyReceiver = deployer
    
    try {
        const royaltySplitter = await hre.deployments.get('RoyaltySplitter')
        royaltyReceiver = royaltySplitter.address
        console.log(`Using RoyaltySplitter for royalties: ${royaltyReceiver}`)
        console.log(`  Artist gets: 15% of sale (93.75% of 16% royalty)`)
        console.log(`  Platform gets: 1% of sale (6.25% of 16% royalty)`)
    } catch (error) {
        console.log(`⚠️  RoyaltySplitter not found, using deployer as royalty receiver: ${royaltyReceiver}`)
        console.log(`  💡 Deploy RoyaltySplitter first for automatic artist/platform split`)
    }

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            'Doba Music NFT', // name
            'DOBA', // symbol
            endpointV2Deployment.address, // LayerZero's EndpointV2 address
            deployer, // delegate/owner
            artistAddress, // artist address (95% of mint)
            platformAddress, // platform address (5% of mint)
            royaltyReceiver, // royalty receiver address (for secondary sales)
            priceFeedAddress, // Chainlink price feed
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
    console.log(`⚠️  IMPORTANT: Set base URI after deployment using: await doba.setBaseURI('https://api.dobamusic.com/metadata/')`)
}

deploy.tags = [contractName]

export default deploy
