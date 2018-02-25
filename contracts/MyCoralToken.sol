pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract MyCoralToken is MintableToken {
  string public constant name     = "Coral Health Token";
  string public constant symbol   = "CHT";
  uint8  public constant decimals = 18;
}
