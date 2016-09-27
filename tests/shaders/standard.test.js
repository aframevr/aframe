/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var THREE = require('index').THREE;

suite('standard material', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('material', 'shader: standard');
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
    el.setAttribute('material', 'ambientOcclusionMapIntensity: 0.4; ambientOcclusionMap: url(' + imageUrl + ');');
    assert.equal(el.getObject3D('mesh').material.aoMapIntensity, 0.4);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.image.getAttribute('src'), imageUrl);
      assert.equal(el.getObject3D('mesh').material.aoMap, evt.detail.texture);
      done();
    });
  });

  test('can use normal maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    assert.isNull(el.getObject3D('mesh').material.normalMap);
    el.setAttribute('material', 'normalScale: 0.3 -0.4; normalMap: url(' + imageUrl + '); normalTextureRepeat: 2 2; normalTextureOffset: 0.1 0.1;');
    assert.equal(el.getObject3D('mesh').material.normalScale.x, 0.3);
    assert.equal(el.getObject3D('mesh').material.normalScale.y, -0.4);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.image.getAttribute('src'), imageUrl);
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
    el.setAttribute('material', 'displacementScale: 0.3; displacementBias: 0.2; displacementMap: url(' + imageUrl + '); displacementTextureRepeat: 2 2; displacementTextureOffset: 0.1 0.1;');
    assert.equal(el.getObject3D('mesh').material.displacementScale, 0.3);
    assert.equal(el.getObject3D('mesh').material.displacementBias, 0.2);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.image.getAttribute('src'), imageUrl);
      assert.equal(el.getObject3D('mesh').material.displacementMap, evt.detail.texture);
      assert.equal(evt.detail.texture.repeat.x, 2);
      assert.equal(evt.detail.texture.offset.x, 0.1);
      done();
    });
  });

  test('can use spherical env maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    el.setAttribute('material', 'sphericalEnvMap: url(' + imageUrl + ');');
    assert.ok(el.components.material.shader.isLoadingEnvMap);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.image.getAttribute('src'), imageUrl);
      assert.equal(evt.detail.texture.mapping, THREE.SphericalReflectionMapping);
      assert.equal(el.getObject3D('mesh').material.envMap, evt.detail.texture);
      done();
    });
  });

  test('can use cube env maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    el.setAttribute('material', 'envMap: url(' + imageUrl + '), url(' + imageUrl + '), url(' + imageUrl + '), url(' + imageUrl + '), url(' + imageUrl + '), url(' + imageUrl + ');');
    assert.ok(el.components.material.shader.isLoadingEnvMap);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.mapping, THREE.CubeReflectionMapping);
      assert.equal(el.getObject3D('mesh').material.envMap, evt.detail.texture);
      done();
    });
  });
});
