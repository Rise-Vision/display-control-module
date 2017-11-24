const common = require("common-display-module");
const logger = require("./logger");

// So we ensure it will only be sent once.
let watchMessageAlreadySent = false

/**
 * We check the client list until local storage is available to send a
 * WATCH message.
 * @param {Object} message the client-list message object as received from
 * local messaging.
 */
function receiveClientList(message) {
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
  // currently common.broadcastMessage() does not return promises; so broadcasting errors may not be thrown here and thus are not handled.
  common.broadcastMessage({});
}

module.exports = {
  receiveClientList,
  sendWatchMessage
};
