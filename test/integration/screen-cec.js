/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const common = require("common-display-module");
const child = require("child_process");
const simple = require("simple-mock");

const config = require("../../src/config");
const screen = require("../../src/screen");

const cec = require("../../src/strategies/cec");
const cecStrategy = require("../../src/strategies/cec/strategy");

describe("Screen CEC - Integration", () =>
{

  beforeEach(() =>
  {
    simple.mock(common, "connect").resolveWith({});
    simple.mock(common, "getDisplayId").resolveWith("ABC");
    simple.mock(common, "broadcastMessage").returnWith();

    config.setDisplayControlSettings({interface: "CEC"});
  });

  afterEach(()=>
  {
    simple.restore();
    config.setDisplayControlSettings(null);

    return cec.clear();
  });

  it("should turn on the screen using CEC commands", () =>
  {
    // no error
    simple.mock(child, "exec").callFn((path, callback) => callback(false));

    cecStrategy.init({
      WriteRawMessage: () => Promise.resolve()
    });

    simple.mock(cec, "init").resolveWith(cecStrategy);

    return screen.turnOn()
    .then(() =>
    {
      // should have resulted in a call to logging module
      assert(common.broadcastMessage.called);

      // this is the actual event object sent to the logging module
      const event = common.broadcastMessage.lastCall.args[0];

      // I sent the event
      assert.equal(event.from, "display-control");
      // it's a log event
      assert.equal(event.topic, "log");

      const data = event.data;
      assert.equal(data.projectName, "client-side-events");
      assert.equal(data.datasetName, "Module_Events");
      assert.equal(data.table, "display_control_events");
      assert.equal(data.failedEntryFile, "display-control-failed.log");

      // the BigQuery row entry, see design doc for individual element description
      const row = data.data;
      assert.equal(row.event, "turn-screen-on");
      assert.equal(row.event_details, "on 0");
      assert.equal(row.display_id, "ABC");
    });
  });

  it("should turn off the screen using CEC commands", () =>
  {
    // no error
    simple.mock(child, "exec").callFn((path, callback) => callback(false));

    cecStrategy.init({
      WriteRawMessage: () => Promise.resolve()
    });

    simple.mock(cec, "init").resolveWith(cecStrategy);

    return screen.turnOff()
    .then(() =>
    {
      // should have resulted in a call to logging module
      assert(common.broadcastMessage.called);

      // this is the actual event object sent to the logging module
      const event = common.broadcastMessage.lastCall.args[0];

      // I sent the event
      assert.equal(event.from, "display-control");
      // it's a log event
      assert.equal(event.topic, "log");

      const data = event.data
      assert.equal(data.projectName, "client-side-events");
      assert.equal(data.datasetName, "Module_Events");
      assert.equal(data.table, "display_control_events");
      assert.equal(data.failedEntryFile, "display-control-failed.log");

      // the BigQuery row entry, see design doc for individual element description
      const row = data.data;
      assert.equal(row.event, "turn-screen-off");
      assert.equal(row.event_details, "standby 0");
      assert.equal(row.display_id, "ABC");
    });
  });

  it("should log error if cec-utils are not installed", () =>
  {
    // cec-utils not found
    simple.mock(child, "exec").callFn((path, callback) => callback(true));

    simple.mock(cec, "init").callFn(cec.checkCecUtilsConfigured);

    // either turnOn() or turnOff() will fail
    return screen.turnOff()
    .then(() =>
    {
      // should have resulted in a call to logging module
      assert(common.broadcastMessage.called);

      // this is the actual event object sent to the logging module
      const event = common.broadcastMessage.lastCall.args[0];

      // I sent the event
      assert.equal(event.from, "display-control");
      // it's a log event
      assert.equal(event.topic, "log");

      const data = event.data
      assert.equal(data.projectName, "client-side-events");
      assert.equal(data.datasetName, "Module_Events");
      assert.equal(data.table, "display_control_events");
      assert.equal(data.failedEntryFile, "display-control-failed.log");

      // the BigQuery row entry, see design doc for individual element description
      const row = data.data;
      assert.equal(row.event, "error");
      assert(row.event_details.includes("cec-utils not installed in Operating System"));
      assert.equal(row.display_id, "ABC");
    });
  });

  it("should log error if command execution fails", () =>
  {
    // cec-utils found
    simple.mock(child, "exec").callFn((path, callback) => callback(false));

    cecStrategy.init({
      WriteRawMessage: () => Promise.reject(Error('display not available'))
    });

    simple.mock(cec, "init").resolveWith(cecStrategy);

    // either turnOn() or turnOff() will fail
    return screen.turnOff()
    .then(() =>
    {
      // should have resulted in 2 calls to logging module: attempt and failure
      assert(common.broadcastMessage.called);
      assert.equal(common.broadcastMessage.callCount, 2);

      {
        // event representing command attempt
        const event = common.broadcastMessage.calls[0].args[0];

        // I sent the event
        assert.equal(event.from, "display-control");
        // it's a log event
        assert.equal(event.topic, "log");

        const data = event.data
        assert.equal(data.projectName, "client-side-events");
        assert.equal(data.datasetName, "Module_Events");
        assert.equal(data.table, "display_control_events");
        assert.equal(data.failedEntryFile, "display-control-failed.log");

        // the BigQuery row entry, see design doc for individual element description
        const row = data.data;
        assert.equal(row.event, "turn-screen-off");
        assert.equal(row.event_details, "standby 0");
        assert.equal(row.display_id, "ABC");
      }

      {
        // event representing command failure
        const event = common.broadcastMessage.calls[1].args[0];

        // I sent the event
        assert.equal(event.from, "display-control");
        // it's a log event
        assert.equal(event.topic, "log");

        const data = event.data
        assert.equal(data.projectName, "client-side-events");
        assert.equal(data.datasetName, "Module_Events");
        assert.equal(data.table, "display_control_events");
        assert.equal(data.failedEntryFile, "display-control-failed.log");

        // the BigQuery row entry, see design doc for individual element description
        const row = data.data;
        assert.equal(row.event, "failed_command");
        assert.equal(row.event_details, "display not available");
        assert.equal(row.display_id, "ABC");
      }
    });
  });

});
