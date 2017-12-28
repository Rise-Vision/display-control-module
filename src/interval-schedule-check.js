const config = require("./config");
const logger = require("./logger.js");
const scheduleCheckInterval = 60000;
const screen = require("./screen.js");

let lastCommand = null;

module.exports = {
  startInterval() {
    setInterval(runCheck, scheduleCheckInterval);
  },
  runCheck
};

function runCheck(date = null) {
  try {
    if (!config.isDisplayControlEnabled()) {
      return;
    }

    const command = config.checkTimelineNow(date) ? "turnOn" : "turnOff";

    screen[command]({suppressLog: lastCommand === command});
    lastCommand = command;
  }
  catch (error) {
    // This handler should never be reached, unless there is a bug in the code.
    // Command execution errors should have been handled by the screen object.
    logger.error(error.stack, "Unexpected error in schedled check.");
  }
}
