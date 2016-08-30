/* global AFRAME, assert, process, sinon, setup, suite, teardown, test */
var AEntity = require('core/a-entity');
var ANode = require('core/a-node');
var AScene = require('core/scene/a-scene');
var components = require('core/component').components;
var helpers = require('../../helpers');
var systems = require('core/system').systems;

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
    var el = this.el = document.createElement('a-scene');
    document.body.appendChild(el);
  });

  teardown(function () {
    document.body.removeChild(this.el);
  });

  suite('createdCallback', function () {
    test('initializes scene object', function () {
      assert.equal(this.el.object3D.type, 'Scene');
    });

    test('does not initialize systems', function () {
      var sceneEl = document.createElement('a-scene');
      assert.notOk(Object.keys(sceneEl.systems).length);
    });
  });

  suite('attachedCallback', function () {
    test('initializes systems', function (done) {
      var self = this;
      self.el.addEventListener('loaded', function () {
        assert.ok(Object.keys(self.el.systems).length);
        done();
      });
    });
  });

  suite('init', function () {
    test('initializes scene object', function () {
      var sceneEl = this.el;
      sceneEl.isPlaying = false;
      sceneEl.hasLoaded = true;
      sceneEl.init();
      assert.equal(sceneEl.isPlaying, false);
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

  suite('system', function () {
    setup(function () {
      delete components.test;
      delete systems.test;
    });

    test('can getAttribute', function () {
      var sceneEl = document.createElement('a-scene');

      AFRAME.registerComponent('test', {schema: {default: 'component'}});
      AFRAME.registerSystem('test', {schema: {default: 'system'}});

      sceneEl.initSystem('test');
      assert.equal(sceneEl.getAttribute('test'), 'system');
      assert.equal(sceneEl.getComputedAttribute('test'), 'system');
    });

    test('does not initialize component on setAttribute', function () {
      var sceneEl = document.createElement('a-scene');
      var stub = sinon.stub();

      AFRAME.registerComponent('test', {init: stub});
      AFRAME.registerSystem('test', {});

      sceneEl.initSystem('test');
      sceneEl.setAttribute('test', '');
      assert.notOk(stub.called);
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

  suite('play', function () {
    test('has camera on renderstart', function () {
      assert.ok(this.el.camera);
    });
  });

  test('calls behaviors', function () {
    var scene = this.el;
    var Component = {el: {isPlaying: true}, tick: function () {}};
    this.sinon.spy(Component, 'tick');
    scene.addBehavior(Component);
    scene.render();
    sinon.assert.called(Component.tick);
    sinon.assert.calledWith(Component.tick, scene.time);
  });
});
