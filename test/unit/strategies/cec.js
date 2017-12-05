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

  it("should fail if cec-utils is not available", done =>
  {
    // file not found
    simple.mock(fs, "stat").callFn((path, callback) => callback(true));

    strategy.checkConfigured()
    .then(() =>
    {
      assert.fail();

      done();
    })
    .catch(error =>
    {
      assert.equal(error.message, "cec-utils not installed in Operating System");

      done();
    });
  });

});
