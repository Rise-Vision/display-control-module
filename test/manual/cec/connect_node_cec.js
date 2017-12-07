/* eslint-disable no-magic-numbers */

// Test if we have connection to the CEC adapter.
// Unless this test finishes successfully, the other tests in this same folder won't work.
// This test uses the lower level node-cec library.
// It's left here for future reference and troubleshooting.

const {NodeCec} = require("node-cec");
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

monitor.start('cec-client', '-m', '-d', '8');

process.on('exit', () =>
{
  try {
    monitor.stop();
  }
  catch (error) {
    console.error(error.message);
  }
});
