// turn off the monitor using CEC commands.

const CECMonitor = require("@senzil/cec-monitor").CECMonitor;
const SECONDS = 10;

const monitor = new CECMonitor('RV', {
  debug: true
});

monitor.once(CECMonitor.EVENTS._READY, () =>
{
  console.log('successful CEC adapter connection');
  const command = 'standby 0';

  monitor.writeRawMessage(command)
  .then(() =>
  {
    console.log(`Successful command execution: ${command}`);
    process.exit();
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
