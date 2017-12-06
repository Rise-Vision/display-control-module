// turn off the monitor using CEC commands.

const { NodeCec, CEC } = require("node-cec");
const SECONDS = 10;

const cec = new NodeCec('node-cec-monitor');



const command = 'standby 0';

cec.send('standby 0')
.then(output =>
{
  console.log(`Successful command execution: ${command}`);
  console.log(`Output: ${output}`);
  process.exit();
})
.catch(error =>
{
  console.log(`Command '${command}' execution failed: ${error}`);
  process.exit(1);
});

// quit after waiting
setTimeout(() =>
{
  console.log(`CEC adapter connection unsuccessful after ${SECONDS} seconds`);
  process.exit(1);
}, SECONDS * 1000);
