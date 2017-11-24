/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const common = require("common-display-module");
const simple = require("simple-mock");

const config = require("../../src/config");

describe("Config - Unit", ()=>
{

  beforeEach(()=>
  {
    const settings = Promise.resolve({displayid: "DIS123"});

    simple.mock(common, "getDisplaySettings").returnWith(settings);
  });

  afterEach(()=> simple.restore());

  it("config should load the display id", done =>
  {
    config.loadDisplayId()
    .then(displayId =>
    {
      assert.equal(displayId, "DIS123");
      assert.equal(config.displayId(), "DIS123");

      done();
    })
    .catch(error =>
    {
      assert.fail(error);

      done();
    });
  });

});
