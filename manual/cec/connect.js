// test if we have connection to the CEC adapter.
// unless this test finishes successfully, the other tests in this same folder won't work.

const { NodeCec, CEC } = require("node-cec");
const SECONDS = 5;

const monitor = new NodeCec('node-cec-monitor');

monitor.once('ready', () =>
{
  console.log('successful CEC adapter connection');
  process.exit();
});

monitor.once('error', error =>
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

monitor.start('cec-client', '-m', '-d', '8', '-b', 'r');

process.on('exit', () =>
{
  try {
    monitor.stop();
  }
  catch(error) {
    console.error(error.message);
  }
});
