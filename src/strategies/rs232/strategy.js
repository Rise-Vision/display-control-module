module.exports = function(port, settings) {

  this.executeCommand = spec =>
  {
    const command = settings[spec.command];

    return new Promise(resolve =>
    {
      const data = command.map(item => `0x${item}`);

      port.write(data, error =>
      {
        if (error) {
          spec.commandErrorMessage = error.message;
        }

        resolve(spec);
      });
    });
  }

  this.turnOff = () =>
    this.executeCommand({
      commandType: "turn-screen-off", command: 'serial-screen-off'
    });

  this.turnOn = () =>
    this.executeCommand({
      commandType: "turn-screen-on", command: 'serial-screen-on'
    });

  // Important to release the port before attempting to connect again.
  this.close = () => port.close(() => {});

};
