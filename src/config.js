const common = require("common-display-module");

const moduleName = "display-control";

// This will be set once the configuration file is received, if it is ever received.
// It's an object containing the following properties: interface, serial-port,
// serial-baud-rate, serial-data-bits, serial-parity, serial-stop-bits,
// serial-flow-control, serial-screen-on-cmd, serial-screen-off-cmd
// See the display control design documentation for more information about
// these fields.
let displayControlSettings = null;

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
  setDisplayControlSettings
};
