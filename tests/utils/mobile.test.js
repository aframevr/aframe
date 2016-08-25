/* global assert, suite, test */
var utils = require('utils/');

suite('utils.mobile', function () {
  suite('isMobile', function () {
    test('includes GearVR', function () {
      var originalUa = navigator.userAgent;
      assert.notOk(utils.isMobile());
      navigator.__defineGetter__('userAgent', function () { return 'SamsungBrowser'; });
      assert.ok(utils.isMobile());
      navigator.__defineGetter__('userAgent', function () { return originalUa; });
    });
  });
});
