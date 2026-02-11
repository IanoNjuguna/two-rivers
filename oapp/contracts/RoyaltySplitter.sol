// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RoyaltySplitter
 * @notice Splits royalty payments: 93.75% to artist, 6.25% to platform
 * @dev Receives royalties from marketplaces and splits them automatically
 * 
 * When used as royaltyReceiver in Doba with 16% royalty:
 * - Artist receives: 15% of sale price (93.75% of 16%)
 * - Platform receives: 1% of sale price (6.25% of 16%)
 * - Seller keeps: 84% of sale price (minus marketplace fees)
 */
contract RoyaltySplitter is Ownable, ReentrancyGuard {
    
    address public immutable artist;
    address public immutable platform;
    
    // 15:1 ratio = 93.75% artist, 6.25% platform
    uint256 public constant ARTIST_SHARES = 15;
    uint256 public constant PLATFORM_SHARES = 1;
    uint256 public constant TOTAL_SHARES = 16;
    
    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentSplit(address indexed artist, uint256 artistAmount, address indexed platform, uint256 platformAmount);
    
    error TransferFailed();
    error ZeroAddress();
    
    /**
     * @notice Initialize the splitter with artist and platform addresses
     * @param _artist Address to receive 93.75% of payments (15% of sale)
     * @param _platform Address to receive 6.25% of payments (1% of sale)
     */
    constructor(address _artist, address _platform) Ownable(msg.sender) {
        if (_artist == address(0) || _platform == address(0)) revert ZeroAddress();
        
        artist = _artist;
        platform = _platform;
    }
    
    /**
     * @notice Receive ETH payments and split automatically
     */
    receive() external payable {
        if (msg.value > 0) {
            emit PaymentReceived(msg.sender, msg.value);
            _splitPayment();
        }
    }
    
    /**
     * @notice Manually trigger payment split (in case receive() fails)
     */
    function splitBalance() external nonReentrant {
        _splitPayment();
    }
    
    /**
     * @dev Internal function to split the contract balance
     */
    function _splitPayment() private {
        uint256 balance = address(this).balance;
        if (balance == 0) return;
        
        // Calculate shares
        uint256 artistAmount = (balance * ARTIST_SHARES) / TOTAL_SHARES;
        uint256 platformAmount = balance - artistAmount; // Remainder goes to platform
        
        // Send to artist
        (bool artistSuccess, ) = artist.call{value: artistAmount}("");
        if (!artistSuccess) revert TransferFailed();
        
        // Send to platform
        (bool platformSuccess, ) = platform.call{value: platformAmount}("");
        if (!platformSuccess) revert TransferFailed();
        
        emit PaymentSplit(artist, artistAmount, platform, platformAmount);
    }
    
    /**
     * @notice View function to see pending split amounts
     */
    function getPendingSplit() external view returns (uint256 artistAmount, uint256 platformAmount) {
        uint256 balance = address(this).balance;
        artistAmount = (balance * ARTIST_SHARES) / TOTAL_SHARES;
        platformAmount = balance - artistAmount;
    }
}
