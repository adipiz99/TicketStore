const fs = require('fs');
const { assert } = require('chai');
const { BN, expectRevert, expectEvent, constants } = require('@openzeppelin/test-helpers')
const ethers = require('ethers');

const Drawing = artifacts.require('Ticket');
const DrawingMarket = artifacts.require('TicketMarket');

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Ticket', (accounts) => {

    // Declare contract
    let contract;
    let market;

    beforeEach(async () => {
        market = await DrawingMarket.new({ from: accounts[0] });
        contract = await Drawing.new({ from: accounts[0] });
    })

    describe('deployment', async () => {
        it('deployment successfully', async () => {
            // Check on contract's address
            const address = contract.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined); 

            const addressMarket = market.address;
            assert.notEqual(addressMarket, 0x0);
            assert.notEqual(addressMarket, '');
            assert.notEqual(addressMarket, null);
            assert.notEqual(addressMarket, undefined); 
        });

        it("has a name", async () => {
            // Get name of contract and check it
            assert.equal(await contract.name(), 'Ticket');
        });

        it("has a symbol", async () => {
            // Get symbol of contract and check it
            assert.equal(await contract.symbol(), 'TCKT');
        });

    })
    
    describe('create nft', async () => {
        it('createTokenURI', async () => {
            const name = 'name';
            const description = 'description';
            const json = 'json';
            const tokenURI = await contract.createTokenURI(name, description, json);
            assert.equal(tokenURI, 'data:application/json;base64,eyJuYW1lIjogIm5hbWUiLCAiZGVzY3JpcHRpb24iOiAiZGVzY3JpcHRpb24iLCAiYXR0cmlidXRlcyI6ICIiLCAiaW1hZ2UiOiAiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxhVzFoWjJVPSIgfQ==');
        });

        it('createToken', async () => {
            const name = 'name';
            const description = 'description';
            const json = 'json';
            const tx = await contract.createToken(name, description, json);
            const tokenId = tx.logs[1].args['2'].words[0];
            assert.equal(1, tokenId);
            
            const tokenURI = await contract.tokenURI(1);
            assert.equal(tokenURI, 'data:application/json;base64,eyJuYW1lIjogIm5hbWUiLCAiZGVzY3JpcHRpb24iOiAiZGVzY3JpcHRpb24iLCAiYXR0cmlidXRlcyI6ICIiLCAiaW1hZ2UiOiAiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxhVzFoWjJVPSIgfQ==');    
        });

    })

    describe('getMyTokens', async () => {
    
        it('There are no tokens.', async () => {
            await expectRevert(
                contract.getMyTokens(),
                'There are no tokens.'
            );
        });

        it('Caller must be have at least 1 token.', async () => {
            const name = 'name';
            const description = 'description';
            const json = 'json';
            const tx = await contract.createToken(name, description, json);
            const tokenId = tx.logs[1].args['2'].words[0];
            assert.equal(1, tokenId);
            
            const tokenURI = await contract.tokenURI(1);
            assert.equal(tokenURI, 'data:application/json;base64,eyJuYW1lIjogIm5hbWUiLCAiZGVzY3JpcHRpb24iOiAiZGVzY3JpcHRpb24iLCAiYXR0cmlidXRlcyI6ICIiLCAiaW1hZ2UiOiAiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxhVzFoWjJVPSIgfQ==');    
            
            await expectRevert(
                contract.getMyTokens({ from: accounts[1] }),
                'Caller must be have at least 1 token.'
            );
        });

        it('Test returns value.', async () => {

            // Create token1 by accounts[0]
            const name1 = 'name1';
            const description1 = 'description1';
            const json1 = 'json1';
            const tx1 = await contract.createToken(name1, description1, json1);
            const tokenId1 = tx1.logs[1].args['2'].words[0];
            assert.equal(1, tokenId1);
            
            const tokenURI1 = await contract.tokenURI(1);
            assert.equal(tokenURI1, 'data:application/json;base64,eyJuYW1lIjogIm5hbWUxIiwgImRlc2NyaXB0aW9uIjogImRlc2NyaXB0aW9uMSIsICJhdHRyaWJ1dGVzIjogIiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LGFXMWhaMlV4IiB9');
            assert.equal(await contract.ownerOf(tokenId1), accounts[0]);

            // Create token2 by accounts[0]
            const name2 = 'name2';
            const description2 = 'description2';
            const json2 = 'json2';
            const tx2 = await contract.createToken(name2, description2, json2);
            const tokenId2 = tx2.logs[1].args['2'].words[0];
            assert.equal(2, tokenId2);
            
            const tokenURI2 = await contract.tokenURI(2);
            assert.equal(tokenURI2, 'data:application/json;base64,eyJuYW1lIjogIm5hbWUyIiwgImRlc2NyaXB0aW9uIjogImRlc2NyaXB0aW9uMiIsICJhdHRyaWJ1dGVzIjogIiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LGFXMWhaMlV5IiB9');
            assert.equal(await contract.ownerOf(tokenId2), accounts[0]);

            // Create token3 by accounts[1]
            const name3 = 'name3';
            const description3 = 'description3';
            const json3 = 'json3';
            const tx3 = await contract.createToken(name3, description3, json3, { from: accounts[1] });
            const tokenId3 = tx3.logs[1].args['2'].words[0];
            assert.equal(3, tokenId3);
            
            const tokenURI3 = await contract.tokenURI(3);
            assert.equal(tokenURI3, 'data:application/json;base64,eyJuYW1lIjogIm5hbWUzIiwgImRlc2NyaXB0aW9uIjogImRlc2NyaXB0aW9uMyIsICJhdHRyaWJ1dGVzIjogIiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LGFXMWhaMlV6IiB9');
            assert.equal(await contract.ownerOf(tokenId3), accounts[1]);

            // Retrive tokens owned by accounts[0]
            const recepit = await contract.getMyTokens({ from: accounts[0] });
            const tokensOwnedByAccounts0 = recepit[0];
            assert.equal(tokensOwnedByAccounts0.length, 2);
            assert.equal(tokensOwnedByAccounts0[0], tokenURI1);
            assert.equal(tokensOwnedByAccounts0[1], tokenURI2);

            // Retrive tokens owned by accounts[1]
            const recepit1 = await contract.getMyTokens({ from: accounts[1] });
            const tokensOwnedByAccounts1 = recepit1[0];
            assert.equal(tokensOwnedByAccounts1.length, 1);
            assert.equal(tokensOwnedByAccounts1[0], tokenURI3);

        });

    })

    describe('create market', async () => {

        it('Price must be at least 1 wei.', async () => {

            let listingPrice = await market.getListingPrice();
            
            const name = 'name';
            const description = 'description';
            const json = 'json';
            let tx = await contract.createToken(name, description, json);
            const tokenId = tx.logs[1].args['2'].words[0];
            assert.equal(1, tokenId);

            const auctionPrice = ethers.utils.parseUnits('0', 'ether');

            await expectRevert(
                market.create(contract.address, tokenId, auctionPrice, { value: listingPrice }),
                'Price must be at least 1 wei.'
            );

        });

        it('Price must be equal to listing price.', async () => {

            let listingPrice = await market.getListingPrice();
            
            const name = 'name';
            const description = 'description';
            const json = 'json';
            let tx = await contract.createToken(name, description, json);
            const tokenId = tx.logs[1].args['2'].words[0];
            assert.equal(1, tokenId);

            const auctionPrice = ethers.utils.parseUnits('1', 'ether');

            await expectRevert(
                market.create(contract.address, tokenId, auctionPrice, { value: auctionPrice }),
                'Price must be equal to listing price.'
            );

        });

        it('ItemCreated event.', async () => {
        
            // Market was deployed by accounts[0], test creation with accounts[1]
            const address = accounts[1];

            let listingPrice = await market.getListingPrice();
            
            const name = 'name';
            const description = 'description';
            const json = 'json';
            let tx = await contract.createToken(name, description, json, { from: address });
            const tokenId = tx.logs[1].args['2'].words[0];
            assert.equal(1, tokenId);
            assert.equal(await contract.ownerOf(tokenId), address);

            const auctionPrice = ethers.utils.parseUnits('1', 'ether');

            await contract.setApprovalForAll(market.address, true, {
                from: address
            });

            tx = await market.create(contract.address, tokenId, auctionPrice, {
                from: address,
                value: listingPrice 
            });

            expectEvent(tx, 'ItemCreated', {
                itemId: new BN(1),
                nftContract: contract.address,
                tokenId: new BN(tokenId),
                seller: address,
                owner: constants.ZERO_ADDRESS,
                price: new BN("1000000000000000000"),
                sold: false
            });

            // NFT is now owned by smart contract
            assert.equal(await contract.ownerOf(tokenId), market.address);

        });

    });

    describe('create market sale', async () => {

        it('Please submit the asking price in order to complete the purchase.', async () => {

            // Market was deployed by accounts[0], test creation with accounts[1]
            const seller = accounts[1];

            let listingPrice = await market.getListingPrice();
            
            const name = 'name';
            const description = 'description';
            const json = 'json';
            let tx = await contract.createToken(name, description, json, { from: seller });
            const tokenId = tx.logs[1].args['2'].words[0];
            assert.equal(1, tokenId);
            assert.equal(await contract.ownerOf(tokenId), seller);

            const auctionPrice = ethers.utils.parseUnits('1', 'ether');

            await contract.setApprovalForAll(market.address, true, {
                from: seller
            });

            tx = await market.create(contract.address, tokenId, auctionPrice, {
                from: seller,
                value: listingPrice 
            });

            expectEvent(tx, 'ItemCreated', {
                itemId: new BN(1),
                nftContract: contract.address,
                tokenId: new BN(tokenId),
                seller: seller,
                owner: constants.ZERO_ADDRESS,
                price: new BN("1000000000000000000"),
                sold: false
            });

            // NFT is now owned by smart contract
            assert.equal(await contract.ownerOf(tokenId), market.address);

            const buyer = accounts[2];
            const offeredPrice = ethers.utils.parseUnits('0.5', 'ether');

            await expectRevert(
                market.createMarketSale(contract.address, new BN(1), { 
                    from: buyer,
                    value: offeredPrice 
                }),
                'Please submit the asking price in order to complete the purchase.'
            );

        });

        it('buying an item', async () => {

            // Market was deployed by accounts[0], test creation with accounts[1]
            const seller = accounts[1];

            let listingPrice = await market.getListingPrice();
            
            const name = 'name';
            const description = 'description';
            const json = 'json';
            let tx = await contract.createToken(name, description, json, { from: seller });
            const tokenId = tx.logs[1].args['2'].words[0];
            assert.equal(1, tokenId);
            assert.equal(await contract.ownerOf(tokenId), seller);

            const auctionPrice = ethers.utils.parseUnits('1', 'ether');
            await contract.setApprovalForAll(market.address, true, {
                from: seller
            });
            tx = await market.create(contract.address, tokenId, auctionPrice, {
                from: seller,
                value: listingPrice 
            });

            expectEvent(tx, 'ItemCreated', {
                itemId: new BN(1),
                nftContract: contract.address,
                tokenId: new BN(tokenId),
                seller: seller,
                owner: constants.ZERO_ADDRESS,
                price: new BN("1000000000000000000"),
                sold: false
            });

            // NFT is now owned by smart contract
            assert.equal(await contract.ownerOf(tokenId), market.address);
            const buyer = accounts[2];
            tx = await market.createMarketSale(contract.address, new BN(1), { 
                from: buyer,
                value: auctionPrice 
            });

            // NFT is now owned by buyer
            assert.equal(await contract.ownerOf(tokenId), buyer);

        });
    });

});