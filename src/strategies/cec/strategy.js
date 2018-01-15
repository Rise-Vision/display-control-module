let monitor = null

function init(monitor_) {
  monitor = monitor_;
}

function executeCommand(spec) {
  return monitor.WriteRawMessage(spec.command)
  .then(() => spec)
  .catch(error => Object.assign(spec, {
    commandErrorMessage:
      error.message || `CEC command invocation failed: '${spec.command}'`
  }));
}

// TV/monitor address is always fixed to 0 in CEC.
// Low level call equivalent to 'standby 0' is 'tx 10:36'
// see http://www.cec-o-matic.com/ for details on this code.
function turnOff() {
  return executeCommand({
    commandType: "turn-screen-off", command: `standby 0`
  });
}

// TV/monitor address is always fixed to 0 in CEC.
// Low level call equivalent to 'on 0' is 'tx 10:04'
// see http://www.cec-o-matic.com/ for details on this code.
function turnOn() {
  return executeCommand({
    commandType: "turn-screen-on", command: `on 0`
  });
}

module.exports = {
  init, turnOff, turnOn
};
