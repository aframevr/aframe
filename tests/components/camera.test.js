/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('camera', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('camera', '');
    process.nextTick(function () {
      done();
    });
  });

  suite('init', function () {
    test('adds a camera', function () {
      assert.equal(this.el.object3D.children[0].type, 'PerspectiveCamera');
    });

    test('sets sceneEl.camera', function () {
      var el = this.el;
      el.setAttribute('camera', 'active: true');
      assert.equal(el.sceneEl.camera, el.components.camera.camera);
    });
  });

  suite('update', function () {
    test('updates camera object3D', function () {
      var el = this.el;
      assert.notEqual(el.object3D.fov, 40);
      el.setAttribute('camera', 'fov: 65');
      assert.equal(el.object3D.children[0].fov, 65);
    });

    test('does not create a new camera object', function () {
      var el = this.el;
      var cameraId = el.object3D.children[0].uuid;
      el.setAttribute('camera', 'fov: 65');
      assert.equal(el.object3D.children[0].uuid, cameraId);
    });
  });
});
