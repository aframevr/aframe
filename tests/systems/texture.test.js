/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

var IMAGE1 = 'base/tests/assets/test.png';
var IMAGE2 = 'base/tests/assets/test2.png';
var VIDEO1 = 'base/tests/assets/test.mp4';
var VIDEO2 = 'base/tests/assets/test2.mp4';

suite('texture system', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    var self = this;
    el.addEventListener('loaded', function () {
      self.system = el.sceneEl.systems.texture;
      done();
    });
  });

  suite('loadImage', function () {
    test('loads image texture', function (done) {
      var system = this.system;
      var src = IMAGE1;
      var data = {src: IMAGE1};
      var hash = system.hash(data);

      system.loadImage(src, data, function (texture) {
        assert.equal(texture.image.getAttribute('src'), src);
        system.cache[hash].then(function (texture2) {
          assert.equal(texture, texture2);
          done();
        });
      });
    });

    test('loads image given an <img> element', function (done) {
      var img = document.createElement('img');
      var system = this.system;
      var data = {src: IMAGE1};
      var hash = system.hash(data);

      img.setAttribute('src', IMAGE1);
      system.loadImage(img, data, function (texture) {
        assert.equal(texture.image, img);
        system.cache[hash].then(function (texture2) {
          assert.equal(texture, texture2);
          done();
        });
      });
    });

    test('caches identical image textures', function (done) {
      var system = this.system;
      var src = IMAGE1;
      var data = {src: src};
      var hash = system.hash(data);

      Promise.all([
        new Promise(function (resolve) { system.loadImage(src, data, resolve); }),
        new Promise(function (resolve) { system.loadImage(src, data, resolve); })
      ]).then(function (results) {
        assert.equal(results[0], results[1]);
        assert.equal(results[0].image.getAttribute('src'), src);
        assert.ok(system.cache[hash]);
        assert.equal(Object.keys(system.cache).length, 1);
        done();
      });
    });

    test('caches different textures for different images', function (done) {
      var system = this.system;
      var src1 = IMAGE1;
      var src2 = IMAGE2;
      var data1 = {src: src1};
      var data2 = {src: src2};

      Promise.all([
        new Promise(function (resolve) { system.loadImage(src1, data1, resolve); }),
        new Promise(function (resolve) { system.loadImage(src2, data2, resolve); })
      ]).then(function (results) {
        assert.equal(results[0].image.getAttribute('src'), src1);
        assert.equal(results[1].image.getAttribute('src'), src2);
        assert.notEqual(results[0].uuid, results[1].uuid);
        done();
      });
    });

    test('caches different textures for different repeat', function (done) {
      var system = this.system;
      var src = IMAGE1;
      var data1 = {src: src};
      var data2 = {src: src, repeat: '5 5'};
      var hash1 = system.hash(data1);
      var hash2 = system.hash(data2);

      Promise.all([
        new Promise(function (resolve) { system.loadImage(src, data1, resolve); }),
        new Promise(function (resolve) { system.loadImage(src, data2, resolve); })
      ]).then(function (results) {
        assert.notEqual(results[0].uuid, results[1].uuid);
        assert.shallowDeepEqual(results[0].repeat, {x: 1, y: 1});
        assert.shallowDeepEqual(results[1].repeat, {x: 5, y: 5});
        assert.equal(Object.keys(system.cache).length, 2);
        assert.ok(system.cache[hash1]);
        assert.ok(system.cache[hash2]);
        done();
      });
    });
  });

  suite('loadVideo', function () {
    test('loads video texture', function (done) {
      var system = this.system;
      var src = VIDEO1;
      var data = {src: VIDEO1};

      system.loadVideo(src, data, function (texture) {
        var hash = Object.keys(system.cache)[0];
        assert.equal(texture.image.getAttribute('src'), src);
        system.cache[hash].then(function (result) {
          assert.equal(texture, result.texture);
          assert.equal(texture.image, result.videoEl);
          done();
        });
      });
    });

    test('loads image given a <video> element', function (done) {
      var videoEl = document.createElement('video');
      var system = this.system;
      var data = {src: VIDEO1};

      videoEl.setAttribute('src', VIDEO1);
      system.loadVideo(videoEl, data, function (texture) {
        var hash = Object.keys(system.cache)[0];
        assert.equal(texture.image, videoEl);
        system.cache[hash].then(function (result) {
          assert.equal(texture, result.texture);
          assert.equal(texture.image, result.videoEl);
          done();
        });
      });
    });

    test('caches identical video textures', function (done) {
      var system = this.system;
      var src = VIDEO1;
      var data = {src: src};

      Promise.all([
        new Promise(function (resolve) { system.loadVideo(src, data, resolve); }),
        new Promise(function (resolve) { system.loadVideo(src, data, resolve); })
      ]).then(function (results) {
        assert.equal(results[0], results[1]);
        assert.equal(results[0].image.getAttribute('src'), src);
        assert.equal(Object.keys(system.cache).length, 1);
        done();
      });
    });

    test('caches different textures for different videos', function (done) {
      var system = this.system;
      var src1 = VIDEO1;
      var src2 = VIDEO2;
      var data1 = {src: src1};
      var data2 = {src: src2};

      Promise.all([
        new Promise(function (resolve) { system.loadVideo(src1, data1, resolve); }),
        new Promise(function (resolve) { system.loadVideo(src2, data2, resolve); })
      ]).then(function (results) {
        assert.equal(results[0].image.getAttribute('src'), src1);
        assert.equal(results[1].image.getAttribute('src'), src2);
        assert.notEqual(results[0].uuid, results[1].uuid);
        done();
      });
    });

    test('caches different textures for different repeat', function (done) {
      var system = this.system;
      var src = VIDEO1;
      var data1 = {src: src};
      var data2 = {src: src, repeat: '5 5'};

      Promise.all([
        new Promise(function (resolve) { system.loadVideo(src, data1, resolve); }),
        new Promise(function (resolve) { system.loadVideo(src, data2, resolve); })
      ]).then(function (results) {
        assert.notEqual(results[0].uuid, results[1].uuid);
        assert.shallowDeepEqual(results[0].repeat, {x: 1, y: 1});
        assert.shallowDeepEqual(results[1].repeat, {x: 5, y: 5});
        assert.equal(Object.keys(system.cache).length, 2);
        done();
      });
    });
  });
});
