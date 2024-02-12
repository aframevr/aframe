/* global assert, suite, test */
import { device } from 'utils/index.js';

suite('isTablet', function () {
  test('is true for Nexus 7 and Nexus 9', function () {
    var nexus7 = 'Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';
    var nexus9 = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 9 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.105 Safari/537.36';
    assert.ok(device.isTablet(nexus7));
    assert.ok(device.isTablet(nexus9));
  });
});

suite('isIpad', function () {
  test('is true for iPad', function () {
    var iPadUserAgent = 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1';
    var platform = 'iPad';
    var maxTouchPoints = 5;
    assert.ok(device.isIpad(iPadUserAgent, platform, maxTouchPoints));
  });

  test('is true for MacIntel with touch capabilities', function () {
    var macUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15';
    var platform = 'MacIntel';
    var maxTouchPoints = 5;
    assert.ok(device.isIpad(macUserAgent, platform, maxTouchPoints));
  });

  test('is false for MacIntel with no touch capabilities', function () {
    var macUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15';
    var platform = 'MacIntel';
    var maxTouchPoints = 0;
    assert.ok(!device.isIpad(macUserAgent, platform, maxTouchPoints));
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
