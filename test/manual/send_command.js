// Manually test sending commands to BQ vía logging module.

const messaging = require("common-display-module/messaging");

const config = require("../src/config");
const logger = require("../src/logger");

messaging.connect(config.moduleName).then(() =>
{
  return logger.sendCommandAttempt('turn-screen-on', 'TURN_ON --PLEASE');
})
.catch(console.error);
