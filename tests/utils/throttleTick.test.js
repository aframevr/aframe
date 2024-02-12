/* global assert, suite, test */
import { throttleTick } from 'utils/index.js';

suite('utils.throttleTick', function () {
  var ts;
  var dts;
  var interval = 1000;
  var functionToThrottle = function (t, dt) { ts.push(t); dts.push(dt); };
  var throttleTickFn = throttleTick(functionToThrottle, interval);
  var arbitraryLargeTime = 987634578;
  var arbitraryLargeDelta = 12345;

  test('fires callback on first tick whatever', function () {
    ts = [];
    dts = [];
    assert.equal(ts.length, 0);
    assert.equal(dts.length, 0);
    throttleTickFn = throttleTick(functionToThrottle, interval);
    throttleTickFn(arbitraryLargeTime, arbitraryLargeDelta);
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
    throttleTickFn = throttleTick(function (t, dt) { ts.push(t); dts.push(dt); }, interval);
    throttleTickFn(0, arbitraryLargeDelta);
    assert.equal(ts.length, 1);
    assert.equal(ts[0], 0);
    assert.equal(dts.length, 1);
    assert.equal(dts[0], arbitraryLargeDelta);
  });

  test('does not fire callback on ticks too soon', function () {
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

  test('does fire callback on ticks after enough', function () {
    var tlen = ts.length;
    var dtlen = dts.length;
    assert.equal(ts.length, dts.length);
    throttleTickFn(interval);
    assert.equal(ts.length, tlen + 1);
    assert.ok(ts[tlen] - ts[tlen - 1] >= interval);
    assert.equal(dts.length, dtlen + 1);
    assert.ok(ts[tlen] - ts[tlen - 1] === dts[tlen]);
  });

  test('fires only one callback on multiply late ticks', function () {
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

  test('binds function if context given', function () {
    var obj = {};
    obj.functionToThrottle = function (t, dt) { this.t = t; this.dt = dt; };
    var spy = this.sinon.spy(obj, 'functionToThrottle');
    obj.functionToThrottle = throttleTick(obj.functionToThrottle, interval, obj);
    obj.functionToThrottle(arbitraryLargeTime, arbitraryLargeDelta);
    assert.ok(spy.calledOnce);
    assert.ok(spy.calledWith(arbitraryLargeTime, arbitraryLargeDelta));
    assert.equal(obj.t, arbitraryLargeTime);
    assert.equal(obj.dt, arbitraryLargeDelta);
  });
});
