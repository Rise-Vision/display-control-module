const config = require('../../config');
const logger = require('../../logger');
const RS232ControlStrategy = require("./strategy");

const SerialPort = require('serialport');

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

    const port = new SerialPort(path, options, false);

    // RS-232 errors not related to opening and command sending. There are explicit handlers for those others.
    port.on('error', error =>
      logger.error(error.message, "Error occurred with RS-232 port")
    );

    // just in case other process left it open. Ignore errors here
    port.close(() => {});

    port.open(error =>
    {
      if (error) {
        return reject(error);
      }

      resolve(strategy = new RS232ControlStrategy(port, settings));
    });
  });
}

/**
 * For test purposes, or when configuration changes.
 */
function clear() {
  strategy.close();

  strategy = null;
}

module.exports = {
  asSerialPortOptions,
  init,
  clear
};
