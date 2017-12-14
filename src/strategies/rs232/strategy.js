let port = null;
let settings = null;

function init(port_, settings_) {
  port = port_;
  settings = settings_;
}

function executeCommand(suffix) {
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

function turnOff() {
  return executeCommand('off');
}

function turnOn() {
  return executeCommand('on');
}

function close() {
  return new Promise(resolve =>
    port.close(() => resolve())
  );
}

module.exports = {
  init, turnOff, turnOn, close
};
