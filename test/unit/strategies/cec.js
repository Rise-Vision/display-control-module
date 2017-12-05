/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const fs = require("fs");
const simple = require("simple-mock");

const CECControlStrategy = require("../../../src/strategies/cec");

describe("CECControlStrategy - Unit", () =>
{
  const strategy = new CECControlStrategy();

  afterEach(()=> {
    simple.restore()
  });

  it("should check if cec-utils is available", done =>
  {
    // no error
    simple.mock(fs, "stat").callFn((path, callback) => callback(false));

    strategy.checkConfigured()
    .then(() => done())
    .catch(error =>
    {
      assert.fail(error);

      done()
    });
  });

});
