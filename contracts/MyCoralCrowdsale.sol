pragma solidity ^0.4.18;

import "./TimedWhitelistCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/PostDeliveryCrowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";

contract MyCoralCrowdsale is MintedCrowdsale, PostDeliveryCrowdsale, TimedWhitelistCrowdsale, CappedCrowdsale {

	modifier onlyWhileNotClosed {
    	require(now <= closingTime);
    	_;
  	}

  	modifier cappedOrClosed() {
  		require(hasClosed() || capReached());
  		_;
  	}

  	function withdrawTokens() public cappedOrClosed() {
    	uint256 amount = balances[msg.sender];
    	require(amount > 0);
    	balances[msg.sender] = 0;
    	_deliverTokens(msg.sender, amount);
  	}

	function addBalanceToAddress(address _beneficiary, uint256 tokenAmount) 
		public onlyOwner onlyWhileNotClosed {
	    _processPurchase(_beneficiary, tokenAmount);
	}


	function MyCoralCrowdsale(uint256 _startTime,
                           uint256 _endTime,
                           uint256 _rate,
                           address _wallet,
                           MintableToken _token,
                           uint256 _cap) public 
                           Crowdsale(_rate, _wallet, _token)
                           TimedWhitelistCrowdsale(_startTime, _endTime)
                           CappedCrowdsale(_cap)
  {}
}
