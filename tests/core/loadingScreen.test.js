/* global assert, process, setup, suite, teardown, test */
var AScene = require('core/scene/a-scene').AScene;
var helpers = require('../helpers');

helpers.getSkipCISuite()('loadingScreen', function () {
  suite('setup', function () {
    setup(function () {
      AScene.prototype.setupRenderer.restore();
    });

    test('adds title element', function (done) {
      var el = this.el = document.createElement('a-scene');
      document.body.appendChild(el);
      el.addEventListener('loaded', function () {
        assert.ok(el.querySelector('.a-loader-title'));
        done();
      });
    });

    test('does not add title element if loadingScreen is disabled', function (done) {
      var el = this.el = document.createElement('a-scene');
      el.setAttribute('loading-screen', 'enabled: false');
      document.body.appendChild(el);
      el.addEventListener('loaded', function () {
        assert.notOk(el.querySelector('.a-loader-title'));
        done();
      });
    });

    test('adds title element if enabled is true', function (done) {
      var el = this.el = document.createElement('a-scene');
      el.setAttribute('loading-screen', 'enabled: true');
      document.body.appendChild(el);
      el.addEventListener('loaded', function () {
        assert.ok(el.querySelector('.a-loader-title'));
        done();
      });
    });

    teardown(function () {
      document.body.removeChild(this.el);
    });
  });
});
