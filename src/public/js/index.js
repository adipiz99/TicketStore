App = {

    web3Provider: null,
    contracts: {},

    init: async () => {
        return await App.initWeb3();        
    },

    initWeb3: async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
            // Request account access
            await window.ethereum.request({ method: "eth_requestAccounts" });;
            } catch (error) {
            // User denied account access...
            console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        return await App.initContract();
    },

    initContract: async () => {
        await $.getJSON('../build/contracts/Ticket.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with @truffle/contract
            const TicketArtifact = data;
            App.contracts.Ticket = TruffleContract(TicketArtifact);
          
            // Set the provider for our contract
            App.contracts.Ticket.setProvider(App.web3Provider);          
        });
        await $.getJSON('../build/contracts/TicketMarket.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with @truffle/contract
            const TicketMarketArtifact = data;
            App.contracts.TicketMarket = TruffleContract(TicketMarketArtifact);
          
            // Set the provider for our contract
            App.contracts.TicketMarket.setProvider(App.web3Provider);          
        });
    },

    getUnsoldItems: async () => {
        let ticketMarketInstance;
        let ticketInstance;

        web3.eth.handleRevert = true;

        await web3.eth.getAccounts(function(error, accounts) {
            
            if (error) {
                console.log(error);
            }

            const account = accounts[0];

            App.contracts.Ticket.deployed().then(function(instance) {
                ticketInstance = instance;
                
                App.contracts.TicketMarket.deployed().then(async function(instance) {
                    ticketMarketInstance = instance;
    
                    try {

                        const items = await ticketMarketInstance.getUnsoldItems({ from: account });
                        if (items.length > 0) {
                            for (const item of items) {
                                const tokenId = item[2];
                                const tokenURI = await ticketInstance.tokenURI(tokenId);
                                const json = atob(tokenURI.substring(29));
                                const result = JSON.parse(json);
                                result.itemId = item[0];
                                result.price = item[5];
                                $("#items").append(createItem(result));
                            }
                        } else {
                            $("#items").append("<p>There are currently no tokens for sale!</p>")
                        }
                    } catch (error) {
                        $("#items").append("<p>There are currently no tokens for sale!</p>")
                    }
    
                });

            })

        });

    },

    createMarketSale: async (itemId, price) => {
        let ticketMarketInstance;

        await web3.eth.getAccounts(function(error, accounts) {
            
            if (error) {
                console.log(error);
            }

            const account = accounts[0];

            App.contracts.Ticket.deployed().then(function(instance) {
                ticketInstance = instance;

                App.contracts.ticketInstance.deployed().then(async function(instance) {
                    ticketMarketInstance = instance;

                    try {

                        await ticketMarketInstance.createMarketSale(ticketInstance.address, itemId, {
                            from: account,
                            value: price
                        });
                        window.location.href = "./my-nft?action=buyed";

                    } catch (error) {
                        window.location.href = "./my-nft?action=error";
                    }

                });

            });
            
        });

    }

}

$(function() {
    $(window).load(function() {
        App.init();
    });
});

const createItem = (result) => {
    const item = `<div class="col-sm-6 col-md-4 product-item animation-element slide-top-left">`
        + `<div class="product-container" style="height: 100%;padding-bottom: 0px;">`
        + `<div class="row">`
  /*change*/      + `<div class="col-md-12"><img class="img-fluid" src="${result.json}" style="display: block;margin-left: auto;margin-right: auto"></div>`
        + `</div>`
        + `<div class="row">`
        + `<div class="col-12">`
        + `<h2 style="margin-top: 20px">${result.name}</h2>`
        + `</div>`
        + `</div>`
        + `<div class="row">`
        + `<div class="col-12">`
        + `<p class="product-description" style="margin-top: 0px;margin-bottom: 10px">${result.description}</p>`
        + `</div>`
        + `</div>`
        + `<div class="row">`
        + `<div class="col-6"><button class="btn btn-light" style="border-radius: 125px;background: rgb(78,115,225);" onclick="buy(${result.itemId}, ${result.price})" type="button">Buy Now!</button></div>`
        + `<div class="col-6">`
        + `<p class="product-price">${web3.utils.fromWei(result.price)} ETH</p>`
        + `</div>`
        + `</div>`
        + `</div>`
    return item;
}

async function buy(itemId, price) {

    await App.createMarketSale(itemId, price);

}
