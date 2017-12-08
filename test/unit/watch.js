/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
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
    watch.clearMessagesAlreadySentFlag();

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
      // so WATCH message should have been sent for both screen-control.txt and content.json files
      assert(common.broadcastMessage.called);
      assert.equal(2, common.broadcastMessage.callCount);

      {
        // this is the request for screen-control.txt
        const event = common.broadcastMessage.calls[0].args[0];

        assert(event);
        // check we sent it
        assert.equal(event.from, "display-control");
        // check it's a WATCH event
        assert.equal(event.topic, "watch");
        // check the URL of the file.
        assert.equal(event.filePath, "risevision-display-notifications/DIS123/screen-control.txt");
      }

      {
        // this is the request for content.json
        const event = common.broadcastMessage.calls[1].args[0];

        assert(event);
        // check we sent it
        assert.equal(event.from, "display-control");
        // check it's a WATCH event
        assert.equal(event.topic, "watch");
        // check the URL of the file.
        assert.equal(event.filePath, "risevision-display-notifications/DIS123/content.json");
      }

      done();
    })
    .catch(error =>
    {
      assert.fail(error)

      done()
    });
  });

});
