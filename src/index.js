const commonConfig = require("common-display-module");
const config = require("./config");
const watch = require("./watch");
const interval = require("./interval-schedule-check");
const displayConfigBucket = "rise-display-notifications";
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

  commonConfig.broadcastMessage({
    from: config.moduleName,
    topic: "clientlist-request"
  });

  if (process.env.NODE_ENV !== "test") {logger.all("started", "")}
});
