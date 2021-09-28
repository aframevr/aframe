/* global assert, suite, test */
var device = require('utils').device;

suite('isTablet', function () {
  test('is true for Nexus 7 and Nexus 9', function () {
    var nexus7 = 'Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';
    var nexus9 = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 9 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.105 Safari/537.36';
    assert.ok(device.isTablet(nexus7));
    assert.ok(device.isTablet(nexus9));
  });

  test('is true for Samsung tablets (eg Galaxy Tab 7)', function () {
    const galaxyTab7Chrome = 'Mozilla/5.0 (Linux; Android 11; SM-T970) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';
    const galaxTab7SamsungBrowser = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/15.0 Chrome/90.0.4430.210 Safari/537.36';

    assert.ok(device.isTablet(galaxyTab7Chrome));
    assert.ok(device.isTablet(galaxTab7SamsungBrowser));
  });

});

suite('environment', function () {
  test('isNodeEnvironment is false for browser tests', function () {
    assert.strictEqual(device.isNodeEnvironment, false);
  });

  test('isBrowserEnvironment is true for browser tests', function () {
    assert.strictEqual(device.isBrowserEnvironment, true);
  });
});
