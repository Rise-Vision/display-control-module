/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const common = require("common-display-module");
const messaging = require("common-display-module/messaging");
const simple = require("simple-mock");
const SerialPort = require('serialport/test');
const MockBinding = SerialPort.Binding;

const config = require("../../src/config");
const screen = require("../../src/screen");

const rs232 = require("../../src/strategies/rs232");

describe("Screen RS232 - Integration", () => {

  beforeEach(() => {
    simple.mock(common, "getDisplayId").resolveWith("ABC");
    simple.mock(messaging, "connect").resolveWith({});
    simple.mock(messaging, "broadcastMessage").returnWith();

    MockBinding.createPort("/dev/mock", {echo: false, record: true});

    config.setDisplayControlSettings({
      interface: "RS232",
      "serial-port": "/dev/mock",
      "serial-screen-on-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0d",
      "serial-screen-off-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d"
    });
  });

  afterEach(done=>
  {
    simple.restore();
    config.setDisplayControlSettings(null);

    rs232.clear().then(() => {
      MockBinding.reset();

      done();
    });
  });

  it("should turn on the screen using RS232 commands", done =>
  {
    screen.turnOn({serialPort: new SerialPort("/dev/mock")})
    .then(() =>
    {
      // should have resulted in a call to logging module
      assert(messaging.broadcastMessage.called);

      // this is the actual event object sent to the logging module
      const event = messaging.broadcastMessage.lastCall.args[0];

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
      assert.equal(row.event_details, "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0d");
      assert.equal(row.display_id, "ABC");

      done();
    })
    .catch(error =>
    {
      assert.fail(error);

      done();
    });
  });

  it("should turn off the screen using RS-232 commands", done =>
  {
    screen.turnOff({serialPort: new SerialPort("/dev/mock")})
    .then(() =>
    {
      // should have resulted in a call to logging module
      assert(messaging.broadcastMessage.called);

      // this is the actual event object sent to the logging module
      const event = messaging.broadcastMessage.lastCall.args[0];

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
      assert.equal(row.event_details, "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d");
      assert.equal(row.display_id, "ABC");

      done();
    })
    .catch(error =>
    {
      assert.fail(error);

      done();
    });
  });

  it("should log error if command execution fails", (done) => {
    const serialPort = new SerialPort("/dev/mock");

    serialPort.write = (data, errorCallback) =>
      errorCallback({message: 'display not available'});

    // either turnOn() or turnOff() will fail
    screen.turnOff({serialPort})
    .then(() =>
    {
      // should have resulted in 2 calls to logging module: attempt and failure
      assert(messaging.broadcastMessage.called);
      assert.equal(messaging.broadcastMessage.callCount, 2);

      {
        // event representing command attempt
        const event = messaging.broadcastMessage.calls[0].args[0];

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
        assert.equal(row.event_details, "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d");
        assert.equal(row.display_id, "ABC");
      }

      {
        // event representing command failure
        const event = messaging.broadcastMessage.calls[1].args[0];

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

      done();
    })
    .catch(error =>
    {
      assert.fail(error);

      done();
    });
  });

  it("should clear the strategy", done =>
  {
    // any command to initialize the port
    screen.turnOn({serialPort: new SerialPort("/dev/mock")})
    .then(() =>
    {
      const strategy = rs232.getStrategy();
      assert(strategy);

      return screen.clearCurrentStrategy();
    })
    .then(() =>
    {
      const strategy = rs232.getStrategy();

      // should've been deleted
      assert(!strategy);

      done();
    })
    .catch(error =>
    {
      assert.fail(error);

      done();
    });
  });

});
