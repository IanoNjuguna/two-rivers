// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";
import { DobaSplitter } from "./DobaSplitter.sol";

/**
 * @title Doba
 * @dev Music NFT platform (ERC-1155) with automated splitting.
 * Each song or collection has a dedicated DobaSplitter clone for artists/collaborators.
 */
contract Doba is ERC1155, Ownable, ReentrancyGuard {
    uint256 public nextCollectionId;
    
    IERC20 public usdc;
    address public splitterImplementation;
    
    // Revenue splits: 93% Artist Splitter, 7% platform (owner)
    uint256 public constant PRIMARY_ARTIST_BPS = 9300;
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct Collection {
        uint256 id;
        address artist;
        uint256 price; // Price in USDC (6 decimals)
        address splitter;
        string baseUri;
        bool exists;
    }

    mapping(uint256 => Collection) public collections;
    mapping(uint256 => uint256) public tokenToCollection; // tokenId => collectionId
    mapping(uint256 => uint256) public collectionMinted; // collectionId => total minted

    event CollectionPublished(uint256 indexed collectionId, address indexed artist, address splitter, uint256 price);
    event SongMinted(uint256 indexed collectionId, uint256 indexed tokenId, address indexed buyer);

    constructor(
        address _usdc
    ) ERC1155("") Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        splitterImplementation = address(new DobaSplitter());
    }

    /**
     * @notice Publishes a new collection (Album or Single)
     * @param _baseUri Metadata URI for the collection
     * @param _price Mint price in USDC
     * @param _collaborators Payees for the splitter
     * @param _shares Relative weights for payees
     */
    function publish(
        string memory _baseUri,
        uint256 _price,
        address[] memory _collaborators,
        uint256[] memory _shares
    ) external nonReentrant returns (uint256) {
        uint256 collectionId = nextCollectionId++;
        
        // Deploy splitter clone
        address splitter = Clones.clone(splitterImplementation);
        DobaSplitter(payable(splitter)).initialize(_collaborators, _shares);
        
        collections[collectionId] = Collection({
            id: collectionId,
            artist: msg.sender,
            price: _price,
            splitter: splitter,
            baseUri: _baseUri,
            exists: true
        });

        uint256 tokenId = collectionId; // Setting first tokenId to collectionId
        tokenToCollection[tokenId] = collectionId;

        emit CollectionPublished(collectionId, msg.sender, splitter, _price);
        return collectionId;
    }

    /**
     * @notice Mints a token from a collection
     * @param _collectionId The collection to mint from
     */
    function mint(uint256 _collectionId) external nonReentrant {
        Collection storage collection = collections[_collectionId];
        require(collection.exists, "Nonexistent collection");

        uint256 price = collection.price;
        uint256 platformShare = (price * (BPS_DENOMINATOR - PRIMARY_ARTIST_BPS)) / BPS_DENOMINATOR;
        uint256 artistShare = price - platformShare;

        // Transfers
        require(usdc.transferFrom(msg.sender, owner(), platformShare), "Platform fee failed");
        require(usdc.transferFrom(msg.sender, collection.splitter, artistShare), "Artist share failed");

        uint256 tokenId = _collectionId; // Simplified 1:1 for now, can be adjusted for editions
        collectionMinted[_collectionId]++;
        
        _mint(msg.sender, tokenId, 1, "");
        
        emit SongMinted(_collectionId, tokenId, msg.sender);
    }

    /**
     * @dev Override uri to return collection-specific metadata
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        uint256 collectionId = tokenToCollection[tokenId];
        if (!collections[collectionId].exists) return super.uri(tokenId);
        return collections[collectionId].baseUri;
    }
}
