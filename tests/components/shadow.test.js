/* global assert, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var THREE = require('index').THREE;

suite('shadow component', function () {
  var component;
  var el;
  var mesh;
  var meshWithMaterialArray;

  setup(function (done) {
    el = entityFactory();
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function (evt) {
        component = el.components.shadow;
        done();
      });
      el.setAttribute('shadow', {});
      mesh = new THREE.Mesh(
        new THREE.Sphere(2),
        new THREE.MeshBasicMaterial({color: 0xffff00})
      );
      meshWithMaterialArray = new THREE.Mesh(
        new THREE.Sphere(2),
        [new THREE.MeshBasicMaterial({color: 0xffff00}),
          new THREE.MeshBasicMaterial({color: 0xffff00})]
      );
    });
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
      var oldMaterialVersion = mesh.material.version;
      el.object3D.add(mesh);
      component.update();
      assert.equal(mesh.material.version, oldMaterialVersion + 1);
    });

    test('sets needsUpdate on material array', function () {
      var oldMaterial0Version = meshWithMaterialArray.material[0].version;
      var oldMaterial1Version = meshWithMaterialArray.material[1].version;
      el.object3D.add(meshWithMaterialArray);
      component.update();
      assert.equal(meshWithMaterialArray.material[0].version, oldMaterial0Version + 1);
      assert.equal(meshWithMaterialArray.material[1].version, oldMaterial1Version + 1);
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
