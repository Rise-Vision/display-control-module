// test if we have connection to the CEC adapter.
// unless this test finishes successfully, the other tests in this same folder won't work.

const CECMonitor = require("@senzil/cec-monitor").CECMonitor;
const SECONDS = 5;

const monitor = new CECMonitor('RV', {
  debug: true
});

monitor.once(CECMonitor.EVENTS._READY, () =>
{
  console.log('successful CEC adapter connection');
  process.exit();
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
