const common = require("common-display-module");
const timelineParser = require("./timeline-parser.js");

const moduleName = "display-control";

// This will be set once the configuration file is received, if it is ever received.
// It's an object containing the following properties: interface, serial-port,
// serial-baud-rate, serial-data-bits, serial-parity, serial-stop-bits,
// serial-flow-control, serial-screen-on-cmd, serial-screen-off-cmd
// See the display control design documentation for more information about
// these fields.
let displayControlSettings = null;

// The timeline comes from the display's schedule, provided by local-storage
let timeline = null;

function getDisplayControlStrategy() {
  return displayControlSettings && displayControlSettings.interface ?
    displayControlSettings.interface.toUpperCase() : null;
}

function getDisplayControlSettings() {
  return displayControlSettings;
}

function setDisplayControlSettings(settings) {
  displayControlSettings = settings;
}

function isDisplayControlEnabled() {
  const strategy = getDisplayControlStrategy();

  return strategy === "CEC" || strategy === "RS232";
}

function setTimeline(displayContent) {
  if (!displayContent || !displayContent.content) {return false;}
  if (!displayContent.content.schedule) {return false;}

  return timeline = displayContent.content.schedule;
}

function getTimeline() {
  return timeline;
}

function checkTimelineNow() {
  if (!timeline) {return true;}

  if (!timelineParser.canPlay(timeline)) {return false;}

  return timeline.items.some(timelineParser.canPlay);
}

module.exports = {
  bqProjectName: "client-side-events",
  bqDataset: "Module_Events",
  bqTable: "display_control_events",
  failedEntryFile: "display-control-failed.log",
  logFolder: common.getModulePath(moduleName),
  moduleName,
  getModuleVersion() {
    return common.getModuleVersion(moduleName)
  },
  getDisplayControlStrategy,
  getDisplayControlSettings,
  setDisplayControlSettings,
  isDisplayControlEnabled,
  setTimeline,
  getTimeline,
  checkTimelineNow
};
