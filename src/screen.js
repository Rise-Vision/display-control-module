/* eslint-disable global-require */

// Commands that can be sent to display control.
// These functions should only be invoked if dislay control is enabled and properly configured.
// All functions return a Promise, so they can be chained.

const isRaspbian = process.arch.includes("arm");

const config = require("./config");
const logger = require("./logger");

// serialport gave lots of trouble with Raspbian, so we are excluding it in that platform.
const rs232 = !isRaspbian && require("./strategies/rs232");
const cec = require("./strategies/cec");

function clearCurrentStrategy() {
  const strategy = config.getDisplayControlStrategy();

  switch (strategy) {
    case "CEC": return cec.clear();
    case "RS232": return isRaspbian ? Promise.resolve() : rs232.clear();
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
        case "RS232":
          if (isRaspbian) {
            reject(Error("RS232 display control strategy is not supported in Raspbian"));
          }
          else {
            resolve(rs232);
          }

          break;
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
  .then((result)=> !options.suppressLog && logger.logResult(result))
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

function turnOff(options = {}) {
  return executeScreenCommand(provider => provider.turnOff(), options);
}

module.exports = {clearCurrentStrategy, displayControlStrategy, turnOff, turnOn}
