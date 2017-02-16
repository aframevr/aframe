/* global assert, process, setup, suite, test, THREE */
const entityFactory = require('../helpers').entityFactory;

const PI = Math.PI;

suite('tracked-controls', function () {
  var component;
  var controller;
  var el;
  var system;

  setup(function (done) {
    el = entityFactory();
    el.setAttribute('position', '');
    el.setAttribute('tracked-controls', '');
    el.addEventListener('loaded', function () {
      component = el.components['tracked-controls'];
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
      el.setAttribute('tracked-controls', 'id', 'OpenVR Gamepad');
      done();
    });
  });

  suite('updateGamepad', function () {
    test('matches controller with same id', function () {
      assert.notOk(component.controller);
      el.setAttribute('tracked-controls', 'id', 'OpenVR Gamepad');
      component.tick();
      assert.equal(component.controller, controller);
    });

    test('matches controller with prefix', function () {
      assert.notOk(component.controller);
      el.setAttribute('tracked-controls', 'idPrefix', 'OpenVR');
      component.tick();
      assert.equal(component.controller, controller);
    });

    test('does not match controller by default', function () {
      assert.notOk(component.controller);
      el.setAttribute('tracked-controls', {}, true);
      component.tick();
      assert.notOk(component.controller);
    });

    test('does not match controller with different id', function () {
      assert.notOk(component.controller);
      el.setAttribute('tracked-controls', 'id', 'foo');
      component.tick();
      assert.notOk(component.controller);
    });

    test('does not match controller with different prefix', function () {
      assert.notOk(component.controller);
      el.setAttribute('tracked-controls', 'idPrefix', 'foo');
      component.tick();
      assert.notOk(component.controller);
    });
  });

  suite('tick', function () {
    test('updates pose and buttons even if mesh is not defined', function () {
      var updateButtonsSpy = this.sinon.spy(component, 'updateButtons');
      var updatePoseSpy = this.sinon.spy(component, 'updatePose');
      assert.notOk(el.getObject3D('mesh'));
      component.tick();
      assert.ok(updatePoseSpy.called);
      assert.ok(updateButtonsSpy.called);
    });
  });

  suite('updatePose (position)', function () {
    test('defaults position to zero vector', function () {
      controller.pose.position = [0, 0, 0];
      el.setAttribute('position', '0 0 0');
      component.tick();
      assertVec3(component.previousControllerPosition, [0, 0, 0]);
      assertVec3(el.getAttribute('position'), [0, 0, 0]);
    });

    test('applies position from gamepad pose', function () {
      controller.pose.position = [1, 2, 3];
      component.tick();
      assertVec3(component.previousControllerPosition, [1, 2, 3]);
      assertVec3(el.getAttribute('position'), [1, 2, 3]);
    });

    test('applies position using deltas', function () {
      controller.pose.position = [0, 0, 0];
      el.setAttribute('position', '1 2 3');
      component.tick();
      assertVec3(el.getAttribute('position'), [1, 2, 3]);

      assertVec3(component.previousControllerPosition, [0, 0, 0]);
      controller.pose.position = [1, 1, 1];
      component.tick();
      assertVec3(el.getAttribute('position'), [2, 3, 4]);
    });

    test('applies position using deltas with non-zero pose', function () {
      assertVec3(component.previousControllerPosition, [0, 0, 0]);
      controller.pose.position = [4, 5, -6];
      el.setAttribute('position', '-1 2 -3');
      component.tick();
      // A-Frame position + (Gamepad position - previous Gamepad position).
      // [-1, 2, -3] + ([4, 5, -6] - [0, 0, 0]).
      assertVec3(el.getAttribute('position'), [3, 7, -9]);
    });

    test('handles unchanged Gamepad position', function () {
      controller.pose.position = [4, 5, -6];
      component.tick();
      el.setAttribute('position', '-1 2 -3');
      component.tick();
      assertVec3(component.previousControllerPosition, [4, 5, -6]);
      // A-Frame position + (Gamepad position - previous Gamepad position).
      // [-1, 2, -3] + ([4, 5, -6] - [4, 5, -6]).
      assertVec3(el.getAttribute('position'), [-1, 2, -3]);
    });

    test('applies new Gamepad position to manually positioned entity', function () {
      controller.pose.position = [1, 2, 3];
      component.tick();
      assertVec3(component.previousControllerPosition, [1, 2, 3]);
      assertVec3(el.getAttribute('position'), [1, 2, 3]);

      el.setAttribute('position', '10 10 10');
      controller.pose.position = [2, 4, 6];
      component.tick();
      assertVec3(component.previousControllerPosition, [2, 4, 6]);

      // A-Frame position + (Gamepad position - previous Gamepad position).
      // [10, 10, 10] + ([2, 4, 6] - [1, 2, 3]).
      assertVec3(el.getAttribute('position'), [11, 12, 13]);
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
      component.tick();
      assertQuaternion(el.object3D.quaternion, controller.pose.orientation);
    });

    test('applies rotation absolutely', function () {
      controller.pose.orientation = toQuaternion(PI, PI / 2, PI / 3);
      el.setAttribute('rotation', '180 90 60');
      component.tick();
      assertQuaternion(el.object3D.quaternion, controller.pose.orientation);

      controller.pose.orientation = toQuaternion(PI / 2, PI / 3, PI / 4);
      component.tick();
      assertQuaternion(el.object3D.quaternion, controller.pose.orientation);
    });

    test('handles unchanged Gamepad rotation', function () {
      controller.pose.orientation = toQuaternion(PI, PI / 2, PI / 3);
      component.tick();
      component.tick();
      assertQuaternion(el.object3D.quaternion, controller.pose.orientation);
    });

    test('applies rotation Z-offset', function () {
      assertVec3(el.getAttribute('rotation'), [0, 0, 0]);
      el.setAttribute('tracked-controls', 'rotationOffset', 10);
      component.tick();
      assertVec3(el.getAttribute('rotation'), [0, 0, 10]);
    });
  });

  suite('handleAxes', function () {
    test('does not emit on initial state', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      component.tick();
      assert.notOk(component.handleAxes());
      assert.notOk(emitSpy.called);
    });

    test('emits axismove on first touch', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      controller.axes = [0.5, 0.5, 0.5];
      assert.deepEqual(component.axis, [0, 0, 0]);
      component.tick();
      assert.deepEqual(component.axis, [0.5, 0.5, 0.5]);
      assert.equal(emitSpy.getCalls()[0].args[0], 'axismove');
      assert.deepEqual(emitSpy.getCalls()[0].args[1].axis, [0.5, 0.5, 0.5]);
    });

    test('emits axismove if axis changed', function () {
      controller.axes = [0.5, 0.5, 0.5];
      component.tick();
      assert.deepEqual(component.axis, [0.5, 0.5, 0.5]);

      const emitSpy = this.sinon.spy(el, 'emit');
      controller.axes = [1, 1, 1];
      component.tick();
      const emitCall = emitSpy.getCalls()[0];
      assert.equal(emitCall.args[0], 'axismove');
      assert.deepEqual(emitCall.args[1].axis, [1, 1, 1]);
    });
  });

  suite('handleButton', function () {
    test('does not emit if button not pressed', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      component.tick();
      assert.notOk(emitSpy.called);
    });

    test('emits buttonchanged if button pressed', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      controller.buttons[0].pressed = true;
      component.tick();

      const emitChangedCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonchanged');
      assert.equal(emitChangedCalls.length, 1);

      const emitCall = emitChangedCalls[0];
      assert.equal(emitCall.args[0], 'buttonchanged');
      assert.deepEqual(emitCall.args[1].id, 0);
      assert.deepEqual(emitCall.args[1].state, controller.buttons[0]);
    });

    test('emits buttonchanged if button touched', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      controller.buttons[0].touched = true;
      component.tick();

      const emitChangedCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonchanged');
      assert.equal(emitChangedCalls.length, 1);

      const emitCall = emitChangedCalls[0];
      assert.equal(emitCall.args[0], 'buttonchanged');
      assert.deepEqual(emitCall.args[1].id, 0);
      assert.deepEqual(emitCall.args[1].state, controller.buttons[0]);
    });
  });

  suite('handlePress', function () {
    test('does not emit anything if button not pressed', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      component.tick();
      assert.notOk(emitSpy.called);
      assert.notOk(component.handlePress(0, {pressed: false, touched: false, value: 0}));
    });

    test('emits buttondown if button pressed', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      controller.buttons[0].pressed = true;
      component.tick();

      const emitDownCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttondown');
      assert.equal(emitDownCalls.length, 1);

      const emitCall = emitDownCalls[0];
      assert.equal(emitCall.args[0], 'buttondown');
      assert.deepEqual(emitCall.args[1].id, 0);
      assert.deepEqual(emitCall.args[1].state, controller.buttons[0]);
    });

    test('emits buttonup if button released', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      component.buttonStates[1] = {pressed: true, touched: false, value: 1};
      controller.buttons[1].pressed = false;
      controller.buttons[1].value = 0;
      component.tick();

      const emitUpCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonup');
      assert.equal(emitUpCalls.length, 1);

      const emitCall = emitUpCalls[0];
      assert.equal(emitCall.args[0], 'buttonup');
      assert.deepEqual(emitCall.args[1].id, 1);
      assert.deepEqual(emitCall.args[1].state, controller.buttons[1]);
    });

    test('does not emit buttonup if button pressed', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      controller.buttons[0].pressed = true;
      component.tick();
      const emitUpCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'buttonup');
      assert.notOk(emitUpCalls.length);
    });

    test('does not emit buttondown if button released', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
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
      const emitSpy = this.sinon.spy(el, 'emit');
      component.tick();
      assert.notOk(emitSpy.called);
      assert.notOk(component.handleTouch(0, {pressed: false, touched: false, value: 0}));
    });

    test('emits touchstart if button touched', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      controller.buttons[0].touched = true;
      component.tick();

      const emitStartCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'touchstart');
      assert.equal(emitStartCalls.length, 1);

      const emitCall = emitStartCalls[0];
      assert.equal(emitCall.args[0], 'touchstart');
      assert.deepEqual(emitCall.args[1].id, 0);
      assert.deepEqual(emitCall.args[1].state, controller.buttons[0]);
    });

    test('emits touchend if button no longer touched', function () {
      const emitSpy = this.sinon.spy(el, 'emit');
      component.buttonStates[1] = {pressed: false, touched: true, value: 1};
      controller.buttons[1].touched = false;
      controller.buttons[1].value = 0;
      component.tick();

      const emitEndCalls = emitSpy.getCalls().filter(
        call => call.args[0] === 'touchend');
      assert.equal(emitEndCalls.length, 1);

      const emitCall = emitEndCalls[0];
      assert.equal(emitCall.args[0], 'touchend');
      assert.deepEqual(emitCall.args[1].id, 1);
      assert.deepEqual(emitCall.args[1].state, controller.buttons[1]);
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
});

function assertVec3 (vec3, arr) {
  assert.equal(vec3.x, arr[0]);
  assert.equal(vec3.y, arr[1]);
  assert.equal(vec3.z, arr[2]);
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
