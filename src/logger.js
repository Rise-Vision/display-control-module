/* eslint-disable space-in-parens */
const common = require("common-display-module");
const {
  bqProjectName, bqDataset, bqTable, failedEntryFile, logFolder,
  moduleName, getModuleVersion
} = require("./config");

const externalLogger = require("common-display-module/external-logger")(bqProjectName, bqDataset, failedEntryFile);
const logger = require("rise-common-electron/logger")(externalLogger, logFolder, moduleName);

// Creates the detail data structure that the logging functions expect.
// Assigns "event_details" and "display_id", that are expected in the events table
function detailsFor(eventDetails, data = {}) {
  return common.getDisplayId().then(displayId =>
    Object.assign({
      "event_details": eventDetails,
      "display_id": displayId,
      "version": getModuleVersion() || "unknown"
    }, data)
  );
}

function debug(message) {
  logger.debug(message);
}

function error(eventDetails, userFriendlyMessage) {
  return detailsFor(eventDetails)
  .then(detail => logger.error(detail, userFriendlyMessage, bqTable));
}

/**
 * @return {Promise} so it can be chained.
 */
function external(eventType, eventDetails, data = {}) {
  return detailsFor(eventDetails, data)
  .then(detail => logger.external(eventType, detail, bqTable));
}

/**
 * @return {Promise} so it can be chained, or to facilitate testing automation.
 */
function sendCommandAttempt(eventType, command) {
  // we currently send no additional data as third argument for external(), but in future versions display model and vendor may be added
  return external(eventType, command, {});
}

/**
 * @return {Promise} so it can be chained, or to facilitate testing automation.
 */
function sendCommandFailure(errorMessage) {
  return external("failed_command", errorMessage, {});
}

module.exports = {debug, error, external, sendCommandAttempt, sendCommandFailure};
