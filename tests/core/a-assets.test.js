/* global assert, setup, suite, test */

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

  test('waits for images to load', function (done) {
    var el = this.el;
    var scene = this.scene;

    // Create image.
    var img = document.createElement('img');
    img.setAttribute('src', '');
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
});
