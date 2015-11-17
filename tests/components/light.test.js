/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers.js').entityFactory;

suite('light', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('light', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('creates light', function () {
      assert.equal(this.el.object3D.children[0].type, 'DirectionalLight');
    });

    test('updates light', function (done) {
      var el = this.el;
      el.setAttribute('light', 'color: #F0F');
      process.nextTick(function () {
        assert.shallowDeepEqual(el.object3D.children[0].color,
                               {r: 1, g: 0, b: 1});
        done();
      });
    });

    test('does not recreate light for basic updates', function (done) {
      var el = this.el;
      var uuid = el.object3D.children[0].uuid;
      el.setAttribute('light', 'color: #F0F');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].uuid, uuid);
        done();
      });
    });

    test('can switch between types of light', function (done) {
      var el = this.el;
      el.setAttribute('light', 'type: ambient');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].type, 'AmbientLight');
        done();
      });
    });
  });

  suite('getLight', function () {
    test('can get ambient light', function (done) {
      var el = this.el;
      el.setAttribute('light', 'type: ambient');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].type, 'AmbientLight');
        done();
      });
    });

    test('can get directional light', function (done) {
      var el = this.el;
      el.setAttribute('light', 'type: directional');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].type, 'DirectionalLight');
        done();
      });
    });

    test('can get hemisphere light', function (done) {
      var el = this.el;
      el.setAttribute('light', 'type: hemisphere');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].type, 'HemisphereLight');
        done();
      });
    });

    test('can get point light', function (done) {
      var el = this.el;
      el.setAttribute('light', 'type: point');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].type, 'PointLight');
        done();
      });
    });

    test('can get spot light', function (done) {
      var el = this.el;
      el.setAttribute('light', 'type: spot');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].type, 'SpotLight');
        done();
      });
    });

    test('handles invalid type', function (done) {
      var el = this.el;
      el.setAttribute('light', 'type: black');
      process.nextTick(function () {
        assert.equal(el.object3D.children[0].type, 'DirectionalLight');
        done();
      });
    });
  });

  suite('remove', function () {
    test('removes light', function (done) {
      var el = this.el;
      el.removeAttribute('light');
      setTimeout(function () {
        assert.equal(el.object3D.children.length, 0);
        done();
      });
    });
  });
});
