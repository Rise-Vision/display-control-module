const messaging = require("common-display-module/messaging");
const config = require("./config");
const licensing = require("./licensing");
const watch = require("./watch");
const interval = require("./interval-schedule-check");
const displayConfigBucket = "risevision-display-notifications";
const logger = require("./logger");

interval.startInterval();

messaging.receiveMessages(config.moduleName).then(receiver =>
{
  receiver.on("message", message => {
    if (!message.topic) {return;}
    switch (message.topic.toUpperCase()) {
      case "CLIENT-LIST":
        return watch.sendWatchMessagesIfLocalStorageIsAvailable(message);
      case "LICENSING-UPDATE":
        return licensing.updateLicensingData(message);
      case "FILE-UPDATE":
        if (!message.filePath) {return;}
        if (!message.filePath.startsWith(displayConfigBucket)) {return;}

        if (message.filePath.endsWith("/screen-control.txt")) {
          return watch.receiveConfigurationFile(message);
        }
        if (message.filePath.endsWith("/content.json")) {
          return watch.receiveContentFile(message);
        }
    }
  });

  messaging.getClientList(config.moduleName);
  licensing.requestLicensingData();

  if (process.env.NODE_ENV !== "test") {logger.all("started", "")}
})
.catch(error =>
  logger.file(error.stack, 'Unexpected error while starting the module')
);
