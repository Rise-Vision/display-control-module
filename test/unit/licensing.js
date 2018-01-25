/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const config = require("../../src/config");
const licensing = require("../../src/licensing");
const logger = require("../../src/logger");

describe("Licensing - Unit", ()=> {

  beforeEach(() => {
    simple.mock(logger, "all").returnWith();
  });

  afterEach(()=> config.clear());

  it("should be authorized if Rise Player Professional is active", () => {
    const message = {
      from: 'licensing',
      topic: 'licensing-update',
      subscriptions: {
        c4b368be86245bf9501baaa6e0b00df9719869fd: {
          active: true, timestamp: 100
        },
        b0cba08a4baa0c62b8cdc621b6f6a124f89a03db: {
          active: true, timestamp: 100
        }
      }
    };

    licensing.updateLicensingData(message);

    assert(config.isAuthorized());

    assert(logger.all.called);
    assert.equal(logger.all.lastCall.args[0], "authorized");
  });

  it("should not be authorized if Rise Player Professional is not active", () => {
    const message = {
      from: 'licensing',
      topic: 'licensing-update',
      subscriptions: {
        c4b368be86245bf9501baaa6e0b00df9719869fd: {
          active: false, timestamp: 100
        },
        b0cba08a4baa0c62b8cdc621b6f6a124f89a03db: {
          active: true, timestamp: 100
        }
      }
    };

    licensing.updateLicensingData(message);

    assert(!config.isAuthorized());

    assert(logger.all.called);
    assert.equal(logger.all.lastCall.args[0], "not_authorized");
  });

  it("should not be authorized if Rise Player Professional is not present", () => {
    const message = {
      from: 'licensing',
      topic: 'licensing-update',
      subscriptions: {
        b0cba08a4baa0c62b8cdc621b6f6a124f89a03db: {
          active: true, timestamp: 100
        }
      }
    };

    licensing.updateLicensingData(message);

    assert(!config.isAuthorized());

    assert(!logger.all.called);
  });

  it("should log only if there are update changes", () => {
    {
      const message = {
        from: 'licensing',
        topic: 'licensing-update',
        subscriptions: {
          c4b368be86245bf9501baaa6e0b00df9719869fd: {
            active: false, timestamp: 100
          }
        }
      };

      licensing.updateLicensingData(message);

      assert(!config.isAuthorized());

      assert(logger.all.called);
      assert.equal(logger.all.callCount, 1);
      assert.equal(logger.all.lastCall.args[0], "not_authorized");
    }

    {
      const message = {
        from: 'licensing',
        topic: 'licensing-update',
        subscriptions: {
          c4b368be86245bf9501baaa6e0b00df9719869fd: {
            active: false, timestamp: 200
          }
        }
      };

      licensing.updateLicensingData(message);

      assert(!config.isAuthorized());

      // should not be logged again
      assert.equal(logger.all.callCount, 1);
    }

    {
      const message = {
        from: 'licensing',
        topic: 'licensing-update',
        subscriptions: {
          c4b368be86245bf9501baaa6e0b00df9719869fd: {
            active: true, timestamp: 300
          }
        }
      };

      licensing.updateLicensingData(message);

      assert(config.isAuthorized());

      assert.equal(logger.all.callCount, 2);
      assert.equal(logger.all.lastCall.args[0], "authorized");
    }

    {
      const message = {
        from: 'licensing',
        topic: 'licensing-update',
        subscriptions: {
          c4b368be86245bf9501baaa6e0b00df9719869fd: {
            active: true, timestamp: 400
          }
        }
      };

      licensing.updateLicensingData(message);

      assert(config.isAuthorized());

      // should not be logged again
      assert.equal(logger.all.callCount, 2);
    }
  });

});
