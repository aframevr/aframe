/* eslint-env mocha */
'use strict';

const path = require('path');
const assert = require('chai').assert;
const jsdom = require('jsdom');

suite('node acceptance tests', function () {
  setup(function () {
    let _window = global.window = new jsdom.JSDOM().window;
    global.navigator = _window.navigator;
    global.document = _window.document;
    global.screen = {};
    global.HTMLElement = _window.Element;
    global.window.customElements = {define: function () {}};
  });

  teardown(function () {
    delete global.window;
    delete global.navigator;
    delete global.document;
    delete global.screen;
  });

  test('can run in node', function () {
    let aframe = require(path.join(process.cwd(), 'src'));

    assert.ok(aframe.version);
  });

  suite('environment', function () {
    let aframe;

    setup(function () {
      aframe = require(path.join(process.cwd(), 'src'));
    });

    test('isNodeEnvironment is true for node', function () {
      assert.strictEqual(aframe.utils.device.isNodeEnvironment, true);
    });

    test('isBrowserEnvironment is false for node', function () {
      assert.strictEqual(aframe.utils.device.isBrowserEnvironment, false);
    });
  });
});
