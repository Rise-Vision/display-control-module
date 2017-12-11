/* eslint-disable line-comment-position, no-inline-comments */

const common = require("common-display-module");
const config = require("./config");
const logger = require("./logger");
const parser = require("./parser");
const platform = require("rise-common-electron").platform;

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
    ['screen-control.txt', 'content.json'].forEach(name =>
    {
      const filePath = `risevision-display-notifications/${displayId}/${name}`;

      common.broadcastMessage({
        from: config.moduleName,
        topic: "watch",
        filePath
      });
    })
  );
}

function loadCurrentConfiguration(configurationPath) {
  if (configurationPath) {
    logger.debug(`reading ${configurationPath}`);

    return platform.readTextFile(configurationPath)
    .then(data =>
    {
      const settings = parser.parseContent(data);

      logger.debug(`loading settings ${JSON.stringify(settings)}`);

      config.setDisplayControlSettings(settings);
    })
    .catch(error =>
      logger.error(error.message, `Could not parse configuration file ${configurationPath}`)
    );
  }

  // allows linking in tests.
  return Promise.resolve();
}

function receiveConfigurationFile(message) {
  switch (message.status) {
    case "DELETED": case "NOEXIST":
      // if we don't have a file set empty configuration.
      config.setDisplayControlSettings(null);

      // allows linking in tests.
      return Promise.resolve();

    default: return loadCurrentConfiguration(message.ospath);
  }
}

function receiveContentFile(message) {
  if (["DELETED", "NOEXIST"].includes(message.status)) {return;}

  return platform.readTextFile(message.ospath)
  .then(fileData=>{
    try {
      config.setTimeline(JSON.parse(fileData));
    } catch (error) {
      logger.error(error.message, `Could not parse content file ${message.ospath}`)
    }
  });
}

module.exports = {
  checkIfLocalStorageIsAvailable,
  clearMessagesAlreadySentFlag,
  receiveConfigurationFile,
  receiveContentFile
};
