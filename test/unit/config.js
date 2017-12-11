/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");

const config = require("../../src/config");

describe("Config - Unit", ()=> {

  afterEach(()=> config.setDisplayControlSettings(null));

  it("should not be enabled if no display control settings set", () => {
    assert(!config.getDisplayControlStrategy());
    assert(!config.isDisplayControlEnabled());
  });

  it("should set the display control strategy", () => {
    config.setDisplayControlSettings({interface: "CEC"});

    assert.equal(config.getDisplayControlStrategy(), "CEC");
    assert.deepEqual(config.getDisplayControlSettings(), {interface: "CEC"});
  });

  it("should set display control settings", () => {
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

  it("should set timeline", ()=>{
    config.setTimeline({content: {schedule: 1}});
    assert.equal(config.getTimeline(), 1);
  });

  it("should not set invalid timeline", ()=>{
    assert.equal(config.setTimeline({content: {}}), false);
    assert.equal(config.setTimeline({}), false);
    assert.equal(config.setTimeline(), false);
  });

  it("should indicate playability now since timedefined is false", ()=>{
    config.setTimeline({content: {schedule: {"items": [
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
    ]}}});
    assert(config.checkTimelineNow());
  });
});
