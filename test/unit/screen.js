/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");

const config = require("../../src/config");
const screen = require("../../src/screen");

const CECControlStrategy = require("../../src/strategies/cec");

describe("Screen - Unit", () =>
{

  before(()=> config.resetDisplayControlConfiguration());
  afterEach(()=> config.resetDisplayControlConfiguration());

  it("should create CECControlStrategy instance if CEC strategy is configured", done =>
  {
    config.setDisplayControlStrategy("CEC");

    screen.displayControlStrategy()
    .then(strategy =>
    {
      assert(strategy instanceof CECControlStrategy);

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

      done()
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
