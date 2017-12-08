/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");

const config = require("../../src/config");

describe("Config - Unit", ()=>
{

  afterEach(()=> config.setDisplayControlSettings(null));

  it("should not be enabled if no display control settings set", () =>
  {
    assert(!config.getDisplayControlStrategy());
    assert(!config.isDisplayControlEnabled());
  });

  it("should set the display control strategy", () =>
  {
    config.setDisplayControlSettings({interface: "CEC"});

    assert.equal(config.getDisplayControlStrategy(), "CEC");
    assert.deepEqual(config.getDisplayControlSettings(), {interface: "CEC"});
  });

  it("should set display control settings", () =>
  {
    config.setDisplayControlSettings({
      interface: "RS232",
      "serial-port": "serial1",
      "serial-baud-rate": "6600",
      "serial-data-bits": "8"
    });

    assert.equal(config.getDisplayControlStrategy(), "RS232");
    assert.deepEqual(config.getDisplayControlSettings(), {
      interface: "RS232",
      "serial-port": "serial1",
      "serial-baud-rate": "6600",
      "serial-data-bits": "8"
    });
  });

});
