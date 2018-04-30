const config = require("./config");
const licensing = require("./licensing");
const logger = require("./logger");
const screen = require("./screen");

const scheduleCheckInterval = 60000;
let lastCommand = null;

module.exports = {
  startInterval() {
    setInterval(runCheck, scheduleCheckInterval);
  },
  runCheck
};

function ensureLicenseHasBeenRequested() {
  if (config.hasValidStrategy()) {
    logger.logNotAuthorizedWithValidStrategy();

    if (!config.hasReceivedAuthorization()) {
      return licensing.requestLicensingData();
    }
  }

  return Promise.resolve();
}

function runCheck(date = null) {
  try {
    logger.debug("running display control check");

    if (!config.isDisplayControlEnabled()) {
      return ensureLicenseHasBeenRequested();
    }

    logger.clearLoggedNotAuthorizedFlag();

    const command = config.checkTimelineNow(date) ? "turnOn" : "turnOff";
    const suppressLog = lastCommand === command;

    // Promise returned for testing purposes
    return screen[command]({suppressLog})
    .then(() => lastCommand = command)
  }
  catch (error) {
    // This handler should never be reached, unless there is a bug in the code.
    // Command execution errors should have been handled by the screen object.
    logger.error(error.stack, "Unexpected error in scheduled check.");

    return Promise.reject(error);
  }
}
