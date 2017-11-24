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
    simple.mock(common, "broadcastMessage").returnWith();
  });

  afterEach(()=> simple.restore());

  it("should wait until local-storage module is available before sending the watch message", () =>
  {
    watch.receiveClientList({clients: []});
    // no clients, so WATCH message shouldn't have been sent
    assert(!common.broadcastMessage.called);

    // other non-local-storage clients
    watch.receiveClientList({clients: ["logging", "system-metrics"]});
    // so WATCH message shouldn't have been sent
    assert(!common.broadcastMessage.called);

    // now local-storage is present
    watch.receiveClientList({clients: ["logging", "system-metrics", "local-storage"]});
    // so WATCH message should have been sent
    assert(common.broadcastMessage.called);
  });

});
