/* eslint-env mocha */
/* eslint-disable max-statements, global-require, no-magic-numbers */
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

  it("should wait for local-storage to be available to send WATCH messages", done =>
  {
    function Receiver() {
      this.on = (type, handler) =>
      {
        handler({topic: "client-list", clients: []})
        .then(() =>
        {
          // no clients, CLIENT-LIST-REQUEST should have been sent using broadcastMessage(), but no WATCh
          assert.equal(common.broadcastMessage.callCount, 1);

          // this is the actual event object sent to the local storage module
          const event = common.broadcastMessage.lastCall.args[0];

          assert(event);
          // check we sent it
          assert.equal(event.from, "display-control");
          // check it's a WATCH event
          assert.equal(event.topic, "clientlist-request");

          // other non-local-storage clients
          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics"]
          })
        })
        .then(() =>
        {
          // so WATCH message shouldn't have been sent
          assert.equal(common.broadcastMessage.callCount, 1);

          // now local-storage is present
          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics", "local-storage"]
          });
        })
        .then(() =>
        {
          // so WATCH message should have been sent
          assert.equal(common.broadcastMessage.callCount, 2);

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
      }
    }

    simple.mock(common, "receiveMessages").resolveWith(new Receiver());

    // deferred require after mocks are set up
    require("../../src/index");
  });

});
