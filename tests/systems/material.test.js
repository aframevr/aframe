/* global assert, setup, suite, test */
import { entityFactory } from '../helpers.js';

var IMAGE1 = 'base/tests/assets/test.png';
var IMAGE2 = 'base/tests/assets/test2.png';
var VIDEO1 = 'base/tests/assets/test.mp4';
var VIDEO2 = 'base/tests/assets/test2.mp4';

suite('material system', function () {
  setup(function (done) {
    var self = this;
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      self.system = el.sceneEl.systems.material;
      done();
    });
  });

  suite('registerMaterial', function () {
    test('registers material to system', function () {
      var el = this.el;
      var material;
      var system;
      el.setAttribute('geometry', '');
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
      el.setAttribute('geometry', '');
      el.setAttribute('material', 'shader: flat');
      oldMaterial = el.getObject3D('mesh').material;
      el.setAttribute('material', 'shader: standard');
      system = el.components.material.system;
      newMaterial = el.getObject3D('mesh').material;
      assert.notOk(system.materials[oldMaterial.uuid]);
      assert.equal(system.materials[newMaterial.uuid], newMaterial);
    });
  });

  suite('unregisterMaterial', function () {
    test('unregisters material from system', function () {
      var el = this.el;
      var system = el.sceneEl.systems.material;
      var material = {uuid: 'material' };

      system.registerMaterial(material);
      assert.equal(system.materials[material.uuid], material);

      system.unregisterMaterial(material);
      assert.notOk(system.materials[material.uuid]);
    });
  });

  suite('texture caching', function () {
    setup(function () {
      this.system.clearTextureSourceCache();
    });

    suite('loadTextureSource', function () {
      test('loads image texture source', function (done) {
        var system = this.system;
        var src = IMAGE1;
        var hash = system.hash(src);

        system.loadTextureSource(src, function (source) {
          system.sourceCache[hash].then(function (source2) {
            assert.equal(source, source2);
            done();
          });
        });
      });

      test('loads image given an <img> element', function (done) {
        var img = document.createElement('img');
        img.setAttribute('src', IMAGE1);

        var system = this.system;
        var hash = system.hash(img);

        system.loadTextureSource(img, function (source) {
          assert.equal(source.data, img);
          system.sourceCache[hash].then(function (source2) {
            assert.equal(source, source2);
            done();
          });
        });
      });

      test('caches identical image texture sources', function (done) {
        var system = this.system;
        var src = IMAGE1;
        var hash = system.hash(src);

        Promise.all([
          new Promise(function (resolve) { system.loadTextureSource(src, resolve); }),
          new Promise(function (resolve) { system.loadTextureSource(src, resolve); })
        ]).then(function (results) {
          assert.equal(results[0], results[1]);
          assert.ok(system.sourceCache[hash]);
          assert.equal(Object.keys(system.sourceCache).length, 1);
          done();
        });
      });

      test('caches different texture sources for different images', function (done) {
        var system = this.system;
        var src1 = IMAGE1;
        var src2 = IMAGE2;

        Promise.all([
          new Promise(function (resolve) { system.loadTextureSource(src1, resolve); }),
          new Promise(function (resolve) { system.loadTextureSource(src2, resolve); })
        ]).then(function (results) {
          assert.notEqual(results[0].uuid, results[1].uuid);
          done();
        });
      });
    });

    suite('loadVideo', function () {
      test('loads video texture', function (done) {
        var system = this.system;
        var src = VIDEO1;

        system.loadTextureSource(src, function (source) {
          var hash = Object.keys(system.sourceCache)[0];
          system.sourceCache[hash].then(function (result) {
            assert.equal(source, result);
            done();
          });
        });
      });

      test('loads video given a <video> element', function (done) {
        var videoEl = document.createElement('video');
        var system = this.system;

        videoEl.setAttribute('src', VIDEO1);
        system.loadTextureSource(videoEl, function (source) {
          var hash = Object.keys(system.sourceCache)[0];
          assert.equal(source.data, videoEl);
          system.sourceCache[hash].then(function (result) {
            assert.equal(source, result);
            done();
          });
        });
      });

      test('loads video given a <video> element with <source>', function (done) {
        var videoEl = document.createElement('video');
        var system = this.system;

        videoEl.insertAdjacentHTML('beforeend',
                                   '<source src="' + VIDEO1 + '"></source>');
        system.loadTextureSource(videoEl, function (source) {
          var hash = Object.keys(system.sourceCache)[0];
          assert.equal(source.data, videoEl);
          system.sourceCache[hash].then(function (result) {
            assert.equal(source, result);
            done();
          });
        });
      });

      test('caches identical video texture sources', function (done) {
        var system = this.system;
        var src = VIDEO1;

        Promise.all([
          new Promise(function (resolve) { system.loadTextureSource(src, resolve); }),
          new Promise(function (resolve) { system.loadTextureSource(src, resolve); })
        ]).then(function (results) {
          assert.equal(results[0], results[1]);
          assert.equal(Object.keys(system.sourceCache).length, 1);
          done();
        });
      });

      test('caches different texture sources for different videos', function (done) {
        var system = this.system;
        var src1 = VIDEO1;
        var src2 = VIDEO2;

        Promise.all([
          new Promise(function (resolve) { system.loadTextureSource(src1, resolve); }),
          new Promise(function (resolve) { system.loadTextureSource(src2, resolve); })
        ]).then(function (results) {
          assert.notEqual(results[0].uuid, results[1].uuid);
          done();
        });
      });
    });
  });
});
