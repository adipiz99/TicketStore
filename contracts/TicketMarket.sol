// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DrawingMarket is ReentrancyGuard {

    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.0025 ether;

    event ItemCreated(uint256 itemId, address nftContract, uint256 tokenId, 
        address seller, address owner, uint256 price, bool sold);

    constructor() {
        owner = payable(msg.sender);
    }

    struct Item {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => Item) private _idToItem;

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function create(address nftContract, uint256 tokenId, uint256 price)
            public payable nonReentrant {

        require(price > 0, "Price must be at least 1 wei.");
        require(msg.value == listingPrice, "Price must be equal to listing price.");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        _idToItem[itemId] = Item(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        emit ItemCreated(itemId, nftContract, tokenId, msg.sender, address(0), price, false);

        // Transfer NFT from creator to DrawingMarket contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
 
    }

    function createMarketSale(address nftContract, uint256 itemId)
            public payable nonReentrant {

        uint price = _idToItem[itemId].price;
        uint tokenId = _idToItem[itemId].tokenId;

        require(msg.value == price, "Please submit the asking price in order to complete the purchase.");

        // Send money to seller
        _idToItem[itemId].seller.transfer(msg.value);
        // Transfer NFT from DrawingMarket contract to buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Update item
        _idToItem[itemId].owner = payable(msg.sender);
        _idToItem[itemId].sold = true;
        _itemsSold.increment();

        // Pay owner of contract
        payable(owner).transfer(listingPrice);

    }

    function getUnsoldItems() public view returns (Item[] memory) {
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        Item[] memory items = new Item[](unsoldItemCount);
        for (uint i = 1; i < itemCount + 1; i++) {
            // If item at index i is unsold
            if (_idToItem[i].owner == address(0)) {
                uint currentId = _idToItem[i].itemId;
                Item storage currentItem = _idToItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex = currentIndex + 1;
            }
        }

        return items;
    }

    function getMyItems() public view returns (Item[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 1; i < totalItemCount + 1; i++) {
            // If item at index i is owned by msg.sender
            if (_idToItem[i].owner == msg.sender) {
                itemCount = itemCount + 1;
            }
        }

        Item[] memory items = new Item[](itemCount);
        for (uint i = 1; i < totalItemCount + 1; i++) {
            if (_idToItem[i].owner == msg.sender) {
                uint currentId = _idToItem[i].itemId;
                Item storage currentItem = _idToItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex = currentIndex + 1;
            }
        }

        return items;
    }

    function getItemsCreated() public view returns (Item[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 1; i < totalItemCount + 1; i++) {
            // If item at index i is owned by msg.sender
            if (_idToItem[i].seller == msg.sender) {
                itemCount = itemCount + 1;
            }
        }

        Item[] memory items = new Item[](itemCount);
        for (uint i = 1; i < totalItemCount + 1; i++) {
            if (_idToItem[i].seller == msg.sender) {
                uint currentId = _idToItem[i].itemId;
                Item storage currentItem = _idToItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex = currentIndex + 1;
            }
        }

        return items;
    }  

}
