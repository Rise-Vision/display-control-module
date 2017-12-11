/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const common = require("common-display-module");
const child = require("child_process");
const simple = require("simple-mock");

const config = require("../../src/config");
const parser = require("../../src/parser");
const screen = require("../../src/screen");

const cec = require("../../src/strategies/cec");
const CECControlStrategy = require("../../src/strategies/cec/strategy");

describe("Parser - Integration", () =>
{

  beforeEach(() =>
  {
    simple.mock(common, "connect").resolveWith({});
    simple.mock(common, "getDisplayId").resolveWith("ABC");
    simple.mock(common, "broadcastMessage").returnWith();

    // no error
    simple.mock(child, "exec").callFn((path, callback) => callback(false));

    simple.mock(cec, "init").resolveWith(new CECControlStrategy(
    {
      WriteRawMessage: () => Promise.resolve()
    }));
  });

  afterEach(()=>
  {
    simple.restore();
    config.setDisplayControlSettings(null);
    cec.clear();
  });

  it("should recognize CEC configuration, and issue commands according to it", done =>
  {
    const content = `
interface=cec
serial-port=
serial-baud-rate=
serial-data-bits=
serial-parity=
serial-stop-bits=
serial-flow-control=
serial-screen-on-cmd=
serial-screen-off-cmd=`;

    const settings = parser.parseContent(content);

    config.setDisplayControlSettings(settings);

    screen.turnOn()
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

      done();
    })
    .catch(error =>
    {
      assert.fail(error);

      done();
    });
  });

});