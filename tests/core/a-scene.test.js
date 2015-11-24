/* global assert, process, setup, suite, test */
'use strict';
var helpers = require('../helpers');
var AScene = require('core/a-scene');

/**
 * Tests in this suite should not involve WebGL contexts or renderer.
 * They operate with the assumption that attachedCallback is stubbed.
 *
 * Add tests that involve the renderer to the suite at the bottom that is meant
 * to only be run locally since WebGL contexts break CI due to the headless
 * environment.
 */
suite('a-scene (without renderer)', function () {
  setup(function () {
    var el = this.el = document.createElement('a-scene');
    document.body.appendChild(el);
  });

  suite('createdCallback', function () {
    test('initializes scene object', function () {
      assert.equal(this.el.object3D.type, 'Scene');
    });

    test('reuses scene object', function () {
      var anotherEl = document.createElement('a-scene');
      document.body.appendChild(anotherEl);
      assert.equal(anotherEl.object3D.uuid, this.el.object3D.uuid);
    });
  });

  suite('attachFullscreenListeners', function (done) {
    test('does not break', function (done) {
      this.el.attachFullscreenListeners();
      process.nextTick(function () {
        done();
      });
    });
  });

  suite('attachMessageListeners', function () {
    test('does not break', function (done) {
      this.el.attachMessageListeners();
      process.nextTick(function () {
        done();
      });
    });
  });

  suite('setupCanvas', function () {
    test('adds canvas', function (done) {
      assert.notOk(document.querySelector('canvas'));
      this.el.setupCanvas();
      process.nextTick(function () {
        assert.ok(document.querySelector('canvas'));
        done();
      });
    });
  });

  suite('setupDefaultLights', function () {
    test('adds lights to scene', function (done) {
      var el = this.el;
      assert.notOk(document.querySelectorAll('[light]').length);
      el.setupDefaultLights();
      process.nextTick(function () {
        assert.ok(document.querySelectorAll('[light]').length);
        done();
      });
    });

    test('removes default lights when more lights are added', function (done) {
      var el = this.el;
      var light = document.createElement('a-entity');
      light.setAttribute('light', '');

      el.setupDefaultLights();
      process.nextTick(function () {
        el.appendChild(light);
        setTimeout(function () {
          assert.notOk(
            document.querySelectorAll('[data-aframe-default-light]').length);
          done();
        });
      });
    });
  });
});

/**
 * Skipped on CI using environment variable defined in the npm test script.
 */
helpers.getSkipCISuite()('a-scene (with renderer)', function () {
  setup(function (done) {
    var el;
    var self = this;
    AScene.prototype.attachedCallback.restore();
    process.nextTick(function () {
      el = self.el = document.createElement('a-scene');
      document.body.appendChild(el);
      el.addEventListener('loaded', function () {
        done();
      });
    });
  });

  suite('attachedCallback', function () {
    test('sets up camera', function () {
      assert.equal(document.querySelectorAll('[camera]').length, 1);
    });

    test('sets up meta tags', function () {
      assert.ok(document.querySelector('meta[name="viewport"]'));
    });

    test('sets up renderer', function () {
      assert.ok(this.el.renderer);
    });
  });

  suite('detachedCallback', function () {
    test('cancels request animation frame', function (done) {
      var el = this.el;
      var animationFrameID = el.animationFrameID;
      var cancelSpy = this.sinon.spy(window, 'cancelAnimationFrame');

      assert.ok(el.animationFrameID);
      el.parentNode.removeChild(el);
      process.nextTick(function () {
        assert.notOk(el.animationFrameID);
        assert.ok(cancelSpy.calledWith(animationFrameID));
        done();
      });
    });
  });
});
