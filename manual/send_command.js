// Manually test sending commands to BQ vía logging module.

const common = require("common-display-module")

const config = require("../src/config")
const logger = require("../src/logger")

common.connect(config.moduleName).then(() =>
{
  return logger.sendCommandAttempt('turn-screen-on', 'TURN_ON --PLEASE')
})
.catch(console.error)
