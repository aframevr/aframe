/* global assert, setup, suite, test */
import { entityFactory } from '../helpers.js';
import THREE from 'lib/three.js';

suite('phong material', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.sceneEl.systems.material.clearTextureSourceCache();
    el.setAttribute('geometry', '');
    el.setAttribute('material', {shader: 'phong'});
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('can unset fog', function () {
    var el = this.el;
    assert.ok(el.getObject3D('mesh').material.fog);
    el.setAttribute('material', 'fog', false);
    assert.notOk(el.getObject3D('mesh').material.fog);
  });

  test('can use ambient occlusion maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    assert.isNull(el.getObject3D('mesh').material.aoMap);
    el.setAttribute('material', {
      ambientOcclusionMapIntensity: 0.4,
      ambientOcclusionMap: `url(${imageUrl})`
    });
    assert.equal(el.getObject3D('mesh').material.aoMapIntensity, 0.4);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(el.getObject3D('mesh').material.aoMap, evt.detail.texture);
      done();
    });
  });

  test('can use normal maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    assert.isNull(el.getObject3D('mesh').material.normalMap);
    el.setAttribute('material', {
      normalScale: {x: 0.3, y: -0.4},
      normalMap: `url(${imageUrl})`,
      normalTextureRepeat: {x: 2, y: 2},
      normalTextureOffset: {x: 0.1, y: 0.1}
    });
    assert.equal(el.getObject3D('mesh').material.normalScale.x, 0.3);
    assert.equal(el.getObject3D('mesh').material.normalScale.y, -0.4);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(el.getObject3D('mesh').material.normalMap, evt.detail.texture);
      assert.equal(evt.detail.texture.repeat.x, 2);
      assert.equal(evt.detail.texture.offset.x, 0.1);
      done();
    });
  });

  test('can use displacement maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    assert.isNull(el.getObject3D('mesh').material.displacementMap);
    el.setAttribute('material', {
      displacementScale: 0.3,
      displacementBias: 0.2,
      displacementMap: `url(${imageUrl})`,
      displacementTextureRepeat: {x: 2, y: 2},
      displacementTextureOffset: {x: 0.1, y: 0.1}
    });
    assert.equal(el.getObject3D('mesh').material.displacementScale, 0.3);
    assert.equal(el.getObject3D('mesh').material.displacementBias, 0.2);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(el.getObject3D('mesh').material.displacementMap, evt.detail.texture);
      assert.equal(evt.detail.texture.repeat.x, 2);
      assert.equal(evt.detail.texture.offset.x, 0.1);
      done();
    });
  });

  test('can use bump maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    assert.isNull(el.getObject3D('mesh').material.bumpMap);
    el.setAttribute('material', {
      bumpMapScale: 0.4,
      bumpMap: `url(${imageUrl})`
    });
    assert.equal(el.getObject3D('mesh').material.bumpScale, 0.4);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(el.getObject3D('mesh').material.bumpMap, evt.detail.texture);
      done();
    });
  });

  [
    { dataName: 'normalMap', materialName: 'normalMap' },
    { dataName: 'displacementMap', materialName: 'displacementMap' },
    { dataName: 'ambientOcclusionMap', materialName: 'aoMap' },
    { dataName: 'bumpMap', materialName: 'bumpMap' }
  ].forEach(function (names) {
    test(`can unset ${names.dataName}`, function (done) {
      var el = this.el;
      var imageUrl = 'base/tests/assets/test.png';
      assert.isNull(el.getObject3D('mesh').material[names.materialName]);
      el.setAttribute('material', names.dataName, `url(${imageUrl})`);
      el.addEventListener('materialtextureloaded', function (evt) {
        assert.equal(el.getObject3D('mesh').material[names.materialName], evt.detail.texture);
        el.setAttribute('material', names.dataName, '');
        assert.isNull(el.getObject3D('mesh').material[names.materialName]);
        done();
      });
    });
  });

  test('can use spherical env maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    el.setAttribute('material', 'sphericalEnvMap: url(' + imageUrl + ');');
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.mapping, THREE.EquirectangularReflectionMapping);
      assert.equal(el.getObject3D('mesh').material.envMap, evt.detail.texture);
      done();
    });
  });

  test('can use cube env maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    el.setAttribute('material', 'envMap: url(' + imageUrl + '), url(' + imageUrl + '), url(' + imageUrl + '), url(' + imageUrl + '), url(' + imageUrl + '), url(' + imageUrl + ');');
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.mapping, THREE.CubeReflectionMapping);
      assert.equal(el.getObject3D('mesh').material.envMap, evt.detail.texture);
      done();
    });
  });

  test('can use equirectangular env maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    el.setAttribute('material', 'envMap: url(' + imageUrl + ');');
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.mapping, THREE.EquirectangularReflectionMapping);
      assert.equal(el.getObject3D('mesh').material.envMap, evt.detail.texture);
      done();
    });
  });

  test('can use equirectangular env maps for refraction', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test2.png';
    el.setAttribute('material', 'envMap: url(' + imageUrl + '); refract: true');
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.mapping, THREE.EquirectangularRefractionMapping);
      assert.equal(el.getObject3D('mesh').material.envMap, evt.detail.texture);
      done();
    });
  });

  test('falls back to scene.environment for envMap', function () {
    var el = this.el;
    el.sceneEl.object3D.environment = new THREE.CubeTexture();
    assert.equal(el.getObject3D('mesh').material.envMap, el.sceneEl.object3D.environment);
  });

  test('can use wireframes', function () {
    var el = this.el;
    assert.notOk(el.getObject3D('mesh').material.wireframe);
    el.setAttribute('material', 'wireframe', true);
    assert.ok(el.getObject3D('mesh').material.wireframe);
    assert.equal(el.getObject3D('mesh').material.wireframeLinewidth, 2);
  });
});
