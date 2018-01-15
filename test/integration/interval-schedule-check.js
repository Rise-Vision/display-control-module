/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers, no-useless-escape, no-irregular-whitespace, no-multi-spaces */
const assert = require("assert");
const child = require("child_process");
const common = require("common-display-module");
const simple = require("simple-mock");
const platform = require("rise-common-electron").platform;

const config = require("../../src/config");
const logger = require("../../src/logger");
const interval = require("../../src/interval-schedule-check");
const watch = require("../../src/watch");

const cec = require("../../src/strategies/cec");
const cecStrategy = require("../../src/strategies/cec/strategy");

const content = `
{
  "content": {
    "schedule": {
      "id": "dc2ff914-6b9c-4296-9941-cec92c2ceaec",
      "companyId": "176314ee-6b88-47ed-a354-10659722dc39",
      "name": "sometimes nest pi",
      "changeDate": "27122017200053754",
      "transition": "",
      "scale": "",
      "position": "",
      "distribution": ["7C4W7QQVSJEQ", "C93KGJC68GBN"],
      "distributeToAll": false,
      "timeDefined": false,
      "recurrenceType": "Daily",
      "recurrenceFrequency": 1,
      "recurrenceAbsolute": false,
      "recurrenceDayOfWeek": 0,
      "recurrenceDayOfMonth": 0,
      "recurrenceWeekOfMonth": 0,
      "recurrenceMonthOfYear": 0,
      "items": [{
        "name": "countries",
        "type": "presentation",
        "objectReference": "d0b27c18-5f0b-48e8-944d-63857b6e852c",
        "duration": 10,
        "timeDefined": true,
        "startDate": "12/27/2017 12:00:00 AM",
        "startTime": "12/27/2017 2:15:00 PM",
        "endTime": "12/27/2017 2:30:00 PM",
        "recurrenceType": "Daily",
        "recurrenceFrequency": 1,
        "recurrenceAbsolute": true,
        "recurrenceDaysOfWeek": [],
        "recurrenceDayOfWeek": 0,
        "recurrenceDayOfMonth": 1,
        "recurrenceWeekOfMonth": 0,
        "recurrenceMonthOfYear": 0
      }, {
        "name": "Copy of countries",
        "type": "presentation",
        "objectReference": "d0b27c18-5f0b-48e8-944d-63857b6e852c",
        "duration": 10,
        "timeDefined": true,
        "startDate": "12/27/2017 12:00:00 AM",
        "startTime": "12/27/2017 2:45:00 PM",
        "endTime": "12/27/2017 2:59:00 PM",
        "recurrenceType": "Daily",
        "recurrenceFrequency": 1,
        "recurrenceAbsolute": true,
        "recurrenceDaysOfWeek": [],
        "recurrenceDayOfWeek": 0,
        "recurrenceDayOfMonth": 1,
        "recurrenceWeekOfMonth": 0,
        "recurrenceMonthOfYear": 0
      }]
    },
    "presentations": [{
      "id": "d0b27c18-5f0b-48e8-944d-63857b6e852c",
      "companyId": "176314ee-6b88-47ed-a354-10659722dc39",
      "name": "countries",
      "changeDate": "22092017212306616",
      "publish": 0,
      "layout": "",
      "distribution": [],
      "isTemplate": false,
      "revisionStatus": 1
    }]
  },
  "display": {
    "displayAddress": {
      "street": "",
      "unit": "",
      "city": "",
      "province": "",
      "country": "",
      "postalCode": ""
    },
    "authKey": "uJjhqfNhx7K6",
    "restartEnabled": true,
    "restartTime": "02:00",
    "orientation": 0
  },
  "social": [],
  "signature": "23a5522c67a2c7fba6d42ee9a322bf042cb1acd5"
}
`

describe("Interval Schedule Check - Integration", ()=>{
  beforeEach(()=>{
    simple.mock(common, "broadcastMessage").returnWith();
    simple.mock(platform, "readTextFile").resolveWith(content);

    // no error, so cec-utils check passes
    simple.mock(child, "exec").callFn((path, callback) => callback(false));

    // simple.mock(logger, "file").callFn(console.log);
    simple.mock(logger, "error").callFn((stack, error) => {
      console.error(error);
      console.error(JSON.stringify(stack));
    });
  });

  afterEach(()=>{
    simple.restore();
    config.setDisplayControlSettings(null);
    config.setTimeline(null);

    return cec.clear();
  });

  it("should switch correctly between turn on and turn off commands", ()=>{

    const dateBeforeFirstInterval = new Date(2017, 11, 27, 14,  0, 0);
    const dateInFirstInterval     = new Date(2017, 11, 27, 14, 20, 0);
    const dateBetweenIntervals    = new Date(2017, 11, 27, 14, 35, 0);
    const dateInSecondInterval    = new Date(2017, 11, 27, 14, 48, 0);
    const dateAfterSecondInterval = new Date(2017, 11, 27, 15, 35, 0);

    let offCount = 0;
    let onCount = 0;

    // Intercept CEC write operations.
    cecStrategy.init({
      WriteRawMessage: message => {
        switch (message) {
          case "standby 0": offCount += 1; break;
          case "on 0": onCount += 1; break;
          default: throw new Error("unreachable");
        }

        return Promise.resolve()
      }
    });
    simple.mock(cec, "init").resolveWith(cecStrategy);

    config.setDisplayControlSettings({interface: "CEC"});

    return watch.receiveContentFile({status: "CURRENT"})
    .then(() => {
      const timeline = config.getTimeline();
      assert(timeline);
      assert(timeline.items);
      assert.equal(timeline.items.length, 2);

      return interval.runCheck(dateBeforeFirstInterval);
    })
    .then(() => {
      assert.equal(offCount, 1);
      assert.equal(onCount, 0);
      // command log called
      assert.equal(common.broadcastMessage.callCount, 1);

      return interval.runCheck(dateBeforeFirstInterval);
    })
    .then(() => interval.runCheck(dateBeforeFirstInterval))
    .then(() => {
      assert.equal(offCount, 3);
      assert.equal(onCount, 0);
      // command log was not called again
      assert.equal(common.broadcastMessage.callCount, 1);

      return interval.runCheck(dateInFirstInterval);
    })
    .then(() => {
      assert.equal(offCount, 3);
      assert.equal(onCount, 1);
      // command log called
      assert.equal(common.broadcastMessage.callCount, 2);

      return interval.runCheck(dateInFirstInterval);
    })
    .then(() => interval.runCheck(dateInFirstInterval))
    .then(() => {
      assert.equal(offCount, 3);
      assert.equal(onCount, 3);
      // command log was not called again
      assert.equal(common.broadcastMessage.callCount, 2);

      return interval.runCheck(dateBetweenIntervals);
    })
    .then(() => {
      assert.equal(offCount, 4);
      assert.equal(onCount, 3);
      // command log called
      assert.equal(common.broadcastMessage.callCount, 3);

      return interval.runCheck(dateBetweenIntervals);
    })
    .then(() => interval.runCheck(dateBetweenIntervals))
    .then(() => {
      assert.equal(offCount, 6);
      assert.equal(onCount, 3);
      // command log was not called again
      assert.equal(common.broadcastMessage.callCount, 3);

      return interval.runCheck(dateInSecondInterval);
    })
    .then(() => {
      assert.equal(offCount, 6);
      assert.equal(onCount, 4);
      // command log called
      assert.equal(common.broadcastMessage.callCount, 4);

      return interval.runCheck(dateInSecondInterval);
    })
    .then(() => interval.runCheck(dateInSecondInterval))
    .then(() => {
      assert.equal(offCount, 6);
      assert.equal(onCount, 6);
      // command log was not called again
      assert.equal(common.broadcastMessage.callCount, 4);

      return interval.runCheck(dateAfterSecondInterval);
    })
    .then(() => {
      assert.equal(offCount, 7);
      assert.equal(onCount, 6);
      // command log called
      assert.equal(common.broadcastMessage.callCount, 5);

      return interval.runCheck(dateAfterSecondInterval);
    })
    .then(() => interval.runCheck(dateAfterSecondInterval))
    .then(() => {
      assert.equal(offCount, 9);
      assert.equal(onCount, 6);
      // command log was not called again
      assert.equal(common.broadcastMessage.callCount, 5);
    });
  });
});
