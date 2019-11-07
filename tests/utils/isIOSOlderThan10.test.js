/* global assert, suite, test */
var isIOSOlderThan10 = require('utils/isIOSOlderThan10');

suite('isIOSOlderThan10', function () {
  test('is true for versions 7, 8, 9', function () {
    var v7 = `Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1
             (KHTML, like Gecko) CriOS/30.0.1599.12 Mobile/11A465 Safari/8536.25
             (3B92C18B-D9DE-4CB7-A02A-22FD2AF17C8F)`;
    var v8 = `Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4
              (KHTML, like Gecko) Version/8.0 Mobile/12F70 Safari/600.1.4`;
    var v9 = `Mozilla/5.0 (iPad; CPU OS 9_0 like Mac OS X) AppleWebKit/601.1.17
              (KHTML, like Gecko) Version/8.0 Mobile/13A175 Safari/600.1.4`;
    assert.ok(isIOSOlderThan10(v7));
    assert.ok(isIOSOlderThan10(v8));
    assert.ok(isIOSOlderThan10(v9));
  });

  test('is false for version 10, 11, 12', function () {
    var v10 = `Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38
              (KHTML, like Gecko) Version/10.0 Mobile/14A5297c Safari/602.1`;
    var v11 = `Mozilla/5.0 (iPhone; CPU iPhone OS 11_1 like Mac OS X) AppleWebKit/602.1.38
              (KHTML, like Gecko) Version/11.0 Mobile/14A5297c Safari/602.1`;
    var v12 = `Mozilla/5.0 (iPhone; CPU iPhone OS 12_7 like Mac OS X) AppleWebKit/602.1.38
              (KHTML, like Gecko) Version/12.0 Mobile/14A5297c Safari/602.1`;
    assert.notOk(isIOSOlderThan10(v10));
    assert.notOk(isIOSOlderThan10(v11));
    assert.notOk(isIOSOlderThan10(v12));
  });

  test('is false for webview', function () {
    var chromeiOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/70.0.3538.60 Mobile/15E148 Safari/605.1';
    assert.notOk(isIOSOlderThan10(chromeiOS));
  });
});
