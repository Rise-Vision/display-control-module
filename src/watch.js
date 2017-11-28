const common = require("common-display-module");
const config = require("./config");
const logger = require("./logger");

// So we ensure it will only be sent once.
let watchMessageAlreadySent = false

function clearMessageAlreadySentFlag() {
  watchMessageAlreadySent = false;
}

function checkIfLocalStorageIsAvailable(message) {
  if (!watchMessageAlreadySent) {
    logger.debug(JSON.stringify(message));

    const clients = message.clients;

    if (clients.includes("local-storage")) {
      sendWatchMessage();

      watchMessageAlreadySent = true;
    }
  }
}

function sendWatchMessage() {
  const displayId = config.displayId();
  const filePath = `risedisplayconfigurations-${displayId}/screen-control.txt`;

  // currently common.broadcastMessage() does not return promises; so any broadcasting errors won't be propagated here and thus can't be handled.
  common.broadcastMessage({
    from: config.moduleName,
    topic: "watch",
    filePath
  });
}

module.exports = {
  checkIfLocalStorageIsAvailable,
  clearMessageAlreadySentFlag
};
