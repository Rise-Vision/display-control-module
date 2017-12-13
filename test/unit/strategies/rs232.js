/* eslint-env mocha */
/* eslint-disable max-statements, line-comment-position, no-inline-comments,  array-bracket-newline, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");
const SerialPort = require('serialport/test');
const MockBinding = SerialPort.Binding;

const config = require("../../../src/config");
const rs232 = require("../../../src/strategies/rs232");
const SerialPortFactory = require("../../../src/strategies/rs232/serial-port-factory");

describe("RS232ControlStrategy - Unit", () => {

  beforeEach(() => {
    simple.mock(SerialPortFactory, "create").callFn(path =>
      new SerialPort(path)
    )

    MockBinding.createPort("/dev/mock", {echo: false, record: true});

    config.setDisplayControlSettings({
      interface: "RS232",
      "serial-port": "/dev/mock",
      "serial-screen-on-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0d",
      "serial-screen-off-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d"
    });
  });

  afterEach(done=> {
    simple.restore();

    rs232.clear().then(() => {
      MockBinding.reset();

      done();
    });
  });

  it("should turn off the screen", done => {
    rs232.init()
    .then(provider =>
      provider.turnOff().then(result => {
        assert.equal(result.commandType, "turn-screen-off");
        assert.equal(result.command, "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d");
        assert(!result.commandErrorMessage);

        const sent = rs232.getStrategy().port.binding.recording.toString('hex');
        assert.equal(sent, "01304130413043024332303344363030303403760d");

        done();
      })
    )
    .catch(error => {
      assert.fail(error);

      done();
    });
  });

  it("should turn on the screen", done => {
    rs232.init()
    .then(provider =>
      provider.turnOn().then(result => {
        assert.equal(result.commandType, "turn-screen-on");
        assert.equal(result.command, "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0d");
        assert(!result.commandErrorMessage);

        const sent = rs232.getStrategy().port.binding.recording.toString('hex');
        assert.equal(sent, "01304130413043024332303344363030303103730d");

        done();
      })
    )
    .catch(error => {
      assert.fail(error);

      done();
    });
  });

  it("should return command error message if the command execution fails", done => {
    simple.mock(SerialPortFactory, "create").callFn(path => {
      const port = new SerialPort(path);

      port.write = (data, errorCallback) =>
        errorCallback({message: 'display not available'});

      return port;
    });

    rs232.init()
    .then(provider =>
      provider.turnOff().then(result =>
      {
        assert.equal(result.commandType, "turn-screen-off");
        assert.equal(result.command, "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d");
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
