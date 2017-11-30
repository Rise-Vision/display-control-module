/* eslint-disable space-in-parens */
const common = require("common-display-module");
const {
  bqProjectName, bqDataset, bqTable, failedEntryFile, logFolder, moduleName
} = require("./config");

const externalLogger = require("common-display-module/external-logger")(bqProjectName, bqDataset, failedEntryFile);
const logger = require("rise-common-electron/logger")(externalLogger, logFolder, moduleName);

// Creates the detail data structure that the logging functions expect.
// Assigns "event_details" and "display_id", that are expected in the events table
function detailsFor(eventDetails, data = {}) {
  return common.getDisplayId().then(displayId =>
    Object.assign({
      "event_details": eventDetails,
      "display_id": displayId
    }, data)
  );
}

function debug(message) {
  logger.debug(message);
}

function error(eventDetails, userFriendlyMessage) {
  detailsFor(eventDetails, {})
  .then(detail => logger.error(detail, userFriendlyMessage, bqTable));
}

module.exports = {debug, error};
