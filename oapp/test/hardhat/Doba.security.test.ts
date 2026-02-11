import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

/**
 * Security Test Suite for Doba NFT
 * Tests all new security features implemented in the audit fix
 */
describe('Doba Security Features Test Suite', function () {
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
        const signers = await ethers.getSigners()
        ;[owner, user, royaltyReceiver, endpointOwner] = signers

        Doba = await ethers.getContractFactory('Doba')
        MockPriceFeed = await ethers.getContractFactory('MockV3Aggregator')

        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(
            EndpointV2MockArtifact.abi,
            EndpointV2MockArtifact.bytecode,
            endpointOwner
        )
    })

    beforeEach(async function () {
        mockEndpointA = await EndpointV2Mock.deploy(eidA)
        mockEndpointB = await EndpointV2Mock.deploy(eidB)
        mockPriceFeed = await MockPriceFeed.deploy(8, 300000000000) // $3000.00000000

        dobaA = await Doba.deploy(
            'Doba Music NFT',
            'DOBA',
            mockEndpointA.address,
            owner.address,
            royaltyReceiver.address,
            mockPriceFeed.address
        )

        dobaB = await Doba.deploy(
            'Doba Music NFT',
            'DOBA',
            mockEndpointB.address,
            owner.address,
            royaltyReceiver.address,
            mockPriceFeed.address
        )

        await mockEndpointA.setDestLzEndpoint(dobaB.address, mockEndpointB.address)
        await mockEndpointB.setDestLzEndpoint(dobaA.address, mockEndpointA.address)
        await dobaA.connect(owner).setPeer(eidB, ethers.utils.zeroPad(dobaB.address, 32))
        await dobaB.connect(owner).setPeer(eidA, ethers.utils.zeroPad(dobaA.address, 32))
    })

    describe('Pausable Functionality', function () {
        it('should allow owner to pause contract', async function () {
            const tx = await dobaA.connect(owner).pause()
            await expect(tx)
                .to.emit(dobaA, 'ContractPaused')
                .withArgs(owner.address)
        })

        it('should prevent minting when paused', async function () {
            await dobaA.connect(owner).pause()
            
            const mintPrice = await dobaA.getMintPriceInETH()
            
            await expect(
                dobaA.connect(user).mint(user.address, { value: mintPrice })
            ).to.be.revertedWith('Pausable: paused')
        })

        it('should allow owner to unpause contract', async function () {
            await dobaA.connect(owner).pause()
            
            const tx = await dobaA.connect(owner).unpause()
            await expect(tx)
                .to.emit(dobaA, 'ContractUnpaused')
                .withArgs(owner.address)
        })

        it('should allow minting after unpause', async function () {
            await dobaA.connect(owner).pause()
            await dobaA.connect(owner).unpause()
            
            const mintPrice = await dobaA.getMintPriceInETH()
            
            await expect(
                dobaA.connect(user).mint(user.address, { value: mintPrice })
            ).to.emit(dobaA, 'Minted')
        })

        it('should prevent non-owner from pausing', async function () {
            await expect(
                dobaA.connect(user).pause()
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('should prevent non-owner from unpausing', async function () {
            await dobaA.connect(owner).pause()
            
            await expect(
                dobaA.connect(user).unpause()
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })

    describe('Price Feed Update Mechanism', function () {
        let newMockPriceFeed: Contract

        beforeEach(async function () {
            // Deploy a new price feed
            newMockPriceFeed = await MockPriceFeed.deploy(8, 250000000000) // $2500
        })

        it('should allow owner to update price feed', async function () {
            const oldFeed = await dobaA.priceFeed()
            
            await expect(
                dobaA.connect(owner).updatePriceFeed(newMockPriceFeed.address)
            ).to.emit(dobaA, 'PriceFeedUpdated')
                .withArgs(oldFeed, newMockPriceFeed.address)
            
            expect(await dobaA.priceFeed()).to.equal(newMockPriceFeed.address)
        })

        it('should use new price feed for mint calculations', async function () {
            const oldPrice = await dobaA.getMintPriceInETH()
            
            // Update to feed with lower ETH price ($2500 vs $3000)
            await dobaA.connect(owner).updatePriceFeed(newMockPriceFeed.address)
            
            const newPrice = await dobaA.getMintPriceInETH()
            
            // New price should be higher (more ETH needed for $5 at lower ETH price)
            expect(newPrice).to.be.gt(oldPrice)
        })

        it('should prevent updating to zero address', async function () {
            await expect(
                dobaA.connect(owner).updatePriceFeed(ethers.constants.AddressZero)
            ).to.be.revertedWithCustomError(dobaA, 'InvalidPriceFeed')
        })

        it('should prevent non-owner from updating price feed', async function () {
            await expect(
                dobaA.connect(user).updatePriceFeed(newMockPriceFeed.address)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })

    describe('Price Bounds Validation', function () {
        it('should revert when ETH price is below minimum ($100)', async function () {
            // Set ETH price to $50 (below $100 minimum)
            await mockPriceFeed.updateAnswer(5000000000) // $50 in 8 decimals
            
            await expect(
                dobaA.getMintPriceInETH()
            ).to.be.revertedWithCustomError(dobaA, 'PriceBoundsExceeded')
        })

        it('should revert when ETH price is above maximum ($100k)', async function () {
            // Set ETH price to $150k (above $100k maximum)
            await mockPriceFeed.updateAnswer(15000000000000) // $150k in 8 decimals
            
            await expect(
                dobaA.getMintPriceInETH()
            ).to.be.revertedWithCustomError(dobaA, 'PriceBoundsExceeded')
        })

        it('should accept price at minimum bound ($100)', async function () {
            await mockPriceFeed.updateAnswer(10000000000) // $100
            
            const mintPrice = await dobaA.getMintPriceInETH()
            const expectedPrice = ethers.utils.parseEther('5').div(100) // $5 / $100 = 0.05 ETH
            
            expect(mintPrice).to.equal(expectedPrice)
        })

        it('should accept price at maximum bound ($100k)', async function () {
            await mockPriceFeed.updateAnswer(10000000000000) // $100k
            
            const mintPrice = await dobaA.getMintPriceInETH()
            const expectedPrice = ethers.utils.parseEther('5').div(100000) // $5 / $100k = 0.00005 ETH
            
            expect(mintPrice).to.equal(expectedPrice)
        })

        it('should accept price in normal range ($3000)', async function () {
            // Default price is $3000, should work fine
            const mintPrice = await dobaA.getMintPriceInETH()
            
            expect(mintPrice).to.be.gt(0)
            
            // Should be able to mint
            await expect(
                dobaA.connect(user).mint(user.address, { value: mintPrice })
            ).to.emit(dobaA, 'Minted')
        })
    })

    describe('Stale Price Data Protection', function () {
        it('should revert when price data is stale (>1 hour)', async function () {
            // Fast forward time by 2 hours
            await ethers.provider.send('evm_increaseTime', [7200])
            await ethers.provider.send('evm_mine', [])
            
            await expect(
                dobaA.getMintPriceInETH()
            ).to.be.revertedWithCustomError(dobaA, 'StalePriceData')
        })

        it('should accept fresh price data (<1 hour)', async function () {
            // Update answer to refresh timestamp
            await mockPriceFeed.updateAnswer(300000000000)
            
            const mintPrice = await dobaA.getMintPriceInETH()
            expect(mintPrice).to.be.gt(0)
        })
    })

    describe('supportsInterface Fix', function () {
        it('should support ERC721 interface', async function () {
            // ERC721 interface ID: 0x80ac58cd
            expect(await dobaA.supportsInterface('0x80ac58cd')).to.be.true
        })

        it('should support ERC2981 royalty interface', async function () {
            // ERC2981 interface ID: 0x2a55205a
            expect(await dobaA.supportsInterface('0x2a55205a')).to.be.true
        })

        it('should support ERC165 interface', async function () {
            // ERC165 interface ID: 0x01ffc9a7
            expect(await dobaA.supportsInterface('0x01ffc9a7')).to.be.true
        })

        it('should not support random interface', async function () {
            expect(await dobaA.supportsInterface('0xffffffff')).to.be.false
        })
    })

    describe('Max Supply Enforcement', function () {
        it('should have correct MAX_SUPPLY constant', async function () {
            const maxSupply = await dobaA.MAX_SUPPLY()
            expect(maxSupply).to.equal(100000)
        })

        it('should track nextTokenId correctly', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            
            expect(await dobaA.nextTokenId()).to.equal(1)
            
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            expect(await dobaA.nextTokenId()).to.equal(2)
            
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            expect(await dobaA.nextTokenId()).to.equal(3)
        })

        it('should track totalMinted correctly', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            
            expect(await dobaA.totalMinted()).to.equal(0)
            
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            expect(await dobaA.totalMinted()).to.equal(1)
            
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            expect(await dobaA.totalMinted()).to.equal(2)
        })
    })
})
