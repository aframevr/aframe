/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

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

    test('updates light', function () {
      var el = this.el;
      el.setAttribute('light', 'color: #F0F');
      assert.shallowDeepEqual(el.object3D.children[0].color,
                              {r: 1, g: 0, b: 1});
    });

    test('does not recreate light for basic updates', function () {
      var el = this.el;
      var uuid = el.object3D.children[0].uuid;
      el.setAttribute('light', 'color: #F0F');
      assert.equal(el.object3D.children[0].uuid, uuid);
    });

    test('can switch between types of light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: ambient');
      assert.equal(el.object3D.children[0].type, 'AmbientLight');
    });
  });

  suite('getLight', function () {
    test('can get ambient light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: ambient');
      assert.equal(el.object3D.children[0].type, 'AmbientLight');
    });

    test('can get directional light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: directional');
      assert.equal(el.object3D.children[0].type, 'DirectionalLight');
    });

    test('can get hemisphere light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: hemisphere');
      assert.equal(el.object3D.children[0].type, 'HemisphereLight');
    });

    test('can get point light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: point');
      assert.equal(el.object3D.children[0].type, 'PointLight');
    });

    test('can get spot light', function () {
      var el = this.el;
      var light;
      el.setAttribute('light', 'type: spot; angle: 180');
      light = el.object3D.children[0];
      assert.equal(light.type, 'SpotLight');
      assert.equal(light.angle, Math.PI);
    });

    test('handles invalid type', function () {
      var el = this.el;
      el.setAttribute('light', 'type: black');
      assert.equal(el.object3D.children[0].type, 'DirectionalLight');
    });
  });

  suite('remove', function () {
    test('removes light', function () {
      var el = this.el;
      el.removeAttribute('light');
      assert.equal(el.object3D.children.length, 0);
    });
  });
});
