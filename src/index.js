const commonConfig = require("common-display-module");

commonConfig.receiveMessages("logger").then((receiver) => {
  receiver.on("message", (message) => {
    // remove - soley for initial setup
    console.log(`message received: ${message}`);
  });
});
