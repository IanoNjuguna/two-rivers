// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Script, console } from "forge-std/Script.sol";
import { Doba } from "../src/Doba.sol";

contract DeployDoba is Script {
    function run() external {
        address usdc;
        address lzEndpoint;
        if (block.chainid == 421614) {
            usdc = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d; // Arbitrum Sepolia
            lzEndpoint = 0x6EDCE65403992e310A62460808c4b910D972f10f;
        } else if (block.chainid == 42161) {
            usdc = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831; // Arbitrum One
            lzEndpoint = 0x1a44076050125825900e736c501f859c50fE728c;
        } else if (block.chainid == 84532) {
            usdc = 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // Base Sepolia
            lzEndpoint = 0x6EDCE65403992e310A62460808c4b910D972f10f;
        } else if (block.chainid == 8453) {
            usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // Base Mainnet
            lzEndpoint = 0x1a44076050125825900e736c501f859c50fE728c;
        } else if (block.chainid == 43114) {
            usdc = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E; // Avalanche C-Chain
            lzEndpoint = 0x1a44076050125825900e736c501f859c50fE728c;
        } else {
            revert("Unsupported network");
        }
        
        vm.startBroadcast();

        Doba doba = new Doba(usdc, lzEndpoint, msg.sender);
        
        vm.stopBroadcast();

        // Log results
        console.log("Doba deployed to:", address(doba));
        console.log("Splitter implementation deployed to:", doba.splitterImplementation());
    }
}
