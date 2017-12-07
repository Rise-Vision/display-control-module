/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const simple = require("simple-mock");

const config = require("../../src/config");
const screen = require("../../src/screen");

const cec = require("../../src/strategies/cec");
const CECControlStrategy = require("../../src/strategies/cec/strategy");

describe("Screen - Unit", () =>
{

  beforeEach(() =>
  {
    config.setDisplayControlStrategy(null);

    simple.mock(cec, "init").resolveWith(new CECControlStrategy());
  });

  afterEach(()=>
  {
    simple.restore();
    config.setDisplayControlStrategy(null);
    cec.clear();
  });

  it("should create CECControlStrategy instance if CEC strategy is configured", done =>
  {
    config.setDisplayControlStrategy("CEC");

    screen.displayControlStrategy()
    .then(strategy =>
    {
      assert(strategy instanceof CECControlStrategy);
      assert(strategy.turnOff);
      assert(strategy.turnOn);

      done();
    })
    .catch(error =>
    {
      assert.fail(error);

      done()
    });
  });

  it("should fail if no strategy is configured", done =>
  {
    screen.displayControlStrategy()
    .then(strategy =>
    {
      assert.fail(strategy);

      done();
    })
    .catch(error =>
    {
      assert.equal(error.message, "Display control not enabled");

      done();
    });
  });

  it("should fail if an invalid strategy is configured", done =>
  {
    config.setDisplayControlStrategy("other");

    screen.displayControlStrategy()
    .then(strategy =>
    {
      assert.fail(strategy);

      done();
    })
    .catch(error =>
    {
      assert.equal(error.message, "Illegal display control strategy: 'other'");

      done()
    });
  });

});
