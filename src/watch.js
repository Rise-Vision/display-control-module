const common = require("common-display-module");
const config = require("./config");
const logger = require("./logger");

// So we ensure it will only be sent once.
let watchMessagesAlreadySent = false

function clearMessagesAlreadySentFlag() {
  watchMessagesAlreadySent = false;
}

function checkIfLocalStorageIsAvailable(message) {
  if (!watchMessagesAlreadySent) {
    logger.debug(JSON.stringify(message));

    const clients = message.clients;

    if (clients.includes("local-storage")) {
      return sendWatchMessages()
      .then(() => watchMessagesAlreadySent = true)
    }
  }

  return Promise.resolve()
}

function sendWatchMessages() {
  return common.getDisplayId()
  .then(displayId =>
  {
    function sendWatchMessageForFile(name) {
      const filePath = `risevision-display-notifications/${displayId}/${name}`;

      common.broadcastMessage({
        from: config.moduleName,
        topic: "watch",
        filePath
      });
    }

    sendWatchMessageForFile('screen-control.txt');
    sendWatchMessageForFile('content.json');
  })
}

module.exports = {
  checkIfLocalStorageIsAvailable,
  clearMessagesAlreadySentFlag
};
