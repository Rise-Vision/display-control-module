/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const common = require("common-display-module");
const fs = require("fs");
const simple = require("simple-mock");

const config = require("../../src/config");
const screen = require("../../src/screen");

const cec = require("../../src/strategies/cec");

describe("Screen - Integration", () =>
{

  beforeEach(() =>
  {
    simple.mock(common, "connect").resolveWith({})
    simple.mock(common, "getDisplayId").resolveWith("ABC")
    simple.mock(common, "broadcastMessage").returnWith()

    config.resetDisplayControlConfiguration();
  });

  afterEach(()=>
  {
    simple.restore();
    config.resetDisplayControlConfiguration();
    cec.clear();
  });

  it("should turn on the screen using CEC commands", done =>
  {
    config.setDisplayControlStrategy("CEC");

    // no error
    simple.mock(fs, "stat").callFn((path, callback) => callback(false));

    simple.mock(cec, "init").resolveWith(new cec.CECControlStrategy(
    {
      writeRawMessage: () => Promise.resolve()
    }));

    screen.turnOn()
    .then(() =>
    {
      // should have resulted in a call to logging module
      assert(common.broadcastMessage.called)

      // this is the actual event object sent to the logging module
      const event = common.broadcastMessage.lastCall.args[0]

      // I sent the event
      assert.equal(event.from, "display-control")
      // it's a log event
      assert.equal(event.topic, "log")

      const data = event.data
      assert.equal(data.projectName, "client-side-events")
      assert.equal(data.datasetName, "Module_Events")
      assert.equal(data.table, "display_control_events")
      assert.equal(data.failedEntryFile, "display-control-failed.log")

      // the BigQuery row entry, see design doc for individual element description
      const row = data.data
      assert.equal(row.event, "turn-on-command")
      assert.equal(row.event_details, "on")
      assert.equal(row.display_id, "ABC")
      // ts will be inserted in logging module, so we won't be checking it here

      done();
    })
    .catch(error =>
    {
      assert.fail(error);

      done()
    });
  });

});
