const config = require("./config");
const scheduleCheckInterval = 60000;
const screen = require("./screen.js");

let lastCommand = null;

module.exports = {
  startInterval() {
    setInterval(runCheck, scheduleCheckInterval);
  },
  runCheck
};

function runCheck() {
  if (!config.isDisplayControlEnabled()) {
    return;
  }

  const command = config.checkTimelineNow() ? "turnOn" : "turnOff";

  screen[command]({suppressLog: lastCommand === command});
  lastCommand = command;
}
