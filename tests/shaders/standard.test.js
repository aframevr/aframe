/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var THREE = require('index').THREE;

var VIDEO = 'base/tests/assets/test.mp4';

suite('standard material', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('geometry', '');
    el.setAttribute('material', {shader: 'standard'});
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

  test('can use spherical env maps', function (done) {
    var el = this.el;
    var imageUrl = 'base/tests/assets/test.png';
    el.setAttribute('material', 'sphericalEnvMap: url(' + imageUrl + ');');
    assert.ok(el.components.material.shader.isLoadingEnvMap);
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
    assert.ok(el.components.material.shader.isLoadingEnvMap);
    el.addEventListener('materialtextureloaded', function (evt) {
      assert.equal(evt.detail.texture.mapping, THREE.CubeReflectionMapping);
      assert.equal(el.getObject3D('mesh').material.envMap, evt.detail.texture);
      done();
    });
  });

  test('can use wireframes', function () {
    var el = this.el;
    assert.notOk(el.getObject3D('mesh').material.wireframe);
    el.setAttribute('material', 'wireframe', true);
    assert.ok(el.getObject3D('mesh').material.wireframe);
    assert.equal(el.getObject3D('mesh').material.wireframeLinewidth, 2);
  });

  test('can use video textures with selector', function (done) {
    var el = this.el;
    var videoEl = document.createElement('video');
    videoEl.setAttribute('src', VIDEO);
    videoEl.setAttribute('id', 'video');
    el.sceneEl.appendChild(videoEl);
    el.addEventListener('materialtextureloaded', () => {
      assert.equal(el.components.material.material.map.image, videoEl);
      done();
    });
    el.setAttribute('material', 'src', '#video');
  });

  test('can use video textures with inline URL', function (done) {
    var el = this.el;
    el.addEventListener('materialtextureloaded', () => {
      assert.equal(el.components.material.material.map.image.getAttribute('src'), VIDEO);
      done();
    });
    el.setAttribute('material', 'src', VIDEO);
  });
});
