const config = require('../../config');
const logger = require('../../logger');
const SerialPort = require('./serial-port-factory');
const RS232ControlStrategy = require("./strategy");

let strategy = null;

function asSerialPortOptions(settings) {
  const options = {};

  function consider(property, value = true) {
    if (value) {
      options[value] = value;
    }
  }

  consider('baudRate', settings['serial-baud-rate']);
  consider('dataBits', settings['serial-data-bits']);
  consider('stopBits', settings['serial-stop-bits']);
  consider('parity', settings['serial-parity']);

  const flowControl = settings['serial-flow-control'];
  if (flowControl) {
    flowControl.toLowerCase().split(',')
    .filter(['rtscts', 'xon', 'xoff', 'xany'].includes)
    .forEach(consider);
  }

  return options;
}

function init() {
  if (strategy) {
    return Promise.resolve(strategy);
  }

  return new Promise((resolve, reject) =>
  {
    const settings = config.getDisplayControlSettings();
    const path = settings['serial-port'];
    const options = asSerialPortOptions(settings);

    const port = SerialPort.create(path, options);

    // RS-232 errors not related to opening and command sending. There are explicit handlers for those others.
    port.on('error', error =>
      logger.error(error.message, "Error occurred with RS-232 port")
    );

    // just in case other process left it open. Ignore errors here
    port.close(() => {});

    port.open(error =>
    {
      // opening message sent as error message in callback, so we filter it.
      if (error && !error.message.includes('Port is opening')) {
        return reject(error);
      }

      resolve(strategy = new RS232ControlStrategy(port, settings));
    });
  });
}

// Exposed for test purposes
function getStrategy() {
  return strategy;
}

/**
 * For test purposes, or when configuration changes.
 */
function clear() {
  if (strategy) {
    return strategy.close().then(() => {
      strategy = null
    });
  }

  return Promise.resolve();
}

module.exports = {
  asSerialPortOptions,
  getStrategy,
  init,
  clear
};
