// Commands that can be sent to display control.
// These functions should only be invoked if dislay control is enabled and properly configured.
// All functions return a Promise, so they can be chained.

const config = require("./config");
const logger = require("./logger");

const CECControlStrategy = require("./strategies/cec");

function displayControlStrategy() {
  return new Promise((resolve, reject) =>
  {
    const strategy = config.getDisplayControlStrategy();

    if (strategy) {
      switch (strategy) {
        case "CEC": resolve(new CECControlStrategy()); break;
        // later add RS-232
        default: reject(Error(`Illegal display control strategy: '${strategy}'`));
      }
    }
    else {
      reject(Error('Display control not enabled'));
    }
  });
}

function executeScreenCommand(action) {
  return displayControlStrategy()
  .then(provider =>
    provider.checkConfigured()
    .then(() => action(provider))
    .then(result =>
      logger.sendCommandAttempt(result.commandType, result.command)
      .then(() =>
        result.commandErrorMessage && logger.sendCommandFailure(result.commandErrorMessage)
      )
    )
  )
  .catch(error=>
  {
    const detail = error.message || JSON.stringify(error);

    logger.error(detail, "Error while trying to execute screen command");
  });
}

function turnOn() {
  return executeScreenCommand(provider => provider.turnOn());
}

function turnOff() {
  return executeScreenCommand(provider => provider.turnOff());
}

module.exports = {displayControlStrategy, turnOff, turnOn}
