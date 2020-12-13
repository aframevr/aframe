/* global assert, setup, suite, test */
let THREE = require('lib/three');

let inferResponseType = require('core/a-assets').inferResponseType;
let getFileNameFromURL = require('core/a-assets').getFileNameFromURL;

let IMG_SRC = '/base/tests/assets/test.png';
let XHR_SRC = '/base/tests/assets/dummy/dummy.txt';
let XHR_SRC_GLTF = '/base/tests/assets/dummy/dummy.gltf';
let XHR_SRC_GLB = '/base/tests/assets/dummy/dummy.glb';

suite('a-assets', function () {
  setup(function () {
    let el = this.el = document.createElement('a-assets');
    let scene = this.scene = document.createElement('a-scene');
    scene.appendChild(el);
  });

  test('loads if no assets', function (done) {
    let scene = this.scene;
    scene.addEventListener('loaded', function () {
      done();
    });
    document.body.appendChild(scene);
    THREE.Cache.files = {};
  });

  test('throws error if not in a-scene', function () {
    let div = document.createElement('div');
    let assets = document.createElement('a-assets');
    div.appendChild(assets);
    assert.throws(function () {
      assets.attachedCallback();
    }, Error);
  });

  test('has fileLoader', function () {
    assert.equal(this.el.fileLoader.constructor, THREE.FileLoader);
  });

  test('waits for images to load', function (done) {
    let el = this.el;
    let scene = this.scene;

    // Create image.
    let img = document.createElement('img');
    img.setAttribute('src', IMG_SRC);
    el.appendChild(img);

    scene.addEventListener('loaded', function () {
      done();
    });

    // Load image.
    document.body.appendChild(scene);
    process.nextTick(function () {
      img.onload();
    });
  });

  test('caches image in three.js', function (done) {
    let assetsEl = this.el;
    let sceneEl = this.scene;

    // Create image.
    let img = document.createElement('img');
    img.setAttribute('src', IMG_SRC);
    assetsEl.appendChild(img);

    img.addEventListener('load', function () {
      assert.equal(THREE.Cache.files[IMG_SRC], img);
      done();
    });

    document.body.appendChild(sceneEl);
  });

  test('does not wait for media element without preload attribute', function (done) {
    let el = this.el;
    let scene = this.scene;

    // Create audio.
    let audio = document.createElement('audio');
    audio.setAttribute('src', '');
    el.appendChild(audio);

    scene.addEventListener('loaded', function () {
      done();
    });

    document.body.appendChild(scene);
  });

  test('does not wait for random element', function (done) {
    let el = this.el;
    let scene = this.scene;

    let div = document.createElement('div');
    el.appendChild(div);

    scene.addEventListener('loaded', function () {
      done();
    });

    document.body.appendChild(scene);
  });

  test('calls load when timing out', function (done) {
    let el = this.el;
    let scene = this.scene;
    let img = document.createElement('img');

    el.setAttribute('timeout', 50);
    img.setAttribute('src', '');
    el.appendChild(img);

    el.addEventListener('timeout', function () {
      el.addEventListener('loaded', function () {
        assert.ok(el.hasLoaded);
        done();
      });
    });

    document.body.appendChild(scene);
  });

  suite('fixUpMediaElement', function () {
    test('recreates media elements with crossorigin if necessary', function (done) {
      let el = this.el;
      let scene = this.scene;
      let img = document.createElement('img');

      img.setAttribute('id', 'myImage');
      img.setAttribute('src', 'https://example.url/asset.png');
      el.setAttribute('timeout', 50);
      el.appendChild(img);

      el.addEventListener('loaded', function () {
        assert.ok(el.querySelectorAll('img').length, 1);
        assert.ok(el.querySelector('#myImage').hasAttribute('crossorigin'));
        done();
      });

      document.body.appendChild(scene);
    });

    test('recreates media elements with crossorigin even if no src set', function (done) {
      let el = this.el;
      let scene = this.scene;
      let img = document.createElement('img');

      img.setAttribute('id', 'myImage');
      el.setAttribute('timeout', 50);
      el.appendChild(img);

      el.addEventListener('loaded', function () {
        assert.ok(el.querySelectorAll('img').length, 1);
        assert.ok(el.querySelector('#myImage').hasAttribute('crossorigin'));
        done();
      });

      document.body.appendChild(scene);
    });

    test('does not recreate media element if not crossorigin', function (done) {
      let el = this.el;
      let scene = this.scene;
      let img = document.createElement('img');
      let cloneSpy = this.sinon.spy(img, 'cloneNode');

      img.setAttribute('id', 'myImage');
      img.setAttribute('src', 'asset.png');
      el.setAttribute('timeout', 50);
      el.appendChild(img);

      el.addEventListener('loaded', function () {
        assert.notOk(el.querySelector('#myImage').hasAttribute('crossorigin'));
        assert.notOk(cloneSpy.called);
        done();
      });

      document.body.appendChild(scene);
    });

    test('does not recreate media element if crossorigin already set', function (done) {
      let el = this.el;
      let scene = this.scene;
      let img = document.createElement('img');
      let cloneSpy = this.sinon.spy(img, 'cloneNode');

      img.setAttribute('id', 'myImage');
      img.setAttribute('src', 'https://example.url/asset.png');
      img.setAttribute('crossorigin', '');
      el.setAttribute('timeout', 50);
      el.appendChild(img);

      el.addEventListener('loaded', function () {
        assert.notOk(cloneSpy.called);
        done();
      });

      document.body.appendChild(scene);
    });

    test('sets playsinline', function (done) {
      let el = this.el;
      let scene = this.scene;
      let video = document.createElement('video');

      video.setAttribute('id', 'test');
      video.setAttribute('src', 'dummy.mp4');
      el.setAttribute('timeout', 10);
      el.appendChild(video);
      scene.addEventListener('loaded', function () {
        assert.ok(video.hasAttribute('webkit-playsinline'));
        assert.ok(video.hasAttribute('playsinline'));
        done();
      });
      document.body.appendChild(scene);
    });
  });
});

suite('a-asset-item', function () {
  setup(function () {
    let el = this.assetsEl = document.createElement('a-assets');
    let scene = this.sceneEl = document.createElement('a-scene');
    scene.appendChild(el);
  });

  test('emits progress event', function (done) {
    let assetItem = document.createElement('a-asset-item');
    assetItem.setAttribute('src', XHR_SRC);
    assetItem.addEventListener('progress', function (evt) {
      assert.ok(evt.detail.loadedBytes !== undefined);
      assert.ok(evt.detail.totalBytes !== undefined);
      assert.ok(evt.detail.xhr !== undefined);
      done();
    });
    this.assetsEl.appendChild(assetItem);
    document.body.appendChild(this.sceneEl);
  });

  test('emits error event', function (done) {
    let assetItem = document.createElement('a-asset-item');
    assetItem.setAttribute('src', 'doesntexist');
    assetItem.addEventListener('error', function (evt) {
      assert.ok(evt.detail.xhr !== undefined);
      done();
    });
    this.assetsEl.appendChild(assetItem);
    document.body.appendChild(this.sceneEl);
  });

  test('loads as text without responseType attribute', function (done) {
    let assetItem = document.createElement('a-asset-item');
    // Remove cache data to not load from it.
    THREE.Cache.remove(XHR_SRC);
    assetItem.setAttribute('src', XHR_SRC);
    assetItem.addEventListener('loaded', function (evt) {
      assert.ok(assetItem.data !== null);
      assert.ok(typeof assetItem.data === 'string');
      done();
    });
    this.assetsEl.appendChild(assetItem);
    document.body.appendChild(this.sceneEl);
  });

  test('loads as arraybuffer', function (done) {
    let assetItem = document.createElement('a-asset-item');
    THREE.Cache.remove(XHR_SRC);
    assetItem.setAttribute('src', XHR_SRC);
    assetItem.setAttribute('response-type', 'arraybuffer');
    assetItem.addEventListener('loaded', function (evt) {
      assert.ok(assetItem.data !== null);
      assert.ok(assetItem.data instanceof ArrayBuffer);
      done();
    });
    this.assetsEl.appendChild(assetItem);
    document.body.appendChild(this.sceneEl);
  });

  test('loads from cache as arraybuffer without response-type attribute', function (done) {
    let assetItem = document.createElement('a-asset-item');
    assetItem.setAttribute('src', XHR_SRC);
    assetItem.addEventListener('loaded', function (evt) {
      assert.ok(assetItem.data !== null);
      assert.ok(assetItem.data instanceof ArrayBuffer);
      done();
    });
    this.assetsEl.appendChild(assetItem);
    document.body.appendChild(this.sceneEl);
  });

  test('reloads as text', function (done) {
    THREE.Cache.remove(XHR_SRC);
    let assetItem = document.createElement('a-asset-item');
    assetItem.setAttribute('src', XHR_SRC);
    assetItem.addEventListener('loaded', function (evt) {
      assert.ok(assetItem.data !== null);
      assert.ok(typeof assetItem.data === 'string');
      done();
    });
    this.assetsEl.appendChild(assetItem);
    document.body.appendChild(this.sceneEl);
  });

  test('loads .gltf file as arraybuffer without response-type attribute', function (done) {
    let assetItem = document.createElement('a-asset-item');
    assetItem.setAttribute('src', XHR_SRC_GLTF);
    assetItem.addEventListener('loaded', function (evt) {
      assert.ok(assetItem.data !== null);
      assert.ok(typeof assetItem.data === 'string');
      done();
    });
    this.assetsEl.appendChild(assetItem);
    document.body.appendChild(this.sceneEl);
  });

  suite('inferResponseType', function () {
    test('returns text as default', function () {
      assert.equal(inferResponseType(XHR_SRC), 'text');
    });

    test('returns text for .gltf file', function () {
      assert.equal(inferResponseType(XHR_SRC_GLTF), 'text');
    });

    test('returns arraybuffer for .glb file', function () {
      assert.equal(inferResponseType(XHR_SRC_GLB), 'arraybuffer');
    });

    test('returns arraybuffer for .glb file with query string', function () {
      assert.equal(inferResponseType(XHR_SRC_GLB + '?a=1'), 'arraybuffer');
    });
  });

  suite('getFileNameFromURL', function () {
    test('get file name from relative url', function () {
      let url = 'my/path/relative.jpg';
      assert.equal(getFileNameFromURL(url), 'relative.jpg');
    });

    test('get file name from absolute url', function () {
      let url = 'https://aframe.io/my/path/absolute.jpg';
      assert.equal(getFileNameFromURL(url), 'absolute.jpg');
    });

    test('get file name from url with query parameters', function () {
      let url = 'https://cdn.glitch.com/test.jpg?1531238960521&test=yeah';
      assert.equal(getFileNameFromURL(url), 'test.jpg');
    });
  });
});
