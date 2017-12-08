/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");

const config = require("../../src/config");

describe("Watch - Unit", ()=>
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

});
