/* eslint-disable no-magic-numbers */
const screen = "../../src/screen"
const watch = "../../src/watch"

const configurationPath = process.argv[2];

watch.loadCurrentConfiguration(configurationPath)
.then(() => {
  console.log("configuration loaded, turning off...")

  return screen.turnOff();
})
.catch(console.error);

setTimeout(() =>
{
  console.log("exiting program");

  screen.clearCurrentStrategy()
  .then(() => process.exit())
  .catch(() => process.exit());
}, 10000);
