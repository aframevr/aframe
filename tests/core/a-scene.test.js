/* global assert, process, sinon, setup, suite, teardown, test, THREE */
'use strict';
var helpers = require('../helpers');
var AEntity = require('core/a-entity');
var ANode = require('core/a-node');
var AScene = require('core/scene/a-scene');

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
    var el;
    el = this.el = document.createElement('a-scene');
    el.setAttribute('canvas', '');
    document.body.appendChild(el);
  });

  teardown(function () {
    document.body.removeChild(this.el);
  });

  suite('createdCallback', function () {
    test('initializes scene object', function () {
      assert.equal(this.el.object3D.type, 'Scene');
    });
  });

  suite('init', function () {
    test('initializes scene object', function () {
      var sceneEl = this.el;
      sceneEl.behaviors = ['dummy'];
      sceneEl.materials = {dummy: 1};
      sceneEl.paused = false;
      sceneEl.hasLoaded = true;
      sceneEl.init();
      assert.equal(sceneEl.behaviors.length, 0);
      assert.equal(Object.keys(sceneEl.materials).length, 0);
      assert.equal(sceneEl.paused, true);
      assert.equal(sceneEl.hasLoaded, false);
    });
  });

  suite('reload', function () {
    test('reload scene innerHTML to original value', function () {
      var sceneEl = this.el;
      sceneEl.innerHTML = 'NEW';
      sceneEl.reload();
      assert.ok(sceneEl.innerHTML, '');
    });

    test('reloads the scene and pauses', function () {
      var sceneEl = this.el;
      this.sinon.spy(AEntity.prototype, 'pause');
      this.sinon.spy(ANode.prototype, 'load');
      sceneEl.reload(true);
      sinon.assert.called(AEntity.prototype.pause);
      sinon.assert.called(ANode.prototype.load);
    });
  });

  suite('setActiveCamera', function () {
    test('sets new active camera in three.js graph', function () {
      var el = this.el;
      var camera = new THREE.PerspectiveCamera(45, 2, 1, 1000);
      el.setActiveCamera(camera);
      assert.equal(el.camera, camera);
    });

    test('sets new active camera in entity graph', function (done) {
      var self = this;
      var cameraEl = document.createElement('a-entity');
      cameraEl.setAttribute('camera', '');
      this.el.appendChild(cameraEl);
      process.nextTick(function () {
        self.el.setActiveCamera(cameraEl);
        assert.equal(self.el.camera, cameraEl.components.camera.camera);
        done();
      });
    });
  });

  suite('setActiveCamera', function () {
    test('switches active camera', function (done) {
      var sceneEl = this.el;
      var camera1El = document.createElement('a-entity');
      var camera2El = document.createElement('a-entity');
      camera1El.setAttribute('camera', 'active: false');
      sceneEl.appendChild(camera1El);
      camera2El.setAttribute('camera', 'active: true');
      sceneEl.appendChild(camera2El);
      process.nextTick(function () {
        assert.equal(camera1El.getAttribute('camera').active, false);
        sceneEl.setActiveCamera(camera1El);
        assert.equal(camera1El.getAttribute('camera').active, true);
        assert.equal(camera2El.getAttribute('camera').active, false);
        done();
      });
    });
  });

  suite('removeDefaultCamera', function () {
    test('removes the default camera', function () {
      var sceneEl = this.el;
      var defaultCamera;
      sceneEl.setupDefaultCamera();
      defaultCamera = sceneEl.querySelector('[data-aframe-default-camera]');
      assert.notEqual(defaultCamera, null);
      // Mocks camera initialization
      sceneEl.camera = { el: true };
      sceneEl.removeDefaultCamera();
      defaultCamera = sceneEl.querySelector('[data-aframe-default-camera]');
      assert.equal(defaultCamera, null);
    });
  });

  suite('updateCameras', function () {
    test('disable inactive cameras', function (done) {
      var sceneEl = this.el;
      var cameraEl = document.createElement('a-entity');
      cameraEl.setAttribute('camera', 'active: false');
      sceneEl.appendChild(cameraEl);

      var camera2El = document.createElement('a-entity');
      camera2El.setAttribute('camera', 'active: false');
      sceneEl.appendChild(camera2El);

      process.nextTick(function () {
        cameraEl.setAttribute('camera', 'active: true');
        camera2El.setAttribute('camera', 'active: true');
        assert.equal(cameraEl.getAttribute('camera').active, false);
        assert.equal(camera2El.getAttribute('camera').active, true);
        assert.equal(camera2El.components.camera.camera, sceneEl.camera);
        done();
      });
    });
  });

  suite('setupDefaultLights', function () {
    setup(function () {
      var el = this.el;
      var lights = el.querySelectorAll('[light]');
      var i;
      for (i = 0; i < lights.length; ++i) {
        el.removeChild(lights[i]);
      }
    });

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
    AScene.prototype.setupRenderer.restore();
    AScene.prototype.resize.restore();
    AScene.prototype.render.restore();
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

  test('calls behaviors', function () {
    var scene = this.el;
    var Component = { el: { paused: false }, tick: function () {} };
    this.sinon.spy(Component, 'tick');
    scene.addBehavior(Component);
    scene.render();
    sinon.assert.called(Component.tick);
    sinon.assert.calledWith(Component.tick, scene.time);
  });
});
