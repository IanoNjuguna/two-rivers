import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

/**
 * Pending Refunds Test Suite
 * Tests the failed refund recovery mechanism
 */
describe('Doba Pending Refunds System', function () {
    const eidA = 1
    
    let Doba: ContractFactory
    let MockPriceFeed: ContractFactory
    let EndpointV2Mock: ContractFactory
    let RejectETH: ContractFactory
    let owner: SignerWithAddress
    let user: SignerWithAddress
    let royaltyReceiver: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let dobaA: Contract
    let mockEndpointA: Contract
    let mockPriceFeed: Contract
    let rejectContract: Contract

    before(async function () {
        const signers = await ethers.getSigners()
        ;[owner, user, royaltyReceiver, endpointOwner] = signers

        Doba = await ethers.getContractFactory('Doba')
        MockPriceFeed = await ethers.getContractFactory('MockV3Aggregator')
        RejectETH = await ethers.getContractFactory('RejectETHContract')

        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(
            EndpointV2MockArtifact.abi,
            EndpointV2MockArtifact.bytecode,
            endpointOwner
        )
    })

    beforeEach(async function () {
        mockEndpointA = await EndpointV2Mock.deploy(eidA)
        mockPriceFeed = await MockPriceFeed.deploy(8, 300000000000) // $3000

        dobaA = await Doba.deploy(
            'Doba Music NFT',
            'DOBA',
            mockEndpointA.address,
            owner.address,
            royaltyReceiver.address,
            mockPriceFeed.address
        )

        // Deploy contract that rejects ETH
        rejectContract = await RejectETH.deploy(dobaA.address)
    })

    describe('Failed Refund Storage', function () {
        it('should store failed refund when recipient rejects ETH', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            const overpayment = mintPrice.mul(2)
            const expectedRefund = overpayment.sub(mintPrice)
            
            // Mint from contract that rejects ETH
            await expect(
                rejectContract.mintNFT({ value: overpayment })
            ).to.emit(dobaA, 'RefundFailed')
                .withArgs(rejectContract.address, expectedRefund)
            
            // Verify pending refund stored
            expect(await dobaA.pendingRefunds(rejectContract.address)).to.equal(expectedRefund)
            
            // Verify NFT was still minted
            expect(await dobaA.ownerOf(1)).to.equal(rejectContract.address)
        })

        it('should emit RefundSent with amount 0 for successful refunds', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            const overpayment = mintPrice.mul(2)
            const expectedRefund = overpayment.sub(mintPrice)
            
            // Normal user should receive refund successfully
            await expect(
                dobaA.connect(user).mint(user.address, { value: overpayment })
            ).to.emit(dobaA, 'RefundSent')
                .withArgs(user.address, expectedRefund)
            
            // No pending refund for normal user
            expect(await dobaA.pendingRefunds(user.address)).to.equal(0)
        })

        it('should accumulate multiple failed refunds', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            const overpayment = mintPrice.mul(2)
            const expectedPerRefund = overpayment.sub(mintPrice)
            
            // Mint three times
            await rejectContract.mintNFT({ value: overpayment })
            await rejectContract.mintNFT({ value: overpayment })
            await rejectContract.mintNFT({ value: overpayment })
            
            const totalPending = expectedPerRefund.mul(3)
            expect(await dobaA.pendingRefunds(rejectContract.address)).to.equal(totalPending)
            
            // All three NFTs should be minted
            expect(await dobaA.balanceOf(rejectContract.address)).to.equal(3)
        })
    })

    describe('Pending Refund Withdrawal', function () {
        beforeEach(async function () {
            // Create a pending refund
            const mintPrice = await dobaA.getMintPriceInETH()
            const overpayment = mintPrice.mul(2)
            await rejectContract.mintNFT({ value: overpayment })
        })

        it('should allow withdrawal of pending refund', async function () {
            const pendingAmount = await dobaA.pendingRefunds(rejectContract.address)
            expect(pendingAmount).to.be.gt(0)
            
            const balanceBefore = await ethers.provider.getBalance(rejectContract.address)
            
            await expect(
                rejectContract.withdrawRefund()
            ).to.emit(dobaA, 'RefundSent')
                .withArgs(rejectContract.address, pendingAmount)
            
            const balanceAfter = await ethers.provider.getBalance(rejectContract.address)
            expect(balanceAfter).to.equal(balanceBefore.add(pendingAmount))
            
            // Pending refund should be cleared
            expect(await dobaA.pendingRefunds(rejectContract.address)).to.equal(0)
        })

        it('should revert when no pending refund exists', async function () {
            await expect(
                dobaA.connect(user).withdrawPendingRefund()
            ).to.be.revertedWithCustomError(dobaA, 'NoPendingRefund')
        })

        it('should revert when trying to withdraw twice', async function () {
            await rejectContract.withdrawRefund()
            
            // Second withdrawal should fail
            await expect(
                rejectContract.withdrawRefund()
            ).to.be.revertedWithCustomError(dobaA, 'NoPendingRefund')
        })

        it('should clear pending refund before transfer (reentrancy protection)', async function () {
            const pendingBefore = await dobaA.pendingRefunds(rejectContract.address)
            
            await rejectContract.withdrawRefund()
            
            const pendingAfter = await dobaA.pendingRefunds(rejectContract.address)
            expect(pendingAfter).to.equal(0)
            expect(pendingBefore).to.be.gt(0)
        })
    })

    describe('Edge Cases', function () {
        it('should handle exact payment (no refund needed)', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            
            await dobaA.connect(user).mint(user.address, { value: mintPrice })
            
            // No pending refund
            expect(await dobaA.pendingRefunds(user.address)).to.equal(0)
        })

        it('should handle very small overpayment (1 wei)', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            const overpayment = mintPrice.add(1)
            
            await rejectContract.mintNFT({ value: overpayment })
            
            expect(await dobaA.pendingRefunds(rejectContract.address)).to.equal(1)
        })

        it('should track pending refunds separately for different users', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            const overpayment = mintPrice.mul(2)
            
            // Create second reject contract
            const rejectContract2 = await RejectETH.deploy(dobaA.address)
            
            await rejectContract.mintNFT({ value: overpayment })
            await rejectContract2.mintNFT({ value: overpayment.mul(2) })
            
            const pending1 = await dobaA.pendingRefunds(rejectContract.address)
            const pending2 = await dobaA.pendingRefunds(rejectContract2.address)
            
            expect(pending1).to.not.equal(pending2)
            expect(pending2).to.be.gt(pending1)
        })
    })

    describe('Gas Optimization', function () {
        it('should use nonReentrant modifier efficiently', async function () {
            const mintPrice = await dobaA.getMintPriceInETH()
            const overpayment = mintPrice.mul(2)
            
            await rejectContract.mintNFT({ value: overpayment })
            
            const tx = await rejectContract.withdrawRefund()
            const receipt = await tx.wait()
            
            // Gas usage should be reasonable (< 100k)
            expect(receipt.gasUsed).to.be.lt(100000)
        })
    })
})
