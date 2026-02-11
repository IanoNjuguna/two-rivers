// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Doba } from "../Doba.sol";

// @dev Mock contract for testing Doba  
contract DobaMock is Doba {
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate,
        address _artist,
        address _platform,
        address _royaltyReceiver,
        address _priceFeed
    ) Doba(_name, _symbol, _lzEndpoint, _delegate, _artist, _platform, _royaltyReceiver, _priceFeed) {}
}
