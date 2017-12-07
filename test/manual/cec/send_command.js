/* eslint-disable no-magic-numbers */

const CECMonitor = require("@senzil/cec-monitor").CECMonitor;
const SECONDS = 10;

module.exports = command =>
{
  const monitor = new CECMonitor('RV', {
    debug: true
  });

  monitor.once(CECMonitor.EVENTS._READY, () =>
  {
    console.log('successful CEC adapter connection');

    monitor.WriteRawMessage(command)
    .then(() =>
    {
      console.log(`Successful command execution: ${command}`);

      setTimeout(process.exit, 3000);
    })
    .catch(error =>
    {
      console.log(`Command '${command}' execution failed: ${error}`);
      process.exit(1);
    })
  });

  monitor.once(CECMonitor.EVENTS._ERROR, error =>
  {
    console.log(`CEC adapter connection failed: ${error}`);
    process.exit(1);
  });

  // quit after waiting
  setTimeout(() =>
  {
    console.log(`CEC adapter connection unsuccessful after ${SECONDS} seconds`);
    process.exit(1);
  }, SECONDS * 1000);
};
