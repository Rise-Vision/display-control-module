/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers, no-useless-escape, no-irregular-whitespace, no-tabs */
const assert = require("assert");
const simple = require("simple-mock");
const config = require("../../src/config");
const logger = require("../../src/logger");
const screen = require("../../src/screen");
const interval = require("../../src/interval-schedule-check");
const platform = require("rise-common-electron").platform;
const watch = require("../../src/watch");

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
    simple.mock(platform, "readTextFile").resolveWith(content);
    simple.mock(screen, "turnOff").returnWith();
    simple.mock(screen, "turnOn").returnWith();
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
  });

  it("should switch correctly between turn on and turn off commands", ()=>{

    config.setDisplayControlSettings({interface: "CEC"});

    return watch.receiveContentFile({status: "NEW"})
    .then(() => {
      const timeline = config.getTimeline();
      assert(timeline);
      assert(timeline.items);
      assert.equal(timeline.items.length, 2);

      // before first interval 14:00
      {
        const date = new Date(2017, 11, 27, 14, 0, 0);

        interval.runCheck(date);
        assert.equal(screen.turnOff.callCount, 1);
        assert(!screen.turnOff.lastCall.args[0].suppressLog);

        interval.runCheck(date);
        interval.runCheck(date);
        assert.equal(screen.turnOff.callCount, 3);
        assert(screen.turnOff.lastCall.args[0].suppressLog);
      }

      // in first interval 14:20
      {
        const date = new Date(2017, 11, 27, 14, 20, 0);

        interval.runCheck(date);
        assert.equal(screen.turnOn.callCount, 1);
        assert(!screen.turnOn.lastCall.args[0].suppressLog);

        interval.runCheck(date);
        interval.runCheck(date);
        assert.equal(screen.turnOn.callCount, 3);
        assert(screen.turnOn.lastCall.args[0].suppressLog);
      }

      // between intervals 14:35
      {
        const date = new Date(2017, 11, 27, 14, 35, 0);

        interval.runCheck(date);
        assert.equal(screen.turnOff.callCount, 4);
        assert(!screen.turnOff.lastCall.args[0].suppressLog);

        interval.runCheck(date);
        interval.runCheck(date);
        assert.equal(screen.turnOff.callCount, 6);
        assert(screen.turnOff.lastCall.args[0].suppressLog);
      }

      // in second interval 14:20
      {
        const date = new Date(2017, 11, 27, 14, 48, 0);

        interval.runCheck(date);
        assert.equal(screen.turnOn.callCount, 4);
        assert(!screen.turnOn.lastCall.args[0].suppressLog);

        interval.runCheck(date);
        interval.runCheck(date);
        assert.equal(screen.turnOn.callCount, 6);
        assert(screen.turnOn.lastCall.args[0].suppressLog);
      }

      // after second interval 15:35
      {
        const date = new Date(2017, 11, 27, 15, 35, 0);

        interval.runCheck(date);
        assert.equal(screen.turnOff.callCount, 7);
        assert(!screen.turnOff.lastCall.args[0].suppressLog);

        interval.runCheck(date);
        interval.runCheck(date);
        assert.equal(screen.turnOff.callCount, 9);
        assert(screen.turnOff.lastCall.args[0].suppressLog);
      }
    })
  });
});
