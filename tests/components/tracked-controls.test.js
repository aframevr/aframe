/* global assert, setup, suite, test, THREE */
import { entityFactory } from '../helpers.js';

suite('tracked-controls', function () {
  var component;
  var controller;
  var el;
  var system;
  var standingMatrix = new THREE.Matrix4();

  setup(function (done) {
    standingMatrix.identity();
    el = entityFactory();
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function () {
        system = el.sceneEl.systems['tracked-controls'];
        controller = {
          handedness: 'left',
          profiles: ['test']
        };
        system.controllers = [controller];
        el.setAttribute('tracked-controls', {'hand': 'right'});
        component = el.components['tracked-controls'];
        component.controller = undefined;
        done();
      });
    });
  });

  suite('updateGamepad', function () {
    test('matches controller with same hand', function () {
      assert.strictEqual(component.controller, undefined);
      el.setAttribute('tracked-controls', {id: 'test', hand: 'left'});
      component.updateController();
      assert.equal(component.controller, controller);
    });

    test('matches generic controller', function () {
      controller = {
        handedness: 'left',
        profiles: ['generic-touchpad']
      };
      system.controllers = [controller];
      assert.strictEqual(component.controller, undefined);
      el.setAttribute('tracked-controls',
                      {id: 'generic', hand: 'left', iterateControllerProfiles: true});
      component.updateController();
      assert.equal(component.controller, controller);
    });
  });

  suite('trackedSources', function () {
    function makeController () {
      return {
        handedness: 'right',
        profiles: ['test'],
        gamepad: {buttons: [], axes: []},
        gripSpace: {},
        targetRaySpace: {}
      };
    }

    function updateSources (inputSources, trackedSources) {
      system.el.xrSession = {
        inputSources: inputSources,
        trackedSources: trackedSources,
        requestReferenceSpace: function () { return Promise.resolve({}); }
      };
      system.onInputSourcesChange();
    }

    test('keeps a controller match when its source moves out of inputSources', function () {
      var controllerSource = makeController();
      updateSources([], [controllerSource]);
      component.updateController();
      assert.deepEqual(system.controllers, [controllerSource]);
      assert.strictEqual(component.controller, controllerSource);
    });

    test('prefers matching inputSources over trackedSources', function () {
      var inputController = makeController();
      var trackedController = makeController();
      updateSources([inputController], [trackedController]);
      component.updateController();
      assert.strictEqual(system.controllers[0], inputController);
      assert.strictEqual(component.controller, inputController);
    });

    test('works when trackedSources is unavailable', function () {
      var inputController = makeController();
      updateSources([inputController], undefined);
      assert.deepEqual(system.controllers, [inputController]);
    });

    test('does not add a hand-only tracked source as a controller', function () {
      var handOnly = {
        handedness: 'right',
        profiles: ['test'],
        hand: {},
        gripSpace: {},
        targetRaySpace: {}
      };
      updateSources([], [handOnly]);
      component.updateController();
      assert.deepEqual(system.controllers, []);
      assert.isUndefined(component.controller);
    });
  });

  suite('tick', function () {
    test('updates pose and buttons even if mesh is not defined', function () {
      el.sceneEl.frame = {
        getPose: function () {
          var euler = new THREE.Euler(Math.PI / 2, 0, 0);
          return {
            transform: {
              matrix: new THREE.Matrix4().compose(
                new THREE.Vector3(1, 2, 3),
                new THREE.Quaternion().setFromEuler(euler),
                new THREE.Vector3(1, 1, 1)).elements
            }
          };
        }
      };
      component.system.referenceSpace = {};
      component.controller = {};
      component.tick();
      assert.shallowDeepEqual(component.el.getAttribute('position'), {x: 1, y: 2, z: 3});
      assert.shallowDeepEqual(Math.round(component.el.getAttribute('rotation').x), 90);
    });
  });
});
