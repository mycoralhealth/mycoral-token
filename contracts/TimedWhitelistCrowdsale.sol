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

	modifier whitelistedOrStarted(address _beneficiary) {
		require((whitelist[_beneficiary]) || (now >= openingTime && now <= closingTime));
		_;
	}

	function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal 
		whitelistedOrStarted(_beneficiary) {
	}
}
