/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");

const config = require("../../src/config");
const screen = require("../../src/screen");

const CECControlStrategy = require("../../src/strategies/cec");

describe("Screen - Unit", ()=>
{

  afterEach(()=> config.resetDisplayControlConfiguration);

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
      assert.fail(error)

      done()
    });
  });

});
