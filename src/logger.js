const common = require("common-display-module");
const config = require("./config");
const moduleName = config.moduleName;

const BQ_PROJECT_NAME = "client-side-events"
const BQ_DATASET = "Display_Control_Events"
const BQ_TABLE = "events"

const logFolder = common.getModulePath(moduleName)
const FAILED_ENTRY_FILE = "display-control-failed.log"

const externalLogger = require("common-display-module/external-logger")(BQ_PROJECT_NAME, BQ_DATASET, FAILED_ENTRY_FILE)
const logger = require("rise-common-electron/logger")(externalLogger, logFolder, moduleName)

// Creates the detail data structure that the logging functions expect.
// Assigns "event_details" and "display_id", that are expected in the events table
function detailsFor(eventDetails, data = {}) {
  const displayId = config.displayId();

  if (!displayId) {
    throw new Error('Display ID not initialized');
  }

  return Object.assign({
    "event_details": eventDetails,
    "display_id": displayId
  }, data)
}

function debug(message) {
  logger.debug(message);
}

function error(eventDetails, userFriendlyMessage) {
  const detail = detailsFor(eventDetails, {})

  logger.error(detail, userFriendlyMessage, BQ_TABLE)
}

module.exports = {debug, error}
