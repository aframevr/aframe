/* global assert, process, setup, suite, test, sinon, AFRAME */
var entityFactory = require('../helpers').entityFactory;
var shaders = require('core/shader').shaders;
var THREE = require('index').THREE;

var IMG_SRC = '/base/tests/assets/test.png';

suite('material', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    this.sinon = sinon.sandbox.create();
    el.setAttribute('material', 'shader: flat');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('creates material', function () {
      assert.ok(this.el.getObject3D('mesh').material);
    });

    test('updates material', function () {
      var el = this.el;
      el.setAttribute('material', 'color: #F0F; side: double');
      assert.shallowDeepEqual(el.getObject3D('mesh').material.color,
                             {r: 1, g: 0, b: 1});
      assert.shallowDeepEqual(el.getObject3D('mesh').material.side, THREE.DoubleSide);
    });

    test('updates material shader', function () {
      var el = this.el;
      assert.equal(el.getObject3D('mesh').material.type, 'MeshBasicMaterial');
      el.setAttribute('material', 'shader', 'standard');
      assert.equal(el.getObject3D('mesh').material.type, 'MeshStandardMaterial');
    });

    test('disposes material when changing to new material', function () {
      var el = this.el;
      var material = el.getObject3D('mesh').material;
      var disposeSpy = this.sinon.spy(material, 'dispose');
      el.setAttribute('material', 'shader', 'standard');
      assert.ok(disposeSpy.called);
    });

    test('defaults to standard material', function () {
      this.el.setAttribute('material', '');
      assert.equal(this.el.getObject3D('mesh').material.type, 'MeshStandardMaterial');
    });

    test('does not recreate material for basic updates', function () {
      var el = this.el;
      var uuid = el.getObject3D('mesh').material.uuid;
      el.setAttribute('material', 'color', '#F0F');
      assert.equal(el.getObject3D('mesh').material.uuid, uuid);
    });

    test('can toggle material to flat shading', function () {
      var el = this.el;
      el.setAttribute('material', 'shader: flat');
      el.setAttribute('material', 'shader: standard');
      assert.equal(el.getObject3D('mesh').material.type, 'MeshStandardMaterial');
    });

    test('can unset fog', function () {
      var el = this.el;
      assert.ok(el.getObject3D('mesh').material.fog);
      el.setAttribute('material', 'fog', false);
      assert.notOk(el.getObject3D('mesh').material.fog);
    });

    test('emits event when loading texture', function (done) {
      var el = this.el;
      var imageUrl = 'base/tests/assets/test.png';
      el.setAttribute('material', '');
      assert.notOk(el.components.material.material.texture);
      el.setAttribute('material', 'src: url(' + imageUrl + ')');
      el.addEventListener('materialtextureloaded', function (evt) {
        var loadedTexture = evt.detail.texture;
        assert.ok(el.components.material.material.map === loadedTexture);
        done();
      });
    });

    test('removes texture when src attribute removed', function (done) {
      var el = this.el;
      var imageUrl = 'base/tests/assets/test.png';
      el.setAttribute('material', '');
      assert.notOk(el.components.material.material.texture);
      el.setAttribute('material', 'src: url(' + imageUrl + ')');
      el.addEventListener('materialtextureloaded', function (evt) {
        var loadedTexture = evt.detail.texture;
        assert.ok(el.components.material.material.map === loadedTexture);
        el.removeAttribute('material', 'src');
        assert.notOk(el.components.material.material.map);
        done();
      });
    });

    test('removes texture when src attribute is empty string', function (done) {
      var el = this.el;
      var imageUrl = 'base/tests/assets/test.png';
      el.setAttribute('material', '');
      assert.notOk(el.components.material.material.texture);
      el.setAttribute('material', 'src: url(' + imageUrl + ')');
      el.addEventListener('materialtextureloaded', function (evt) {
        var loadedTexture = evt.detail.texture;
        assert.ok(el.components.material.material.map === loadedTexture);
        el.setAttribute('material', 'src', '');
        assert.notOk(el.components.material.material.map);
        done();
      });
    });

    test('does not invoke XHR if passing <img>', function (done) {
      var el = this.el;
      var assetsEl = document.createElement('a-assets');
      var img = document.createElement('img');
      var imageLoaderSpy = this.sinon.spy(THREE.ImageLoader.prototype, 'load');
      var textureLoaderSpy = this.sinon.spy(THREE.TextureLoader.prototype, 'load');
      img.setAttribute('src', IMG_SRC);
      img.setAttribute('id', 'foo');
      THREE.Cache.files[IMG_SRC] = img;
      assetsEl.appendChild(img);
      el.sceneEl.appendChild(assetsEl);
      el.addEventListener('materialtextureloaded', function () {
        assert.notOk(imageLoaderSpy.called);
        assert.notOk(textureLoaderSpy.called);
        delete THREE.Cache.files[IMG_SRC];
        THREE.ImageLoader.prototype.load.restore();
        THREE.TextureLoader.prototype.load.restore();
        done();
      });
      el.setAttribute('material', 'src', '#foo');
    });

    test('invokes XHR if <img> not cached', function (done) {
      var el = this.el;
      var textureLoaderSpy = this.sinon.spy(THREE.TextureLoader.prototype, 'load');
      el.addEventListener('materialtextureloaded', function () {
        assert.ok(textureLoaderSpy.called);
        assert.ok(IMG_SRC in THREE.Cache.files);
        THREE.TextureLoader.prototype.load.restore();
        done();
      });
      el.setAttribute('material', 'src', IMG_SRC);
    });

    test('sets material to MeshShaderMaterial for custom shaders', function () {
      var el = this.el;
      delete shaders.test;
      AFRAME.registerShader('test', {});
      assert.equal(el.getObject3D('mesh').material.type, 'MeshBasicMaterial');
      el.setAttribute('material', 'shader', 'test');
      assert.equal(el.getObject3D('mesh').material.type, 'ShaderMaterial');
    });
  });

  suite('updateSchema', function () {
    test('updates schema for flat shader', function () {
      var el = this.el;
      el.components.material.updateSchema({shader: 'flat'});
      assert.ok(el.components.material.schema.color);
      assert.ok(el.components.material.schema.fog);
      assert.ok(el.components.material.schema.height);
      assert.ok(el.components.material.schema.repeat);
      assert.ok(el.components.material.schema.src);
      assert.ok(el.components.material.schema.width);
      assert.notOk(el.components.material.schema.metalness);
      assert.notOk(el.components.material.schema.roughness);
      assert.notOk(el.components.material.schema.envMap);
    });

    test('updates schema for custom shader', function () {
      var el = this.el;
      delete shaders.test;
      AFRAME.registerShader('test', {
        schema: {
          color: {type: 'color'},
          luminance: {default: 1}
        }
      });
      el.setAttribute('material', 'shader', 'test');
      assert.ok(el.components.material.schema.opacity);
      assert.ok(el.components.material.schema.color);
      assert.ok(el.components.material.schema.luminance);
      assert.notOk(el.components.material.schema.src);
    });
  });

  suite('remove', function () {
    test('removes material', function () {
      var el = this.el;
      assert.ok(el.getObject3D('mesh').material);
      el.removeAttribute('material');
      assert.equal(el.getObject3D('mesh').material.type, 'MeshBasicMaterial');
    });

    test('disposes material', function () {
      var el = this.el;
      var material = el.getObject3D('mesh').material;
      var disposeSpy = this.sinon.spy(material, 'dispose');
      el.removeAttribute('material');
      assert.ok(disposeSpy.called);
    });
  });

  suite('side', function () {
    test('can be set with initial material', function (done) {
      var el = entityFactory();
      el.setAttribute('material', 'side: double');
      el.addEventListener('loaded', function () {
        assert.ok(el.getObject3D('mesh').material.side, THREE.DoubleSide);
        done();
      });
    });

    test('defaults to front side', function () {
      assert.equal(this.el.getObject3D('mesh').material.side, THREE.FrontSide);
    });

    test('can be set to back', function () {
      var el = this.el;
      el.setAttribute('material', 'side: back');
      assert.equal(el.getObject3D('mesh').material.side, THREE.BackSide);
    });

    test('can be set to double', function () {
      var el = this.el;
      el.setAttribute('material', 'side: double');
      assert.equal(el.getObject3D('mesh').material.side, THREE.DoubleSide);
    });

    test('sets material.needsUpdate true if side switchs from/to double', function () {
      var el = this.el;
      el.setAttribute('material', 'side: front');
      el.getObject3D('mesh').material.needsUpdate = false;
      el.setAttribute('material', 'side: double');
      assert.equal(el.getObject3D('mesh').material.needsUpdate, 1);
      el.getObject3D('mesh').material.needsUpdate = false;
      el.setAttribute('material', 'side: front');
      assert.equal(el.getObject3D('mesh').material.needsUpdate, 1);
    });
  });

  suite('transparent', function () {
    test('can set transparent', function () {
      var el = this.el;
      assert.notOk(el.getObject3D('mesh').material.transparent);
      el.setAttribute('material', 'opacity: 1; transparent: true');
      assert.equal(el.getObject3D('mesh').material.opacity, 1);
      assert.ok(el.getObject3D('mesh').material.transparent);
    });

    test('can be set to false', function () {
      var el = this.el;
      el.setAttribute('material', 'opacity: 1; transparent: false');
      assert.equal(el.getObject3D('mesh').material.opacity, 1);
      assert.notOk(el.getObject3D('mesh').material.transparent);
    });

    test('is inferred if opacity is less than 1', function () {
      var el = this.el;
      assert.notOk(el.getObject3D('mesh').material.transparent);
      el.setAttribute('material', 'opacity: 0.75');
      assert.equal(el.getObject3D('mesh').material.opacity, 0.75);
      assert.ok(el.getObject3D('mesh').material.transparent);
    });
  });

  suite('depthTest', function () {
    test('can be set to false', function () {
      var el = this.el;
      assert.ok(el.getObject3D('mesh').material.depthTest);
      el.setAttribute('material', 'depthTest: false');
      assert.equal(el.getObject3D('mesh').material.depthTest, 0);
    });
  });

  suite('depthWrite', function () {
    test('can be set to false', function () {
      var el = this.el;
      assert.ok(el.getObject3D('mesh').material.depthWrite);
      el.setAttribute('material', 'depthWrite: false');
      assert.equal(el.getObject3D('mesh').material.depthWrite, 0);
    });
  });

  suite('alphaTest', function () {
    test('can be updated', function () {
      var el = this.el;
      assert.equal(el.getObject3D('mesh').material.alphaTest, 0);
      el.setAttribute('material', 'alphaTest: 1.0');
      assert.equal(el.getObject3D('mesh').material.alphaTest, 1);
    });

    test('sets material.needsUpdate true if alphaTest is updated', function () {
      var el = this.el;
      el.setAttribute('material', 'alphaTest: 0.0');
      el.getObject3D('mesh').material.needsUpdate = false;
      assert.equal(el.getObject3D('mesh').material.needsUpdate, 0);
      el.setAttribute('material', 'alphaTest: 1.0');
      assert.equal(el.getObject3D('mesh').material.needsUpdate, 1);
    });
  });

  test('can set visible to false', function () {
    var el = this.el;
    assert.ok(el.getObject3D('mesh').material.visible);
    el.setAttribute('material', 'visible: false');
    assert.notOk(el.getObject3D('mesh').material.visible);
  });
});
