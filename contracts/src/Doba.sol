// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";
import { DobaSplitter } from "./DobaSplitter.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";

/**
 * @title Doba
 * @dev Music NFT platform (ERC-1155) with automated splitting and LayerZero omnichain sync.
 */
contract Doba is ERC1155, Ownable, ReentrancyGuard, OApp {
    using SafeERC20 for IERC20;
    uint256 public nextCollectionId;
    
    IERC20 public usdc;
    address public splitterImplementation;
    
    // Revenue splits: 93% Artist Splitter, 7% platform (owner)
    uint256 public constant PRIMARY_ARTIST_BPS = 9300;
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    uint256 public constant MINT_PRICE = 990000; // 0.99 USDC (6 decimals)
    uint256 public botFee = 990000; // Default 0.99 USDC

    struct Collection {
        uint256 id;
        address artist;
        address splitter;
        string baseUri;
        uint256 maxSupply;
        bool exists;
    }

    mapping(uint256 => Collection) public collections;
    mapping(uint256 => uint256) public tokenToCollection; // tokenId => collectionId
    mapping(uint256 => uint256) public collectionMinted; // collectionId => total minted

    event CollectionPublished(uint256 indexed collectionId, address indexed artist, address splitter, uint256 price);
    event SongMinted(uint256 indexed collectionId, uint256 indexed tokenId, address indexed buyer);
    event SongSynced(uint32 dstEid, uint256 collectionId, bytes32 guid);

    constructor(
        address _usdc,
        address _lzEndpoint,
        address _delegate
    ) ERC1155("") Ownable(_delegate) OApp(_lzEndpoint, _delegate) {
        usdc = IERC20(_usdc);
        splitterImplementation = address(new DobaSplitter());
    }

    /**
     * @notice Updates the splitter implementation address for future clones
     */
    function updateSplitterImplementation(address _implementation) external onlyOwner {
        require(_implementation != address(0), "Zero address");
        splitterImplementation = _implementation;
    }

    /**
     * @notice Updates the bot fee for publishing
     */
    function setBotFee(uint256 _fee) external onlyOwner {
        botFee = _fee;
    }

    /**
     * @notice Publishes a new collection
     */
    function publish(
        string memory _baseUri,
        uint256 _maxSupply,
        address[] memory _collaborators,
        uint256[] memory _shares
    ) external nonReentrant returns (uint256) {
        if (msg.sender != owner() && botFee > 0) {
            usdc.safeTransferFrom(msg.sender, owner(), botFee);
        }
        
        uint256 collectionId = nextCollectionId++;
        
        address splitter = Clones.clone(splitterImplementation);
        DobaSplitter(payable(splitter)).initialize(_collaborators, _shares);
        
        collections[collectionId] = Collection({
            id: collectionId,
            artist: msg.sender,
            splitter: splitter,
            baseUri: _baseUri,
            maxSupply: _maxSupply,
            exists: true
        });

        tokenToCollection[collectionId] = collectionId;

        emit CollectionPublished(collectionId, msg.sender, splitter, MINT_PRICE);
        return collectionId;
    }

    /**
     * @notice Mints a token from a collection
     */
    function mint(uint256 _collectionId) external nonReentrant {
        Collection storage collection = collections[_collectionId];
        require(collection.exists, "Nonexistent collection");
        require(collection.maxSupply == 0 || collectionMinted[_collectionId] < collection.maxSupply, "Sold Out");
        require(balanceOf(msg.sender, _collectionId) == 0, "Already Collected");

        uint256 platformShare = (MINT_PRICE * (BPS_DENOMINATOR - PRIMARY_ARTIST_BPS)) / BPS_DENOMINATOR;
        uint256 artistShare = MINT_PRICE - platformShare;

        usdc.safeTransferFrom(msg.sender, owner(), platformShare);
        usdc.safeTransferFrom(msg.sender, collection.splitter, artistShare);

        collectionMinted[_collectionId]++;
        _mint(msg.sender, _collectionId, 1, "");
        
        emit SongMinted(_collectionId, _collectionId, msg.sender);
    }

    // --- LayerZero Functions ---

    /**
     * @notice Quotes the fee for syncing a song to another chain
     */
    function quoteSyncSong(
        uint32 _dstEid,
        uint256 _collectionId,
        bytes calldata _options
    ) public view returns (uint256 nativeFee) {
        Collection storage collection = collections[_collectionId];
        require(collection.exists, "Collection does not exist");
        
        bytes memory payload = abi.encode(
            collection.id,
            collection.artist,
            collection.maxSupply,
            collection.baseUri
        );
        
        MessagingFee memory fee = _quote(_dstEid, payload, _options, false);
        return fee.nativeFee;
    }

    /**
     * @notice Syncs a song to another chain
     */
    function syncSong(
        uint32 _dstEid,
        uint256 _collectionId,
        bytes calldata _options
    ) external payable nonReentrant returns (MessagingReceipt memory receipt) {
        Collection storage collection = collections[_collectionId];
        require(collection.exists, "Collection does not exist");
        require(msg.sender == collection.artist, "Not the artist");
        
        bytes memory payload = abi.encode(
            collection.id,
            collection.artist,
            collection.maxSupply,
            collection.baseUri
        );
        
        receipt = _lzSend(
            _dstEid,
            payload,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
        
        emit SongSynced(_dstEid, _collectionId, receipt.guid);
    }

    /**
     * @dev Internal function to handle incoming LayerZero messages
     */
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        (uint256 id, address artist, uint256 maxSupply, string memory baseUri) = abi.decode(
            _message,
            (uint256, address, uint256, string)
        );
        
        if (!collections[id].exists) {
            collections[id] = Collection({
                id: id,
                artist: artist,
                splitter: address(0), // No local splitter for remote songs
                baseUri: baseUri,
                maxSupply: maxSupply,
                exists: true
            });
            
            if (id >= nextCollectionId) {
                nextCollectionId = id + 1;
            }
            
            tokenToCollection[id] = id;
            emit CollectionPublished(id, artist, address(0), MINT_PRICE);
        }
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        uint256 collectionId = tokenToCollection[tokenId];
        if (!collections[collectionId].exists || tokenId != collectionId) {
            return super.uri(tokenId);
        }
        return collections[collectionId].baseUri;
    }
}
