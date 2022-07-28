let value;

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

    createNFT: async (name, description, json) => {
        let ticketInstance;

        await web3.eth.getAccounts(function(error, accounts) {
            
            if (error) {
                console.log(error);
            }

            const account = accounts[0];
            App.contracts.Ticket.deployed().then(function(instance) {
                ticketInstance = instance;

                return ticketInstance.createToken(name, description, json, { from: account });
            }).then(function(result) {
                window.location.href = "./my-nft?action=created";
            }).catch(function(err) {
                window.location.href = "./my-nft?action=error";
            });

        });

    }

}

$(function() {
    $(window).load(function() {
        App.init();
        $("#createNFT").click(async () => {            
            const name = $("#name").val();
            const description = $("#description").val();
            const event = $("#event").val();
            const artist = $("#artist").val();
            const date = $("#date").val();
            const hour= $("#hour").val();

            const json = JSON.stringify({ event: event, artist: artist, date: date, hour: hour });
            console.log(json);

            if (name == '' || description == '' || event == '' || artist == '' || date == '' || hour == '') {
                toastr.error("Please fill all input fields...");
            } else {
                await App.createNFT(name, description, json);
            }

        });
    });
});
