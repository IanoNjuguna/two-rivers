import assert from 'assert'
import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'RoyaltySplitter'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`\n🎭 Deploying ${contractName}...`)
    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    // For now, using deployer as both artist and platform
    // TODO: Update with actual artist and platform addresses
    const artistAddress = deployer
    const platformAddress = deployer

    console.log(`Artist address (93.75% of royalties): ${artistAddress}`)
    console.log(`Platform address (6.25% of royalties): ${platformAddress}`)

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            artistAddress,   // 93.75% of royalties (15% of sale)
            platformAddress, // 6.25% of royalties (1% of sale)
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`✅ ${contractName} deployed at: ${address}`)
    console.log(`\n📊 Royalty Split (16% total):`)
    console.log(`   Artist: 15% of sale price (93.75% of 16%)`)
    console.log(`   Platform: 1% of sale price (6.25% of 16%)`)
    console.log(`   Seller: 84% of sale price (minus marketplace fees)`)
    console.log(`\n💡 Use this address as the royaltyReceiver when deploying Doba`)
}

export default deploy

deploy.tags = ['RoyaltySplitter']
