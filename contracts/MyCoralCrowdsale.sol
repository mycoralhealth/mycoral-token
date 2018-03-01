pragma solidity ^0.4.18;

import "./TimedWhitelistCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/PostDeliveryCrowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract MyCoralCrowdsale is MintedCrowdsale, PostDeliveryCrowdsale, TimedWhitelistCrowdsale {

	modifier onlyWhileNotClosed {
    	require(now <= closingTime);
    	_;
  	}

	// Would be used to transfer tokens that were prepurchased - WIP
	function addBalanceToAddress(address _beneficiary, uint256 weiAmount) 
		public onlyOwner onlyWhileNotClosed {
	    uint256 tokens = _getTokenAmount(weiAmount);
		TokenPurchase(msg.sender, _beneficiary, weiAmount, tokens);
	    _processPurchase(_beneficiary, tokens);
	}


  function MyCoralCrowdsale(uint256 _startTime,
                           uint256 _endTime,
                           uint256 _rate,
                           address _wallet,
                           MintableToken _token) public 
                           Crowdsale(_rate, _wallet, _token)
                           TimedWhitelistCrowdsale(_startTime, _endTime)
  {}
}
