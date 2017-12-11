/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const simple = require("simple-mock");

const config = require("../../src/config");
const screen = require("../../src/screen");

const cec = require("../../src/strategies/cec");
const CECControlStrategy = require("../../src/strategies/cec/strategy");

const logger = require("../../src/logger");

describe("Screen - Unit", () =>
{

  beforeEach(() =>
  {
    config.setDisplayControlSettings(null);
    simple.mock(logger, "logResult").resolveWith();

    simple.mock(cec, "init").resolveWith(new CECControlStrategy());
  });

  afterEach(()=>
  {
    simple.restore();
    config.setDisplayControlSettings(null);
    cec.clear();
  });

  it("should create CECControlStrategy instance if CEC strategy is configured", done =>
  {
    config.setDisplayControlSettings({interface: "CEC"});

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
    config.setDisplayControlSettings({interface: "OTHER"});

    screen.displayControlStrategy()
    .then(strategy =>
    {
      assert.fail(strategy);

      done();
    })
    .catch(error =>
    {
      assert.equal(error.message, "Illegal display control strategy: 'OTHER'");

      done()
    });
  });

  it("should log if suppressLog option was not passed to turnOn", ()=>{
    simple.mock(screen, "displayControlStrategy").resolveWith({turnOn() {}});

    return screen.turnOn()
    .then(()=>assert(logger.logResult.called));
  });

  it("should log if suppressLog option was not passed to turnOff", ()=>{
    simple.mock(screen, "displayControlStrategy").resolveWith({turnOff() {}});

    return screen.turnOff()
    .then(()=>assert(logger.logResult.called));
  });

  it("should not log if suppressLog option was passed to turnOn", ()=>{
    simple.mock(screen, "displayControlStrategy").resolveWith({turnOn() {}});

    return screen.turnOn({suppressLog: true})
    .then(()=>assert(!logger.logResult.called));
  });

  it("should not log if suppressLog option was passed to turnOff", ()=>{
    simple.mock(screen, "displayControlStrategy").resolveWith({turnOff() {}});

    return screen.turnOff({suppressLog: true})
    .then(()=>assert(!logger.logResult.called));
  });
});
