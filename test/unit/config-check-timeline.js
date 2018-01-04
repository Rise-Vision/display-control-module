/* eslint-env mocha */
/* eslint-disable max-statements, key-spacing, comma-spacing, no-magic-numbers */
const assert = require("assert");

const config = require("../../src/config");

const full = {
  "content": {
     "schedule": {
         "id":"dc2ff914-6b9c-4296-9941-cec92c2ceaec",
         "companyId":"176314ee-6b88-47ed-a354-10659722dc39",
         "name":"sometimes nest pi",
         "changeDate":"27122017200053754",
         "transition":"",
         "scale":"",
         "position":"",
         "distribution": ["7C4W7QQVSJEQ", "C93KGJC68GBN"],
         "distributeToAll":false,
         "timeDefined":false,
         "recurrenceType":"Daily",
         "recurrenceFrequency":1,
         "recurrenceAbsolute":false,
         "recurrenceDayOfWeek":0,
         "recurrenceDayOfMonth":0,
         "recurrenceWeekOfMonth":0,
         "recurrenceMonthOfYear":0,
         "items": [
           {
             "name":"countries",
             "type":"presentation",
             "objectReference":"d0b27c18-5f0b-48e8-944d-63857b6e852c",
             "duration":10,
             "timeDefined":true,
             "startDate":"12/27/2017 12:00:00 AM",
             "startTime":"12/27/2017 2:15:00 PM",
             "endTime":"12/27/2017 2:30:00 PM",
             "recurrenceType":"Daily",
             "recurrenceFrequency":1,
             "recurrenceAbsolute":true,
             "recurrenceDaysOfWeek":[],
             "recurrenceDayOfWeek":0,
             "recurrenceDayOfMonth":1,
             "recurrenceWeekOfMonth":0,
             "recurrenceMonthOfYear":0
           },
           {
             "name":"Copy of countries",
             "type":"presentation",
             "objectReference":"d0b27c18-5f0b-48e8-944d-63857b6e852c",
             "duration":10,
             "timeDefined":true,
             "startDate":"12/27/2017 12:00:00 AM",
             "startTime":"12/27/2017 2:45:00 PM",
             "endTime":"12/27/2017 2:59:00 PM",
             "recurrenceType":"Daily",
             "recurrenceFrequency":1,
             "recurrenceAbsolute":true,
             "recurrenceDaysOfWeek":[],
             "recurrenceDayOfWeek":0,
             "recurrenceDayOfMonth":1,
             "recurrenceWeekOfMonth":0,
             "recurrenceMonthOfYear":0
           }
         ]
       },
    "presentations": []
  }
};

describe("Config check timeline - Unit", ()=> {

  beforeEach(() => config.setTimeline(full.content.schedule));
  afterEach(() => config.setTimeline(null));

  it("should not indicate playability if time is before first interval", () => {
    const date = new Date(2017, 11, 27, 14, 0, 0);

    assert(!config.checkTimelineNow(date));
  });

  it("should indicate playability if time is in first interval", () => {
    const date = new Date(2017, 11, 27, 14, 20, 0);

    assert(config.checkTimelineNow(date));
  });

  it("should not indicate playability if time is between intervals", () => {
    const date = new Date(2017, 11, 27, 14, 35, 0);

    assert(!config.checkTimelineNow(date));
  });

  it("should indicate playability if time is in second interval", () => {
    const date = new Date(2017, 11, 27, 14, 48, 0);

    assert(config.checkTimelineNow(date));
  });

  it("should not indicate playability if time is after second interval", () => {
    const date = new Date(2017, 11, 27, 15, 0, 0);

    assert(!config.checkTimelineNow(date));
  });

  it("should indicate playability if time is in first interval other day", () => {
    const date = new Date(2018, 1, 27, 14, 20, 0);

    assert(config.checkTimelineNow(date));
  });

  it("should not indicate playability if time is between intervals other day", () => {
    const date = new Date(2018, 1, 27, 14, 35, 0);

    assert(!config.checkTimelineNow(date));
  });

  it("should indicate playability if time is in second interval other day", () => {
    const date = new Date(2018, 1, 27, 14, 48, 0);

    assert(config.checkTimelineNow(date));
  });

});
