const fs = require("fs")

module.exports = class CECControlStrategy {

  /**
   * In case of CEC, this checks that cec-client command exists.
   */
  checkConfigured() {
    return new Promise((resolve, reject) =>
    {
      fs.stat("/usr/bin/cec-client", err =>
      {
        if (err) {
          reject(Error('cec-utils not installed in Operating System'));
        }
        else {
          resolve();
        }
      });
    });
  }

}
