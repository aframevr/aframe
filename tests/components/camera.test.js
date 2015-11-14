/* global assert, process, setup, sinon, suite, test */
var camera = require('components/camera').Component;
var VRObject = require('core/vr-object');

suite.only('camera', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('camera', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('init', function () {
    test('adds a camera', function () {
      assert.equal(this.el.object3D.children[0].type, 'PerspectiveCamera');
    });

    test('sets sceneEl.cameraEl', function () {
      assert.equal(this.el.sceneEl.cameraEl, this.el);
    });
  });

  suite('update', function () {
    test('updates camera object3D', function () {
      var el = this.el;
      assert.notEqual(el.object3D.fov, 40);
      el.setAttribute('camera', 'fov: 65');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].fov, 65);
      });
    });

    test('does not create a new camera object', function () {
      var el = this.el;
      var cameraId = el.object3D.children[0].uuid;
      el.setAttribute('camera', 'fov: 65');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].uuid, cameraId);
      });
    });
  });
});
