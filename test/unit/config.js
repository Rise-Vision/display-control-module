/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");

const config = require("../../src/config");

describe("Config - Unit", ()=> {

  afterEach(()=> config.clear());

  it("should not be enabled if no display control settings set", () => {
    assert(!config.getDisplayControlStrategy());
    assert(!config.isDisplayControlEnabled());
  });

  it("should set the display control strategy", () => {
    config.setDisplayControlSettings({interface: "CEC"});

    assert.equal(config.getDisplayControlStrategy(), "CEC");
    assert.deepEqual(config.getDisplayControlSettings(), {interface: "CEC"});
  });

  it("should set display control settings for RS-232", () => {
    config.setDisplayControlSettings({
      interface: "RS232",
      "serial-port": "serial1",
      "serial-baud-rate": "6600",
      "serial-data-bits": "8",
      "serial-screen-on-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0d",
      "serial-screen-off-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d"
    });

    assert.equal(config.getDisplayControlStrategy(), "RS232");
    assert.deepEqual(config.getDisplayControlSettings(), {
      interface: "RS232",
      "serial-port": "serial1",
      "serial-baud-rate": "6600",
      "serial-data-bits": "8",
      "serial-screen-on-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0d",
      "serial-screen-off-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d",
      "serial-screen-on":
        ["01", "30", "41", "30", "41", "30", "43", "02", "43", "32", "30", "33", "44", "36", "30", "30", "30", "31", "03", "73", "0d"],
      "serial-screen-off":
        ["01", "30", "41", "30", "41", "30", "43", "02", "43", "32", "30", "33", "44", "36", "30", "30", "30", "34", "03", "76", "0d"]
    });
  });

  it("should accept RS-232 commands without spaces", () => {
    config.setDisplayControlSettings({
      interface: "RS232",
      "serial-port": "serial1",
      "serial-baud-rate": "6600",
      "serial-data-bits": "8",
      "serial-screen-on-cmd": "01304130413043024332303344363030303103730d",
      "serial-screen-off-cmd": "01304130413043024332303344363030303403760d"
    });

    assert.equal(config.getDisplayControlStrategy(), "RS232");
    assert.deepEqual(config.getDisplayControlSettings(), {
      interface: "RS232",
      "serial-port": "serial1",
      "serial-baud-rate": "6600",
      "serial-data-bits": "8",
      "serial-screen-on-cmd": "01304130413043024332303344363030303103730d",
      "serial-screen-off-cmd": "01304130413043024332303344363030303403760d",
      "serial-screen-on":
        ["01", "30", "41", "30", "41", "30", "43", "02", "43", "32", "30", "33", "44", "36", "30", "30", "30", "31", "03", "73", "0d"],
      "serial-screen-off":
        ["01", "30", "41", "30", "41", "30", "43", "02", "43", "32", "30", "33", "44", "36", "30", "30", "30", "34", "03", "76", "0d"]
    });
  });

  it("should fail in RS232 if serial port is not provided", () => {
    try {
      config.setDisplayControlSettings({
        interface: "RS232",
        "serial-baud-rate": "6600",
        "serial-data-bits": "8",
        "serial-screen-on-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0d",
        "serial-screen-off-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d"
      });

      assert.fail();
    }
    catch (error) {
      assert.equal(error.message, 'RS-232 serial port not provided.');
    }
  });

  it("should fail in RS232 if ON command is not provided", () => {
    try {
      config.setDisplayControlSettings({
        interface: "RS232",
        "serial-port": "serial1",
        "serial-baud-rate": "6600",
        "serial-data-bits": "8",
        "serial-screen-off-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d"
      });

      assert.fail();
    }
    catch (error) {
      assert.equal(error.message, 'RS-232 ON/OFF commands not provided.');
    }
  });

  it("should fail in RS232 if OFF command is not provided", () => {
    try {
      config.setDisplayControlSettings({
        interface: "RS232",
        "serial-port": "serial1",
        "serial-baud-rate": "6600",
        "serial-data-bits": "8",
        "serial-screen-on-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0d"
      });

      assert.fail();
    }
    catch (error) {
      assert.equal(error.message, 'RS-232 ON/OFF commands not provided.');
    }
  });

  it("should fail in RS232 if ON/OFF command is not even", () => {
    try {
      config.setDisplayControlSettings({
        interface: "RS232",
        "serial-port": "serial1",
        "serial-baud-rate": "6600",
        "serial-data-bits": "8",
        "serial-screen-on-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0",
        "serial-screen-off-cmd": "01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 34 03 76 0d"
      });

      assert.fail();
    }
    catch (error) {
      assert.equal(error.message, "Invalid RS-232 command: '01 30 41 30 41 30 43 02 43 32 30 33 44 36 30 30 30 31 03 73 0'");
    }
  });

  it("should set timeline", ()=>{
    config.setTimeline({timeDefined: 1});
    assert.deepEqual(config.getTimeline(), {timeDefined: 1});
  });

  it("should indicate playability now since timedefined is false", ()=>{
    config.setTimeline({"items": [
      {
        "name": "Caridad Main",
        "type": "presentation",
        "objectReference": "2a195ef9-7969-4dfd-94d3-dc4b19d199f6",
        "duration": 10,
        "distributeToAll": true,
        "timeDefined": false,
        "recurrenceType": "Daily",
        "recurrenceFrequency": 1,
        "recurrenceAbsolute": true,
        "recurrenceDayOfWeek": 0,
        "recurrenceDayOfMonth": 1,
        "recurrenceWeekOfMonth": 0,
        "recurrenceMonthOfYear": 0
      }
    ]});
    assert(config.checkTimelineNow());
  });
});
