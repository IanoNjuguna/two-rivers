// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DobaSplitter
 * @dev Clone-compatible payment splitter.
 * Based on OpenZeppelin's PaymentSplitter but with initialize() for clones.
 * Pure Splitter Architecture: No owner, no administrative functions. 
 * Once initialized, shares are immutable.
 */
contract DobaSplitter is Initializable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    event PaymentReleased(address to, uint256 amount);
    event ERC20PaymentReleased(IERC20 indexed token, address to, uint256 amount);
    event PaymentReceived(address from, uint256 amount);
    event PayeeAdded(address account, uint256 shares);

    uint256 public totalShares;
    uint256 public totalReleased;

    mapping(address => uint256) public shares;
    mapping(address => uint256) public released;
    address[] public payees;

    mapping(IERC20 => uint256) public totalReleasedERC20;
    mapping(IERC20 => mapping(address => uint256)) public releasedERC20;

    /**
     * @notice Initializes the contract with payees and shares
     * @dev Can only be called once via the initializer modifier.
     * @param _payees Array of addresses to receive payments
     * @param _shares Array of relative weights for each payee
     */
    function initialize(address[] memory _payees, uint256[] memory _shares) external initializer {
        require(_payees.length == _shares.length, "Length mismatch");
        require(_payees.length > 0, "No payees");

        for (uint256 i = 0; i < _payees.length; i++) {
            _addPayee(_payees[i], _shares[i]);
        }
    }

    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }

    /**
     * @notice Releases accumulated ETH for a specific account
     */
    function release(address payable account) public nonReentrant {
        require(shares[account] > 0, "No shares");

        uint256 totalReceived = address(this).balance + totalReleased;
        uint256 payment = (totalReceived * shares[account]) / totalShares - released[account];

        require(payment > 0, "Not due payment");

        released[account] += payment;
        totalReleased += payment;

        (bool success, ) = account.call{value: payment}("");
        require(success, "Transfer failed");

        emit PaymentReleased(account, payment);
    }

    /**
     * @notice Releases accumulated ERC20 tokens for a specific account
     */
    function releaseERC20(IERC20 token, address account) public nonReentrant {
        require(shares[account] > 0, "No shares");

        uint256 totalReceived = token.balanceOf(address(this)) + totalReleasedERC20[token];
        uint256 payment = (totalReceived * shares[account]) / totalShares - releasedERC20[token][account];

        require(payment > 0, "Not due payment");

        releasedERC20[token][account] += payment;
        totalReleasedERC20[token] += payment;

        token.safeTransfer(account, payment);
        emit ERC20PaymentReleased(token, account, payment);
    }

    function _addPayee(address account, uint256 shares_) private {
        require(account != address(0), "Zero address");
        require(shares_ > 0, "Zero shares");
        require(shares[account] == 0, "Duplicate payee");

        payees.push(account);
        shares[account] = shares_;
        totalShares += shares_;
        emit PayeeAdded(account, shares_);
    }
}
