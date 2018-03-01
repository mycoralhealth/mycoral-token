import ether from 'zeppelin-solidity/test/helpers/ether';
import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


const TimedWhitelistCrowdsale = artifacts.require('TimedWhitelistCrowdsaleImpl');
const MyCoralToken = artifacts.require('MyCoralToken');

contract('TimedWhitelistCrowdsale', function ([owner, wallet, authorized, unauthorized, anotherAuthorized]) {
  const rate = new BigNumber(1500);
  const value = ether(2);
  const expectedValue = rate.mul(value);
  describe('single user whitelisting', function () {
    before(async function () {
      // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
      await advanceBlock();  
    });
    beforeEach(async function () {
      this.openingTime = latestTime() + duration.weeks(1);
      this.closingTime = this.openingTime + duration.weeks(1);
      this.afterClosingTime = this.closingTime + duration.seconds(1);
      this.token = await MyCoralToken.new();
      this.crowdsale = await TimedWhitelistCrowdsale.new(this.openingTime, this.closingTime, rate, wallet, this.token.address);
      await this.token.transferOwnership(this.crowdsale.address)
      await this.crowdsale.addToWhitelist(authorized).should.be.fulfilled;
    });

    describe('check if started', function () {
      it('should not have started yet', async function () {
        let started = await this.crowdsale.hasStarted();
        started.should.equal(false);
        let ended = await this.crowdsale.hasClosed();
        ended.should.equal(false);
      });
    });

    describe('accepting payments whitelist only', function () {
      it('should accept payments to whitelisted (from whichever buyers)', async function () {
        await this.crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.fulfilled;
        let balance = await this.token.balanceOf(authorized);
        balance.should.be.bignumber.equal(expectedValue);
        await this.crowdsale.buyTokens(authorized, { value: value, from: unauthorized }).should.be.fulfilled;
        balance = await this.token.balanceOf(authorized);
        balance.should.be.bignumber.equal(expectedValue.mul(2));
      });

      it('should reject payments to not whitelisted (from whichever buyers)', async function () {
        await this.crowdsale.send(value).should.be.rejected;
        await this.crowdsale.buyTokens(unauthorized, { value: value, from: unauthorized }).should.be.rejected;
        await this.crowdsale.buyTokens(unauthorized, { value: value, from: authorized }).should.be.rejected;
      });

      it('should reject payments to addresses removed from whitelist', async function () {
        await this.crowdsale.removeFromWhitelist(authorized);
        await this.crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.rejected;
      });
    });

    describe('reporting whitelisted', function () {
      it('should correctly report whitelisted addresses', async function () {
        let isAuthorized = await this.crowdsale.whitelist(authorized);
        isAuthorized.should.equal(true);
        await increaseTimeTo(this.openingTime);
        let isntAuthorized = await this.crowdsale.whitelist(unauthorized);
        isntAuthorized.should.equal(false);
      });
    });

    describe('accepting payments from all, crowdsale started', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.openingTime + duration.seconds(1));
      })
      it('should be started', async function () {
        let started = await this.crowdsale.hasStarted();
        started.should.equal(true);
      });

      it('should accept payments to whitelisted (from whichever buyers)', async function () {
        await this.crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.fulfilled;
        await this.crowdsale.buyTokens(authorized, { value: value, from: unauthorized }).should.be.fulfilled;
      });

      it('should accept payments to not whitelisted (from whichever buyers)', async function () {
        await this.crowdsale.send(value).should.be.fulfilled;
        let balance = await this.token.balanceOf(owner);
        balance.should.be.bignumber.equal(expectedValue);
        await this.crowdsale.buyTokens(unauthorized, { value: value, from: unauthorized }).should.be.fulfilled;
        balance = await this.token.balanceOf(unauthorized);
        balance.should.be.bignumber.equal(expectedValue);
        await this.crowdsale.buyTokens(unauthorized, { value: value, from: authorized }).should.be.fulfilled;
        balance = await this.token.balanceOf(unauthorized);
        balance.should.be.bignumber.equal(expectedValue.mul(2));
      });

      it('should accept payments to addresses removed from whitelist', async function () {
        await this.crowdsale.removeFromWhitelist(authorized);
        await this.crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.fulfilled;
      });
    });

    describe('update time and check closed', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.afterClosingTime);
      })
      it('should be closed', async function () {
        let ended = await this.crowdsale.hasClosed();
        ended.should.equal(true);
      });
      it('should reject payments to whitelisted (from whichever buyers)', async function () {
        await this.crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.rejected;
        await this.crowdsale.buyTokens(authorized, { value: value, from: unauthorized }).should.be.rejected;
      });

      it('should reject payments to not whitelisted (from whichever buyers)', async function () {
        await this.crowdsale.send(value).should.be.rejected;
        await this.crowdsale.buyTokens(unauthorized, { value: value, from: unauthorized }).should.be.rejected;
        await this.crowdsale.buyTokens(unauthorized, { value: value, from: authorized }).should.be.rejected;
      });

      it('should reject payments to addresses removed from whitelist', async function () {
        await this.crowdsale.removeFromWhitelist(authorized);
        await this.crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.rejected;
      });
    });
  });
});
