pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol"; 
import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";

contract TimedWhitelistCrowdsale is WhitelistedCrowdsale, TimedCrowdsale {
	function TimedWhitelistCrowdsale(uint256 _startTime, uint256 _endTime) public
		TimedCrowdsale(_startTime, _endTime) {
	}

	function hasStarted() public view returns (bool) {
		return now > openingTime;
	}

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

	modifier whitelistedOrStarted(address _beneficiary) {
		require(((whitelist[_beneficiary]) || (now >= openingTime)) && (now <= closingTime));
		_;
	}

	function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal 
		whitelistedOrStarted(_beneficiary) {
		require(_beneficiary != address(0));
    	require(_weiAmount != 0);
	}
}
