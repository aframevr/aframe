/* eslint-env mocha */
'use strict';

const path = require('path');
const assert = require('chai').assert;
const jsdom = require('jsdom');
const Module = require('module');
const sinon = require('sinon');

const _require = Module.prototype.require;

suite('node acceptance tests', function () {
  let sandbox;

  suiteSetup(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(Module.prototype, 'require', function () {
      if (arguments[0].indexOf('.css') === -1) {
        return _require.apply(this, arguments);
      }
    });
  });

  setup(function () {
    let _window = global.window = jsdom.jsdom().defaultView;
    global.navigator = _window.navigator;
    global.document = _window.document;
    global.HTMLElement = _window.HTMLElement;
    Object.defineProperty(_window, 'WebVRConfig', {
      get () {
        return global.WebVRConfig;
      },
      set (WebVRConfig) {
        global.WebVRConfig = WebVRConfig;
      }
    });
  });

  teardown(function () {
    delete global.window;
    delete global.document;
    delete global.HTMLElement;
    delete global.WebVRConfig;
  });

  suiteTeardown(function () {
    sandbox.restore();
  });

  test('can run in node', function () {
    let aframe = require(path.join(process.cwd(), 'src'));

    assert.ok(aframe.version);
  });
});
