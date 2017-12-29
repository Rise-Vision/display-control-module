/* eslint-env mocha */
/* eslint-disable max-statements */
/* eslint-disable no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");
const config = require("../../src/config");
const screen = require("../../src/screen");
const interval = require("../../src/interval-schedule-check");

describe("Interval Schedule Check - Unit", ()=>{
  beforeEach(()=>{
    simple.mock(config, "isDisplayControlEnabled").returnWith(true);
    simple.mock(screen, "turnOn").resolveWith();
    simple.mock(screen, "turnOff").resolveWith();
  });

  afterEach(()=>{
    simple.restore();
  });

  it("should not send any command if display control is not enabled", ()=>{
    simple.mock(config, "isDisplayControlEnabled").returnWith(false);
    simple.mock(config, "checkTimelineNow").returnWith(true);

    return interval.runCheck()
    .then(() => assert(!screen.turnOn.called));
  });

  it("should turn the screen on if timeline is now valid for play", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(true);

    return interval.runCheck()
    .then(() => assert(screen.turnOn.called));
  });

  it("should turn the screen off if timeline is now invalid for play", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(false);

    return interval.runCheck()
    .then(() => assert(!screen.turnOn.called));
  });

  it("should suppress logging if previous turnOn is repeated", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(true);

    return interval.runCheck()
    .then(interval.runCheck)
    .then(() => {
      assert.equal(screen.turnOn.callCount, 2);
      assert(screen.turnOn.lastCall.args[0].suppressLog);
    })
  });

  it("should suppress logging if previous turnOff is repeated", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(false);

    return interval.runCheck()
    .then(interval.runCheck)
    .then(() => {
      assert.equal(screen.turnOff.callCount, 2);
      assert(screen.turnOff.lastCall.args[0].suppressLog);
    });
  });

  it("should not suppress logging if previous command is different", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(false);

    return interval.runCheck()
    .then(interval.runCheck)
    .then(() =>
    {
      assert.equal(screen.turnOff.callCount, 2);
      assert(screen.turnOff.lastCall.args[0].suppressLog);

      simple.mock(config, "checkTimelineNow").returnWith(true);
      return interval.runCheck();
    })
    .then(() =>
    {
      assert.equal(screen.turnOn.callCount, 1);
      assert(!screen.turnOn.lastCall.args[0].suppressLog);
    });
  });

  it("should switch correctly between turn on and turn off commands", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(false);

    return interval.runCheck()
    .then(interval.runCheck)
    .then(interval.runCheck)
    .then(() => {
      assert.equal(screen.turnOff.callCount, 3);
      assert(screen.turnOff.lastCall.args[0].suppressLog);

      simple.mock(config, "checkTimelineNow").returnWith(true);
      return interval.runCheck();
    })
    .then(interval.runCheck)
    .then(interval.runCheck)
    .then(() => {
      assert.equal(screen.turnOn.callCount, 3);
      assert(screen.turnOn.lastCall.args[0].suppressLog);

      simple.mock(config, "checkTimelineNow").returnWith(false);
      return interval.runCheck();
    })
    .then(interval.runCheck)
    .then(interval.runCheck)
    .then(() => {
      assert.equal(screen.turnOff.callCount, 6);
      assert(screen.turnOff.lastCall.args[0].suppressLog);

      simple.mock(config, "checkTimelineNow").returnWith(true);
      return interval.runCheck();
    })
    .then(interval.runCheck)
    .then(interval.runCheck)
    .then(() => {
      assert.equal(screen.turnOn.callCount, 6);
      assert(screen.turnOn.lastCall.args[0].suppressLog);
    });
  });
});
