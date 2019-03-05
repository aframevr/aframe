/* global assert, suite, test */
var device = require('utils').device;

suite('isTablet', function () {
  test('is true for Nexus 7 and Nexus 9', function () {
    var nexus7 = 'Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';
    var nexus9 = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 9 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.105 Safari/537.36';
    assert.ok(device.isTablet(nexus7));
    assert.ok(device.isTablet(nexus9));
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
