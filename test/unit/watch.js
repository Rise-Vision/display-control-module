/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const common = require("common-display-module");
const simple = require("simple-mock");

const watch = require("../../src/watch");

describe("Watch - Unit", ()=>
{

  beforeEach(()=>
  {
    const settings = {displayid: "DIS123"};

    simple.mock(common, "broadcastMessage").returnWith();
    simple.mock(common, "getDisplaySettings").resolveWith(settings);
  });

  afterEach(()=> {
    watch.clearMessageAlreadySentFlag();

    simple.restore()
  });

  it("should not send WATCH message if no module is available", done =>
  {
    watch.checkIfLocalStorageIsAvailable({clients: []})
    .then(() =>
    {
      // no clients, so WATCH message shouldn't have been sent
      assert(!common.broadcastMessage.called);

      done();
    })
    .catch(error =>
    {
      assert.fail(error)

      done()
    });
  });

  it("should not send WATCH message if local-storage module is not available", done =>
  {
    watch.checkIfLocalStorageIsAvailable({
      clients: ["logging", "system-metrics"]
    })
    .then(() =>
    {
      // so WATCH message shouldn't have been sent
      assert(!common.broadcastMessage.called);

      done();
    })
    .catch(error =>
    {
      assert.fail(error)

      done()
    });
  });

  it("should send WATCH message if local-storage module is available", done =>
  {
    watch.checkIfLocalStorageIsAvailable({
      clients: ["logging", "system-metrics", "local-storage"]
    })
    .then(() =>
    {
      // so WATCH message should have been sent
      assert(common.broadcastMessage.called);

      // this is the actual event object sent to the local storage module
      const event = common.broadcastMessage.lastCall.args[0];

      assert(event);
      // check we sent it
      assert.equal(event.from, "display-control");
      // check it's a WATCH event
      assert.equal(event.topic, "watch");
      // check the URL of the file.
      assert.equal(event.filePath, "risedisplayconfigurations-DIS123/screen-control.txt");

      done();
    })
    .catch(error =>
    {
      assert.fail(error)

      done()
    });
  });

});
