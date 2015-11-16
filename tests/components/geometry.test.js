/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers.js').entityFactory;

suite('geometry', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('geometry', 'primitive: box');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('creates geometry', function () {
      assert.ok(this.el.object3D.geometry);
      assert.equal(this.el.object3D.geometry.type, 'BoxGeometry');
    });

    test('updates geometry', function (done) {
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      setTimeout(function () {
        assert.equal(el.object3D.geometry.parameters.width, 5);
        done();
      });
    });

    test('updates geometry for segment-related attribute', function (done) {
      var el = this.el;
      el.setAttribute('geometry', 'primitive: sphere');
      setTimeout(function () {
        el.setAttribute('geometry', 'primitive: sphere; segmentsWidth: 8');
        setTimeout(function () {
          assert.equal(el.object3D.geometry.parameters.widthSegments, 8);
          done();
        });
      });
    });

    test('can change type of geometry', function (done) {
      var el = this.el;
      el.setAttribute('geometry', 'primitive: sphere');
      process.nextTick(function () {
        assert.equal(el.object3D.geometry.type, 'SphereGeometry');
        el.setAttribute('geometry', 'primitive: box');
        setTimeout(function () {
          assert.equal(el.object3D.geometry.type, 'BoxGeometry');
          done();
        });
      });
    });

    suite('remove', function () {
      test('removes geometry', function (done) {
        var el = this.el;
        el.removeAttribute('geometry');
        setTimeout(function () {
          assert.notOk(el.object3D.geometry);
          done();
        });
      });
    });
  });

  suite('getGeometry', function () {
    test('creates circle geometry', function (done) {
      var el = this.el;
      var geometry;
      el.setAttribute(
        'geometry',
        'primitive: circle; radius: 5; segments: 4; thetaStart: 1; ' +
        'thetaLength: 2');
      setTimeout(function () {
        geometry = el.object3D.geometry;
        assert.equal(geometry.type, 'CircleGeometry');
        assert.equal(geometry.parameters.radius, 5);
        assert.equal(geometry.parameters.segments, 4);
        assert.equal(geometry.parameters.thetaStart, 1);
        assert.equal(geometry.parameters.thetaLength, 2);
        done();
      });
    });

    test('creates cylinder geometry', function (done) {
      var el = this.el;
      var geometry;
      el.setAttribute(
        'geometry',
        'primitive: cylinder; radius: 1; height: 2; segmentsRadius: 3; ' +
        'segmentsHeight: 4; openEnded: true; thetaStart: 3.1; thetaLength: 6');
      setTimeout(function () {
        geometry = el.object3D.geometry;
        assert.equal(geometry.type, 'CylinderGeometry');
        assert.equal(geometry.parameters.radiusBottom, 1);
        assert.equal(geometry.parameters.radiusTop, 1);
        assert.equal(geometry.parameters.height, 2);
        assert.equal(geometry.parameters.radialSegments, 3);
        assert.equal(geometry.parameters.heightSegments, 4);
        assert.equal(geometry.parameters.openEnded, true);
        assert.equal(geometry.parameters.thetaStart, 3.1);
        assert.equal(geometry.parameters.thetaLength, 6);
        done();
      });
    });

    test('creates plane geometry', function (done) {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', 'primitive: plane; width: 1; height: 2');
      setTimeout(function () {
        geometry = el.object3D.geometry;
        assert.equal(geometry.type, 'PlaneBufferGeometry');
        assert.equal(geometry.parameters.width, 1);
        assert.equal(geometry.parameters.height, 2);
        done();
      });
    });

    test('creates ring geometry', function (done) {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', 'primitive: ring; innerRadius: 1; ' +
                      'outerRadius: 2; segments: 3');
      setTimeout(function () {
        geometry = el.object3D.geometry;
        assert.equal(geometry.type, 'RingGeometry');
        assert.equal(geometry.parameters.innerRadius, 1);
        assert.equal(geometry.parameters.outerRadius, 2);
        assert.equal(geometry.parameters.thetaSegments, 3);
        done();
      });
    });

    test('creates sphere geometry', function (done) {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', 'primitive: sphere; radius: 1; ' +
                      'segmentsWidth: 2; segmentsHeight: 3');
      setTimeout(function () {
        geometry = el.object3D.geometry;
        assert.equal(geometry.type, 'SphereGeometry');
        assert.equal(geometry.parameters.radius, 1);
        assert.equal(geometry.parameters.widthSegments, 2);
        assert.equal(geometry.parameters.heightSegments, 3);
        done();
      });
    });

    test('creates torus geometry', function (done) {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', 'primitive: torus; radius: 1; ' +
                      'tube: 2; segments: 3; tubularSegments: 4; arc: 5.1');
      setTimeout(function () {
        geometry = el.object3D.geometry;
        assert.equal(geometry.type, 'TorusGeometry');
        assert.equal(geometry.parameters.radius, 1);
        assert.equal(geometry.parameters.tube, 2);
        assert.equal(geometry.parameters.radialSegments, 3);
        assert.equal(geometry.parameters.tubularSegments, 4);
        assert.equal(geometry.parameters.arc, 5.1);
        done();
      });
    });

    test('creates torus knot geometry', function (done) {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', 'primitive: torusKnot; radius: 1; ' +
                      'tube: 2; segments: 3; tubularSegments: 4; p: 5; q: 6');
      setTimeout(function () {
        geometry = el.object3D.geometry;
        assert.equal(geometry.type, 'TorusKnotGeometry');
        assert.equal(geometry.parameters.radius, 1);
        assert.equal(geometry.parameters.tube, 2);
        assert.equal(geometry.parameters.radialSegments, 3);
        assert.equal(geometry.parameters.tubularSegments, 4);
        assert.equal(geometry.parameters.p, 5);
        assert.equal(geometry.parameters.q, 6);
        done();
      });
    });
  });
});
