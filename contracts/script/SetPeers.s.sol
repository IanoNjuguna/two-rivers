// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Script, console } from "forge-std/Script.sol";
import { Doba } from "../src/Doba.sol";

contract SetPeers is Script {
    function run() external {
        address dobaAddress = vm.envAddress("DOBA_ADDRESS");
        uint32 peerEid = uint32(vm.envUint("PEER_EID"));
        address peerAddress = vm.envAddress("PEER_ADDRESS");

        vm.startBroadcast();

        Doba(payable(dobaAddress)).setPeer(
            peerEid,
            bytes32(uint256(uint160(peerAddress)))
        );

        vm.stopBroadcast();

        console.log("Peer set for EID:", peerEid);
    }
}
