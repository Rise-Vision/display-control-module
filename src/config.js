const common = require("common-display-module");
const timelineParser = require("./timeline-parser.js");

const moduleName = "display-control";

const VALID_STRATEGIES = ["CEC", "RS232"];

// This will be set once the configuration file is received, if it is ever received.
// It's an object containing the following properties: interface, serial-port,
// serial-baud-rate, serial-data-bits, serial-parity, serial-stop-bits,
// serial-flow-control, serial-screen-on-cmd, serial-screen-off-cmd
// See the display control design documentation for more information about
// these fields.
let displayControlSettings = null;

// The timeline comes from the display's schedule, provided by local-storage
let timeline = null;

// will turn to either true or false when valid license data is received
let authorized = null;

function getDisplayControlStrategy() {
  return displayControlSettings && displayControlSettings.interface ?
    displayControlSettings.interface.toUpperCase() : null;
}

function getDisplayControlSettings() {
  return displayControlSettings;
}

// Storing the commands this way helps RS-232 to process more easily
function toArrayOfBytesEncodedAsString(command) {
  const compact = command.toLowerCase().replace(/\s/g, '');
  const valid = (/^([0-9a-f][0-9a-f])+$/).test(compact);

  if (!valid) {
    throw new Error(`Invalid RS-232 command: '${command}'`)
  }

  return compact.match(/.{2}/g);
}

function validateRS232Settings(settings) {
  if (!settings['serial-port']) {
    throw new Error('RS-232 serial port not provided.');
  }

  const onCommand = settings['serial-screen-on-cmd'];
  const offCommand = settings['serial-screen-off-cmd'];

  if (!onCommand || !offCommand) {
    throw new Error('RS-232 ON/OFF commands not provided.');
  }

  settings['serial-screen-on'] = toArrayOfBytesEncodedAsString(onCommand);
  settings['serial-screen-off'] = toArrayOfBytesEncodedAsString(offCommand);
}

function setDisplayControlSettings(settings) {
  // initially set to null so previous configuration is reset even if an error happens
  displayControlSettings = null;

  if (settings && settings.interface) {
    if (settings.interface.toUpperCase() === 'RS232') {
      validateRS232Settings(settings);
    }
  }

  displayControlSettings = settings;
}

function isDisplayControlEnabled() {
  return isAuthorized() && hasValidStrategy();
}

function hasValidStrategy() {
  const strategy = getDisplayControlStrategy();

  return VALID_STRATEGIES.includes(strategy);
}

function setTimeline(schedule) {
  return timeline = schedule;
}

function getTimeline() {
  return timeline;
}

function checkTimelineNow(date = null) {
  if (!timeline) {return true;}

  if (!timelineParser.canPlay(timeline, date)) {return false;}

  return timeline.items.some(item => timelineParser.canPlay(item, date));
}

function setAuthorized(flag) {
  authorized = flag;
}

function isAuthorized() {
  return authorized;
}

function hasReceivedAuthorization() {
  return authorized !== null;
}

// Clear all state, for testing purposes only
function clear() {
  setDisplayControlSettings(null);
  setTimeline(null);
  setAuthorized(null);
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
  hasValidStrategy,
  isDisplayControlEnabled,
  setTimeline,
  getTimeline,
  checkTimelineNow,
  setAuthorized,
  isAuthorized,
  hasReceivedAuthorization,
  clear
};
