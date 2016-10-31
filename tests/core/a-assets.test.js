/* global assert, setup, suite, test */
var THREE = require('lib/three');

// Empty src will not trigger load events in Chrome.
// Use data URI where a load event is needed.
var IMG_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

var XHR_SRC = 'base/src/README.md';

suite('a-assets', function () {
  setup(function () {
    var el = this.el = document.createElement('a-assets');
    var scene = this.scene = document.createElement('a-scene');
    scene.appendChild(el);
  });

  test('loads if no assets', function (done) {
    var scene = this.scene;
    scene.addEventListener('loaded', function () {
      done();
    });
    document.body.appendChild(scene);
  });

  test('throws error if not in a-scene', function () {
    var div = document.createElement('div');
    var assets = document.createElement('a-assets');
    div.appendChild(assets);
    assert.throws(function () {
      assets.attachedCallback();
    }, Error);
  });

  test('has fileLoader', function () {
    assert.ok(this.el.fileLoader.constructor, THREE.XHRLoader);
  });

  test('waits for images to load', function (done) {
    var el = this.el;
    var scene = this.scene;

    // Create image.
    var img = document.createElement('img');
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

  test('does not wait for media element without preload attribute', function (done) {
    var el = this.el;
    var scene = this.scene;

    // Create audio.
    var audio = document.createElement('audio');
    audio.setAttribute('src', '');
    el.appendChild(audio);

    scene.addEventListener('loaded', function () {
      done();
    });

    document.body.appendChild(scene);
  });

  test('does not wait for random element', function (done) {
    var el = this.el;
    var scene = this.scene;

    var div = document.createElement('div');
    el.appendChild(div);

    scene.addEventListener('loaded', function () {
      done();
    });

    document.body.appendChild(scene);
  });

  test('calls load when timing out', function (done) {
    var el = this.el;
    var scene = this.scene;
    var img = document.createElement('img');

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
      var el = this.el;
      var scene = this.scene;
      var img = document.createElement('img');

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
      var el = this.el;
      var scene = this.scene;
      var img = document.createElement('img');

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
      var el = this.el;
      var scene = this.scene;
      var img = document.createElement('img');
      var cloneSpy = this.sinon.spy(img, 'cloneNode');

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
      var el = this.el;
      var scene = this.scene;
      var img = document.createElement('img');
      var cloneSpy = this.sinon.spy(img, 'cloneNode');

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
      var el = this.el;
      var scene = this.scene;
      var video = document.createElement('video');

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
    var el = this.assetsEl = document.createElement('a-assets');
    var scene = this.sceneEl = document.createElement('a-scene');
    scene.appendChild(el);
  });

  test('emits progress event', function (done) {
    var assetItem = document.createElement('a-asset-item');
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
    var assetItem = document.createElement('a-asset-item');
    assetItem.setAttribute('src', 'doesntexist');
    assetItem.addEventListener('error', function (evt) {
      assert.ok(evt.detail.xhr !== undefined);
      done();
    });
    this.assetsEl.appendChild(assetItem);
    document.body.appendChild(this.sceneEl);
  });
});
