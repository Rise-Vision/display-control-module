/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const fs = require("fs");
const simple = require("simple-mock");

const cec = require("../../../src/strategies/cec");

describe("CECControlStrategy - Unit", () =>
{
  afterEach(()=> {
    simple.restore();
    cec.clear();
  });

  it("should check if cec-utils is available", done =>
  {
    // no error
    simple.mock(fs, "stat").callFn((path, callback) => callback(false));

    cec.checkCecUtilsConfigured()
    .then(() => done())
    .catch(error =>
    {
      assert.fail(error);

      done();
    });
  });

  it("should fail if cec-utils is not available", done =>
  {
    // file not found
    simple.mock(fs, "stat").callFn((path, callback) => callback(true));

    cec.checkCecUtilsConfigured()
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

  it("should turn off the screen", done =>
  {
    // no error
    simple.mock(fs, "stat").callFn((path, callback) => callback(false));

    simple.mock(cec, "init").resolveWith(new cec.CECControlStrategy(
    {
      writeRawMessage: () => Promise.resolve()
    }));

    cec.init()
    .then(provider =>
      provider.turnOff().then(result =>
      {
        assert.equal(result.commandType, "turn-screen-off");
        assert.equal(result.command, "standby");
        assert(!result.commandErrorMessage);

        done();
      })
    )
    .catch(error =>
    {
      assert.fail(error);

      done();
    });
  });

  it("should return command error message if the command execution fails", done =>
  {
    // no error
    simple.mock(fs, "stat").callFn((path, callback) => callback(false));

    simple.mock(cec, "init").resolveWith(new cec.CECControlStrategy(
    {
      writeRawMessage: () => Promise.reject(Error('display not available'))
    }));

    cec.init()
    .then(provider =>
      provider.turnOff().then(result =>
      {
        assert.equal(result.commandType, "turn-screen-off");
        assert.equal(result.command, "standby");
        assert.equal(result.commandErrorMessage, 'display not available');

        done();
      })
    )
    .catch(error =>
    {
      assert.fail(error);

      done();
    });
  });

});
