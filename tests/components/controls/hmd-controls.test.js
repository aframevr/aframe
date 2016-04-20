/* global assert, process, setup, suite, test */
'use strict';
var entityFactory = require('../../helpers').entityFactory;
var THREE = require('index').THREE;
var EPS = 10e-6;

suite('hmd-controls', function () {
  var hmd, hmdControls;

  setup(function (done) {
    var el = this.el = entityFactory();
    hmd = {
      dolly: null,
      update: this.sinon.spy(),
      dispose: this.sinon.spy()
    };
    this.sinon.stub(THREE, 'VRControls', function (dolly) {
      hmd.dolly = hmd.dolly || dolly;
      return hmd;
    });
    el.setAttribute('hmd-controls', '');
    el.addEventListener('loaded', function () {
      hmdControls = el.components['hmd-controls'];
      done();
    });
  });

  suite('isRotationActive', function () {
    test('not active by default', function () {
      assert.isFalse(hmdControls.isRotationActive());
    });

    test('active when HMD has rotated', function () {
      hmd.dolly.quaternion.set(Math.PI / 4, 0, 0, 1);
      assert.isTrue(hmdControls.isRotationActive());
    });

    test('inactive when disabled', function () {
      hmd.dolly.quaternion.set(Math.PI / 4, 0, 0, 1);
      this.el.setAttribute('hmd-controls', {enabled: false});
      assert.isFalse(hmdControls.isRotationActive());
    });
  });

  suite('getRotation', function () {
    test('returns HMD rotation', function () {
      hmd.dolly.quaternion.set(0.5, 0, 0, 0.8660254);
      var rotation = hmdControls.getRotation();
      assert.approximately(rotation.x, 60, EPS);
      assert.equal(rotation.y, 0);
      assert.equal(rotation.z, 0);
    });
  });

  suite('isVelocityActive', function () {
    test('not active by default', function () {
      assert.isFalse(hmdControls.isVelocityActive());
    });

    test('active when HMD has moved', function () {
      hmd.dolly.position.set(0, 0, 1);
      assert.isTrue(hmdControls.isVelocityActive());
    });

    test('inactive when disabled', function () {
      hmd.dolly.position.set(0, 0, 1);
      this.el.setAttribute('hmd-controls', {enabled: false});
      assert.isFalse(hmdControls.isVelocityActive());
    });
  });

  suite('getVelocity', function () {
    test('returns HMD velocity', function () {
      hmd.dolly.position.set(0, 0, 0);
      hmd.dolly.position.set(5, 0, 1);
      assert.shallowDeepEqual(hmdControls.getVelocity(), {x: 5, y: 0, z: 1});
    });
  });
});
