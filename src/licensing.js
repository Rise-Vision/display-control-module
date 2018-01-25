const licensing = require("common-display-module/licensing");

const config = require("./config");
const logger = require("./logger");

function updateLicensingData(data) {
  if (licensing.containsSubscriptionDataForRisePlayerProfessional(data)) {
    const previousAuthorized = config.isAuthorized();
    const currentAuthorized = licensing.isRisePlayerProfessionalSubscriptionActive(data);

    // detect licensing change
    if (previousAuthorized !== currentAuthorized) {
      config.setAuthorized(currentAuthorized);

      logger.all(currentAuthorized ? 'authorized' : 'not_authorized');
    }
  }
}

module.exports = {updateLicensingData};
