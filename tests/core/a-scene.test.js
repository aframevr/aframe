/* global assert, process, setup, suite, test, THREE */
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

  suite('setActiveCamera', function () {
    test('sets a new active THREE camera', function () {
      var camera = new THREE.PerspectiveCamera(45, 2, 1, 1000);
      this.el.setActiveCamera(camera);
      assert.equal(this.el.camera, camera);
    });

    test('sets a new active THREE camera', function (done) {
      var self = this;
      var cameraEl = document.createElement('a-entity');
      cameraEl.setAttribute('camera', '');
      this.el.appendChild(cameraEl);
      cameraEl.addEventListener('loaded', function () {
        self.el.setActiveCamera(cameraEl);
        assert.equal(self.el.camera, cameraEl.components.camera.camera);
        done();
      });
    });
  });

  suite('setupCanvas', function () {
    test('adds canvas to a-scene element by default', function (done) {
      assert.notOk(this.el.querySelector('canvas'));
      this.el.setupCanvas();
      process.nextTick(function () {
        assert.ok(this.el.querySelector('canvas'));
        done();
      }.bind(this));
    });

    test('reuses existing canvas when selector is given', function (done) {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('id', 'canvas');
      document.body.appendChild(canvas);
      assert.notOk(canvas.classList.contains('a-canvas'));

      this.el.setAttribute('canvas', '#canvas');
      this.el.setupCanvas();
      process.nextTick(function () {
        assert.ok(canvas.classList.contains('a-canvas'));
        assert.notOk(this.el.querySelector('canvas'));
        done();
      }.bind(this));
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
      el.addEventListener('renderstart', function () {
        done();
      });
    });
  });

  suite('attachedCallback', function () {
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
      document.body.removeChild(el);
      process.nextTick(function () {
        assert.notOk(el.animationFrameID);
        assert.ok(cancelSpy.calledWith(animationFrameID));
        done();
      });
    });

    test('does not destroy document.body', function (done) {
      var el = this.el;
      document.body.removeChild(el);
      process.nextTick(function () {
        assert.ok(document.body);
        done();
      });
    });
  });
});
