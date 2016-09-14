/* global assert, setup, suite, test */

suite('a-assets', function () {
  // Empty src will not trigger load events in Chrome. Use data URI where a load event is needed.
  var IMG_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

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

  suite('crossorigin', function () {
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
  });
});

test('a-assets throws error if not in a-scene', function () {
  var div = document.createElement('div');
  var assets = document.createElement('a-assets');
  div.appendChild(assets);
  assert.throws(function () {
    assets.attachedCallback();
  }, Error);
});
