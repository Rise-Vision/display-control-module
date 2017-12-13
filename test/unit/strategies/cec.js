/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const child = require("child_process");
const simple = require("simple-mock");

const cec = require("../../../src/strategies/cec");
const CECControlStrategy = require("../../../src/strategies/cec/strategy");

describe("CECControlStrategy - Unit", () =>
{
  afterEach(done => {
    simple.restore();

    cec.clear().then(() => done());
  });

  it("should check if cec-utils is available", done =>
  {
    // no error
    simple.mock(child, "exec").callFn((path, callback) => callback(false));

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
    simple.mock(child, "exec").callFn((path, callback) => callback(true));

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
    simple.mock(child, "exec").callFn((path, callback) => callback(false));

    simple.mock(cec, "init").resolveWith(new CECControlStrategy(
    {
      WriteRawMessage: () => Promise.resolve()
    }));

    cec.init()
    .then(provider =>
      provider.turnOff().then(result =>
      {
        assert.equal(result.commandType, "turn-screen-off");
        assert.equal(result.command, "standby 0");
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

  it("should turn on the screen", done =>
  {
    // no error
    simple.mock(child, "exec").callFn((path, callback) => callback(false));

    simple.mock(cec, "init").resolveWith(new CECControlStrategy(
    {
      WriteRawMessage: () => Promise.resolve()
    }));

    cec.init()
    .then(provider =>
      provider.turnOn().then(result =>
      {
        assert.equal(result.commandType, "turn-screen-on");
        assert.equal(result.command, "on 0");
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
    simple.mock(child, "exec").callFn((path, callback) => callback(false));

    simple.mock(cec, "init").resolveWith(new CECControlStrategy(
    {
      WriteRawMessage: () => Promise.reject(Error('display not available'))
    }));

    cec.init()
    .then(provider =>
      provider.turnOff().then(result =>
      {
        assert.equal(result.commandType, "turn-screen-off");
        assert.equal(result.command, "standby 0");
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
