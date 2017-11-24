const commonConfig = require("common-display-module");
const config = require("./config");
const logger = require("./logger");

config.loadDisplayId().then(() =>
{
  commonConfig.receiveMessages(config.moduleName).then(receiver =>
  {
    receiver.on("message", message => {
      switch (message.topic) {
        case "xxxxxxxxxxxxxxxxxxxx":
          logger.debug(JSON.stringify(message.data));

          break;
      }
    });
  });
});
