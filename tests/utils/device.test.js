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

suite('isIOSOlderThan10', function () {
  test('is true for versions 7, 8, 9', function () {
    var v7 = `Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1
             (KHTML, like Gecko) CriOS/30.0.1599.12 Mobile/11A465 Safari/8536.25
             (3B92C18B-D9DE-4CB7-A02A-22FD2AF17C8F)`;
    var v8 = `Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4
              (KHTML, like Gecko) Version/8.0 Mobile/12F70 Safari/600.1.4`;
    var v9 = `Mozilla/5.0 (iPad; CPU OS 9_0 like Mac OS X) AppleWebKit/601.1.17
              (KHTML, like Gecko) Version/8.0 Mobile/13A175 Safari/600.1.4`;
    assert.ok(device.isIOSOlderThan10(v7));
    assert.ok(device.isIOSOlderThan10(v8));
    assert.ok(device.isIOSOlderThan10(v9));
  });

  test('is false for version 10, 11, 12', function () {
    var v10 = `Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38
              (KHTML, like Gecko) Version/10.0 Mobile/14A5297c Safari/602.1`;
    var v11 = `Mozilla/5.0 (iPhone; CPU iPhone OS 11_1 like Mac OS X) AppleWebKit/602.1.38
              (KHTML, like Gecko) Version/11.0 Mobile/14A5297c Safari/602.1`;
    var v12 = `Mozilla/5.0 (iPhone; CPU iPhone OS 12_7 like Mac OS X) AppleWebKit/602.1.38
              (KHTML, like Gecko) Version/12.0 Mobile/14A5297c Safari/602.1`;
    assert.notOk(device.isIOSOlderThan10(v10));
    assert.notOk(device.isIOSOlderThan10(v11));
    assert.notOk(device.isIOSOlderThan10(v12));
  });
});
