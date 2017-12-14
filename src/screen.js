// Commands that can be sent to display control.
// These functions should only be invoked if dislay control is enabled and properly configured.
// All functions return a Promise, so they can be chained.

const config = require("./config");
const logger = require("./logger");

const cec = require("./strategies/cec");
const rs232 = require("./strategies/rs232");

function clearCurrentStrategy() {
  const strategy = config.getDisplayControlStrategy();

  switch (strategy) {
    case "CEC": return cec.clear();
    case "RS232": return rs232.clear();
    default: return Promise.resolve();
  }
}

// serialPort for test purposes, and may be null or undefined
function displayControlStrategy(serialPort) {
  return new Promise((resolve, reject) =>
  {
    const strategy = config.getDisplayControlStrategy();

    if (strategy) {
      switch (strategy) {
        case "CEC": resolve(cec); break;
        case "RS232": resolve(rs232); break;
        default: reject(Error(`Illegal display control strategy: '${strategy}'`));
      }
    }
    else {
      reject(Error('Display control not enabled'));
    }
  })
  .then(strategy => strategy.init(serialPort));
}

function executeScreenCommand(action, options = {}) {
  return module.exports.displayControlStrategy(options.serialPort)
  .then(action)
  .then((result)=>!options.suppressLog && logger.logResult(result))
  .catch(error=>
  {
    const detail = error.message || JSON.stringify(error);

    if (options.suppressLog) {return logger.debug(error);}
    return logger.error(detail, "Error while trying to execute screen command");
  });
}

function turnOn(options = {}) {
  return executeScreenCommand(provider => provider.turnOn(), options);
}

function turnOff(options = {}) {
  return executeScreenCommand(provider => provider.turnOff(), options);
}

module.exports = {clearCurrentStrategy, displayControlStrategy, turnOff, turnOn}
