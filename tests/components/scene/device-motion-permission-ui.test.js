/* global assert, process, setup, suite, test, teardown */
var entityFactory = require('../../helpers').entityFactory;
var utils = require('index').utils;

var PERMISSION_DIALOG_CLASSES = ['.a-modal', '.a-dialog', '.a-dialog-allow-button', '.a-dialog-deny-button'];
var ALERT_DIALOG_CLASSES = ['.a-modal', '.a-dialog', '.a-dialog-ok-button'];

suite('device-orientation-permission-ui', function () {
  suite('device permission dialog', function () {
    setup(function (done) {
      this.entityEl = entityFactory();
      var el = this.el = this.entityEl.parentNode;
      window.DeviceOrientationEvent = {
        requestPermission: function () { return Promise.reject(); }
      };
      el.addEventListener('loaded', function () { done(); });
    });

    test('appends permission dialog', function (done) {
      var scene = this.el;
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
      var el = this.el = this.entityEl.parentNode;
      this.sinon.stub(utils.device, 'isMobileDeviceRequestingDesktopSite').returns(true);
      el.addEventListener('loaded', function () { done(); });
    });

    test('appends UI', function () {
      var scene = this.el;
      ALERT_DIALOG_CLASSES.forEach(function (uiClass) {
        assert.equal(scene.querySelectorAll(uiClass).length, 1);
      });
    });
  });

  teardown(function () {
    window.DeviceOrientationEvent = undefined;
  });
});
