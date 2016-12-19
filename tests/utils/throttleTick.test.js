/* global assert, suite, test */
var throttleTick = require('utils').throttleTick;

suite('utils.throttleTick', function () {
  var ts;
  var dts;
  var interval = 1000;
  var throttleTickFn = throttleTick(function (t, dt) { ts.push(t); dts.push(dt); }, interval);

  test('utils.throttleTick fires callback on first tick whatever', function () {
    ts = [];
    dts = [];
    assert.equal(ts.length, 0);
    assert.equal(dts.length, 0);
    throttleTickFn = throttleTick(function (t, dt) { ts.push(t); dts.push(dt); }, interval);
    throttleTickFn(987634578, 12345);
    assert.equal(ts.length, 1);
    assert.equal(ts[0], 987634578);
    assert.equal(dts.length, 1);
    assert.equal(dts[0], 12345);
  });

  test('utils.throttleTick fires callback on first tick zero', function () {
    ts = [];
    dts = [];
    assert.equal(ts.length, 0);
    assert.equal(dts.length, 0);
    throttleTickFn = throttleTick(function (t, dt) { ts.push(t); dts.push(dt); }, interval);
    throttleTickFn(0, 34586);
    assert.equal(ts.length, 1);
    assert.equal(ts[0], 0);
    assert.equal(dts.length, 1);
    assert.equal(dts[0], 34586);
  });

  test('utils.throttleTick does not fire callback on ticks too soon', function () {
    var tlen = ts.length;
    var dtlen = dts.length;
    assert.equal(ts.length, dts.length);
    throttleTickFn(1);
    assert.equal(ts.length, tlen);
    assert.equal(dts.length, dtlen);
    throttleTickFn(interval / 2);
    assert.equal(ts.length, tlen);
    assert.equal(dts.length, dtlen);
    throttleTickFn(interval - 1);
    assert.equal(ts.length, tlen);
    assert.equal(dts.length, dtlen);
  });

  test('utils.throttleTick does fire callback on ticks after enough', function () {
    var tlen = ts.length;
    var dtlen = dts.length;
    assert.equal(ts.length, dts.length);
    throttleTickFn(interval);
    assert.equal(ts.length, tlen + 1);
    assert.ok(ts[tlen] - ts[tlen - 1] >= interval);
    assert.equal(dts.length, dtlen + 1);
    assert.ok(ts[tlen] - ts[tlen - 1] === dts[tlen]);
  });

  test('utils.throttleTick fires only one callback on multiply late ticks', function () {
    var tlen = ts.length;
    var dtlen = dts.length;
    assert.equal(ts.length, dts.length);
    throttleTickFn(interval * 5);
    assert.equal(ts.length, tlen + 1);
    assert.ok(ts[tlen] - ts[tlen - 1] >= interval);
    assert.equal(dts.length, dtlen + 1);
    assert.ok(ts[tlen] - ts[tlen - 1] === dts[tlen]);
    throttleTickFn(interval * 9);
    assert.equal(ts.length, tlen + 2);
    assert.ok(ts[tlen + 1] - ts[tlen] >= interval);
    assert.equal(dts.length, dtlen + 2);
    assert.ok(ts[tlen + 1] - ts[tlen] === dts[tlen + 1]);
  });
});
