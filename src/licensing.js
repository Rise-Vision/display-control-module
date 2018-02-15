const licensing = require("common-display-module/licensing");

const config = require("./config");
const logger = require("./logger");

function requestLicensingData() {
  return licensing.requestLicensingData(config.moduleName)
  .catch(error => {
    logger.error(error.stack, 'Error while requesting licensing data');
  });
}

function updateLicensingData(data) {
  logger.file(data, "receiving licensing data");

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

module.exports = {requestLicensingData, updateLicensingData};
