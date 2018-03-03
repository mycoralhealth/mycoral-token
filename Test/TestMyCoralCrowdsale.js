import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import EVMRevert from 'zeppelin-solidity/test/helpers/EVMRevert';
import ether from 'zeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MyCoralCrowdsale = artifacts.require('MyCoralCrowdsale');
const MyCoralToken = artifacts.require('MyCoralToken');

contract('MyCoralCrowdsale', function ([owner, investor, wallet, purchaser, presale, whitelist, unauthorized]) {
  const rate = new BigNumber(1);
  const value = ether(2);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.openingTime = latestTime() + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(1);
    this.beforeEndTime = this.closingTime - duration.hours(1);
    this.afterClosingTime = this.closingTime + duration.seconds(1);
    this.token = await MyCoralToken.new();
    this.crowdsale = await MyCoralCrowdsale.new(
      this.openingTime, this.closingTime, rate, wallet, this.token.address
    );
    await this.token.transferOwnership(this.crowdsale.address);
    await this.crowdsale.addToWhitelist(whitelist).should.be.fulfilled;

  });

  describe('Check presale', function () {
    it('should approve presale from owner, but not give tokens', async function () {
      await this.crowdsale.addBalanceToAddress(presale, ether(2))
      await this.crowdsale.withdrawTokens({from:presale}).should.be.rejectedWith(EVMRevert);
      let balance = await this.token.balanceOf(presale);
      balance.should.be.bignumber.equal(0);

    });
    
    it('should approve presale from owner, provide tokens at the end', async function () {
      await this.crowdsale.addBalanceToAddress(presale, ether(2))
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.withdrawTokens({from:presale});
      let balance = await this.token.balanceOf(presale);
      balance.should.be.bignumber.equal(value);
    });

    it('should reject presale from other', async function () {
      await this.crowdsale.addBalanceToAddress(presale, ether(2), {from:presale}).should.be.rejected;
      let prebalance = await this.crowdsale.balances(presale);
      prebalance.should.be.bignumber.equal(0);
    });

    it('should reject presale purchase after crowdsale', async function () {
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.addBalanceToAddress(presale, ether(2)).should.be.rejected;
      let prebalance = await this.crowdsale.balances(presale);
      prebalance.should.be.bignumber.equal(0);
    });
  });

  describe('Check whitelist', function () {
    it('should allow purchase before crowdsale begins, but not provide tokens', async function () {
      await this.crowdsale.buyTokens(whitelist, { value: value, from: purchaser}).should.be.fulfilled;
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(0);     
    });

    it('should not allow whitelist to withdraw tokens before the end', async function() {
      await this.crowdsale.buyTokens(whitelist, { value: value, from: purchaser});
      await increaseTimeTo(this.beforeEndTime);
      await this.crowdsale.withdrawTokens({ from: investor }).should.be.rejectedWith(EVMRevert); 
      let balance = await this.token.balanceOf(presale);
      balance.should.be.bignumber.equal(0);
    })

    it('should provide tokens to whitelist at the end', async function() {
      await this.crowdsale.buyTokens(whitelist, { value: value, from: purchaser});
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.withdrawTokens({from:whitelist});
      let balance = await this.token.balanceOf(whitelist);
      balance.should.be.bignumber.equal(value);
    })
  });

  describe('General sale', function () {
    it('should not immediately assign tokens to beneficiary', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(0);
    });

    it('should not allow beneficiaries to withdraw tokens before crowdsale ends', async function () {
      await increaseTimeTo(this.beforeEndTime);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      await this.crowdsale.withdrawTokens({ from: investor }).should.be.rejectedWith(EVMRevert);
    });

    it('should allow beneficiaries to withdraw tokens after crowdsale ends', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.withdrawTokens({ from: investor }).should.be.fulfilled;
    });

    it('should return the amount of tokens bought', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.withdrawTokens({ from: investor });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(value);
    });
  })
});
