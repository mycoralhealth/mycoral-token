require('babel-register')({
  ignore: /node_modules\/(?!zeppelin-solidity)/
});
require('babel-polyfill');
module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8546,
            network_id: "*"
        }, 
        ropsten: {
        	network_id: 3,
        	host: "localhost",
        	port: 8547,
        	gas: 2900000
        }
    },
    rpc: {
    	host: "localhost",
    	port: 8080
    }
};
