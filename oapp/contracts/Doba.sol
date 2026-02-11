// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { ONFT721 } from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC2981 } from "@openzeppelin/contracts/token/common/ERC2981.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Doba - Secure Music NFT with Cross-chain Support
 * @notice ERC721 NFT with LayerZero cross-chain capabilities, dynamic USD pricing, and royalties
 * @dev Implements reentrancy protection, stale price checks, and safe fund transfers
 */
contract Doba is ONFT721, ERC2981, ReentrancyGuard, Pausable {
    
    // ============ State Variables ============
    
    AggregatorV3Interface public priceFeed;
    address public immutable artistAddress; // Receives 95% of mint proceeds
    address public immutable platformAddress; // Receives 5% of mint proceeds
    
    uint256 public constant MINT_PRICE_USD = 5e8; // $5 in 8 decimals (Chainlink format)
    uint256 public constant MAX_SUPPLY = 100000; // Maximum NFTs mintable
    uint256 public constant PRICE_STALENESS_THRESHOLD = 3600; // 1 hour in seconds
    uint256 public constant MIN_ETH_PRICE = 100e8; // $100 minimum ETH price
    uint256 public constant MAX_ETH_PRICE = 100000e8; // $100k maximum ETH price
    
    // Primary sale split: 95% artist, 5% platform
    uint256 public constant ARTIST_MINT_SHARE = 95;
    uint256 public constant PLATFORM_MINT_SHARE = 5;
    
    uint256 private _nextTokenId;
    mapping(address => uint256) public pendingRefunds; // Failed refunds storage
    
    // ============ Events ============
    
    event Minted(address indexed to, uint256 indexed tokenId, uint256 pricePaid);
    event MintPaymentSplit(address indexed artist, uint256 artistAmount, address indexed platform, uint256 platformAmount);
    event Withdrawn(address indexed to, uint256 amount);
    event PriceFeedUpdated(address indexed oldFeed, address indexed newFeed);
    event RefundSent(address indexed to, uint256 amount);
    event RefundFailed(address indexed to, uint256 amount);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);
    
    // ============ Errors ============
    
    error InvalidPriceFeed();
    error InvalidRoyaltyReceiver();
    error InvalidArtistAddress();
    error InvalidPlatformAddress();
    error InsufficientPayment(uint256 required, uint256 provided);
    error PaymentFailed();
    error MaxSupplyReached();
    error StalePriceData();
    error InvalidPriceData();
    error WithdrawFailed();
    error NoPendingRefund();
    error PriceBoundsExceeded(uint256 price);
    error TokenAlreadyExists(uint256 tokenId);
    
    // ============ Constructor ============
    
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate,
        address _artist,
        address _platform,
        address _royaltyReceiver,
        address _priceFeed
    ) ONFT721(_name, _symbol, _lzEndpoint, _delegate) {
        // Validate inputs
        if (_priceFeed == address(0)) revert InvalidPriceFeed();
        if (_royaltyReceiver == address(0)) revert InvalidRoyaltyReceiver();
        if (_artist == address(0)) revert InvalidArtistAddress();
        if (_platform == address(0)) revert InvalidPlatformAddress();
        
        // Set payment recipients
        artistAddress = _artist;
        platformAddress = _platform;
        
        // Sets a 16% royalty (1600 basis points) for secondary sales
        // Split via RoyaltySplitter: 15% artist (93.75% of royalty) + 1% platform (6.25% of royalty)
        // This leaves 84% for the seller (minus marketplace fees ~2-3%)
        _setDefaultRoyalty(_royaltyReceiver, 1600);
        priceFeed = AggregatorV3Interface(_priceFeed);
        _nextTokenId = 1; // Start token IDs from 1
        
        // Note: Base URI should be set post-deployment using inherited setBaseURI() function
    }

    // ============ Public/External Functions ============

    /**
     * @notice Returns the current mint price in ETH based on $5 USD
     * @dev Validates price data freshness and sanity
     * @return The mint price in wei
     */
    function getMintPriceInETH() public view returns (uint256) {
        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        
        // Validate price data
        if (price <= 0) revert InvalidPriceData();
        if (updatedAt == 0) revert InvalidPriceData();
        if (answeredInRound < roundId) revert StalePriceData();
        
        // Check price freshness (not older than PRICE_STALENESS_THRESHOLD)
        if (block.timestamp - updatedAt > PRICE_STALENESS_THRESHOLD) {
            revert StalePriceData();
        }
        
        // Safe calculation with overflow protection
        // price is in 8 decimals (e.g., $3000.00000000 for ETH)
        // MINT_PRICE_USD is $5 in 8 decimals (500000000)
        // Return value in wei (18 decimals)
        uint256 ethPrice = uint256(price);
        
        // Validate price bounds to prevent extreme edge cases
        if (ethPrice < MIN_ETH_PRICE || ethPrice > MAX_ETH_PRICE) {
            revert PriceBoundsExceeded(ethPrice);
        }
        
        // Use checked math (default in 0.8+) to prevent overflow
        return (MINT_PRICE_USD * 1e18) / ethPrice;
    }

    /**
     * @notice Public minting function with auto-incrementing token IDs
     * @dev Protected against reentrancy attacks and can be paused in emergencies
     * @dev Splits payment: 95% to artist, 5% to platform
     * @param _to Address to mint the NFT to
     * @return tokenId The ID of the minted token
     */
    function mint(address _to) external payable nonReentrant whenNotPaused returns (uint256) {
        // Check max supply
        if (_nextTokenId > MAX_SUPPLY) revert MaxSupplyReached();
        
        uint256 requiredPrice = getMintPriceInETH();
        if (msg.value < requiredPrice) {
            revert InsufficientPayment(requiredPrice, msg.value);
        }
        
        uint256 tokenId = _nextTokenId++;
        
        // Mint first (Checks-Effects-Interactions pattern)
        _safeMint(_to, tokenId);
        
        // Split payment: 95% artist, 5% platform
        uint256 artistAmount = (requiredPrice * ARTIST_MINT_SHARE) / 100;
        uint256 platformAmount = requiredPrice - artistAmount; // Remainder to platform
        
        // Send to artist
        (bool artistSuccess, ) = payable(artistAddress).call{value: artistAmount}("");
        if (!artistSuccess) revert PaymentFailed();
        
        // Send to platform
        (bool platformSuccess, ) = payable(platformAddress).call{value: platformAmount}("");
        if (!platformSuccess) revert PaymentFailed();
        
        emit MintPaymentSplit(artistAddress, artistAmount, platformAddress, platformAmount);
        
        // Refund excess payment after mint (safe from reentrancy due to nonReentrant)
        uint256 refundAmount = msg.value - requiredPrice;
        if (refundAmount > 0) {
            // Use call instead of transfer to avoid 2300 gas limit issues
            (bool refundSuccess, ) = payable(msg.sender).call{value: refundAmount}("");
            if (!refundSuccess) {
                // Store failed refund for manual withdrawal (user still gets NFT)
                pendingRefunds[msg.sender] += refundAmount;
                emit RefundFailed(msg.sender, refundAmount);
            } else {
                emit RefundSent(msg.sender, refundAmount);
            }
        }
        
        emit Minted(_to, tokenId, requiredPrice);
        return tokenId;
    }
    
    /**
     * @notice Withdraw pending refund from failed refund attempt
     * @dev Allows users to claim refunds that failed during mint
     */
    function withdrawPendingRefund() external nonReentrant {
        uint256 amount = pendingRefunds[msg.sender];
        if (amount == 0) revert NoPendingRefund();
        
        pendingRefunds[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert WithdrawFailed();
        
        emit RefundSent(msg.sender, amount);
    }
    
    /**
     * @notice Returns the next token ID to be minted
     * @return The next token ID
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @notice Returns the total supply minted so far
     * @return The total number of tokens minted
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @notice Emergency withdraw for stuck funds (owner only)
     * @dev Only for recovering accidentally sent funds, not mint revenue
     * @dev Mint revenue is split instantly to artist/platform on each mint
     */
    function emergencyWithdraw(address payable to) external onlyOwner {
        if (to == address(0)) revert InvalidPlatformAddress();
        
        uint256 balance = address(this).balance;
        if (balance == 0) return;
        
        (bool success, ) = to.call{value: balance}("");
        if (!success) revert WithdrawFailed();
        
        emit Withdrawn(to, balance);
    }
    
    /**
     * @notice Update price feed address (owner only)
     * @dev Allows updating Chainlink oracle if current feed is deprecated
     * @param _newFeed New Chainlink price feed address
     */
    function updatePriceFeed(address _newFeed) external onlyOwner {
        if (_newFeed == address(0)) revert InvalidPriceFeed();
        
        address oldFeed = address(priceFeed);
        priceFeed = AggregatorV3Interface(_newFeed);
        
        emit PriceFeedUpdated(oldFeed, _newFeed);
    }
    
    /**
     * @notice Pause contract in emergency (owner only)
     */
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender);
    }
    
    /**
     * @notice Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    // ============ Required Overrides ============
    
    /**
     * @notice Override supportsInterface to combine ONFT721 and ERC2981
     * @dev Must override both ERC721 (from ONFT721) and ERC2981
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(ERC721, ERC2981)
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @notice Override _credit to prevent token ID collisions in cross-chain transfers
     * @dev Checks that token doesn't already exist before minting from cross-chain message
     * @param _to Address to mint token to
     * @param _tokenId Token ID to mint
     * @param _srcEid Source chain endpoint ID
     */
    function _credit(
        address _to,
        uint256 _tokenId,
        uint32 _srcEid
    ) internal virtual override {
        // Prevent token ID collision - ensure token doesn't already exist
        if (_ownerOf(_tokenId) != address(0)) {
            revert TokenAlreadyExists(_tokenId);
        }
        
        // Call parent implementation to mint
        super._credit(_to, _tokenId, _srcEid);
    }
}
