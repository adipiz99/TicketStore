module.exports = {

  contracts_build_directory: "./src/public/build/contracts/",

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,     
      network_id: "*",       // Any network (default: none)
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.11",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  }

};
