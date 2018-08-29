pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol"; 
import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";

/**
* A basic timed crowdsale. Addresses on a whitelist are able to purchase 
* tokens at any time once the contract is deployed up until the end time.
* Non-whitelisted addresses can only purchase tokens once the start time is 
* reached, up until the end time. 
**/
contract TimedWhitelistCrowdsale is WhitelistedCrowdsale, TimedCrowdsale {
	function TimedWhitelistCrowdsale(uint256 _startTime, uint256 _endTime) public
		TimedCrowdsale(_startTime, _endTime) {
	}

	function hasStarted() public view returns (bool) {
		return now >= openingTime;
	}

	/**
	* Used to check if an address is either whitelisted, or if the general
	* crowdsale time has been reached. Fails once the end time is 
	* reached.
	**/
	modifier whitelistedOrStarted(address _beneficiary) {
		require((whitelist[_beneficiary]) || (now >= openingTime));
		require(now <= closingTime);
		_;
	}

	/**
	* Called by the base buyToken method in Crowdsale.sol. Used to validate
	* the token purchase before the purchase is performed.
	**/
	function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal 
		whitelistedOrStarted(_beneficiary) {
		require(_beneficiary != address(0));
    	require(_weiAmount != 0);
	}
}
