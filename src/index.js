const commonConfig = require("common-display-module");
const config = require("./config");
const watch = require("./watch");
const interval = require("./interval-schedule-check");
const displayConfigBucket = "risevision-display-notifications";
const logger = require("./logger");

interval.startInterval();

commonConfig.receiveMessages(config.moduleName).then(receiver =>
{
  receiver.on("message", message => {
    switch (message.topic.toUpperCase()) {
      case "CLIENT-LIST":
        return watch.checkIfLocalStorageIsAvailable(message);
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

  commonConfig.getClientList(config.moduleName);

  if (process.env.NODE_ENV !== "test") {logger.all("started", "")}
});
