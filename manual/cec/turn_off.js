// turn off the monitor using CEC commands.

const { NodeCec, CEC } = require("node-cec");
const SECONDS = 10;

const monitor = new NodeCec('node-cec-monitor');
const command = "tx 10:36";

monitor.once('ready', () =>
{
  console.log('successful CEC adapter connection');

  try {
    monitor.send(command);
    console.log(`CEC command successfully sent: ${command}`);

    process.exit();
  }
  catch(error) {
    console.error(error);

    process.exit(1);
  }
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
  catch(error) {
    console.error(error.message);
  }
});
