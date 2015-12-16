/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var rad = require('index').THREE.Math.degToRad;

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

    test('updates geometry', function () {
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      assert.equal(el.object3D.geometry.parameters.width, 5);
    });

    test('updates geometry for segment-related attribute', function () {
      var el = this.el;
      el.setAttribute('geometry', 'primitive: sphere');
      el.setAttribute('geometry', 'primitive: sphere; segmentsWidth: 8');
      assert.equal(el.object3D.geometry.parameters.widthSegments, 8);
    });

    test('can change type of geometry', function () {
      var el = this.el;
      el.setAttribute('geometry', 'primitive: sphere');
      assert.equal(el.object3D.geometry.type, 'SphereGeometry');
      el.setAttribute('geometry', 'primitive: box');
      assert.equal(el.object3D.geometry.type, 'BoxGeometry');
    });

    suite('remove', function () {
      test('removes geometry', function () {
        var el = this.el;
        el.removeAttribute('geometry');
        assert.equal(el.object3D.geometry.type, 'Geometry');
      });
    });
  });

  suite('getGeometry', function () {
    test('creates circle geometry', function () {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', {
        primitive: 'circle', radius: 5, segments: 4, thetaStart: 0, thetaLength: 350
      });
      geometry = el.object3D.geometry;
      assert.equal(geometry.type, 'CircleGeometry');
      assert.equal(geometry.parameters.radius, 5);
      assert.equal(geometry.parameters.segments, 4);
      assert.equal(geometry.parameters.thetaStart, 0);
      assert.equal(geometry.parameters.thetaLength, rad(350));
    });

    test('creates cylinder geometry', function () {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', {
        primitive: 'cylinder', radius: 1, height: 2, segmentsRadial: 3,
        segmentsHeight: 4, openEnded: true, thetaStart: 240, thetaLength: 350
      });
      geometry = el.object3D.geometry;
      assert.equal(geometry.type, 'CylinderGeometry');
      assert.equal(geometry.parameters.radiusTop, 1);
      assert.equal(geometry.parameters.radiusTop, 1);
      assert.equal(geometry.parameters.height, 2);
      assert.equal(geometry.parameters.radialSegments, 3);
      assert.equal(geometry.parameters.heightSegments, 4);
      assert.equal(geometry.parameters.openEnded, true);
      assert.equal(geometry.parameters.thetaStart, rad(240));
      assert.equal(geometry.parameters.thetaLength, rad(350));
    });

    test('creates cone geometry', function () {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', {
        primitive: 'cone', radiusTop: 1, radiusBottom: 5, height: 2, segmentsRadial: 3,
        segmentsHeight: 4, openEnded: true, thetaStart: 240, thetaLength: 350
      });
      geometry = el.object3D.geometry;
      assert.equal(geometry.type, 'CylinderGeometry');
      assert.equal(geometry.parameters.radiusTop, 1);
      assert.equal(geometry.parameters.radiusBottom, 5);
      assert.equal(geometry.parameters.radialSegments, 3);
      assert.equal(geometry.parameters.heightSegments, 4);
      assert.equal(geometry.parameters.openEnded, true);
      assert.equal(geometry.parameters.thetaStart, rad(240));
      assert.equal(geometry.parameters.thetaLength, rad(350));
    });

    test('creates plane geometry', function () {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', { primitive: 'plane', width: 1, height: 2 });
      geometry = el.object3D.geometry;
      assert.equal(geometry.type, 'PlaneBufferGeometry');
      assert.equal(geometry.parameters.width, 1);
      assert.equal(geometry.parameters.height, 2);
    });

    test('creates ring geometry', function () {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', {
        primitive: 'ring', radiusInner: 1, radiusOuter: 2, segmentsTheta: 3});
      geometry = el.object3D.geometry;
      assert.equal(geometry.type, 'RingGeometry');
      assert.equal(geometry.parameters.innerRadius, 1);
      assert.equal(geometry.parameters.outerRadius, 2);
      assert.equal(geometry.parameters.thetaSegments, 3);
    });

    test('creates sphere geometry', function () {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', {
        primitive: 'sphere', radius: 1, segmentsWidth: 2, segmentsHeight: 3
      });
      geometry = el.object3D.geometry;
      assert.equal(geometry.type, 'SphereGeometry');
      assert.equal(geometry.parameters.radius, 1);
      assert.equal(geometry.parameters.widthSegments, 2);
      assert.equal(geometry.parameters.heightSegments, 3);
    });

    test('creates torus geometry', function () {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', {
        primitive: 'torus', radius: 1, radiusTubular: 2, segmentsRadial: 3, segmentsTubular: 4,
        arc: 350
      });
      geometry = el.object3D.geometry;
      assert.equal(geometry.type, 'TorusGeometry');
      assert.equal(geometry.parameters.radius, 1);
      assert.equal(geometry.parameters.radialSegments, 3);
      assert.equal(geometry.parameters.tube, 4);
      assert.equal(geometry.parameters.tubularSegments, 4);
      assert.equal(geometry.parameters.arc, rad(350));
    });

    test('creates torus knot geometry', function () {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', {
        primitive: 'torusKnot', radius: 1, radiusTubular: 2, segmentsRadial: 3,
        segmentsTubular: 4, p: 5, q: 6
      });
      geometry = el.object3D.geometry;
      assert.equal(geometry.type, 'TorusKnotGeometry');
      assert.equal(geometry.parameters.radius, 1);
      assert.equal(geometry.parameters.tube, 4);
      assert.equal(geometry.parameters.radialSegments, 3);
      assert.equal(geometry.parameters.tubularSegments, 4);
      assert.equal(geometry.parameters.p, 5);
      assert.equal(geometry.parameters.q, 6);
    });
  });

  suite('translate', function () {
    var DEFAULT_VERTICES = [
      {x: 0.5, y: 0.5, z: 0.5}, {x: 0.5, y: 0.5, z: -0.5}, {x: 0.5, y: -0.5, z: 0.5},
      {x: 0.5, y: -0.5, z: -0.5}, {x: -0.5, y: 0.5, z: -0.5}, {x: -0.5, y: 0.5, z: 0.5},
      {x: -0.5, y: -0.5, z: -0.5}, {x: -0.5, y: -0.5, z: 0.5}
    ];

    setup(function () {
      this.el.setAttribute('geometry', {
        primitive: 'box',
        depth: 1,
        height: 1,
        width: 1
      });
    });

    test('defaults translate to center', function () {
      assert.shallowDeepEqual(this.el.object3D.geometry.vertices, DEFAULT_VERTICES);
    });

    test('can set translate', function () {
      var el = this.el;
      el.setAttribute('geometry', 'translate', '-2 4 2');
      assert.shallowDeepEqual(el.object3D.geometry.vertices, [
        {x: -1.5, y: 4.5, z: 2.5}, {x: -1.5, y: 4.5, z: 1.5}, {x: -1.5, y: 3.5, z: 2.5},
        {x: -1.5, y: 3.5, z: 1.5}, {x: -2.5, y: 4.5, z: 1.5}, {x: -2.5, y: 4.5, z: 2.5},
        {x: -2.5, y: 3.5, z: 1.5}, {x: -2.5, y: 3.5, z: 2.5}]);
    });

    test('can update translate', function (done) {
      var el = this.el;
      el.setAttribute('geometry', 'translate', '-2 4 2');
      el.setAttribute('geometry', 'translate', '0 0 0');
      setTimeout(function () {
        assert.shallowDeepEqual(el.object3D.geometry.vertices, DEFAULT_VERTICES);
        done();
      });
    });

    test('can remove translate', function () {
      var el = this.el;
      el.setAttribute('geometry', 'translate', '-2 4 2');
      this.el.setAttribute('geometry', {
        primitive: 'box',
        depth: 1,
        height: 1,
        width: 1
      });
      assert.shallowDeepEqual(el.object3D.geometry.vertices, DEFAULT_VERTICES);
    });

    test('does not recreate geometry when just translating', function () {
      var el = this.el;
      var uuid = el.object3D.geometry.uuid;
      el.setAttribute('geometry', 'translate', '-2 4 2');
      assert.equal(el.object3D.geometry.uuid, uuid);
    });
  });
});
