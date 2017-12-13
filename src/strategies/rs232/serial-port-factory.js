// serial port creation; extracted to facilitate tests

const SerialPort = require('serialport');

module.exports = {
  create(path, options) {
    return new SerialPort(path, options, false);
  }
}
