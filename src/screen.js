// Commands that can be sent to display control.
// These functions should only be invoked if dislay control is enabled and properly configured.
// All functions return a Promise, so they can be chained.

const config = require("./config");
const logger = require("./logger");

const cec = require("./strategies/cec");

function displayControlStrategy() {
  return new Promise((resolve, reject) =>
  {
    const strategy = config.getDisplayControlStrategy();

    if (strategy) {
      switch (strategy) {
        case "CEC": resolve(cec); break;
        // later add RS-232
        default: reject(Error(`Illegal display control strategy: '${strategy}'`));
      }
    }
    else {
      reject(Error('Display control not enabled'));
    }
  })
  .then(strategy => strategy.init());
}

function executeScreenCommand(action, options = {}) {
  return module.exports.displayControlStrategy()
  .then(action)
  .then((result)=>!options.suppressLog && logger.logResult(result))
  .catch(error=>
  {
    const detail = error.stack || JSON.stringify(error);

    if (options.suppressLog) {return logger.debug(error);}
    return logger.error(detail, "Error while trying to execute screen command");
  });
}

function turnOn(options = {}) {
  return executeScreenCommand(provider => provider.turnOn(), options);
}

function turnOff(options) {
  return executeScreenCommand(provider => provider.turnOff(), options);
}

module.exports = {displayControlStrategy, turnOff, turnOn}
