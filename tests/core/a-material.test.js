/* global assert, setup, suite, teardown, test, sinon */
import THREE from 'lib/three.js';

suite('a-material', function () {
  setup(function (done) {
    var sceneEl = this.sceneEl = document.createElement('a-scene');
    this.sinon = sinon.createSandbox();
    sceneEl.innerHTML = `
      <a-assets>
        <a-material id="red" shader="flat" color="red" side="double"></a-material>
        <a-material id="pbr" color="#00F" metalness="0.5" roughness="0.3"></a-material>
        <a-material id="textured" shader="flat" src="url(base/tests/assets/test.png)"></a-material>
      </a-assets>
      <a-box material="material: #red"></a-box>
      <a-sphere material="material: #red"></a-sphere>
    `;
    document.body.appendChild(sceneEl);
    if (sceneEl.hasLoaded) { done(); return; }
    sceneEl.addEventListener('loaded', function () { done(); });
  });

  teardown(function () {
    var sceneEl = this.sceneEl;
    if (sceneEl.parentNode) { sceneEl.parentNode.removeChild(sceneEl); }
    this.sinon.restore();
  });

  test('creates a THREE.Material from attributes', function () {
    var materialEl = document.getElementById('red');
    var material = materialEl.getMaterial();
    assert.ok(material);
    assert.equal(material.type, 'MeshBasicMaterial');
    assert.shallowDeepEqual(material.color, {r: 1, g: 0, b: 0});
    assert.equal(material.side, THREE.DoubleSide);
    assert.equal(material.name, 'red');
  });

  test('defaults to standard shader', function () {
    var material = document.getElementById('pbr').getMaterial();
    assert.equal(material.type, 'MeshStandardMaterial');
    assert.equal(material.metalness, 0.5);
    assert.equal(material.roughness, 0.3);
    assert.shallowDeepEqual(material.color, {r: 0, g: 0, b: 1});
  });

  test('loads texture before emitting loaded', function () {
    var materialEl = document.getElementById('textured');
    assert.ok(materialEl.hasLoaded);
    assert.ok(materialEl.getMaterial().map);
    assert.ok(materialEl.getMaterial().map.isTexture);
  });

  test('entities share the same material instance', function () {
    var boxMaterial = this.sceneEl.querySelector('a-box').getObject3D('mesh').material;
    var sphereMaterial = this.sceneEl.querySelector('a-sphere').getObject3D('mesh').material;
    var material = document.getElementById('red').getMaterial();
    assert.equal(boxMaterial, material);
    assert.equal(sphereMaterial, material);
  });

  test('updates material when attribute changes', function (done) {
    var materialEl = document.getElementById('red');
    var material = materialEl.getMaterial();
    materialEl.setAttribute('color', 'blue');
    // Attribute changes are picked up via MutationObserver, so asynchronous.
    setTimeout(function () {
      assert.shallowDeepEqual(material.color, {r: 0, g: 0, b: 1});
      done();
    }, 0);
  });

  test('setting base material property updates material', function (done) {
    var materialEl = document.getElementById('red');
    var material = materialEl.getMaterial();
    materialEl.setAttribute('opacity', '0.5');
    setTimeout(function () {
      assert.equal(material.opacity, 0.5);
      assert.ok(material.transparent);
      done();
    }, 0);
  });

  test('entity going back to own material does not dispose shared material', function () {
    var boxEl = this.sceneEl.querySelector('a-box');
    var sharedMaterial = document.getElementById('red').getMaterial();
    var disposeSpy = this.sinon.spy(sharedMaterial, 'dispose');
    boxEl.setAttribute('material', 'material', '');
    var ownMaterial = boxEl.getObject3D('mesh').material;
    assert.notEqual(ownMaterial, sharedMaterial);
    assert.notOk(disposeSpy.called);
  });

  test('removing material component does not dispose shared material', function () {
    var boxEl = this.sceneEl.querySelector('a-box');
    var sharedMaterial = document.getElementById('red').getMaterial();
    var disposeSpy = this.sinon.spy(sharedMaterial, 'dispose');
    boxEl.removeAttribute('material');
    assert.notOk(disposeSpy.called);
  });

  test('detaching <a-material> disposes its material', function () {
    var materialEl = document.getElementById('pbr');
    var material = materialEl.getMaterial();
    var disposeSpy = this.sinon.spy(material, 'dispose');
    materialEl.parentNode.removeChild(materialEl);
    assert.ok(disposeSpy.called);
    assert.notOk(materialEl.material);
  });

  test('warns on unknown property', function () {
    var materialEl = document.createElement('a-material');
    materialEl.setAttribute('id', 'unknownprops');
    materialEl.setAttribute('shader', 'flat');
    materialEl.setAttribute('metalness', '0.5');  // Not part of flat shader.
    this.sceneEl.querySelector('a-assets').appendChild(materialEl);
    var material = materialEl.getMaterial();
    assert.equal(material.type, 'MeshBasicMaterial');
  });
});
