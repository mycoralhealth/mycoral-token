pragma solidity ^0.4.18;

import "./TimedWhitelistCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/PostDeliveryCrowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";

/**
* The specific MyCoralHealth crowdsale contract with the following properties:
* - There's a maximum number of tokens available in the crowdsale
* - Tokens are only distributed at the end of the crowdsale
* - The crowdsale is considered finished when the end time is reached, or all tokens have been sold
* - Whitelisted addresses are able to purchase tokens before the start of the crowdsale
* - Once the crowdsale starts all addresses are able to purchase tokens
* - Once the crowdsale finishes the beneficiaries will need to call withdrawTokens() to have
*   ownership transfered to them
*
**/
contract MyCoralCrowdsale is MintedCrowdsale, PostDeliveryCrowdsale, TimedWhitelistCrowdsale, CappedCrowdsale {

  /**
  *  Used to keep track of all the token beneficiaries
  *  during the crowdsale for future delivery.
  **/
  mapping (address => address) public beneficiaryLookup;

  function _addLookup(address _beneficiary) internal {
    beneficiaryLookup[_beneficiary] = beneficiaryLookup[0x0];
    beneficiaryLookup[0x0] = _beneficiary;
  }

  function _processPurchase(address _beneficiary, uint256 _tokenAmount) internal {
    _addLookup(_beneficiary);
    super._processPurchase(_beneficiary, _tokenAmount);
  }

  /**
  * Verifies that the closing time hasn't
  * been reached. 
  **/
	modifier onlyWhileNotClosed {
   	require(now <= closingTime);
  	_;
	}

  /**
  * Checks if the maximum crowdsale cap (CappedCrowdsale) has been reached
  * or the closing time (TimedWhitelistCrowdsale) has been reached.
  **/
  modifier cappedOrClosed() {
 		require(hasClosed() || capReached());
 		_;
 	}

  /**
  * Delivers the tokens assigned to the message sender
  * once the crowdsale has finished.
  **/
 	function withdrawTokens() public cappedOrClosed() {
   	uint256 amount = balances[msg.sender];
   	require(amount > 0);
   	balances[msg.sender] = 0;
   	_deliverTokens(msg.sender, amount);
 	}

  function getAddressesWithBalance() public onlyOwner {

  }

  /**
  * Assigns tokens to an address, tokens assigned in this way do 
  * not count towards the crowdsale token cap. Available only
  * to the owner of the contract, and while the crowdsale is still running.
  **/
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
