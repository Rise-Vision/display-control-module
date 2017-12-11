const commonConfig = require("common-display-module");
const config = require("./config");
const watch = require("./watch");

commonConfig.receiveMessages(config.moduleName).then(receiver =>
{
  receiver.on("message", message => {
    switch (message.topic.toUpperCase()) {
      case "CLIENT-LIST":
        return watch.checkIfLocalStorageIsAvailable(message);
      case "FILE-UPDATE":
        if (message.filePath && message.filePath.endsWith("/screen-control.txt")) {
          watch.receiveConfigurationFile(message);
        }
    }
  });

  commonConfig.broadcastMessage({
    from: config.moduleName,
    topic: "clientlist-request"
  });
});
