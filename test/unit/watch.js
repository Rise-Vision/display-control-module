/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const logger = require("../../src/logger");
const common = require("common-display-module");
const simple = require("simple-mock");
const platform = require("rise-common-electron").platform;

const config = require("../../src/config");
const watch = require("../../src/watch");

describe("Watch - Unit", ()=> {

  beforeEach(()=> {
    const settings = {displayid: "DIS123"};

    simple.mock(common, "broadcastMessage").returnWith();
    simple.mock(logger, "error").returnWith();
    simple.mock(common, "getDisplaySettings").resolveWith(settings);
    simple.mock(platform, "fileExists").returnWith(true);
  });

  afterEach(()=> {
    watch.clearMessagesAlreadySentFlag();

    simple.restore()
  });

  it("should not send WATCH messages if no module is available", done => {
    watch.sendWatchMessagesIfLocalStorageIsAvailable({clients: []})
    .then(() => {
      // no clients, so WATCH messages shouldn't have been sent
      assert(!common.broadcastMessage.called);

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should not send WATCH messages if local-storage module is not available", done => {
    watch.sendWatchMessagesIfLocalStorageIsAvailable({
      clients: ["logging", "system-metrics"]
    })
    .then(() => {
      // so WATCH messages shouldn't have been sent
      assert(!common.broadcastMessage.called);

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should send WATCH messages if local-storage module is available", done => {
    watch.sendWatchMessagesIfLocalStorageIsAvailable({
      clients: ["logging", "system-metrics", "local-storage"]
    })
    .then(() => {
      // so WATCH messages should have been sent for both screen-control.txt and content.json files
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
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should receive control config file", done => {
    simple.mock(platform, "readTextFile").resolveWith(`
interface=cec
serial-port=
serial-baud-rate=
serial-data-bits=
serial-parity=
serial-stop-bits=
serial-flow-control=
serial-screen-on-cmd=
serial-screen-off-cmd=`);

    watch.receiveConfigurationFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx/screen-control.txt"
    })
    .then(() => {
      assert(config.isDisplayControlEnabled());
      const settings = config.getDisplayControlSettings();

      assert(settings);
      assert.equal(settings.interface, "cec");
      assert.equal(settings['serial-port'], "");
      assert.equal(settings['serial-baud-rate'], "");
      assert.equal(settings['serial-screen-off-cmd'], "");

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should clear settings if local file is not current", done => {
    watch.receiveConfigurationFile({
      topic: "file-update",
      status: "DELETED",
      ospath: "xxxxxxx/screen-control.txt"
    })
    .then(() => {
      assert(!config.isDisplayControlEnabled());

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should receive content file", ()=>{
    const mockScheduleText = '{"content": {"schedule": {"timeDefined": true}}}';
    simple.mock(platform, "readTextFile").resolveWith(mockScheduleText);
    simple.mock(config, "setTimeline").returnWith();

    return watch.receiveContentFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx"
    })
    .then(() => {
      assert.deepEqual(config.setTimeline.lastCall.args[0], {timeDefined: true});
    });
  });

  it("should catch invalid content file", ()=>{
    const mockScheduleText = '{"content": invalid}';
    simple.mock(platform, "readTextFile").resolveWith(mockScheduleText);

    return watch.receiveContentFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx"
    })
    .then(() => {
      assert(logger.error.lastCall.args[1].startsWith("Could not parse"));
    });
  });

  it("should catch invalid content file", ()=>{
    const mockScheduleText = '{{';
    simple.mock(platform, "readTextFile").resolveWith(mockScheduleText);

    return watch.receiveContentFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx"
    })
    .then(() => {
      assert(logger.error.lastCall.args[1].startsWith("Could not parse"));
    });
  });
});
