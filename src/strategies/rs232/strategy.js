module.exports = function(port, settings) {

  this.executeCommand = suffix =>
  {
    const key = `serial-screen-${suffix}`;
    const spec = {
      commandType: `turn-screen-${suffix}`,
      command: settings[`${key}-cmd`]
    }

    const command = settings[key];

    return new Promise(resolve =>
    {
      // we'll have to see if this formatting works for every display; if not, this should be adjusted accordingly later
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

  this.turnOff = () => this.executeCommand('off');
  this.turnOn = () => this.executeCommand('on');

  // Important to release the port before attempting to connect again.
  this.close = () => new Promise(resolve =>
    port.close(() => resolve())
  );

};
