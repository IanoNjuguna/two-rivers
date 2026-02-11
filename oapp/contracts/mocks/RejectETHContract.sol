// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IDoba {
    function mint(address _to) external payable returns (uint256);
    function withdrawPendingRefund() external;
    function pendingRefunds(address user) external view returns (uint256);
}

/**
 * @title RejectETHContract
 * @notice Helper contract for testing failed refund scenarios
 * @dev Rejects ETH during mint refund but accepts during withdrawPendingRefund
 */
contract RejectETHContract {
    IDoba public doba;
    bool public acceptingETH;
    
    constructor(address _doba) {
        doba = IDoba(_doba);
        acceptingETH = false;
    }
    
    /**
     * @notice Mint NFT with overpayment - refund will fail
     */
    function mintNFT() external payable {
        doba.mint{value: msg.value}(address(this));
    }
    
    /**
     * @notice Allow withdrawal of pending refund
     */
    function withdrawRefund() external {
        acceptingETH = true;
        doba.withdrawPendingRefund();
        acceptingETH = false;
    }
    
    /**
     * @notice Check pending refund amount
     */
    function checkPendingRefund() external view returns (uint256) {
        return doba.pendingRefunds(address(this));
    }
    
    /**
     * @notice Receive function - rejects during mint, accepts during withdrawal
     */
    receive() external payable {
        if (!acceptingETH) {
            revert("Rejecting ETH refund");
        }
    }
    
    /**
     * @notice Allow owner to withdraw collected ETH
     */
    function withdrawCollected() external {
        payable(msg.sender).transfer(address(this).balance);
    }
}
