/* eslint-env mocha */
/* eslint-disable max-statements, global-require, no-magic-numbers */
const assert = require("assert");
const common = require("common-display-module");
const messaging = require("common-display-module/messaging");
const simple = require("simple-mock");

const licensing = require("../../src/licensing");
const watch = require("../../src/watch");

describe("Watch - Integration", ()=>
{

  beforeEach(()=>
  {
    const settings = {displayid: "DIS123"};

    simple.mock(licensing, "requestLicensingData").resolveWith();
    simple.mock(messaging, "broadcastMessage").resolveWith();
    simple.mock(messaging, "getClientList").returnWith();
    simple.mock(common, "getDisplaySettings").resolveWith(settings);
  });

  afterEach(()=> {
    watch.clearMessagesAlreadySentFlag();

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
          // no clients, getClientList() should have been called, but no WATCH
          assert.equal(messaging.getClientList.callCount, 1);
          assert.equal(messaging.broadcastMessage.callCount, 0);

          // other non-local-storage clients
          return handler({
            msg: "non-topic-message"
          })
        })
        .then(() => {
          // other non-local-storage clients
          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics"]
          })
        })
        .then(() =>
        {
          // so WATCH message shouldn't have been sent
          assert.equal(messaging.broadcastMessage.callCount, 0);

          // now local-storage is present
          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics", "local-storage"]
          });
        })
        .then(() =>
        {
          // so both WATCH messages should have been sent
          assert.equal(messaging.broadcastMessage.callCount, 2);

          {
            // this is the request for screen-control.txt
            const event = messaging.broadcastMessage.calls[0].args[0];

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
            const event = messaging.broadcastMessage.calls[1].args[0];

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
      }
    }

    simple.mock(messaging, "receiveMessages").resolveWith(new Receiver());

    // deferred require after mocks are set up
    require("../../src/index");
  });

});
