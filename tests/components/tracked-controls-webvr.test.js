/* global assert, process, setup, sinon, suite, teardown, test, THREE */
const entityFactory = require('../helpers').entityFactory;

const PI = Math.PI;

suite('tracked-controls-webvr', function () {
  var component;
  var controller;
  var el;
  var system;
  var standingMatrix = new THREE.Matrix4();

  setup(function (done) {
    standingMatrix.identity();
    el = entityFactory();
    setTimeout(() => {
      el.setAttribute('position', '');
      el.setAttribute('tracked-controls', '');
      el.sceneEl.addEventListener('loaded', function () {
        el.parentNode.renderer.xr.getStandingMatrix = function () {
          return standingMatrix;
        };
        component = el.components['tracked-controls-webvr'];
        system = component.system;
        controller = {
          id: 'OpenVR Gamepad',
          pose: {
            position: [0, 0, 0],
            orientation: [0, 0, 0, 1]
          },
          buttons: [
            {pressed: false, touched: false, value: 0},
            {pressed: false, touched: false, value: 0}
          ],
          axes: [0, 0, 0]
        };
        system.controllers = [controller];
        el.setAttribute('tracked-controls-webvr', 'id', 'OpenVR Gamepad');
        done();
      });
    });
  });

  suite('updateGamepad', function () {
    test('matches controller with same id', function () {
      assert.strictEqual(component.controller, undefined);
      el.setAttribute('tracked-controls-webvr', 'id', 'OpenVR Gamepad');
      component.tick();
      assert.equal(component.controller, controller);
    });

    test('matches controller with prefix', function () {
      assert.strictEqual(component.controller, undefined);
      el.setAttribute('tracked-controls-webvr', 'idPrefix', 'OpenVR');
      component.tick();
      assert.equal(component.controller, controller);
    });

    test('does not match controller by default', function () {
      assert.strictEqual(component.controller, undefined);
      el.setAttribute('tracked-controls-webvr', {}, true);
      component.tick();
      assert.strictEqual(component.controller, undefined);
    });

    test('does not match controller with different id', function () {
      assert.strictEqual(component.controller, undefined);
      el.setAttribute('tracked-controls-webvr', 'id', 'foo');
      component.tick();
      assert.strictEqual(component.controller, undefined);
    });

    test('does not match controller with different prefix', function () {
      assert.strictEqual(component.controller, undefined);
      el.setAttribute('tracked-controls-webvr', 'idPrefix', 'foo');
      component.tick();
      assert.strictEqual(component.controller, undefined);
    });

    test('set controller to undefined if controller not found', function () {
      assert.strictEqual(component.controller, undefined);
      el.setAttribute('tracked-controls-webvr', 'id', 'OpenVR Gamepad');
      component.tick();
      assert.equal(component.controller, controller);
      system.controllers = [];
      component.tick();
      assert.strictEqual(component.controller, undefined);
    });
  });

  suite('tick', function () {
    test('updates pose and buttons even if mesh is not defined', function () {
      var updateButtonsSpy = sinon.spy(component, 'updateButtons');
      var updatePoseSpy = sinon.spy(component, 'updatePose');
      assert.notOk(el.getObject3D('mesh'));
      component.tick();
      sinon.assert.calledOnce(updatePoseSpy);
      sinon.assert.calledOnce(updateButtonsSpy);
    });
  });

  suite('updatePose (position)', function () {
    test('defaults position to zero vector', function () {
      controller.pose.position = [0, 0, 0];
      el.setAttribute('position', '0 0 0');
      component.tick();
      assertVec3(el.getAttribute('position'), [0, 0, 0]);
    });

    test('applies position from gamepad pose', function () {
      controller.pose.position = [1, 2, 3];
      el.sceneEl.systems['tracked-controls-webvr'].vrDisplay = true;
      component.tick();
      assertVec3(el.getAttribute('position'), [1, 2, 3]);
    });

    test('handles unchanged Gamepad position', function () {
      controller.pose.position = [4, 5, -6];
      el.sceneEl.systems['tracked-controls-webvr'].vrDisplay = true;
      component.tick();
      el.setAttribute('position', '-1 2 -3');
      component.tick();
      assertVec3(el.getAttribute('position'), [4, 5, -6]);
    });

    test('applies new Gamepad position to manually positioned entity', function () {
      controller.pose.position = [1, 2, 3];
      el.sceneEl.systems['tracked-controls-webvr'].vrDisplay = true;
      component.tick();
      assertVec3(el.getAttribute('position'), [1, 2, 3]);

      el.setAttribute('position', '10 10 10');
      controller.pose.position = [2, 4, 6];
      component.tick();
      assertVec3(el.getAttribute('position'), [2, 4, 6]);
    });

    test('applies standing matrix transform', function () {
      standingMatrix.makeTranslation(1, 0.5, -3);
      controller.pose.position = [1, 2, 3];
      el.sceneEl.systems['tracked-controls-webvr'].vrDisplay = true;
      component.tick();
      assertVec3(el.getAttribute('position'), [2, 2.5, 0]);
    });

    test('does not apply standing matrix transform for 3DoF', function () {
      standingMatrix.makeTranslation(1, 0.5, -3);
      controller.pose.position = null;
      el.setAttribute('tracked-controls-webvr', 'armModel', true);
      el.sceneEl.systems['tracked-controls-webvr'].vrDisplay = true;
      component.tick();
      // assert position after default camera position and arm model are applied
      assertVec3CloseTo(el.getAttribute('position'), [0.28, 1.12, -0.32], 0.01);
    });
  });

  suite('updatePose (rotation)', function () {
    test('defaults rotation to zero', function () {
      controller.pose.orientation = toQuaternion(0, 0, 0);
      el.setAttribute('rotation', '0 0 0');
      component.tick();
      assert.shallowDeepEqual(el.object3D.quaternion.toArray(), [0, 0, 0, 1]);
    });

    test('applies rotation from Gamepad pose', function () {
      controller.pose.orientation = toQuaternion(PI, PI / 2, PI / 3);
      el.sceneEl.systems['tracked-controls-webvr'].vrDisplay = true;
      component.tick();
      assertQuaternion(el.object3D.quaternion, controller.pose.orientation);
    });

    test('applies rotation absolutely', function () {
      controller.pose.orientation = toQuaternion(PI, PI / 2, PI / 3);
      el.sceneEl.systems['tracked-controls-webvr'].vrDisplay = true;
      el.setAttribute('rotation', '180 90 60');
      component.tick();
      assertQuaternion(el.object3D.quaternion, controller.pose.orientation);

      controller.pose.orientation = toQuaternion(PI / 2, PI / 3, PI / 4);
      component.tick();
      assertQuaternion(el.object3D.quaternion, controller.pose.orientation);
    });

    test('handles unchanged Gamepad rotation', function () {
      controller.pose.orientation = toQuaternion(PI, PI / 2, PI / 3);
      el.sceneEl.systems['tracked-controls-webvr'].vrDisplay = true;
      component.tick();
      assertQuaternion(el.object3D.quaternion, controller.pose.orientation);
    });

    test('applies orientation offset', function () {
      el.setAttribute('tracked-controls-webvr', 'orientationOffset', {x: 3, y: 4, z: 5});
      component.tick();
      var rotation = el.getAttribute('rotation');
      rotation.x = Math.round(rotation.x);
      rotation.y = Math.round(rotation.y);
      rotation.z = Math.round(rotation.z);
      assertVec3(rotation, [3, 4, 5]);
    });
  });

  suite('handleAxes', function () {
    test('does not emit on initial state', function () {
      const emitSpy = sinon.spy(el, 'emit');
      component.tick();
      assert.notOk(component.handleAxes());
      sinon.assert.notCalled(emitSpy);
    });

    test('emits axismove on first touch', function () {
      const emitSpy = sinon.spy(el, 'emit');
      controller.axes = [0.5, 0.5, 0.5];
      assert.deepEqual(component.axis, [0, 0, 0]);
      component.tick();
      assert.deepEqual(component.axis, [0.5, 0.5, 0.5]);
      assert.equal(emitSpy.getCalls()[0].args[0], 'axismove');
      assert.deepEqual(emitSpy.getCalls()[0].args[1].axis, [0.5, 0.5, 0.5]);
      assert.deepEqual(emitSpy.getCalls()[0].args[1].changed, [true, true, true]);
    });

    test('emits axismove if axis changed', function () {
      controller.axes = [0.5, 0.5, 0.5];
      component.tick();
      assert.deepEqual(component.axis, [0.5, 0.5, 0.5]);

      const emitSpy = sinon.spy(el, 'emit');
      controller.axes = [1, 1, 1];
      component.tick();
      const emitCall = emitSpy.getCalls()[0];
      assert.equal(emitCall.args[0], 'axismove');
      assert.deepEqual(emitCall.args[1].axis, [1, 1, 1]);
      assert.deepEqual(emitCall.args[1].changed, [true, true, true]);
    });

    test('emits axismove with correct axis changed flags', function () {
      controller.axes = [0.5, 0.5, 0.5];
      component.tick();
      assert.deepEqual(component.axis, [0.5, 0.5, 0.5]);

      const emitSpy = sinon.spy(el, 'emit');
      controller.axes = [1, 0.5, 0.5];
      component.tick();
      const emitCall = emitSpy.getCalls()[0];
      assert.equal(emitCall.args[0], 'axismove');
      assert.deepEqual(emitCall.args[1].axis, [1, 0.5, 0.5]);
      assert.deepEqual(emitCall.args[1].changed, [true, false, false]);
    });
  });

  suite('handleButton', function () {
    test('does not emit if button not pressed', function () {
      const emitSpy = sinon.spy(el, 'emit');
      component.tick();
      sinon.assert.notCalled(emitSpy);
    });

    test('emits buttonchanged if button pressed', function () {
      const emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].pressed = true;
      component.tick();

      const emitChangedCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonchanged');
      assert.equal(emitChangedCalls.length, 1);

      assertButtonEvent(emitChangedCalls[0], 'buttonchanged', 0, controller.buttons[0]);
    });

    test('emits buttonchanged if button touched', function () {
      const emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].touched = true;
      component.tick();

      const emitChangedCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonchanged');
      assert.equal(emitChangedCalls.length, 1);

      assertButtonEvent(emitChangedCalls[0], 'buttonchanged', 0, controller.buttons[0]);
    });

    test('emits buttonchanged if value changed', function () {
      const emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].value = 0.5;
      component.tick();

      const emitChangedCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonchanged');
      assert.equal(emitChangedCalls.length, 1);

      assertButtonEvent(emitChangedCalls[0], 'buttonchanged', 0, controller.buttons[0]);
    });

    test('emits independent streams for buttondown, touchstart and buttonchanged', function () {
      const emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].pressed = true;
      controller.buttons[0].touched = true;
      component.tick();

      // We should emit button, touch and changed calls.
      assert.equal(emitSpy.getCalls().length, 3);
      const emitButtonCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttondown');
      assert.equal(emitButtonCalls.length, 1);

      const emitTouchCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'touchstart');
      assert.equal(emitTouchCalls.length, 1);

      const emitChangedCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonchanged');
      assert.equal(emitChangedCalls.length, 1);

      assertButtonEvent(emitButtonCalls[0], 'buttondown', 0, controller.buttons[0]);
      assertButtonEvent(emitTouchCalls[0], 'touchstart', 0, controller.buttons[0]);
      assertButtonEvent(emitChangedCalls[0], 'buttonchanged', 0, controller.buttons[0]);
    });

    test('emits independent streams for buttonup, touchend and buttonchanged', function () {
      const emitSpy = sinon.spy(el, 'emit');
      component.buttonStates[0] = {pressed: true, touched: true, value: 1};
      controller.buttons[0].pressed = false;
      controller.buttons[0].touched = false;
      controller.buttons[0].value = 0;
      component.tick();

      // Filter down to just our expected events for verification.
      const emitButtonCalls = emitSpy.getCalls().filter(call => call.args[0] === 'buttonup');
      assert.equal(emitButtonCalls.length, 1);

      const emitTouchCalls = emitSpy.getCalls().filter(call => call.args[0] === 'touchend');
      assert.equal(emitTouchCalls.length, 1);

      const emitChangedCalls = emitSpy.getCalls().filter(call => call.args[0] === 'buttonchanged');
      assert.equal(emitChangedCalls.length, 1);

      // Verify each of the 3 events has the correct event name and state.
      assertButtonEvent(emitButtonCalls[0], 'buttonup', 0, controller.buttons[0]);
      assertButtonEvent(emitTouchCalls[0], 'touchend', 0, controller.buttons[0]);
      assertButtonEvent(emitChangedCalls[0], 'buttonchanged', 0, controller.buttons[0]);
    });

    test('emits correct event stream for spaced out interaction.', function () {
      // First round, verify we only see a touchstart and buttonchanged
      let emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].touched = true;
      component.tick();

      assertEventStream(emitSpy.getCalls(), ['buttonchanged', 'touchstart'], ['buttondown', 'buttonup', 'touchend']);
      emitSpy.restore();

      // Second round, verify we only see a buttondown and buttonchanged since pressed state isn't changing.
      emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].pressed = true;
      component.tick();

      assertEventStream(emitSpy.getCalls(), ['buttonchanged', 'buttondown'], ['buttonup', 'touchend', 'touchstart']);
      emitSpy.restore();

      // Third round, verify we only see a buttonup and button changed when we release the button.
      emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].pressed = false;
      component.tick();

      assertEventStream(emitSpy.getCalls(), ['buttonchanged', 'buttonup'], ['buttondown', 'touchend', 'touchstart']);
      emitSpy.restore();

      // Fourth round, verify we only see a touchend and button changed when we lift our touch.
      emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].touched = false;
      component.tick();

      assertEventStream(emitSpy.getCalls(), ['buttonchanged', 'touchend'], ['buttondown', 'buttonup', 'touchstart']);
      emitSpy.restore();
    });

    test('emits correct event states on a fast click', function () {
      // First round, verify we see all activation events
      let emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].pressed = true;
      controller.buttons[0].touched = true;
      controller.buttons[0].value = 1;
      component.tick();

      assertEventStream(emitSpy.getCalls(), ['buttonchanged', 'buttondown', 'touchstart'], ['buttonup', 'touchend']);
      emitSpy.restore();

      // Second round, verify we see all deactivation events
      emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].pressed = false;
      controller.buttons[0].touched = false;
      controller.buttons[0].value = 0;
      component.tick();

      assertEventStream(emitSpy.getCalls(), ['buttonchanged', 'buttonup', 'touchend'], ['buttondown', 'touchstart']);
      emitSpy.restore();

      // Finally verify there are no events backed up because of bad carryover state.
      emitSpy = sinon.spy(el, 'emit');
      component.tick();
      sinon.assert.notCalled(emitSpy);
    });
  });

  suite('handlePress', function () {
    test('does not emit anything if button not pressed', function () {
      const emitSpy = sinon.spy(el, 'emit');
      component.tick();
      sinon.assert.notCalled(emitSpy);
      assert.notOk(component.handlePress(0, {pressed: false, touched: false, value: 0}));
    });

    test('emits buttondown if button pressed', function () {
      const emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].pressed = true;
      component.tick();

      const emitDownCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttondown');
      assert.equal(emitDownCalls.length, 1);

      assertButtonEvent(emitDownCalls[0], 'buttondown', 0, controller.buttons[0]);
    });

    test('emits buttonup if button released', function () {
      const emitSpy = sinon.spy(el, 'emit');
      component.buttonStates[1] = {pressed: true, touched: false, value: 1};
      component.buttonEventDetails[1] = {id: 1, state: component.buttonStates[1]};
      controller.buttons[1].pressed = false;
      controller.buttons[1].value = 0;
      component.tick();

      const emitUpCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonup');
      assert.equal(emitUpCalls.length, 1);

      assertButtonEvent(emitUpCalls[0], 'buttonup', 1, controller.buttons[1]);
    });

    test('does not emit buttonup if button pressed', function () {
      const emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].pressed = true;
      component.tick();
      const emitUpCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonup');
      assert.notOk(emitUpCalls.length);
    });

    test('does not emit buttondown if button released', function () {
      const emitSpy = sinon.spy(el, 'emit');
      component.buttonStates[1] = {pressed: true, touched: false, value: 1};
      controller.buttons[1].pressed = false;
      controller.buttons[1].value = 0;
      component.tick();

      const emitDownCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttondown');
      assert.notOk(emitDownCalls.length);
    });
  });

  suite('handleTouch', function () {
    test('does not do anything if button not touched', function () {
      const emitSpy = sinon.spy(el, 'emit');
      component.tick();
      sinon.assert.notCalled(emitSpy);
      assert.notOk(component.handleTouch(0, {pressed: false, touched: false, value: 0}));
    });

    test('emits touchstart if button touched', function () {
      const emitSpy = sinon.spy(el, 'emit');
      controller.buttons[0].touched = true;
      component.tick();

      const emitStartCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'touchstart');
      assert.equal(emitStartCalls.length, 1);

      assertButtonEvent(emitStartCalls[0], 'touchstart', 0, controller.buttons[0]);
    });

    test('emits touchend if button no longer touched', function () {
      const emitSpy = sinon.spy(el, 'emit');
      component.buttonStates[1] = {pressed: false, touched: true, value: 1};
      component.buttonEventDetails[1] = {id: 1, state: component.buttonStates[1]};
      controller.buttons[1].touched = false;
      controller.buttons[1].value = 0;
      component.tick();

      const emitEndCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'touchend');
      assert.equal(emitEndCalls.length, 1);

      assertButtonEvent(emitEndCalls[0], 'touchend', 1, controller.buttons[1]);
    });
  });

  suite('handleValue', function () {
    test('stores default button value in button states', function () {
      component.tick();
      assert.equal(component.buttonStates[0].value, 0);
      assert.equal(component.buttonStates[1].value, 0);
    });

    test('stores changed button value in button states', function () {
      controller.buttons[0].value = 0.25;
      controller.buttons[1].value = 0.75;
      component.tick();
      assert.equal(component.buttonStates[0].value, 0.25);
      assert.equal(component.buttonStates[1].value, 0.75);
    });
  });

  suite('armModel', function () {
    setup(function () {
      controller.pose.position = null;
    });

    test('if armModel false, do not apply', function () {
      var applyArmModelSpy = sinon.spy(component, 'applyArmModel');
      component.data.armModel = false;
      component.tick();
      sinon.assert.notCalled(applyArmModelSpy);
    });

    test('if armModel true, apply', function () {
      var applyArmModelSpy = sinon.spy(component, 'applyArmModel');
      component.data.armModel = true;
      component.tick();
      sinon.assert.calledOnce(applyArmModelSpy);
    });

    teardown(function () {
      controller.pose.position = [0, 0, 0];
    });
  });
});

function assertVec3CloseTo (vec3, arr, delta) {
  var debugOutput = `${[vec3.x, vec3.y, vec3.z]} is not close to ${arr}`;
  assert.closeTo(vec3.x, arr[0], delta, debugOutput);
  assert.closeTo(vec3.y, arr[1], delta, debugOutput);
  assert.closeTo(vec3.z, arr[2], delta, debugOutput);
}

function assertVec3 (vec3, arr) {
  var debugOutput = `${[vec3.x, vec3.y, vec3.z]} does not equal ${arr}`;
  assert.equal(vec3.x, arr[0], debugOutput);
  assert.equal(vec3.y, arr[1], debugOutput);
  assert.equal(vec3.z, arr[2], debugOutput);
}

function assertQuaternion (quaternion, arr) {
  quaternion = quaternion.toArray();
  // Compute negative quaternion if necessary. Equivalent rotations.
  // eslint-disable-next-line eqeqeq
  if (quaternion[0].toFixed(5) * -1 == arr[0].toFixed(5)) {
    quaternion = quaternion.map(n => -1 * n);
  }
  // Round.
  quaternion = quaternion.map(n => n.toFixed(5));
  arr = arr.map(n => n.toFixed(5));

  assert.shallowDeepEqual(quaternion, arr);
}

function toQuaternion (x, y, z) {
  var euler = new THREE.Euler();
  var quaternion = new THREE.Quaternion();
  return (function () {
    euler.fromArray([x, y, z]);
    quaternion.setFromEuler(euler);
    return quaternion.toArray();
  })();
}

/**
 * Given a button event emit call that has been spied, verify all of the
 * data matches.
 *
 * @param {object} eventCall - The spied call to emit.
 * @param {string} eventName - The expected name of the event.
 * @param {number} eventId - The button id firing the event.
 * @param {object} eventState - The full event state.
 */
function assertButtonEvent (eventCall, eventName, eventId, eventState) {
  assert.equal(eventCall.args[0], eventName);
  assert.equal(eventCall.args[1].id, eventId);
  assert.deepEqual(eventCall.args[1].state, eventState);
}

/**
 * Verifies a stream of events includes and excludes the expected event names.
 *
 * @param {Array} eventCalls - The spied calls to emit for all events.
 * @param {Array} expectedEvents - The expected events in the stream. Must be present.
 * @param {Array} excludedEvents - Unexpected events in the stream. Must be excluded.
 */
function assertEventStream (eventCalls, expectedEvents, excludedEvents) {
  for (var eventCall of eventCalls) {
    const expectedIndex = expectedEvents.indexOf(eventCall.args[0]);
    const discludedIndex = excludedEvents.indexOf(eventCall.args[0]);

    // Ensure we don't have a discluded event.
    assert.equal(discludedIndex, -1);

    // If we found an expected event, then move it to the discluded list
    // since we should only see expected events once.
    if (expectedIndex >= 0) {
      excludedEvents.push(expectedEvents.splice(expectedIndex, 1)[0]);
    }
  }

  assert.equal(expectedEvents.length, 0);
}
