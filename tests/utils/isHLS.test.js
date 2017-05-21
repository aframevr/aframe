/* global assert, suite, test */
var isHLS = require('utils').material.isHLS;

suite('utils.isHLS', function () {
  test('survives falsy input (negative)', function () {
    assert.equal(isHLS(undefined, undefined), false);
    assert.equal(isHLS('', ''), false);
    assert.equal(isHLS(null, null), false);
    assert.equal(isHLS(0, 0), false);
  });

  test('type application/x-mpegurl', function () {
    assert.equal(isHLS(undefined, 'application/x-mpegurl'), true);
  });

  test('type application/x-mpegURL', function () {
    assert.equal(isHLS(undefined, 'application/x-mpegURL'), true);
  });

  test('type application/vnd.apple.mpegurl', function () {
    assert.equal(isHLS(undefined, 'application/vnd.apple.mpegurl'), true);
  });

  test('type application/x-mpegurl even if src says .mp4', function () {
    assert.equal(isHLS('dummy.mp4', 'application/x-mpegurl'), true);
  });

  test('src containing .mp4 (negative)', function () {
    assert.equal(isHLS('dummy.mp4', ''), false);
  });

  test('src containing .m3u8', function () {
    assert.equal(isHLS('dummy.m3u8', ''), true);
  });

  test('src containing .M3U8', function () {
    assert.equal(isHLS('dummy.M3U8', ''), true);
  });
});
