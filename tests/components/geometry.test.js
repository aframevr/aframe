/* global assert, process, setup, suite, test */
var helpers = require('../helpers');
var degToRad = require('index').THREE.Math.degToRad;

suite('geometry', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    el.setAttribute('geometry', 'primitive: box');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('creates geometry', function () {
      var mesh = this.el.getObject3D('mesh');
      assert.ok(mesh.geometry);
      assert.equal(mesh.geometry.type, 'BoxGeometry');
    });

    test('updates geometry', function () {
      var mesh = this.el.getObject3D('mesh');
      this.el.setAttribute('geometry', 'primitive: box; width: 5');
      assert.equal(mesh.geometry.parameters.width, 5);
    });

    test('updates geometry for segment-related attribute', function () {
      var el = this.el;
      var mesh = el.getObject3D('mesh');
      el.setAttribute('geometry', 'primitive: sphere');
      el.setAttribute('geometry', 'primitive: sphere; segmentsWidth: 8');
      assert.equal(mesh.geometry.parameters.widthSegments, 8);
    });

    test('can change type of geometry', function () {
      var el = this.el;
      var mesh = el.getObject3D('mesh');
      el.setAttribute('geometry', 'primitive: sphere');
      assert.equal(mesh.geometry.type, 'SphereBufferGeometry');
      el.setAttribute('geometry', 'primitive: box');
      assert.equal(mesh.geometry.type, 'BoxGeometry');
    });

    test('disposes geometry', function () {
      var el = this.el;
      var geometry = el.getObject3D('mesh').geometry;
      var disposeSpy = this.sinon.spy(geometry, 'dispose');
      assert.notOk(disposeSpy.called);
      el.setAttribute('geometry', 'primitive: sphere');
      assert.ok(disposeSpy.called);
    });
  });

  suite('remove', function () {
    test('removes geometry', function () {
      var mesh = this.el.getObject3D('mesh');
      this.el.removeAttribute('geometry');
      assert.equal(mesh.geometry.type, 'Geometry');
    });

    test('disposes geometry', function () {
      var geometry = this.el.getObject3D('mesh').geometry;
      var disposeSpy = this.sinon.spy(geometry, 'dispose');
      this.el.removeAttribute('geometry');
      assert.ok(disposeSpy.called);
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
      assert.shallowDeepEqual(this.el.getObject3D('mesh').geometry.vertices, DEFAULT_VERTICES);
    });

    test('can set translate', function () {
      var el = this.el;
      el.setAttribute('geometry', 'translate', '-2 4 2');
      assert.shallowDeepEqual(el.getObject3D('mesh').geometry.vertices, [
        {x: -1.5, y: 4.5, z: 2.5}, {x: -1.5, y: 4.5, z: 1.5}, {x: -1.5, y: 3.5, z: 2.5},
        {x: -1.5, y: 3.5, z: 1.5}, {x: -2.5, y: 4.5, z: 1.5}, {x: -2.5, y: 4.5, z: 2.5},
        {x: -2.5, y: 3.5, z: 1.5}, {x: -2.5, y: 3.5, z: 2.5}]);
    });

    test('can update translate', function (done) {
      var el = this.el;
      el.setAttribute('geometry', 'translate', '-2 4 2');
      el.setAttribute('geometry', 'translate', '0 0 0');
      setTimeout(function () {
        assert.shallowDeepEqual(el.getObject3D('mesh').geometry.vertices, DEFAULT_VERTICES);
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
      assert.shallowDeepEqual(el.getObject3D('mesh').geometry.vertices, DEFAULT_VERTICES);
    });

    test('does not recreate geometry when just translating', function () {
      var el = this.el;
      var uuid = el.getObject3D('mesh').geometry.uuid;
      el.setAttribute('geometry', 'translate', '-2 4 2');
      assert.equal(el.getObject3D('mesh').geometry.uuid, uuid);
    });
  });
});

suite('standard geometries', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    el.setAttribute('geometry', 'primitive: box');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('circle', function () {
    var el = this.el;
    var geometry;
    el.setAttribute('geometry', {
      primitive: 'circle', radius: 5, segments: 4, thetaStart: 0, thetaLength: 350
    });
    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'CircleGeometry');
    assert.equal(geometry.parameters.radius, 5);
    assert.equal(geometry.parameters.segments, 4);
    assert.equal(geometry.parameters.thetaStart, 0);
    assert.equal(geometry.parameters.thetaLength, degToRad(350));
  });

  test('cylinder', function () {
    var el = this.el;
    var geometry;
    el.setAttribute('geometry', {
      primitive: 'cylinder', radius: 1, height: 2, segmentsRadial: 3,
      segmentsHeight: 4, openEnded: true, thetaStart: 240, thetaLength: 350
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
    var el = this.el;
    var geometry;
    el.setAttribute('geometry', {
      primitive: 'cone', radiusTop: 1, radiusBottom: 5, height: 2, segmentsRadial: 3,
      segmentsHeight: 4, openEnded: true, thetaStart: 240, thetaLength: 350
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

  test('plane', function () {
    var el = this.el;
    var geometry;
    el.setAttribute('geometry', { primitive: 'plane', width: 1, height: 2 });
    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'PlaneBufferGeometry');
    assert.equal(geometry.parameters.width, 1);
    assert.equal(geometry.parameters.height, 2);
  });

  test('ring', function () {
    var el = this.el;
    var geometry;
    el.setAttribute('geometry', {
      primitive: 'ring', radiusInner: 1, radiusOuter: 2, segmentsTheta: 3});
    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'RingGeometry');
    assert.equal(geometry.parameters.innerRadius, 1);
    assert.equal(geometry.parameters.outerRadius, 2);
    assert.equal(geometry.parameters.thetaSegments, 3);
  });

  test('sphere', function () {
    var el = this.el;
    var geometry;
    el.setAttribute('geometry', {
      primitive: 'sphere', radius: 1, segmentsWidth: 2, segmentsHeight: 3,
      phiStart: 45, phiLength: 90, thetaStart: 45
    });
    geometry = el.getObject3D('mesh').geometry;
    assert.equal(geometry.type, 'SphereBufferGeometry');
    assert.equal(geometry.parameters.radius, 1);
    assert.equal(geometry.parameters.widthSegments, 2);
    assert.equal(geometry.parameters.heightSegments, 3);
    assert.equal(geometry.parameters.phiStart, degToRad(45));
    assert.equal(geometry.parameters.phiLength, degToRad(90));
    assert.equal(geometry.parameters.thetaStart, degToRad(45));
    assert.equal(geometry.parameters.thetaLength, degToRad(180));
  });

  test('torus', function () {
    var el = this.el;
    var geometry;
    el.setAttribute('geometry', {
      primitive: 'torus', radius: 1, radiusTubular: 2, segmentsRadial: 3, segmentsTubular: 4,
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
    var el = this.el;
    var geometry;
    el.setAttribute('geometry', {
      primitive: 'torusKnot', radius: 1, radiusTubular: 2, segmentsRadial: 3,
      segmentsTubular: 4, p: 5, q: 6
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
});
