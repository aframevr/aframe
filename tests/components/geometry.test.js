/* global assert, process, setup, suite, test */
var helpers = require('../helpers');
var degToRad = require('index').THREE.MathUtils.degToRad;

/**
 * Most geometry tests will disable BufferGeometries in order to assert on geometry types and
 * parameters. That info is mostly lost when converting a Geometry to a BufferGeometry.
 */
suite('geometry', function () {
  let el;

  setup(function (done) {
    el = helpers.entityFactory();
    el.setAttribute('geometry', 'buffer: false; primitive: box;');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('allows empty geometry', function () {
      el.setAttribute('geometry', '');
    });

    test('creates geometry', function () {
      var mesh = el.getObject3D('mesh');
      assert.ok(mesh.geometry);
      assert.equal(mesh.geometry.type, 'BoxGeometry');
    });

    test('updates geometry', function () {
      var mesh = el.getObject3D('mesh');
      el.setAttribute('geometry', 'buffer: false; primitive: box; width: 5');
      assert.equal(mesh.geometry.parameters.width, 5);
    });

    test('updates geometry for segment-related attribute', function () {
      var mesh = el.getObject3D('mesh');
      el.setAttribute('geometry', 'buffer: false; primitive: sphere');
      el.setAttribute('geometry', 'buffer: false; primitive: sphere; segmentsWidth: 8');
      assert.equal(mesh.geometry.parameters.widthSegments, 8);
    });

    test('can change type of geometry', function () {
      var mesh = el.getObject3D('mesh');
      el.setAttribute('geometry', 'buffer: false; primitive: sphere');
      assert.equal(mesh.geometry.type, 'SphereGeometry');
      el.setAttribute('geometry', 'buffer: false; primitive: box');
      assert.equal(mesh.geometry.type, 'BoxGeometry');
    });

    test('disposes geometry', function () {
      var geometry = el.getObject3D('mesh').geometry;
      var disposeSpy = this.sinon.spy(geometry, 'dispose');
      assert.notOk(disposeSpy.called);
      el.setAttribute('geometry', 'primitive: sphere');
      assert.ok(disposeSpy.called);
    });
  });

  suite('remove', function () {
    test('removes geometry', function () {
      var mesh = el.getObject3D('mesh');
      el.removeAttribute('geometry');
      assert.equal(mesh.geometry.type, 'BufferGeometry');
    });

    test('disposes geometry', function () {
      var geometry = el.getObject3D('mesh').geometry;
      var disposeSpy = this.sinon.spy(geometry, 'dispose');
      el.removeAttribute('geometry');
      assert.ok(disposeSpy.called);
    });
  });
});

suite('standard geometries', function () {
  let el;
  setup(function (done) {
    el = helpers.entityFactory();
    el.setAttribute('geometry', 'primitive: box');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('circle', function () {
    var geometry;
    el.setAttribute('geometry', {
      buffer: false, primitive: 'circle', radius: 5, segments: 4, thetaStart: 0, thetaLength: 350
    });

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'CircleGeometry');
    assert.equal(geometry.parameters.radius, 5);
    assert.equal(geometry.parameters.segments, 4);
    assert.equal(geometry.parameters.thetaStart, 0);
    assert.equal(geometry.parameters.thetaLength, degToRad(350));
  });

  test('cylinder', function () {
    var geometry;
    el.setAttribute('geometry', {
      buffer: false,
      primitive: 'cylinder',
      radius: 1,
      height: 2,
      segmentsRadial: 3,
      segmentsHeight: 4,
      openEnded: true,
      thetaStart: 240,
      thetaLength: 350
    });

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'CylinderGeometry');
    assert.equal(geometry.parameters.radiusTop, 1);
    assert.equal(geometry.parameters.radiusTop, 1);
    assert.equal(geometry.parameters.height, 2);
    assert.equal(geometry.parameters.radialSegments, 3);
    assert.equal(geometry.parameters.heightSegments, 4);
    assert.equal(geometry.parameters.openEnded, true);
    assert.equal(geometry.parameters.thetaStart, degToRad(240));
    assert.equal(geometry.parameters.thetaLength, degToRad(350));
  });

  test('cone', function () {
    var geometry;
    el.setAttribute('geometry', {
      buffer: false,
      primitive: 'cone',
      radiusTop: 1,
      radiusBottom: 5,
      height: 2,
      segmentsRadial: 3,
      segmentsHeight: 4,
      openEnded: true,
      thetaStart: 240,
      thetaLength: 350
    });

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'CylinderGeometry');
    assert.equal(geometry.parameters.radiusTop, 1);
    assert.equal(geometry.parameters.radiusBottom, 5);
    assert.equal(geometry.parameters.radialSegments, 3);
    assert.equal(geometry.parameters.heightSegments, 4);
    assert.equal(geometry.parameters.openEnded, true);
    assert.equal(geometry.parameters.thetaStart, degToRad(240));
    assert.equal(geometry.parameters.thetaLength, degToRad(350));
  });

  test('icosahedron', function () {
    var geometry;
    el.setAttribute('geometry', {buffer: false, primitive: 'icosahedron', detail: 0, radius: 5});

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'IcosahedronGeometry');
    assert.equal(geometry.parameters.radius, 5);
    assert.equal(geometry.parameters.detail, 0);
  });

  test('plane', function () {
    var geometry;
    el.setAttribute('geometry', {buffer: false, primitive: 'plane', width: 1, height: 2});

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'PlaneGeometry');
    assert.equal(geometry.parameters.width, 1);
    assert.equal(geometry.parameters.height, 2);
  });

  test('ring', function () {
    var geometry;
    el.setAttribute('geometry', {buffer: false, primitive: 'ring', radiusInner: 1, radiusOuter: 2, segmentsTheta: 3});

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'RingGeometry');
    assert.equal(geometry.parameters.innerRadius, 1);
    assert.equal(geometry.parameters.outerRadius, 2);
    assert.equal(geometry.parameters.thetaSegments, 3);
  });

  test('sphere', function () {
    var geometry;
    el.setAttribute('geometry', {
      buffer: false,
      primitive: 'sphere',
      radius: 1,
      segmentsWidth: 2,
      segmentsHeight: 3,
      phiStart: 45,
      phiLength: 90,
      thetaStart: 45
    });

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'SphereGeometry');
    assert.equal(geometry.parameters.radius, 1);
    assert.equal(geometry.parameters.widthSegments, 2);
    assert.equal(geometry.parameters.heightSegments, 3);
    assert.equal(geometry.parameters.phiStart, degToRad(45));
    assert.equal(geometry.parameters.phiLength, degToRad(90));
    assert.equal(geometry.parameters.thetaStart, degToRad(45));
    assert.equal(geometry.parameters.thetaLength, degToRad(180));
  });

  test('torus', function () {
    var geometry;
    el.setAttribute('geometry', {
      buffer: false,
      primitive: 'torus',
      radius: 1,
      radiusTubular: 2,
      segmentsRadial: 3,
      segmentsTubular: 4,
      arc: 350
    });

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'TorusGeometry');
    assert.equal(geometry.parameters.radius, 1);
    assert.equal(geometry.parameters.radialSegments, 3);
    assert.equal(geometry.parameters.tube, 4);
    assert.equal(geometry.parameters.tubularSegments, 4);
    assert.equal(geometry.parameters.arc, degToRad(350));
  });

  test('torus knot', function () {
    var geometry;
    el.setAttribute('geometry', {
      buffer: false,
      primitive: 'torusKnot',
      radius: 1,
      radiusTubular: 2,
      segmentsRadial: 3,
      segmentsTubular: 4,
      p: 5,
      q: 6
    });

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'TorusKnotGeometry');
    assert.equal(geometry.parameters.radius, 1);
    assert.equal(geometry.parameters.tube, 4);
    assert.equal(geometry.parameters.radialSegments, 3);
    assert.equal(geometry.parameters.tubularSegments, 4);
    assert.equal(geometry.parameters.p, 5);
    assert.equal(geometry.parameters.q, 6);
  });

  test('triangle', function () {
    var geometry;
    el.setAttribute('geometry', {
      buffer: true,
      primitive: 'triangle',
      vertexA: {x: 1, y: 2, z: 3},
      vertexB: {x: 4, y: 5, z: 6},
      vertexC: {x: 7, y: 8, z: 9}
    });

    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'BufferGeometry');
    var vertices = geometry.getAttribute('position').array;
    assert.equal(vertices.length, 9);
    assert.equal(vertices[0], 1);
    assert.equal(vertices[1], 2);
    assert.equal(vertices[2], 3);
    assert.equal(vertices[3], 4);
    assert.equal(vertices[4], 5);
    assert.equal(vertices[5], 6);
    assert.equal(vertices[6], 7);
    assert.equal(vertices[7], 8);
    assert.equal(vertices[8], 9);
  });

  test('retains data on detach and reattach', function (done) {
    helpers.elFactory().then(el => {
      el.setAttribute('geometry', 'primitive', 'plane');
      el.sceneEl.removeChild(el);
      setTimeout(() => {
        el.sceneEl.appendChild(el);
        setTimeout(() => {
          assert.equal(el.components.geometry.data.primitive, 'plane');
          done();
        });
      });
    });
  });
});
