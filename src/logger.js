/* eslint-disable space-in-parens */
const common = require("common-display-module");
const {
  bqProjectName, bqDataset, bqTable, failedEntryFile,
  logFolder, moduleName, getModuleVersion
} = require("./config");

const externalLogger = require("common-display-module/external-logger")(bqProjectName, bqDataset, failedEntryFile);
const logger = require("rise-common-electron/logger")(externalLogger, logFolder, moduleName);

let alreadyLoggedNotAuthorized = false;

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

function error(eventDetails, userFriendlyMessage) {
  return detailsFor(eventDetails)
  .then(detail => logger.error(detail, userFriendlyMessage, bqTable));
}

function all(eventType, eventDetails, data = {}) {
  return detailsFor(eventDetails, data)
    .then(detail => logger.all(eventType, detail, null, bqTable));
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

function logResult(result) {
  return sendCommandAttempt(result.commandType, result.command)
  .then(() =>
    result.commandErrorMessage && sendCommandFailure(result.commandErrorMessage)
  )
}

function logNotAuthorizedWithValidStrategy() {
  if (!alreadyLoggedNotAuthorized) {
    module.exports.all("not_authorized", "Display control is not authorized to run even though it has a valid strategy configured.");

    alreadyLoggedNotAuthorized = true;
  }
}

function clearLoggedNotAuthorizedFlag() {
  alreadyLoggedNotAuthorized = false;
}

module.exports = {
  file: logger.file,
  debug: logger.debug,
  error,
  external,
  all,
  clearLoggedNotAuthorizedFlag,
  logNotAuthorizedWithValidStrategy,
  logResult,
  sendCommandAttempt,
  sendCommandFailure
};
