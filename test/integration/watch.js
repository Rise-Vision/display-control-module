/* eslint-env mocha */
/* eslint-disable max-statements, global-require */
const assert = require("assert");
const common = require("common-display-module");
const simple = require("simple-mock");

const watch = require("../../src/watch");

describe("Watch - Integration", ()=>
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

  it("should send WATCH messages to local storage", done =>
  {
    function Receiver() {
      this.on = (type, handler) =>
      {
        handler({topic: "client-list", clients: []});
        // no clients, so WATCH message shouldn't have been sent
        assert(!common.broadcastMessage.called);

        // other non-local-storage clients
        handler({
          topic: "client-list",
          clients: ["logging", "system-metrics"]
        });
        // so WATCH message shouldn't have been sent
        assert(!common.broadcastMessage.called);

        // now local-storage is present
        handler({
          topic: "client-list",
          clients: ["logging", "system-metrics", "local-storage"]
        });
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
      }
    }

    simple.mock(common, "receiveMessages").resolveWith(new Receiver());

    // deferred require after mocks are set up
    require("../../src/index");
  });

});
