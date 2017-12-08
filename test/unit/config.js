/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");

const config = require("../../src/config");

describe("Watch - Unit", ()=>
{

  afterEach(()=> config.setDisplayControlSettings(null));

  it("should set the display control strategy", () =>
  {
    assert(!config.getDisplayControlStrategy());

    config.setDisplayControlSettings({interface: "CEC"});

    assert.equal(config.getDisplayControlStrategy(), "CEC");
  });

});
