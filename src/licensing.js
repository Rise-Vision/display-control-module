const licensing = require("common-display-module/licensing");

const config = require("./config");
const logger = require("./logger");

let initialRequestAlreadySent = false;

function requestLicensingData() {
  logger.file('requesting licensing data');

  return licensing.requestLicensingData(config.moduleName)
  .catch(error => {
    logger.error(error.stack, 'Error while requesting licensing data');
  });
}

function requestLicensingDataIfLicensingIsAvailable(message) {
  if (!initialRequestAlreadySent) {
    const clients = message.clients;

    if (clients.includes("licensing")) {
      return module.exports.requestLicensingData()
      .then(() => initialRequestAlreadySent = true);
    }
  }

  return Promise.resolve();
}

function updateLicensingData(data) {
  logger.file(JSON.stringify(data), "receiving licensing data");

  if (licensing.containsSubscriptionDataForRisePlayerProfessional(data)) {
    const previousAuthorized = config.isAuthorized();
    const currentAuthorized = licensing.isRisePlayerProfessionalSubscriptionActive(data);

    // detect licensing change
    if (previousAuthorized !== currentAuthorized) {
      config.setAuthorized(currentAuthorized);

      return logger.all(currentAuthorized ? 'authorized' : 'not_authorized', '');
    }
  }

  return Promise.resolve();
}

// for test purposes
function clear() {
  initialRequestAlreadySent = false;
}

module.exports = {
  clear,
  requestLicensingData,
  requestLicensingDataIfLicensingIsAvailable,
  updateLicensingData
};
