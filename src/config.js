const common = require("common-display-module");

const moduleName = "display-control";

// This will be set once the configuration file is received, if it is ever received.
let displayControlStrategy = null;

function getDisplayControlStrategy() {
  return displayControlStrategy;
}
function setDisplayControlStrategy(strategy) {
  displayControlStrategy = strategy;
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
  setDisplayControlStrategy
};
