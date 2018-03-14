### General Info ###
The crowdsale contract is a timed and whitelisted contract that delivers tokens at the end of the sale. The end of the sale occurs when either we hit the token cap or the end time is reached.

## Phases: ##
Phase 1 - delivering private sale tokens, assign tokens using the addBalanceToAddress function 
Phase 2 - We can bulk add whitelisted addresses using MyCoralCrowdSale.addManyToWhitelist([addressList]) and they will be able to buy tokens before the crowdsale "startTime"
Phase 3 - Once the start time passes anyone is able to buy tokens from the crowdsale until the end time

### Installation/Testing: ###
Install truffle and testrpc:
```
 npm install -g truffle
 npm install -g ethereumjs-testrpc
```
Setting up the repo:
```
git clone git@github.com:mycoralhealth/mycoral-token.git
cd mycoral-token
npm install
```
Deploying the local test network with the first user unlocked
```
testrpc -u 0 -p 8546
```
Deploying the contract to the test rpc network
```
truffle compile
truffle migrate --reset
```

### Test: ###
Bring up a fresh testrpc and run:
```
truffle test
```

### Interacting with the crowdsale: ###
Note:
You can change the starting parameters of the crowdsale in "migrations/2_deploy_contracts.js" such as start time, end time, and crowdsale cap.

Rerun the migration (make sure testrpc is still running):
```
truffle migrate --reset
```

Copy the token and crowdsale address from the migrate step:
```
...
Running migration: 2_deploy_contracts.js
  Deploying MyCoralToken...
  ... 0x0a16ca93f58e7939b58c3eb3602eb0e6c5a019f472cb0fb6ae81393ffa338e80
  MyCoralToken: <ADDRESS HERE FOR TOKEN>
======== CONTRACT DEPLOYMENT =============
   Token address: 0xf703d5dc8523f73907d3479998a5e31720fe5a46
   Start time   : 1520996919
   End time     : 1520997069
   Wallet       : 0x96fc62dcd2ec9b6da5ffa89359b06917b577f2e2
   Rate         : 7500
Saving successful migration to network...
  Deploying MyCoralCrowdsale...
  ... 0x6a1b0619222b61112688520a4597cbf46ea88e513c0bbf24ef96395f46072a31
Saving artifacts...
  ... 0xdbbe42f065b4da20689726094ea9e98e68c6ae73f2f70b1d36019785fbe12e9e
  MyCoralCrowdsale: <ADDRESS HERE FOR CROWDSALE>
  ... 0x9ca76720b5a42ab118aa9f2251e73310bfc8cc07b440661d423dd6e0acbb730a

```

Load up a truffle console
```
truffle console
```		

Assign the contract locations to variables:
```
truffle(development)> sale = MyCoralCrowdsale.at("<TOKEN ADDRESS>")
truffle(development)> coin = MyCoralToken.at("<CROWDSALE ADDRESS>")
```

The default truffle console account that is active is the owner account, so you can go right into playing around with the contract:
```
truffle(development)> account = web3.eth.accounts[0]
truffle(development)> sale.addToWhitelist(account)
truffle(development)> sale.buyTokens(account, {value: web3.toWei(1,"ether")})
truffle(development)> sale.balances(account)
BigNumber { s: 1, e: 22, c: [ 150000000 ] }

< 3 minutes later..>

truffle(development)> sale.withdrawTokens()
truffle(development)> sale.balances(account)
BigNumber { s: 1, e: 0, c: [ 0 ] }
truffle(development)> coin.balanceOf(account)
BigNumber { s: 1, e: 22, c: [ 150000000 ] }
```
Note that since this is a timed crowdsale the withdraw step will fail if you try to call it before it has been three minutes.
Also, if an account isn't added as a whitelist then buyTokens will fail until the "startTime" is reached. 

### Deploying to a live test network ###
If you have geth already installed make sure to not accidentally deploy
this to the real network!

Install geth: https://github.com/ethereum/go-ethereum/wiki/Installing-Geth

Create a new testnet account:
```
geth --testnet account new
```

Use your wallet address to get some ether from the ropsten faucet at http://faucet.ropsten.be:3001/

Connect to the geth testnet:
```
geth --testnet --fast --rpc --rpcport 8547 --rpcapi eth,net,web3,personal
```

In a new window attach to geth:
```
geth attach http://127.0.0.1:8547
```

Unlock the account:
```
personal.unlockAccount(eth.accounts[0])
```

Lastly migrate the contracts:
```
truffle migrate --network ropsten
```

The account you unlocked will be the owner of the crowdsale!

Same steps can be used to deploy to the main network, just need to update truffle.js to include the connection info for it as well.