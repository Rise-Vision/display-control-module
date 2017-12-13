/* eslint-disable no-underscore-dangle */
const child = require("child_process");

const CECMonitor = require("rise-cec-monitor").CECMonitor;
const CECControlStrategy = require("./strategy");

let strategy = null;

function checkCecUtilsConfigured() {
  return new Promise((resolve, reject) =>
  {
    child.exec("cec-client -h", err =>
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

module.exports = {
  checkCecUtilsConfigured,
  init,
  clear
};
