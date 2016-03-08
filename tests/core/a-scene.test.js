/* global assert, process, sinon, setup, suite, teardown, test */
'use strict';
var helpers = require('../helpers');
var AEntity = require('core/a-entity');
var ANode = require('core/a-node');
var AScene = require('core/scene/a-scene');
var metaTags = require('core/scene/metaTags');

/**
 * Tests in this suite should not involve WebGL contexts or renderer.
 * They operate with the assumption that attachedCallback is stubbed.
 *
 * Add tests that involve the renderer to the suite at the bottom that is meant
 * to only be run locally since WebGL contexts break CI due to the headless
 * environment.
 */
suite('a-scene (without renderer)', function () {
  setup(function () {
    var el;
    el = this.el = document.createElement('a-scene');
    document.body.appendChild(el);
  });

  teardown(function () {
    document.body.removeChild(this.el);
  });

  suite('createdCallback', function () {
    test('initializes scene object', function () {
      assert.equal(this.el.object3D.type, 'Scene');
    });
  });

  suite('init', function () {
    test('initializes scene object', function () {
      var sceneEl = this.el;
      sceneEl.isPlaying = false;
      sceneEl.hasLoaded = true;
      sceneEl.init();
      assert.equal(sceneEl.isPlaying, true);
      assert.equal(sceneEl.hasLoaded, false);
    });
  });

  suite('reload', function () {
    test('reload scene innerHTML to original value', function () {
      var sceneEl = this.el;
      sceneEl.innerHTML = 'NEW';
      sceneEl.reload();
      assert.equal(sceneEl.innerHTML, '');
    });

    test('reloads the scene and pauses', function () {
      var sceneEl = this.el;
      this.sinon.spy(AEntity.prototype, 'pause');
      this.sinon.spy(ANode.prototype, 'load');
      sceneEl.reload(true);
      sinon.assert.called(AEntity.prototype.pause);
      sinon.assert.called(ANode.prototype.load);
    });
  });
});

/**
 * Skipped on CI using environment variable defined in the npm test script.
 */
helpers.getSkipCISuite()('a-scene (with renderer)', function () {
  setup(function (done) {
    var el;
    var self = this;
    AScene.prototype.setupRenderer.restore();
    AScene.prototype.resize.restore();
    AScene.prototype.render.restore();
    process.nextTick(function () {
      el = self.el = document.createElement('a-scene');
      document.body.appendChild(el);
      el.addEventListener('renderstart', function () {
        done();
      });
    });
  });

  suite('attachedCallback', function () {
    test('sets up renderer', function () {
      assert.ok(this.el.renderer);
    });
  });

  suite('detachedCallback', function () {
    test('cancels request animation frame', function (done) {
      var el = this.el;
      var animationFrameID = el.animationFrameID;
      var cancelSpy = this.sinon.spy(window, 'cancelAnimationFrame');

      assert.ok(el.animationFrameID);
      document.body.removeChild(el);
      process.nextTick(function () {
        assert.notOk(el.animationFrameID);
        assert.ok(cancelSpy.calledWith(animationFrameID));
        done();
      });
    });

    test('does not destroy document.body', function (done) {
      var el = this.el;
      document.body.removeChild(el);
      process.nextTick(function () {
        assert.ok(document.body);
        done();
      });
    });
  });

  test('calls behaviors', function () {
    var scene = this.el;
    var Component = { el: { isPlaying: true }, tick: function () {} };
    this.sinon.spy(Component, 'tick');
    scene.addBehavior(Component);
    scene.render();
    sinon.assert.called(Component.tick);
    sinon.assert.calledWith(Component.tick, scene.time);
  });
});

helpers.getSkipCISuite()('a-scene (for iOS)', function () {
  setup(function (done) {
    var el;
    var self = this;
    // Remove all previous meta tags injected.
    var metaTags = document.querySelectorAll('meta');
    for (var i = 0, len = metaTags.length; i < len; i++) {
      metaTags[i].parentNode.removeChild(metaTags[i]);
    }
    AScene.prototype.setupRenderer.restore();
    AScene.prototype.resize.restore();
    AScene.prototype.render.restore();
    process.nextTick(function () {
      el = self.el = document.createElement('a-scene');
      el.isIOS = true;
      document.body.appendChild(el);
      el.addEventListener('renderstart', function () {
        done();
      });
    });
  });

  suite('attachedCallback', function () {
    test('sets up meta tags', function () {
      assert.equal(document.querySelector('meta[name="viewport"]').content,
        metaTags.MOBILE_HEAD_TAGS[0].attributes.content);
      var webAppCapableMetaTag = document.querySelector('meta[name="web-app-capable"]');
      assert.ok(webAppCapableMetaTag);
      assert.equal(webAppCapableMetaTag.content, 'yes');
      var appleMobileWebAppCapableMetaTag = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      assert.ok(appleMobileWebAppCapableMetaTag);
      assert.equal(appleMobileWebAppCapableMetaTag.content, 'yes');
    });
  });
});

helpers.getSkipCISuite()('a-scene (for non-iOS)', function () {
  setup(function (done) {
    var el;
    var self = this;
    // Remove all previous meta tags injected.
    var metaTags = document.querySelectorAll('meta');
    for (var i = 0, len = metaTags.length; i < len; i++) {
      metaTags[i].parentNode.removeChild(metaTags[i]);
    }
    AScene.prototype.setupRenderer.restore();
    AScene.prototype.resize.restore();
    AScene.prototype.render.restore();
    process.nextTick(function () {
      el = self.el = document.createElement('a-scene');
      el.isIOS = false;
      document.body.appendChild(el);
      el.addEventListener('renderstart', function () {
        done();
      });
    });
  });

  suite('attachedCallback', function () {
    test('sets up meta tags', function () {
      assert.equal(document.querySelector('meta[name="viewport"]').content,
        metaTags.MOBILE_HEAD_TAGS[0].attributes.content);
      var webAppCapableMetaTag = document.querySelector('meta[name="web-app-capable"]');
      assert.ok(webAppCapableMetaTag);
      var appleMobileWebAppCapableMetaTag = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      assert.notOk(appleMobileWebAppCapableMetaTag);
    });
  });
});
