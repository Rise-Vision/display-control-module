/* eslint-disable no-underscore-dangle */
const fs = require("fs")

const CECMonitor = require("@senzil/cec-monitor").CECMonitor;

let strategy = null;

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

function init() {
  if (strategy) {
    return Promise.resolve(strategy)
  }

  return checkCecUtilsConfigured()
  .then(() =>
  {
    const monitor = new CECMonitor('RV', {
      debug: true
    });

    return new Promise((resolve, reject) =>
    {
      monitor.once(CECMonitor.EVENTS._READY, () =>
        resolve(strategy = new CECControlStrategy(monitor))
      );

      monitor.once(CECMonitor.EVENTS._ERROR, error =>
        reject(error || Error('could not init CECMonitor'))
      );
    });
  })
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

  executeCommand(spec) {
    return this.monitor.WriteRawMessage(spec.command)
    .then(() => spec)
    .catch(error => Object.assign(spec, {
      commandErrorMessage:
        error.message || `CEC command invocation failed: '${spec.command}'`
    }))
  }

  turnOff() {
    // TV/monitor address is always fixed to 0 in CEC.
    // Low level call equivalent to 'standby 0' is 'tx 10:36'
    // see http://www.cec-o-matic.com/ for details on this code.
    return this.executeCommand({
      commandType: "turn-screen-off", command: `standby 0`
    });
  }

  turnOn() {
    // TV/monitor address is always fixed to 0 in CEC.
    // Low level call equivalent to 'on 0' is 'tx 10:04'
    // see http://www.cec-o-matic.com/ for details on this code.
    return this.executeCommand({
      commandType: "turn-screen-on", command: `on 0`
    });
  }

}

module.exports = {
  CECControlStrategy,
  checkCecUtilsConfigured,
  init,
  clear
};
