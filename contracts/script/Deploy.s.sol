// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Script, console } from "forge-std/Script.sol";
import { Doba } from "../src/Doba.sol";

contract DeployDoba is Script {
    function run() external {
        address usdc = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d; // Arbitrum Sepolia USDC

        vm.startBroadcast();

        Doba doba = new Doba(usdc);
        
        vm.stopBroadcast();

        // Log results
        console.log("Doba deployed to:", address(doba));
        console.log("Splitter implementation deployed to:", doba.splitterImplementation());
    }
}
