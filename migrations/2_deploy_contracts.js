const Ticket = artifacts.require('Ticket');
const TicketMarket = artifacts.require('TicketMarket');

module.exports = function(deployer) {
    deployer.deploy(TicketMarket);
    deployer.deploy(Ticket);
}
