/* global AFRAME, assert, process, sinon, setup, suite, teardown, test */
var AEntity = require('core/a-entity');
var ANode = require('core/a-node');
var AScene = require('core/scene/a-scene');
var components = require('core/component').components;
var scenes = require('core/scene/scenes');
var systems = require('core/system').systems;

var helpers = require('../../helpers');

/**
 * Tests in this suite should not involve WebGL contexts or renderer.
 * They operate with the assumption that attachedCallback is stubbed.
 *
 * Add tests that involve the renderer to the suite at the bottom that is meant
 * to only be run locally since WebGL contexts break CI due to the headless
 * environment.
 */
suite('a-scene (without renderer)', function () {
  setup(function (done) {
    var el = this.el = document.createElement('a-scene');
    el.addEventListener('nodeready', function () { done(); });
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

  suite('enterVR', function () {
    setup(function () {
      var sceneEl = this.el;

      // Stub canvas.
      sceneEl.canvas = document.createElement('canvas');

      // Stub requestPresent.
      sceneEl.effect = {requestPresent: function () { return Promise.resolve(); }};
      this.requestSpy = this.sinon.spy(sceneEl.effect, 'requestPresent');
    });

    test('does not try to enter VR if already in VR', function (done) {
      var sceneEl = this.el;
      var requestSpy = this.requestSpy;
      sceneEl.addState('vr-mode');
      sceneEl.enterVR().then(function (val) {
        assert.equal(val, 'Already in VR.');
        assert.notOk(requestSpy.called);
        done();
      });
    });

    test('calls requestPresent if headset connected', function (done) {
      var sceneEl = this.el;
      var requestSpy = this.requestSpy;
      this.sinon.stub(sceneEl, 'checkHeadsetConnected').returns(true);
      sceneEl.enterVR().then(function () {
        assert.ok(requestSpy.called);
        done();
      });
    });

    test('calls requestPresent on mobile', function (done) {
      var sceneEl = this.el;
      var requestSpy = this.requestSpy;
      sceneEl.isMobile = true;
      sceneEl.enterVR().then(function () {
        assert.ok(requestSpy.called);
        done();
      });
    });

    test('does not call requestPresent if flat desktop', function (done) {
      var sceneEl = this.el;
      var requestSpy = this.requestSpy;
      sceneEl.enterVR().then(function () {
        assert.notOk(requestSpy.called);
        done();
      });
    });

    test('adds VR mode state', function (done) {
      var sceneEl = this.el;
      sceneEl.enterVR().then(function () {
        assert.ok(sceneEl.is('vr-mode'));
        done();
      });
    });

    test('adds fullscreen styles', function (done) {
      var sceneEl = this.el;
      sceneEl.enterVR().then(function () {
        assert.ok(sceneEl.classList.contains('fullscreen'));
        done();
      });
    });

    test('requests fullscreen on flat desktop', function (done) {
      var sceneEl = this.el;
      var fullscreenSpy;

      if (sceneEl.canvas.mozRequestFullScreen) {
        fullscreenSpy = this.sinon.spy(sceneEl.canvas, 'mozRequestFullScreen');
      } else if (sceneEl.canvas.webkitRequestFullScreen) {
        fullscreenSpy = this.sinon.spy(sceneEl.canvas, 'webkitRequestFullscreen');
      } else {
        fullscreenSpy = this.sinon.spy(sceneEl.canvas, 'requestFullscreen');
      }

      sceneEl.enterVR().then(function () {
        assert.ok(fullscreenSpy.called);
        done();
      });
    });

    test('emits enter-vr', function (done) {
      var sceneEl = this.el;
      sceneEl.addEventListener('enter-vr', function () { done(); });
      sceneEl.enterVR();
    });
  });

  suite('exitVR', function () {
    setup(function () {
      var sceneEl = this.el;

      // Stub canvas.
      sceneEl.canvas = document.createElement('canvas');

      // Stub exitPresent.
      sceneEl.effect = {exitPresent: function () { return Promise.resolve(); }};
      this.exitSpy = this.sinon.spy(sceneEl.effect, 'exitPresent');

      sceneEl.addState('vr-mode');
    });

    test('does not try to exit VR if not in VR', function (done) {
      var sceneEl = this.el;
      var exitSpy = this.exitSpy;
      sceneEl.removeState('vr-mode');
      sceneEl.exitVR().then(function (val) {
        assert.equal(val, 'Not in VR.');
        assert.notOk(exitSpy.called);
        done();
      });
    });

    test('calls exitPresent if headset connected', function (done) {
      var sceneEl = this.el;
      var exitSpy = this.exitSpy;
      this.sinon.stub(sceneEl, 'checkHeadsetConnected').returns(true);
      sceneEl.exitVR().then(function () {
        assert.ok(exitSpy.called);
        done();
      });
    });

    test('calls exitPresent on mobile', function (done) {
      var sceneEl = this.el;
      var exitSpy = this.exitSpy;
      sceneEl.isMobile = true;
      sceneEl.exitVR().then(function () {
        assert.ok(exitSpy.called);
        done();
      });
    });

    test('does not call exitPresent if flat desktop', function (done) {
      var sceneEl = this.el;
      var exitSpy = this.exitSpy;
      sceneEl.exitVR().then(function () {
        assert.notOk(exitSpy.called);
        done();
      });
    });

    test('removes VR mode state', function (done) {
      var sceneEl = this.el;
      sceneEl.exitVR().then(function () {
        assert.notOk(sceneEl.is('vr-mode'));
        done();
      });
    });

    test('removes fullscreen styles if embedded', function (done) {
      var sceneEl = this.el;
      sceneEl.setAttribute('embedded', 'true');
      sceneEl.classList.add('fullscreen');
      sceneEl.exitVR().then(function () {
        assert.notOk(sceneEl.classList.contains('fullscreen'));
        done();
      });
    });

    test('does not remove fullscreen styles if not embedded', function (done) {
      var sceneEl = this.el;
      sceneEl.classList.add('fullscreen');
      sceneEl.exitVR().then(function () {
        assert.ok(sceneEl.classList.contains('fullscreen'));
        done();
      });
    });

    test('emits exit-vr', function (done) {
      var sceneEl = this.el;
      sceneEl.addEventListener('exit-vr', function () { done(); });
      sceneEl.exitVR();
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
    teardown(function () {
      delete components.test;
      delete systems.test;
    });

    test('can getAttribute', function () {
      var sceneEl = document.createElement('a-scene');

      AFRAME.registerComponent('test', {schema: {default: 'component'}});
      AFRAME.registerSystem('test', {schema: {default: 'system'}});

      sceneEl.initSystem('test');
      assert.equal(sceneEl.getAttribute('test'), 'system');
      assert.equal(sceneEl.getAttribute('test'), 'system');
    });

    test('does not initialize component on setAttribute', function (done) {
      var sceneEl = document.createElement('a-scene');
      var stub = sinon.stub();

      AFRAME.registerComponent('test', {init: stub});
      AFRAME.registerSystem('test', {});

      sceneEl.setAttribute('test', '');

      sceneEl.addEventListener('loaded', () => {
        assert.notOk(stub.called);
        done();
      });
      document.body.appendChild(sceneEl);
    });

    test('does not update component', function (done) {
      var childEl;
      var componentUpdateStub = sinon.stub();
      var sceneEl;

      AFRAME.registerComponent('test', {
        schema: {componentProp: {default: 'foo'}},
        update: componentUpdateStub
      });
      AFRAME.registerSystem('test', {
        schema: {systemProp: {default: 'foo'}}
      });

      childEl = document.createElement('a-entity');
      sceneEl = document.createElement('a-scene');
      childEl.setAttribute('test', '');
      sceneEl.setAttribute('test', '');
      sceneEl.appendChild(childEl);

      sceneEl.addEventListener('loaded', () => {
        assert.notOk('systemProp' in childEl.components.test.data);
        assert.equal(componentUpdateStub.callCount, 1);
        done();
      });
      document.body.appendChild(sceneEl);
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

    test('calls component pause handlers', function (done) {
      var el = this.el;
      AFRAME.registerComponent('foo', {
        pause: function () {
          delete AFRAME.components.foo;
          done();
        }
      });
      el.setAttribute('foo', '');
      document.body.removeChild(el);
    });

    test('calls component remove handlers', function (done) {
      var el = this.el;
      AFRAME.registerComponent('foo', {
        remove: function () {
          delete AFRAME.components.foo;
          done();
        }
      });
      el.setAttribute('foo', '');
      document.body.removeChild(el);
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

  test('clock', function () {
    var scene = this.el;

    assert.isAbove(scene.time, 0);
    var prevTime = scene.time;
    assert.ok(scene.time, scene.clock.elapsedTime);
    for (var i = 0; i < 10; i++) {
      scene.render();
      assert.isAbove(scene.time, prevTime);
      assert.ok(scene.time, scene.clock.elapsedTime);
      prevTime = scene.time;
    }
  });
});

suite('scenes', function () {
  var sceneEl;

  setup(function () {
    scenes.length = 0;
    sceneEl = document.createElement('a-scene');
  });

  test('is appended with scene attach', function (done) {
    assert.notOk(scenes.length);
    sceneEl.addEventListener('loaded', () => {
      assert.ok(scenes.length);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('is popped with scene detached', function (done) {
    sceneEl.addEventListener('loaded', () => {
      assert.ok(scenes.length);
      document.body.removeChild(sceneEl);
      setTimeout(() => {
        assert.notOk(scenes.length);
        done();
      });
    });
    document.body.appendChild(sceneEl);
  });
});
