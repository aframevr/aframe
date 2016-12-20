/* global assert, suite, test */
var throttle = require('utils').throttle;

suite('utils.throttle', function () {
  var ts;
  var dts;
  var interval = 1000;
  var functionToThrottle = function (t, dt) { ts.push(t); dts.push(dt); };
  var throttleFn;
  var arbitraryLargeTime = 987634578;
  var arbitraryLargeDelta = 12345;

  test('fires callback on first tick whatever', function () {
    ts = [];
    dts = [];
    assert.equal(ts.length, 0);
    assert.equal(dts.length, 0);
    throttleFn = throttle(functionToThrottle, interval);
    throttleFn(arbitraryLargeTime, arbitraryLargeDelta);
    assert.equal(ts.length, 1);
    assert.equal(ts[0], arbitraryLargeTime);
    assert.equal(dts.length, 1);
    assert.equal(dts[0], arbitraryLargeDelta);
  });

  test('fires callback on first tick zero', function () {
    ts = [];
    dts = [];
    assert.equal(ts.length, 0);
    assert.equal(dts.length, 0);
    throttleFn = throttle(function (t, dt) { ts.push(t); dts.push(dt); }, interval);
    throttleFn(0, arbitraryLargeDelta);
    assert.equal(ts.length, 1);
    assert.equal(ts[0], 0);
    assert.equal(dts.length, 1);
    assert.equal(dts[0], arbitraryLargeDelta);
  });

  // need to wait for wall clock time, so skip this
  test.skip('does not fire callback on ticks too soon', function () {
    var tlen = ts.length;
    var dtlen = dts.length;
    assert.equal(ts.length, dts.length);
    throttleFn(1);
    assert.equal(ts.length, tlen);
    assert.equal(dts.length, dtlen);
    throttleFn(interval / 2);
    assert.equal(ts.length, tlen);
    assert.equal(dts.length, dtlen);
    throttleFn(interval - 1);
    assert.equal(ts.length, tlen);
    assert.equal(dts.length, dtlen);
  });

  // need to wait for wall clock time
  test('does fire callback on ticks after enough', function () {
    var tlen = ts.length;
    var dtlen = dts.length;
    assert.equal(ts.length, dts.length);
    setTimeout(function () {
      throttleFn(interval);
      assert.equal(ts.length, tlen + 1);
      assert.ok(ts[tlen] - ts[tlen - 1] >= interval);
      assert.equal(dts.length, dtlen + 1);
      assert.ok(ts[tlen] - ts[tlen - 1] === dts[tlen]);
    }, interval);
  });

  // need to wait for wall clock time, so skip this
  test.skip('fires only one callback on multiply late ticks', function () {
    var tlen = ts.length;
    var dtlen = dts.length;
    assert.equal(ts.length, dts.length);
    throttleFn(interval * 5);
    assert.equal(ts.length, tlen + 1);
    assert.ok(ts[tlen] - ts[tlen - 1] >= interval);
    assert.equal(dts.length, dtlen + 1);
    assert.ok(ts[tlen] - ts[tlen - 1] === dts[tlen]);
    throttleFn(interval * 9);
    assert.equal(ts.length, tlen + 2);
    assert.ok(ts[tlen + 1] - ts[tlen] >= interval);
    assert.equal(dts.length, dtlen + 2);
    assert.ok(ts[tlen + 1] - ts[tlen] === dts[tlen + 1]);
  });

  test('binds function if context given', function () {
    var obj = {};
    obj.functionToThrottle = function (t, dt) { this.t = t; this.dt = dt; };
    var spy = this.sinon.spy(obj, 'functionToThrottle');
    obj.functionToThrottle = throttle(obj.functionToThrottle, interval, obj);
    obj.functionToThrottle(arbitraryLargeTime, arbitraryLargeDelta);
    assert.ok(spy.calledOnce);
    assert.ok(spy.calledWith(arbitraryLargeTime, arbitraryLargeDelta));
    assert.equal(obj.t, arbitraryLargeTime);
    assert.equal(obj.dt, arbitraryLargeDelta);
  });
});
