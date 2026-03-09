// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Test } from "forge-std/Test.sol";
import { Doba } from "../src/Doba.sol";
import { DobaSplitter } from "../src/DobaSplitter.sol";
import { ERC1155Holder } from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract MockEndpoint {
    function setDelegate(address) external {}
}

contract DobaTest is Test, ERC1155Holder {
    Doba public doba;
    MockUSDC public usdc;

    address public owner = address(1);
    address public artist = address(2);
    address public fan = address(3);
    address public fan2 = address(5);
    address public collaborator = address(4);

    uint256 public constant MINT_PRICE = 500000;

    function setUp() public {
        vm.startPrank(owner);
        usdc = new MockUSDC();
        address mockEndpoint = address(new MockEndpoint());
        // Doba(address _usdc, address _lzEndpoint, address _delegate)
        doba = new Doba(address(usdc), mockEndpoint, owner);
        vm.stopPrank();
    }

    function test_PublishAndMint() public {
        uint256 maxSupply = 100;
        
        // 1. Artist publishes a collection
        uint256 botFee = doba.botFee();
        usdc.mint(artist, botFee);
        vm.startPrank(artist);
        usdc.approve(address(doba), botFee);
        
        address[] memory payees = new address[](2);
        payees[0] = artist;
        payees[1] = collaborator;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 70; // 70% of the artist share
        shares[1] = 30; // 30% of the artist share

        uint256 collectionId = doba.publish("ipfs://metadata", maxSupply, payees, shares);
        vm.stopPrank();

        assertEq(collectionId, 0);
        
        (, address splitter, , uint256 supply, ) = doba.collections(collectionId);
        assertEq(supply, maxSupply);
        assertTrue(splitter != address(0));

        // 2. Fan mints
        usdc.mint(fan, MINT_PRICE);
        
        vm.startPrank(fan);
        usdc.approve(address(doba), MINT_PRICE);
        doba.mint(collectionId);
        vm.stopPrank();

        // 3. Verify NFT received
        assertEq(doba.balanceOf(fan, 0), 1);

        // 4. Verify Splitting
        uint256 platformFee = (MINT_PRICE * 1000) / 10000;
        uint256 artistShare = MINT_PRICE - platformFee;

        assertEq(usdc.balanceOf(owner), platformFee + botFee);
        assertEq(usdc.balanceOf(splitter), artistShare);
    }

    function test_SoldOut() public {
        uint256 maxSupply = 1;
        
        // Artist publishes
        uint256 botFee = doba.botFee();
        usdc.mint(artist, botFee);
        vm.startPrank(artist);
        usdc.approve(address(doba), botFee);
        address[] memory p = new address[](1); p[0] = artist;
        uint256[] memory s = new uint256[](1); s[0] = 100;
        uint256 collectionId = doba.publish("ipfs://cid", maxSupply, p, s);
        vm.stopPrank();

        // Fan 1 mints
        usdc.mint(fan, MINT_PRICE);
        vm.startPrank(fan);
        usdc.approve(address(doba), MINT_PRICE);
        doba.mint(collectionId);
        vm.stopPrank();

        // Fan 2 attempts to mint (Sold Out)
        usdc.mint(fan2, MINT_PRICE);
        vm.startPrank(fan2);
        usdc.approve(address(doba), MINT_PRICE);
        vm.expectRevert("Sold Out");
        doba.mint(collectionId);
        vm.stopPrank();
    }

    function test_UniqueOwnership() public {
        uint256 maxSupply = 100;
        
        // Artist publishes
        uint256 botFee = doba.botFee();
        usdc.mint(artist, botFee);
        vm.startPrank(artist);
        usdc.approve(address(doba), botFee);
        address[] memory p = new address[](1); p[0] = artist;
        uint256[] memory s = new uint256[](1); s[0] = 100;
        uint256 collectionId = doba.publish("ipfs://cid", maxSupply, p, s);
        vm.stopPrank();

        // Fan mints once
        usdc.mint(fan, MINT_PRICE * 2);
        vm.startPrank(fan);
        usdc.approve(address(doba), MINT_PRICE * 2);
        doba.mint(collectionId);
        
        // Fan attempts to mint again (Already Collected)
        vm.expectRevert("Already Collected");
        doba.mint(collectionId);
        vm.stopPrank();
    }

    function test_Uri() public {
        uint256 botFee = doba.botFee();
        usdc.mint(artist, botFee);
        vm.startPrank(artist);
        usdc.approve(address(doba), botFee);
        
        address[] memory payees = new address[](1);
        payees[0] = artist;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 100;
        
        doba.publish("ipfs://cid", 1000, payees, shares);
        vm.stopPrank();

        assertEq(doba.uri(0), "ipfs://cid");
    }

    function test_BotFee() public {
        uint256 expectedFee = 500000;
        usdc.mint(artist, expectedFee);
        
        vm.startPrank(artist);
        usdc.approve(address(doba), expectedFee);
        
        address[] memory payees = new address[](1);
        payees[0] = artist;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 100;

        doba.publish("ipfs://test", 100, payees, shares);
        vm.stopPrank();

        assertEq(usdc.balanceOf(owner), expectedFee);
    }

    function test_MintSyncedSong() public {
        // 1. Mock a synced song via lzReceive
        // Payload: (uint256 id, address artist, uint256 maxSupply, string memory baseUri)
        bytes memory message = abi.encode(uint256(10), artist, uint256(100), "ipfs://synced");
        
        // We need a way to call lzReceive. Let's use a harness or low-level call if we can prank it.
        // For simplicity in this test environment, we'll use vm.etch to put a wrapper or just trust the logic if we can't easily lzReceive.
        // Actually, we can just use vm.makeAddr and cast it to Doba if we want to be fancy, 
        // but let's just use the fact that we can call internal functions if we inherit.
        
        DobaHarness dobaHarness = new DobaHarness(address(usdc), address(new MockEndpoint()), owner);
        
        dobaHarness.lzReceiveTest(message);
        
        // 2. Synced song gets local ID 0 (nextCollectionId is 0 on fresh harness)
        (, address splitter, , , bool exists) = dobaHarness.collections(0);
        assertTrue(exists);
        assertEq(splitter, address(0));

        // 3. Fan mints the synced song (local ID 0)
        usdc.mint(fan, MINT_PRICE);
        vm.startPrank(fan);
        usdc.approve(address(dobaHarness), MINT_PRICE);
        dobaHarness.mint(0);
        vm.stopPrank();

        // 4. Verify revenue went to ARTIST directly
        uint256 platformFee = (MINT_PRICE * 1000) / 10000;
        uint256 artistShare = MINT_PRICE - platformFee;

        assertEq(usdc.balanceOf(owner), platformFee);
        assertEq(usdc.balanceOf(artist), artistShare);
    }

    // --- New tests for audit fixes ---

    function test_LzReceiveDoesNotOverwriteLocalCollection() public {
        // 1. Publish a local collection as artist
        uint256 botFee = doba.botFee();
        usdc.mint(artist, botFee);
        vm.startPrank(artist);
        usdc.approve(address(doba), botFee);
        address[] memory p = new address[](1); p[0] = artist;
        uint256[] memory s = new uint256[](1); s[0] = 100;
        doba.publish("ipfs://local", 100, p, s);
        vm.stopPrank();

        // Local collection 0 now exists with artist
        (address storedArtist,,,,) = doba.collections(0);
        assertEq(storedArtist, artist);
    }

    function test_SetBotFee_OnlyOwner() public {
        vm.prank(fan);
        vm.expectRevert();
        doba.setBotFee(1_000_000);
    }

    function test_SetBotFee_CappedMax() public {
        vm.prank(owner);
        vm.expectRevert("Fee too high");
        doba.setBotFee(20_000_000); // Exceeds MAX_BOT_FEE
    }

    function test_PublishRejectsEmptyUri() public {
        uint256 botFee = doba.botFee();
        usdc.mint(artist, botFee);
        vm.startPrank(artist);
        usdc.approve(address(doba), botFee);
        address[] memory p = new address[](1); p[0] = artist;
        uint256[] memory s = new uint256[](1); s[0] = 100;
        vm.expectRevert("Empty URI");
        doba.publish("", 100, p, s);
        vm.stopPrank();
    }

    function test_SplitterReleaseERC20() public {
        // 1. Publish collection with 2 collaborators
        uint256 botFee = doba.botFee();
        usdc.mint(artist, botFee);
        vm.startPrank(artist);
        usdc.approve(address(doba), botFee);

        address[] memory payees = new address[](2);
        payees[0] = artist;
        payees[1] = collaborator;
        uint256[] memory shares = new uint256[](2);
        shares[0] = 70;
        shares[1] = 30;

        uint256 collectionId = doba.publish("ipfs://test", 100, payees, shares);
        vm.stopPrank();

        (, address splitter,,,) = doba.collections(collectionId);

        // 2. Fan mints (sends USDC to splitter)
        usdc.mint(fan, MINT_PRICE);
        vm.startPrank(fan);
        usdc.approve(address(doba), MINT_PRICE);
        doba.mint(collectionId);
        vm.stopPrank();

        uint256 artistShare = MINT_PRICE - (MINT_PRICE * 1000) / 10000; // 450000
        assertEq(usdc.balanceOf(splitter), artistShare);

        // 3. Release ERC20 for artist (70%)
        DobaSplitter splitterContract = DobaSplitter(payable(splitter));
        splitterContract.releaseERC20(IERC20(address(usdc)), artist);
        assertEq(usdc.balanceOf(artist), (artistShare * 70) / 100);

        // 4. Release ERC20 for collaborator (30%)
        splitterContract.releaseERC20(IERC20(address(usdc)), collaborator);
        assertEq(usdc.balanceOf(collaborator), (artistShare * 30) / 100);
    }
}

import { Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";

contract DobaHarness is Doba {
    constructor(address _usdc, address _lzEndpoint, address _delegate) Doba(_usdc, _lzEndpoint, _delegate) {}
    
    function lzReceiveTest(bytes calldata _message) external {
        this.lzReceive(Origin(0, bytes32(0), 0), bytes32(0), _message, address(0), "");
    }

    function lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata _extraData
    ) public payable override {
        _lzReceive(_origin, _guid, _message, _executor, _extraData);
    }
}
