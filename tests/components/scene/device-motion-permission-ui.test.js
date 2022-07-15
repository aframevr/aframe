/* global assert, process, setup, suite, test, teardown */
var entityFactory = require('../../helpers').entityFactory;

var PERMISSION_DIALOG_CLASSES = ['.a-modal', '.a-dialog', '.a-dialog-allow-button', '.a-dialog-deny-button'];

suite('device-orientation-permission-ui', function () {
  suite('device permission dialog', function () {
    setup(function (done) {
      this.entityEl = entityFactory();
      var el = this.el = this.entityEl.parentNode;
      window.DeviceOrientationEvent = {
        requestPermission: function () { return Promise.reject(); }
      };
      el.addEventListener('deviceorientationpermissiongranted', function () {
        assert.fail('Received permissiongranted too soon.');
      });
      el.addEventListener('deviceorientationpermissionrejected', function () {
        assert.fail('Received permissionrejected too soon.');
      });
      el.addEventListener('loaded', function () {
        done();
      });
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

  teardown(function () {
    window.DeviceOrientationEvent = undefined;
  });
});
