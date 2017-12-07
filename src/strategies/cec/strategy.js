module.exports = function(monitor) {

  this.executeCommand = spec =>
    monitor.WriteRawMessage(spec.command)
    .then(() => spec)
    .catch(error => Object.assign(spec, {
      commandErrorMessage:
        error.message || `CEC command invocation failed: '${spec.command}'`
    }));

  // TV/monitor address is always fixed to 0 in CEC.
  // Low level call equivalent to 'standby 0' is 'tx 10:36'
  // see http://www.cec-o-matic.com/ for details on this code.
  this.turnOff = () =>
    this.executeCommand({
      commandType: "turn-screen-off", command: `standby 0`
    });

  // TV/monitor address is always fixed to 0 in CEC.
  // Low level call equivalent to 'on 0' is 'tx 10:04'
  // see http://www.cec-o-matic.com/ for details on this code.
  this.turnOn = () =>
    this.executeCommand({
      commandType: "turn-screen-on", command: `on 0`
    });

};
