/* global assert, process, setup, suite, test, teardown */
let entityFactory = require('../../helpers').entityFactory;
let utils = require('index').utils;

let PERMISSION_DIALOG_CLASSES = ['.a-modal', '.a-dialog', '.a-dialog-allow-button', '.a-dialog-deny-button'];
let ALERT_DIALOG_CLASSES = ['.a-modal', '.a-dialog', '.a-dialog-ok-button'];

suite('device-orientation-permission-ui', function () {
  suite('device permission dialog', function () {
    setup(function (done) {
      this.entityEl = entityFactory();
      let el = this.el = this.entityEl.parentNode;
      window.DeviceOrientationEvent = {
        requestPermission: function () { return Promise.reject(); }
      };
      el.addEventListener('loaded', function () { done(); });
    });

    test('appends permission dialog', function (done) {
      let scene = this.el;
      process.nextTick(function () {
        PERMISSION_DIALOG_CLASSES.forEach(function (uiClass) {
          assert.equal(scene.querySelectorAll(uiClass).length, 1);
          done();
        });
      });
    });
  });

  suite('desktop request permission dialog', function () {
    setup(function (done) {
      this.entityEl = entityFactory();
      let el = this.el = this.entityEl.parentNode;
      this.sinon.stub(utils.device, 'isMobileDeviceRequestingDesktopSite').returns(true);
      el.addEventListener('loaded', function () { done(); });
    });

    test('appends UI', function () {
      let scene = this.el;
      ALERT_DIALOG_CLASSES.forEach(function (uiClass) {
        assert.equal(scene.querySelectorAll(uiClass).length, 1);
      });
    });
  });

  teardown(function () {
    window.DeviceOrientationEvent = undefined;
  });
});
