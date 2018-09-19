const SerialPort = require('serialport');

const config = require('../../config');
const logger = require('../../logger');
const rs232Strategy = require("./strategy");

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
    .filter(it => ['rtscts', 'xon', 'xoff', 'xany'].includes(it))
    .forEach(consider);
  }

  return options;
}

// this function has provided port injection for test purposes.
function init(providedPort) {
  if (strategy) {
    return Promise.resolve(strategy);
  }

  return new Promise((resolve, reject) =>
  {
    const settings = config.getDisplayControlSettings();
    const path = settings['serial-port'];
    const options = asSerialPortOptions(settings);

    const port = providedPort || new SerialPort(path, options, false);

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

      rs232Strategy.init(port, settings)

      resolve(strategy = rs232Strategy);
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
