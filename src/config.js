const common = require("common-display-module");

let displayId = null

/**
 * Should be called only once at the beggining of the module initialization.
 * @returns {Promise} so it can be chained
 */
function loadDisplayId() {
  return common.getDisplaySettings()
  .then(settings =>
  {
    displayId = settings.displayid || settings.tempdisplayid;

    if (!displayId) {
      throw new Error('Display ID not found.');
    }

    return displayId;
  })
}

module.exports = {
  moduleName: "display-control",
  displayId: () => displayId,
  loadDisplayId
}
