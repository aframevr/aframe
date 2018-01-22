/* global assert, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var THREE = require('index').THREE;

suite('shadow component', function () {
  var component;
  var el;
  var mesh;

  setup(function (done) {
    el = entityFactory();
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'shadow') { return; }
      component = el.components.shadow;
      done();
    });
    el.setAttribute('shadow', {});
    mesh = new THREE.Mesh(
      new THREE.Sphere(2),
      new THREE.MeshBasicMaterial({color: 0xffff00})
    );
  });

  suite('update', function () {
    test('sets cast and receive properties on meshes', function () {
      el.object3D.add(mesh);
      component.update();
      assert.ok(mesh.castShadow);
      assert.ok(mesh.receiveShadow);
      el.setAttribute('shadow', {cast: true, receive: false});
      assert.ok(mesh.castShadow);
      assert.notOk(mesh.receiveShadow);
      el.setAttribute('shadow', {cast: false, receive: false});
      assert.notOk(mesh.castShadow);
      assert.notOk(mesh.receiveShadow);
    });

    test('sets needsUpdate on material', function () {
      el.object3D.add(mesh);
      mesh.material.needsUpdate = false;
      component.update();
      assert.ok(mesh.material.needsUpdate);
    });

    test('sets needsUpdate on material array', function () {
      var mesh2 = new THREE.Mesh(
        new THREE.Sphere(2),
        [new THREE.MeshBasicMaterial({color: 0xffff00}),
          new THREE.MeshBasicMaterial({color: 0xffff00})]
      );
      el.object3D.add(mesh2);
      mesh2.material[0].needsUpdate = false;
      mesh2.material[1].needsUpdate = false;
      component.update();
      assert.ok(mesh2.material[0].needsUpdate && mesh2.material[1].needsUpdate);
    });

    test('refreshes after setObject3D', function () {
      el.setObject3D('foo', mesh);
      component.update();
      assert.ok(mesh.castShadow);
      assert.ok(mesh.receiveShadow);
    });
  });

  suite('remove', function () {
    test('cleans up shadow references', function () {
      el.object3D.add(mesh);
      component.update();
      assert.ok(mesh.castShadow);
      assert.ok(mesh.receiveShadow);
      el.removeAttribute('shadow');
      assert.notOk(mesh.castShadow);
      assert.notOk(mesh.receiveShadow);
    });
  });
});
