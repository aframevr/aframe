/* global AFRAME, assert, screen, sinon, setup, suite, teardown, test, THREE, EventTarget */
import { AScene, determineComponentBehaviorOrder, setupCanvas } from 'core/scene/a-scene.js';
import { AEntity } from 'core/a-entity.js';
import { ANode } from 'core/a-node.js';
import { registerComponent } from 'core/component.js';
import scenes from 'core/scene/scenes.js';

import * as helpers from '../../helpers.js';

var xrSession = new EventTarget();
xrSession.requestReferenceSpace = function () {
  return Promise.resolve();
};
xrSession.end = function () {
  return Promise.resolve();
};

/**
 * Tests in this suite should not involve WebGL contexts or renderer.
 * They operate with the assumption that attachedCallback is stubbed.
 *
 * Add tests that involve the renderer to the suite at the bottom that is meant
 * to only be run locally since WebGL contexts break CI due to the headless
 * environment.
 *
 * These tests run simulating a device that supports the WebXR APIs.
 * They are based on an original set of tests for devices that supported the WebVR API
 * (which are retained below)
 *
 * The tests are broadly similar, with the exception of these tests, which
 * do not seem to be relevant for WebXR, and have been removed:
 *  - tells A-Frame about entering VR if now presenting
 *  - tells A-Frame about exiting VR if no longer presenting
 *  - requests pointerlock when restricted
 *  - exits pointerlock when unrestricted
 *  - does not exit pointerlock when unrestricted on different locked element
 *  - update existing pointerlock target when restricted
 *
 * One test from the original WebVR suite, which actually tested WebXR has been moved to this
 * suite:
 *  - reset xrSession to undefined
 */
suite('a-scene (without renderer) - WebXR', function () {
  // Some browsers (e.g. Firefox as of Feb 2023) don't support WebXR.
  // For these browsers, skip these tests.
  if (!navigator.xr) return;

  setup(function (done) {
    var el = this.el = document.createElement('a-scene');
    el.hasWebXR = true;
    el.addEventListener('loaded', function () { done(); });
    this.sinon.stub(navigator.xr, 'requestSession').returns(Promise.resolve(xrSession));
    document.body.appendChild(el);
  });

  teardown(function () {
    document.body.removeChild(this.el);
  });

  suite('createdCallback', function () {
    var sceneEl;
    setup(function () {
      sceneEl = document.createElement('a-scene');
    });

    test('initializes scene object', function () {
      assert.equal(sceneEl.object3D.type, 'Scene');
    });

    test('does not initialize systems', function () {
      assert.notOk(Object.keys(sceneEl.systems).length);
    });

    test('does not initialize renderer', function () {
      sceneEl = document.createElement('a-scene');
      // Mock renderer.
      assert.ok(sceneEl.renderer);
      // Mock renderer is not a real WebGLRenderer.
      var rendererImpl = ['WebGLRenderer', 'WebGPURenderer'].find(function (x) { return THREE[x]; });
      assert.notOk(sceneEl.renderer instanceof THREE[rendererImpl]);
    });
  });

  suite('attachedCallback', function () {
    test('initializes scene', function () {
      var sceneEl = this.el;
      assert.ok(Object.keys(sceneEl.systems).length);
      assert.ok(sceneEl.behaviors);
      assert.equal(sceneEl.hasLoaded, true, 'Has loaded');
      assert.equal(sceneEl.renderTarget, null);
      // Default components.
      assert.ok(sceneEl.hasAttribute('inspector'));
      assert.ok(sceneEl.hasAttribute('keyboard-shortcuts'));
      assert.ok(sceneEl.hasAttribute('screenshot'));
      assert.ok(sceneEl.hasAttribute('xr-mode-ui'));
    });

    test('recomputes component order upon component registration', function () {
      var sceneEl = this.el;
      var componentCount = sceneEl.componentOrder.length;

      assert.ok(componentCount > 0);
      assert.notIncludeMembers(sceneEl.componentOrder, ['test']);
      registerComponent('test', {});
      assert.equal(sceneEl.componentOrder.length, componentCount + 1);
      assert.includeMembers(sceneEl.componentOrder, ['test']);
    });
  });

  suite('enterVR', function () {
    test('does not try to enter VR if already in VR', function (done) {
      var sceneEl = this.el;
      sceneEl.addState('vr-mode');
      sceneEl.enterVR().then(function (val) {
        assert.equal(val, 'Already in VR.');
        done();
      });
    });

    test('calls requestSession if headset connected', function (done) {
      var sceneEl = this.el;
      this.sinon.stub(sceneEl, 'checkHeadsetConnected').returns(true);
      window.hasNativeWebVRImplementation = false;
      sceneEl.enterVR().then(function () {
        assert.ok(sceneEl.renderer.xr.enabled);
        done();
      });
    });

    test('calls requestSession on mobile', function (done) {
      var sceneEl = this.el;
      sceneEl.isMobile = true;
      sceneEl.enterVR().then(function () {
        assert.ok(sceneEl.renderer.xr.enabled);
        done();
      });
    });

    test('does not call requestSession if flat desktop', function (done) {
      var sceneEl = this.el;
      this.sinon.stub(sceneEl, 'checkHeadsetConnected').returns(false);
      this.sinon.stub(sceneEl.canvas, 'requestFullscreen');
      sceneEl.xrSession = {addEventListener: function () {}};
      sceneEl.enterVR().then(function () {
        assert.notOk(sceneEl.renderer.xr.enabled);
        done();
      });
    });

    test('adds VR mode state', function (done) {
      var sceneEl = this.el;
      sceneEl.xrSession = {removeEventListener: function () {}};
      sceneEl.enterVR().then(function () {
        assert.ok(sceneEl.is('vr-mode'));
        done();
      });
    });

    helpers.getSkipCITest()('adds AR mode state', function (done) {
      var sceneEl = this.el;
      if (!sceneEl.hasWebXR) { done(); }
      sceneEl.removeState('vr-mode');
      sceneEl.xrSession = {removeEventListener: function () {}};
      sceneEl.enterVR(true).then(function () {
        assert.notOk(sceneEl.is('vr-mode'));
        assert.ok(sceneEl.is('ar-mode'));
        done();
      });
    });

    test('adds fullscreen styles', function (done) {
      var sceneEl = this.el;
      sceneEl.xrSession = {removeEventListener: function () {}};
      sceneEl.enterVR().then(function () {
        assert.ok(document.documentElement.classList.contains('a-fullscreen'));
        done();
      });
    });

    test('requests fullscreen on flat desktop', function (done) {
      var sceneEl = this.el;
      var fullscreenSpy = this.sinon.stub(sceneEl.canvas, 'requestFullscreen');

      this.sinon.stub(sceneEl, 'checkHeadsetConnected').returns(false);
      sceneEl.xrSession = {addEventListener: function () {}};
      sceneEl.enterVR().then(function () {
        assert.ok(fullscreenSpy.called);
        done();
      });
    });

    test('emits enter-vr', function (done) {
      var sceneEl = this.el;
      sceneEl.addEventListener('enter-vr', function () { done(); });
      sceneEl.xrSession = {removeEventListener: function () {}};
      sceneEl.enterVR();
    });
  });

  suite('exitVR', function () {
    setup(function () {
      var sceneEl = this.el;

      // Stub canvas.
      sceneEl.canvas = document.createElement('canvas');

      // Stub renderer.
      sceneEl.renderer = {
        xr: {
          getDevice: function () {},
          setDevice: function () {},
          setPoseTarget: function () {},
          dispose: function () {},
          setReferenceSpaceType: function () {},
          setSession: function () {
            return Promise.resolve();
          },
          setFoveation: function () {}
        },
        dispose: function () {},
        getContext: function () { return undefined; },
        setAnimationLoop: function () {},
        setPixelRatio: function () {},
        setSize: function () {},
        render: function () {}
      };

      sceneEl.addState('vr-mode');
      sceneEl.xrSession = xrSession;
    });

    test('does not try to exit VR if not in VR', function (done) {
      var sceneEl = this.el;
      sceneEl.removeState('vr-mode');
      sceneEl.exitVR().then(function (val) {
        assert.equal(val, 'Not in immersive mode.');
        done();
      });
    });

    test('calls xrSession.end if headset connected', function (done) {
      var sceneEl = this.el;
      this.sinon.stub(sceneEl, 'checkHeadsetConnected').returns(true);
      sceneEl.xrSession = {
        removeEventListener: function () {},
        end: function () { return Promise.resolve(); }
      };
      sceneEl.exitVR().then(function () {
        assert.notOk(sceneEl.renderer.xr.enabled);
        done();
      });
    });

    test('calls xrSession.end on mobile', function (done) {
      this.sinon.stub(screen.orientation, 'lock');
      var sceneEl = this.el;
      sceneEl.isMobile = true;
      sceneEl.xrSession = {
        removeEventListener: function () {},
        end: function () { return Promise.resolve(); }
      };
      sceneEl.exitVR().then(function () {
        assert.notOk(sceneEl.renderer.xr.enabled);
        done();
      });
    });

    test('does not call xrSession.end on desktop without a headset', function (done) {
      var sceneEl = this.el;
      sceneEl.renderer.xr.enabled = true;
      sceneEl.isMobile = false;
      this.sinon.stub(sceneEl, 'checkHeadsetConnected').returns(false);
      this.sinon.stub(sceneEl.canvas, 'requestFullscreen');
      sceneEl.xrSession = {removeEventListener: function () {}};
      sceneEl.exitVR().then(function () {
        assert.ok(sceneEl.renderer.xr.enabled);
        done();
      });
    });

    test('removes VR mode state', function (done) {
      var sceneEl = this.el;
      sceneEl.xrSession = {
        removeEventListener: function () {},
        end: function () { return Promise.resolve(); }
      };
      sceneEl.exitVR().then(function () {
        assert.notOk(sceneEl.is('vr-mode'));
        done();
      });
    });

    test('removes fullscreen styles if embedded', function (done) {
      var sceneEl = this.el;
      sceneEl.setAttribute('embedded', 'true');
      document.documentElement.classList.add('a-fullscreen');
      sceneEl.exitVR().then(function () {
        assert.notOk(document.documentElement.classList.contains('a-fullscreen'));
        done();
      });
    });

    test('does not remove fullscreen styles if not embedded', function (done) {
      var sceneEl = this.el;
      document.documentElement.classList.add('a-fullscreen');
      sceneEl.exitVR().then(function () {
        assert.ok(document.documentElement.classList.contains('a-fullscreen'));
        done();
      });
    });

    test('emits exit-vr', function (done) {
      var sceneEl = this.el;
      sceneEl.addEventListener('exit-vr', function () { done(); });
      sceneEl.xrSession = {
        removeEventListener: function () {},
        end: function () { return Promise.resolve(); }
      };
      sceneEl.exitVR();
    });

    test('reset xrSession to undefined', function () {
      var sceneEl = this.el;
      sceneEl.xrSession = {
        removeEventListener: function () {},
        end: function () { return Promise.resolve(); }
      };
      sceneEl.renderer.xr = {
        setSession: function () {},
        dispose: function () {}
      };
      sceneEl.hasWebXR = true;
      sceneEl.checkHeadsetConnected = function () { return true; };
      assert.ok(sceneEl.xrSession);
      sceneEl.exitVR();
      assert.notOk(sceneEl.xrSession);
    });
  });

  suite('tick', function () {
    test('calls component ticks', function () {
      var sceneEl = this.el;
      var el = document.createElement('a-entity');
      var spy = this.sinon.spy();
      AFRAME.registerComponent('test', {
        tick: function () { spy(); }
      });
      el.sceneEl = sceneEl;
      el.hasLoaded = true;
      el.isPlaying = true;
      sceneEl.addBehavior(new AFRAME.components.test.Component(el));
      sceneEl.addBehavior(new AFRAME.components.test.Component(el));
      sceneEl.addBehavior({el: {isPlaying: true}});
      sceneEl.tick();
      assert.equal(spy.getCalls().length, 2);
    });

    test('calls system ticks', function () {
      var sceneEl = this.el;
      var spy = this.sinon.spy();
      AFRAME.registerSystem('test', {
        tick: function () { spy(); }
      });
      AFRAME.registerSystem('foo', {});
      sceneEl.tick();
      assert.equal(spy.getCalls().length, 1);
      delete AFRAME.systems.foo;
    });
  });

  suite('tock', function () {
    test('calls component tocks', function () {
      var sceneEl = this.el;
      var el = document.createElement('a-entity');
      var spy = this.sinon.spy();
      AFRAME.registerComponent('test', {
        tock: function () { spy(); }
      });
      el.sceneEl = sceneEl;
      el.hasLoaded = true;
      el.isPlaying = true;
      sceneEl.addBehavior(new AFRAME.components.test.Component(el));
      sceneEl.addBehavior(new AFRAME.components.test.Component(el));
      sceneEl.addBehavior({el: {isPlaying: true}, tick: () => {}});
      sceneEl.tock();
      assert.equal(spy.getCalls().length, 2);
    });

    test('calls system tocks', function () {
      var sceneEl = this.el;
      var spy = this.sinon.spy();
      AFRAME.registerSystem('test', {
        tock: function () { spy(); }
      });
      AFRAME.registerSystem('foo', {});
      sceneEl.tock();
      assert.equal(spy.getCalls().length, 1);
      delete AFRAME.systems.foo;
    });
  });

  suite('removeBehavior', function () {
    var sceneEl;
    var behaviorOne, behaviorTwo, behaviorThree;
    var spy;

    setup(function () {
      sceneEl = this.el;
      AFRAME.registerComponent('test', {});
      spy = this.sinon.spy();

      behaviorOne = { name: 'test', isPlaying: true, tick: () => spy(1), tock: () => spy(1) };
      behaviorTwo = { name: 'test', isPlaying: true, tick: () => spy(2), tock: () => spy(2) };
      behaviorThree = { name: 'test', isPlaying: true, tick: () => spy(3), tock: () => spy(3) };
      sceneEl.addBehavior(behaviorOne);
      sceneEl.addBehavior(behaviorTwo);
      sceneEl.addBehavior(behaviorThree);
    });

    ['tick', 'tock'].forEach(behaviorType => {
      test('handle deletion outside ' + behaviorType, function () {
        sceneEl.removeBehavior(behaviorTwo);

        sceneEl[behaviorType]();

        assert.deepEqual(spy.args, [[1], [3]]);
      });

      test('handle deletion during ' + behaviorType, function () {
        behaviorTwo[behaviorType] = function () {
          spy(2);
          sceneEl.removeBehavior(behaviorTwo);
        };

        sceneEl[behaviorType]();

        assert.deepEqual(spy.args, [[1], [2], [3]]);
      });

      test('handle deletion of upcoming behavior during ' + behaviorType, function () {
        behaviorTwo[behaviorType] = function () {
          spy(2);
          sceneEl.removeBehavior(behaviorThree);
        };

        sceneEl[behaviorType]();

        // Note: removal of upcoming behaviors take effect after
        assert.deepEqual(spy.args, [[1], [2], [3]]);
        assert.equal(sceneEl.behaviors.test[behaviorType].array.length, 2);
        assert.equal(sceneEl.behaviors.test[behaviorType].array[0], behaviorOne);
        assert.equal(sceneEl.behaviors.test[behaviorType].array[1], behaviorTwo);
        assert.isEmpty(sceneEl.behaviors.test[behaviorType].markedForRemoval);
      });

      test('handle deletion and subsequent adding of upcoming behavior during ' + behaviorType, function () {
        behaviorTwo[behaviorType] = function () {
          spy(2);
          sceneEl.removeBehavior(behaviorThree);
          sceneEl.addBehavior(behaviorThree);
        };

        sceneEl[behaviorType]();

        // Note: removal of upcoming behaviors take effect after
        assert.deepEqual(spy.args, [[1], [2], [3]]);
        assert.equal(sceneEl.behaviors.test[behaviorType].array.length, 3);
        assert.isEmpty(sceneEl.behaviors.test[behaviorType].markedForRemoval);
      });

      test('handle deletion of previous behavior during ' + behaviorType, function () {
        behaviorTwo[behaviorType] = function () {
          spy(2);
          sceneEl.removeBehavior(behaviorOne);
        };

        sceneEl[behaviorType]();

        assert.deepEqual(spy.args, [[1], [2], [3]]);
      });
    });
  });

  suite('resize', function () {
    var sceneEl;
    var setSizeSpy;

    setup(function () {
      sceneEl = this.el;
      sceneEl.camera = { updateProjectionMatrix: function () {} };
      sceneEl.canvas = document.createElement('canvas');
      setSizeSpy = this.sinon.spy();

      // Stub renderer.
      sceneEl.renderer = {
        xr: {
          isPresenting: function () { return true; },
          getDevice: function () { return {isPresenting: false}; },
          setDevice: function () {},
          dispose: function () {}
        },
        dispose: function () {},
        setAnimationLoop: function () {},
        setSize: setSizeSpy,
        render: function () {}
      };
    });

    test('resize renderer when not in vr mode', function () {
      sceneEl.resize();
      assert.ok(setSizeSpy.called);
    });

    test('resize renderer when in vr mode in fullscreen presentation (desktop, no headset)', function () {
      sceneEl.renderer.xr.enabled = false;
      sceneEl.addState('vr-mode');
      sceneEl.resize();
      assert.ok(setSizeSpy.called);
    });

    test('does not resize renderer when in vr mode on mobile', function () {
      sceneEl.isMobile = true;
      sceneEl.addState('vr-mode');

      sceneEl.resize();

      assert.notOk(setSizeSpy.called);
    });

    test('does not resize renderer when in vr mode and presenting in a headset', function () {
      sceneEl.renderer.xr.getDevice = function () { return {isPresenting: true}; };
      sceneEl.renderer.xr.enabled = true;
      sceneEl.addState('vr-mode');
      sceneEl.resize();

      assert.notOk(setSizeSpy.called);
    });
  });

  suite('setAttribute', function () {
    var sceneEl;
    setup(function () {
      sceneEl = this.el;
    });

    test('can set a component with a string', function () {
      sceneEl.setAttribute('fog', 'type: exponential; density: 0.75');
      var fog = sceneEl.getAttribute('fog');
      assert.equal(fog.type, 'exponential');
      assert.equal(fog.density, 0.75);
    });

    test('can set a component with an object', function () {
      var value = {type: 'exponential', density: 0.75};
      sceneEl.setAttribute('fog', value);
      var fog = sceneEl.getAttribute('fog');
      assert.equal(fog.type, 'exponential');
      assert.equal(fog.density, 0.75);
    });

    test('can clobber component attributes with an object and flag', function () {
      sceneEl.setAttribute('fog', 'type: exponential; density: 0.75');
      sceneEl.setAttribute('fog', {type: 'exponential'}, true);
      var fog = sceneEl.getAttribute('fog');
      assert.equal(fog.type, 'exponential');
      assert.equal(fog.density, 0.00025);
      assert.equal(sceneEl.getDOMAttribute('fog').density, undefined);
    });

    test('can set a single component via a single attribute', function () {
      sceneEl.setAttribute('fog', 'type', 'exponential');
      assert.equal(sceneEl.getAttribute('fog').type, 'exponential');
    });

    test('can set system attribute with a string', function () {
      sceneEl.setAttribute('renderer', 'anisotropy: 4; toneMapping: ACESFilmic');
      assert.equal(sceneEl.getAttribute('renderer').anisotropy, 4);
      assert.equal(sceneEl.getAttribute('renderer').toneMapping, 'ACESFilmic');
    });

    test('can set system attribute with an object', function () {
      sceneEl.setAttribute('renderer', {anisotropy: 4, toneMapping: 'ACESFilmic'});
      assert.equal(sceneEl.getAttribute('renderer').anisotropy, 4);
      assert.equal(sceneEl.getAttribute('renderer').toneMapping, 'ACESFilmic');
    });

    test('can set system attribute value before system initializes', function () {
      delete sceneEl.systems['renderer'];
      sceneEl.setAttribute('renderer', 'anisotropy: 4');
      assert.equal(sceneEl.getAttribute('renderer'), 'anisotropy: 4');
      sceneEl.initSystem('renderer');
      assert.equal(sceneEl.getAttribute('renderer').anisotropy, 4);
    });

    test('calls a-entity setAttribute for non-systems (component)', function () {
      var spy = this.sinon.spy(AEntity.prototype, 'setAttribute');
      sceneEl.setAttribute('fog', 'type', 'exponential');
      assert.ok(spy.calledOnce);
    });

    test('calls a-entity setAttribute for non-systems (HTML attribute)', function () {
      var spy = this.sinon.spy(AEntity.prototype, 'setAttribute');
      sceneEl.setAttribute('data-custom-attr', 'value');
      assert.ok(spy.calledOnce);
    });

    test('calls a-node setAttribute for systems', function () {
      var spy = this.sinon.spy(ANode.prototype, 'setAttribute');
      sceneEl.setAttribute('renderer', 'anisotropy: 4');
      assert.ok(spy.calledOnce);
      assert.equal(sceneEl.getAttribute('renderer').anisotropy, 4);
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
    AScene.prototype.render.restore();
    el = self.el = document.createElement('a-scene');
    document.body.appendChild(el);
    el.addEventListener('renderstart', function () {
      done();
    });
  });

  teardown(function () {
    this.sinon.stub(AScene.prototype, 'render');
    this.sinon.stub(AScene.prototype, 'setupRenderer');
  });

  suite('detachedCallback', function () {
    test.skip('cancels request animation frame', function (done) {
      var el = this.el;
      var animationFrameID;
      var cancelSpy = this.sinon.spy(window, 'cancelAnimationFrame');
      animationFrameID = el.animationFrameID;
      assert.ok(el.animationFrameID);
      document.body.removeChild(el);
      setTimeout(function () {
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
      setTimeout(function () {
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

  test('calls tick behaviors', function () {
    var scene = this.el;
    registerComponent('test', {});
    var Component = {name: 'test', isPlaying: true, tick: function () {}};
    this.sinon.spy(Component, 'tick');
    scene.addBehavior(Component);
    scene.addBehavior({name: 'dummy', isPlaying: true});
    scene.render();
    sinon.assert.called(Component.tick);
    sinon.assert.calledWith(Component.tick, scene.time);
  });

  test('calls tock behaviors', function () {
    var scene = this.el;
    registerComponent('test', {});
    var Component = {name: 'test', isPlaying: true, tock: function () {}};
    this.sinon.spy(Component, 'tock');
    scene.render = function () {
      scene.time = 1;
      if (scene.isPlaying) { scene.tock(1); }
    };
    scene.addBehavior(Component);
    scene.addBehavior({isPlaying: true});
    scene.render();
    sinon.assert.called(Component.tock);
    sinon.assert.calledWith(Component.tock, scene.time);
  });

  test.skip('clock', function () {
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

suite('setupCanvas', function () {
  test('adds canvas to a-scene element', function () {
    var el = this.sceneEl = document.createElement('a-scene');
    el.canvas = undefined;
    assert.notOk(el.canvas);
    setupCanvas(el);
    assert.ok(el.canvas);
  });
});

suite('determineComponentBehaviorOrder', function () {
  test('empty order when ordering 0 nodes', function () {
    var actual = determineComponentBehaviorOrder({});
    assert.deepEqual(actual, []);
  });

  test('retains order when no constraints are given', function () {
    var actual = determineComponentBehaviorOrder({a: {}, b: {}, c: {}});
    assert.deepEqual(actual, ['a', 'b', 'c']);
  });

  test('honors before constraint', function () {
    var actual = determineComponentBehaviorOrder({a: {}, b: {}, c: { before: ['a'] }});
    assert.sameMembers(actual, ['a', 'b', 'c']);
    assert.ok(actual.indexOf('c') < actual.indexOf('a'));
  });

  test('honors after constraint', function () {
    var actual = determineComponentBehaviorOrder({a: { after: ['c'] }, b: {}, c: {}});
    assert.sameMembers(actual, ['a', 'b', 'c']);
    assert.ok(actual.indexOf('a') > actual.indexOf('c'));
  });

  test('breaks cycles, while retaining all elements', function () {
    var actual = determineComponentBehaviorOrder({a: { after: ['c'] }, b: {}, c: { after: ['a'] }});
    assert.sameMembers(actual, ['a', 'b', 'c']);
  });

  test('handles chain of before constraints', function () {
    var actual = determineComponentBehaviorOrder({
      d: { },
      c: { before: ['d'] },
      b: { before: ['c'] },
      a: { before: ['b'] }
    });
    assert.deepEqual(actual, ['a', 'b', 'c', 'd']);
  });

  test('handles chain of after constraints', function () {
    var actual = determineComponentBehaviorOrder({
      a: { after: ['b'] },
      b: { after: ['c'] },
      c: { after: ['d'] },
      d: { }
    });
    assert.deepEqual(actual, ['d', 'c', 'b', 'a']);
  });

  test('handles multiple after constraints', function () {
    var actual = determineComponentBehaviorOrder({
      a: { after: ['b', 'c', 'd'] },
      b: { },
      c: { after: ['d', 'b'] },
      d: { }
    });
    assert.sameMembers(actual, ['a', 'b', 'c', 'd']);
    assert.equal(actual.indexOf('a'), 3);
    assert.equal(actual.indexOf('c'), 2);
  });

  test('handles multiple before constraints', function () {
    var actual = determineComponentBehaviorOrder({
      a: { },
      b: { before: ['a', 'c'] },
      c: { },
      d: { before: ['a', 'b', 'c']}
    });
    assert.sameMembers(actual, ['a', 'b', 'c', 'd']);
    assert.equal(actual.indexOf('b'), 1);
    assert.equal(actual.indexOf('d'), 0);
  });

  test('handles graph of before/after constraints', function () {
    // The following graph is modelled in constraints.
    // Arrows indicate a before relationship. Some constraints
    // are modelled as before, others as after and a few as both.
    //
    // a -> b -> c -> d
    //   \      /
    //    e -> f -> g
    //    v         ^
    //    h -> i -> j -> k
    // l
    var actual = determineComponentBehaviorOrder({
      a: { before: ['e', 'b'], after: [] },
      b: { before: [], after: [] },
      c: { before: ['d'], after: ['b', 'f'] },
      d: { before: [], after: [] },
      e: { before: [], after: [] },
      f: { before: ['g'], after: ['e'] },
      g: { before: [], after: ['f'] },
      h: { before: ['i'], after: ['e'] },
      i: { before: ['j'], after: [] },
      j: { before: ['g'], after: ['i'] },
      k: { before: [], after: ['j'] },
      l: { before: [], after: [] }
    });
    assert.sameMembers(actual, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']);
    // Verify all provided constraints.
    assert.ok(actual.indexOf('a') < actual.indexOf('e'));
    assert.ok(actual.indexOf('a') < actual.indexOf('b'));
    assert.ok(actual.indexOf('c') < actual.indexOf('d'));
    assert.ok(actual.indexOf('c') > actual.indexOf('b'));
    assert.ok(actual.indexOf('c') > actual.indexOf('f'));
    assert.ok(actual.indexOf('f') < actual.indexOf('g'));
    assert.ok(actual.indexOf('f') > actual.indexOf('e'));
    assert.ok(actual.indexOf('g') > actual.indexOf('f'));
    assert.ok(actual.indexOf('h') < actual.indexOf('i'));
    assert.ok(actual.indexOf('h') > actual.indexOf('e'));
    assert.ok(actual.indexOf('i') < actual.indexOf('j'));
    assert.ok(actual.indexOf('j') < actual.indexOf('g'));
    assert.ok(actual.indexOf('j') > actual.indexOf('i'));
    assert.ok(actual.indexOf('k') > actual.indexOf('j'));
  });
});
