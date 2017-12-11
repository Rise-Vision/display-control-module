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
    simple.mock(screen, "turnOn").returnWith();
    simple.mock(screen, "turnOff").returnWith();
  });

  afterEach(()=>{
    simple.restore();
  });

  it("should turn the screen on if timeline is now valid for play", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(true);
    interval.runCheck();
    assert(screen.turnOn.called);
  });

  it("should turn the screen off if timeline is now invalid for play", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(false);
    interval.runCheck();
    assert(!screen.turnOn.called);
  });

  it("should suppress logging if previous turnOn is repeated", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(true);
    interval.runCheck();
    interval.runCheck();
    assert.equal(screen.turnOn.callCount, 2);
    assert(screen.turnOn.lastCall.args[0].suppressLog);
  });

  it("should suppress logging if previous turnOff is repeated", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(false);
    interval.runCheck();
    interval.runCheck();
    assert.equal(screen.turnOff.callCount, 2);
    assert(screen.turnOff.lastCall.args[0].suppressLog);
  });

  it("should not suppress logging if previous command is different", ()=>{
    simple.mock(config, "checkTimelineNow").returnWith(false);
    interval.runCheck();
    interval.runCheck();
    assert.equal(screen.turnOff.callCount, 2);
    assert(screen.turnOff.lastCall.args[0].suppressLog);

    simple.mock(config, "checkTimelineNow").returnWith(true);
    interval.runCheck();
    assert.equal(screen.turnOn.callCount, 1);
    assert(!screen.turnOn.lastCall.args[0].suppressLog);
  });
});
