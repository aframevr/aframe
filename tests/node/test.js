/* eslint-env mocha */
'use strict';

const assert = require('assert');

suite('node acceptance tests', function () {
  setup(function () {
    this.jsdomCleanup = require('jsdom-global')();
    global.customElements = { define: function () {} };
  });

  teardown(function () {
    delete global.customElements;
    this.jsdomCleanup();
  });

  test('can run in node', function () {
    const aframe = require('aframe');

    assert.ok(aframe.version);
  });

  suite('environment', function () {
    let aframe;

    setup(function () {
      aframe = require('aframe');
    });

    test('isNodeEnvironment is true for node', function () {
      assert.strictEqual(aframe.utils.device.isNodeEnvironment, true);
    });

    test('isBrowserEnvironment is false for node', function () {
      assert.strictEqual(aframe.utils.device.isBrowserEnvironment, false);
    });
  });
});
