/* eslint-disable no-underscore-dangle */
const fs = require("fs")

const CECMonitor = require("@senzil/cec-monitor").CECMonitor;

let strategy = null;

function init() {
  if (strategy) {
    return Promise.resolve(strategy)
  }

  const monitor = new CECMonitor('RV', {
    debug: true
  });

  return new Promise(resolve =>
  {
    monitor.once(CECMonitor.EVENTS._READY, () =>
    {
      resolve(strategy = new CECControlStrategy(monitor));
    });
  });
}

function checkCecUtilsConfigured() {
  return new Promise((resolve, reject) =>
  {
    fs.stat("/usr/bin/cec-client", err =>
    {
      if (err) {
        reject(Error('cec-utils not installed in Operating System'));
      }
      else {
        resolve();
      }
    });
  });
}

/**
 * For test purposes, or when configuration changes.
 */
function clear() {
  strategy = null;
}

class CECControlStrategy {

  constructor(monitor) {
    this.monitor = monitor;
  }

  checkConfigured() {
    return checkCecUtilsConfigured();
  }

  executeCommand(spec) {
    return this.monitor.writeRawMessage(spec.command)
    .then(() => spec)
    .catch(error => Object.assign(spec, {
      commandErrorMessage:
        error.message || `CEC command invocation failed: '${spec.command}'`
    }))
  }

  turnOff() {
    return this.executeCommand({
      commandType: "turn-off-command", command: "standby"
    });
  }

  turnOn() {
    return this.executeCommand({
      commandType: "turn-on-command", command: "on"
    });
  }

}

module.exports = {
  CECControlStrategy,
  checkCecUtilsConfigured,
  init,
  clear
};
