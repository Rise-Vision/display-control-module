const commonConfig = require("common-display-module");
const config = require("./config");
const watch = require("./watch");

commonConfig.receiveMessages(config.moduleName).then(receiver =>
{
  receiver.on("message", message => {
    switch (message.topic) {
      case "client-list":
        return watch.checkIfLocalStorageIsAvailable(message);
    }
  });
});
