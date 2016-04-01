/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var THREE = require('index').THREE;

suite('material system', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('registerMaterial', function () {
    test('registers material to scene', function () {
      var el = this.el;
      var material;
      var system;
      el.setAttribute('material', '');
      system = el.components.material.system;
      material = el.getObject3D('mesh').material;
      assert.equal(system.materials[material.uuid], material);
    });

    test('re-registers material when toggling material to flat shading', function () {
      var el = this.el;
      var oldMaterial;
      var newMaterial;
      var system;
      el.setAttribute('material', 'shader: flat');
      oldMaterial = el.getObject3D('mesh').material;
      el.setAttribute('material', 'shader: standard');
      system = el.components.material.system;
      newMaterial = el.getObject3D('mesh').material;
      assert.notOk(system.materials[oldMaterial.uuid]);
      assert.equal(system.materials[newMaterial.uuid], newMaterial);
    });
  });

  suite('texture caching', function () {
    setup(function () {
      this.el.sceneEl.systems.material.clearTextureCache();
    });

    test('does not cache different image textures', function (done) {
      var el = this.el;
      var imageUrl = 'base/tests/assets/test.png';
      var imageUrl2 = 'base/tests/assets/test2.png';
      var textureSpy = this.sinon.spy(THREE, 'Texture');
      assert.equal(textureSpy.callCount, 0);

      el.setAttribute('material', 'src: url(' + imageUrl + ')');

      el.addEventListener('material-texture-loaded', function (evt) {
        var el2;
        assert.equal(textureSpy.callCount, 1);

        el2 = document.createElement('a-entity');
        el2.setAttribute('material', 'src: url(' + imageUrl2 + ')');
        el.sceneEl.appendChild(el2);
        el2.addEventListener('material-texture-loaded', function () {
          // Two textures created.
          assert.equal(textureSpy.callCount, 2);
          done();
        });
      });
    });

    test('can cache image textures', function (done) {
      var el = this.el;
      var imageUrl = 'base/tests/assets/test.png';
      var textureSpy = this.sinon.spy(THREE, 'Texture');
      assert.equal(textureSpy.callCount, 0);

      el.setAttribute('material', 'src: url(' + imageUrl + ')');

      el.addEventListener('material-texture-loaded', function () {
        var el2;
        assert.equal(textureSpy.callCount, 1);

        el2 = document.createElement('a-entity');
        el2.setAttribute('material', 'src: url(' + imageUrl + ')');
        el.sceneEl.appendChild(el2);
        el2.addEventListener('material-texture-loaded', function () {
          // Only one texture created.
          assert.equal(textureSpy.callCount, 1);
          done();
        });
      });
    });

    test('does not cache different video textures', function (done) {
      var el = this.el;
      var videoUrl = 'base/tests/assets/test.mp4';
      var videoUrl2 = 'base/tests/assets/test2.mp4';
      var textureSpy = this.sinon.spy(THREE, 'VideoTexture');
      assert.equal(textureSpy.callCount, 0);

      el.setAttribute('material', 'src: url(' + videoUrl + ')');

      el.addEventListener('material-texture-loaded', function (evt) {
        var el2;
        assert.equal(textureSpy.callCount, 1);

        el2 = document.createElement('a-entity');
        el2.setAttribute('material', 'src: url(' + videoUrl2 + ')');
        el.sceneEl.appendChild(el2);
        el2.addEventListener('material-texture-loaded', function () {
          // Two textures created.
          assert.equal(textureSpy.callCount, 2);
          done();
        });
      });
    });

    test('can cache video textures', function (done) {
      var el = this.el;
      var videoUrl = 'base/tests/assets/test.mp4';
      var textureSpy = this.sinon.spy(THREE, 'VideoTexture');
      assert.equal(textureSpy.callCount, 0);

      el.setAttribute('material', 'src: url(' + videoUrl + ')');

      el.addEventListener('material-texture-loaded', function () {
        var el2;
        assert.equal(textureSpy.callCount, 1);

        el2 = document.createElement('a-entity');
        el2.setAttribute('material', 'src: url(' + videoUrl + ')');
        el.sceneEl.appendChild(el2);
        el2.addEventListener('material-texture-loaded', function () {
          assert.equal(textureSpy.callCount, 1);
          done();
        });
      });
    });
  });
});
