var MyCoralCrowdsale = artifacts.require("./MyCoralCrowdsale.sol");
var MyCoralToken = artifacts.require("./MyCoralToken.sol");
module.exports = function(deployer) {
  // These need to be set appropriately...
  const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 150;
  const endTime = startTime + 150; 
  const wallet = web3.eth.accounts[0];
  const rate = 7500;
  const cap = web3.toWei(50, "ether");
  deployer.deploy(MyCoralToken).then(function(){
    console.log("======== CONTRACT DEPLOYMENT =============");
    console.log("   Token address: " + MyCoralToken.address);
    console.log("   Start time   : " + startTime);
    console.log("   End time     : " + endTime);
    console.log("   Wallet       : " + wallet);
    console.log("   Rate         : " + rate);
    deployer.deploy(
      MyCoralCrowdsale, 
      startTime,
      endTime,
      rate,
      wallet,
      MyCoralToken.address,
      cap
    ).then(function(){
      coin = MyCoralToken.at(MyCoralToken.address);
      coin.transferOwnership(MyCoralCrowdsale.address);  
    });
  });

}
