import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('Doba NFT Test Suite', function () {
    const eidA = 1
    const eidB = 2
    
    let Doba: ContractFactory
    let MockPriceFeed: ContractFactory
    let EndpointV2Mock: ContractFactory
    let owner: SignerWithAddress
    let user: SignerWithAddress
    let royaltyReceiver: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let dobaA: Contract
    let dobaB: Contract
    let mockEndpointA: Contract
    let mockEndpointB: Contract
    let mockPriceFeed: Contract

    before(async function () {
        // Get signers
        const signers = await ethers.getSigners()
        ;[owner, user, royaltyReceiver, endpointOwner] = signers

        // Get contract factories
        Doba = await ethers.getContractFactory('Doba')
        
        // Create mock price feed factory
        MockPriceFeed = await ethers.getContractFactory('MockV3Aggregator')

        // Get EndpointV2Mock artifact
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(
            EndpointV2MockArtifact.abi,
            EndpointV2MockArtifact.bytecode,
            endpointOwner
        )
    })

    beforeEach(async function () {
        // Deploy mock endpoints
        mockEndpointA = await EndpointV2Mock.deploy(eidA)
        mockEndpointB = await EndpointV2Mock.deploy(eidB)

        // Deploy mock price feed (8 decimals, initial price $3000)
        mockPriceFeed = await MockPriceFeed.deploy(8, 300000000000) // $3000.00000000

        // Deploy Doba contracts
        dobaA = await Doba.deploy(
            'Doba Music NFT',
            'DOBA',
            mockEndpointA.address,
            owner.address,
            royaltyReceiver.address,
            mockPriceFeed.address,
            'https://api.dobamusic.com/metadata/'
        )

        dobaB = await Doba.deploy(
            'Doba Music NFT',
            'DOBA',
            mockEndpointB.address,
            owner.address,
            royaltyReceiver.address,
            mockPriceFeed.address,
            'https://api.dobamusic.com/metadata/'
        )

        // Setup LayerZero configuration
        await mockEndpointA.setDestLzEndpoint(dobaB.address, mockEndpointB.address)
        await mockEndpointB.setDestLzEndpoint(dobaA.address, mockEndpointA.address)

        await dobaA.connect(owner).setPeer(eidB, ethers.utils.zeroPad(dobaB.address, 32))
        await dobaB.connect(owner).setPeer(eidA, ethers.utils.zeroPad(dobaA.address, 32))
    })

    describe('Deployment', function () {
        it('should set correct name and symbol', async function () {
            expect(await dobaA.name()).to.equal('Doba Music NFT')
            expect(await dobaA.symbol()).to.equal('DOBA')
        })

        it('should set correct base URI', async function () {
            const tokenId = 1
            await dobaA.mint(user.address, { value: ethers.utils.parseEther('0.1') })
            expect(await dobaA.tokenURI(tokenId)).to.equal('https://api.dobamusic.com/metadata/1')
        })

        it('should initialize with token ID starting at 1', async function () {
            expect(await dobaA.nextTokenId()).to.equal(1)
        })
    })

    describe('Dynamic Pricing', function () {
        it('should calculate correct ETH price for $5 USD', async function () {
            // At $3000/ETH, $5 should be ~0.00166 ETH
            const mintPrice = await dobaA.getMintPriceInETH()
            const expectedPrice = ethers.utils.parseEther('5').div(3000)
            
            // Allow 1% margin for rounding
            expect(mintPrice).to.be.closeTo(expectedPrice, expectedPrice.div(100))
        })

        it('should adjust price when ETH price changes', async function () {
            const initialPrice = await dobaA.getMintPriceInETH()
            
            // Update price to $4000/ETH
            await mockPriceFeed.updateAnswer(400000000000)
            
            const newPrice = await dobaA.getMintPriceInETH()
            
            // Price should be lower (less ETH needed for $5)
            expect(newPrice).to.be.lt(initialPrice)
        })

        it('should revert if price feed returns invalid data', async function () {
            // Set price to 0 (invalid)
            await mockPriceFeed.updateAnswer(0)
            
            await expect(
                dobaA.getMintPriceInETH()
            ).to.be.revertedWith('Invalid price feed')
        })
    })

    describe('Minting', function () {
        it('should mint token with correct payment', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            
            await expect(
                dobaA.connect(user).mint(user.address, { value: mintPrice })
            ).to.emit(dobaA, 'Transfer')
            
            expect(await dobaA.balanceOf(user.address)).to.equal(1)
            expect(await dobaA.ownerOf(1)).to.equal(user.address)
        })

        it('should auto-increment token IDs', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            
            expect(await dobaA.balanceOf(user.address)).to.equal(3)
            expect(await dobaA.nextTokenId()).to.equal(4)
        })

        it('should refund excess payment', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            const overpayment = mintPrice.mul(2) // Pay 2x the price
            
            const balanceBefore = await user.getBalance()
            const tx = await dobaA.connect(user).mint(user.address, { value: overpayment })
            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice)
            
            const balanceAfter = await user.getBalance()
            
            // Should only pay mintPrice + gas
            const expectedBalance = balanceBefore.sub(mintPrice).sub(gasUsed)
            expect(balanceAfter).to.equal(expectedBalance)
        })

        it('should revert on insufficient payment', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            const insufficientPayment = mintPrice.sub(1)
            
            await expect(
                dobaA.connect(user).mint(user.address, { value: insufficientPayment })
            ).to.be.revertedWith('Insufficient payment')
        })

        it('should return minted token ID', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            
            const tx = await dobaA.connect(user).mint(user.address, { value: mintPrice })
            const receipt = await tx.wait()
            
            // The mint function should return token ID 1
            expect(await dobaA.ownerOf(1)).to.equal(user.address)
        })
    })

    describe('Royalties', function () {
        it('should return correct royalty info', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            
            const salePrice = ethers.utils.parseEther('1')
            const [receiver, royaltyAmount] = await dobaA.royaltyInfo(1, salePrice)
            
            expect(receiver).to.equal(royaltyReceiver.address)
            // 5% of 1 ETH = 0.05 ETH
            expect(royaltyAmount).to.equal(salePrice.mul(500).div(10000))
        })
    })

    describe('Base URI Management', function () {
        it('should allow owner to update base URI', async function () {
            await dobaA.setBaseURI('https://newapi.dobamusic.com/nft/')
            
            const mintPrice = await dobaA.getMintPriceInETH()
            await dobaA.mint(user.address, { value: mintPrice })
            
            expect(await dobaA.tokenURI(1)).to.equal('https://newapi.dobamusic.com/nft/1')
        })

        it('should prevent non-owner from updating base URI', async function () {
            await expect(
                dobaA.connect(user).setBaseURI('https://malicious.com/')
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })

    describe('Withdrawal', function () {
        it('should allow owner to withdraw funds', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            
            // Mint 3 NFTs
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            
            const contractBalance = await ethers.provider.getBalance(dobaA.address)
            const ownerBalanceBefore = await owner.getBalance()
            
            const tx = await dobaA.connect(owner).withdraw()
            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice)
            
            const ownerBalanceAfter = await owner.getBalance()
            
            expect(ownerBalanceAfter).to.equal(
                ownerBalanceBefore.add(contractBalance).sub(gasUsed)
            )
            expect(await ethers.provider.getBalance(dobaA.address)).to.equal(0)
        })

        it('should prevent non-owner from withdrawing', async function () {
            await expect(
                dobaA.connect(user).withdraw()
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })

    describe('Cross-chain Transfer', function () {
        it('should transfer NFT across chains', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            
            const tokenId = 1
            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
            
            const sendParam = [
                eidB,
                ethers.utils.zeroPad(owner.address, 32),
                tokenId,
                options,
                '0x',
                '0x'
            ]
            
            const [nativeFee] = await dobaA.quoteSend(sendParam, false)
            
            await dobaA.connect(user).send(sendParam, [nativeFee, 0], user.address, { value: nativeFee })
            
            expect(await dobaA.balanceOf(user.address)).to.equal(0)
            expect(await dobaB.balanceOf(owner.address)).to.equal(1)
        })
    })

    describe('Interface Support', function () {
        it('should support ERC721 interface', async function () {
            expect(await dobaA.supportsInterface('0x80ac58cd')).to.be.true
        })

        it('should support ERC2981 royalty interface', async function () {
            expect(await dobaA.supportsInterface('0x2a55205a')).to.be.true
        })
    })
})
