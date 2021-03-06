/* eslint-disable line-comment-position, no-inline-comments */

const common = require("common-display-module");
const config = require("./config");
const logger = require("./logger");
const messaging = require("common-display-module/messaging");
const parser = require("./parser");
const screen = require("./screen");
const platform = require("rise-common-electron").platform;

// So we ensure it will only be sent once.
let watchMessagesAlreadySent = false

function clearMessagesAlreadySentFlag() {
  watchMessagesAlreadySent = false;
}

function sendWatchMessagesIfLocalStorageIsAvailable(message) {
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
      logger.file(name, "sending watch message");

      const filePath = `risevision-display-notifications/${displayId}/${name}`;

      messaging.broadcastMessage({
        from: config.moduleName,
        topic: "watch",
        filePath
      });
    })
  );
}

function loadCurrentConfiguration(configurationPath) {
  if (configurationPath && platform.fileExists(configurationPath)) {
    logger.debug(`reading ${configurationPath}`);

    return platform.readTextFile(configurationPath)
    .then(data =>
    {
      const settings = parser.parseContent(data);

      logger.file(`loading settings ${JSON.stringify(settings)}`);

      // it's important to clear current strategy to shutdown ports and resources
      // before attempting to load a new one
      return screen.clearCurrentStrategy().then(() =>
        config.setDisplayControlSettings(settings)
      );
    })
    .catch(error =>
      logger.error(error.message, `Could not parse configuration file ${configurationPath}`)
    );
  }

  // allows linking in tests.
  return Promise.resolve();
}

function receiveConfigurationFile(message) {
  logger.file(JSON.stringify(message), "receiving configuration file message");

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
  logger.file(JSON.stringify(message), "receiving content file message");

  if (["DELETED", "NOEXIST", "STALE"].includes(message.status)) {return Promise.resolve();}

  return platform.readTextFile(message.ospath)
  .then(fileData=>{
    try {
      const fileJSON = JSON.parse(fileData);

      logger.file(`Setting timeline ${JSON.stringify(fileJSON.content.schedule)}`);
      config.setTimeline(fileJSON.content.schedule);
    } catch (error) {
      logger.error(error.stack, `Could not parse content file ${message.ospath}`)
    }
  });
}

module.exports = {
  sendWatchMessagesIfLocalStorageIsAvailable,
  clearMessagesAlreadySentFlag,
  loadCurrentConfiguration,
  receiveConfigurationFile,
  receiveContentFile
};
