/* global assert, process, setup, sinon, suite, test, THREE */
const entityFactory = require('../helpers').entityFactory;

suite('tracked-controls-webxr', function () {
  var controller;
  var el;
  var system;
  var standingMatrix = new THREE.Matrix4();
  var index = {transform: {position: {x: 0, y: 0, z: 0}}};
  var thumb = {transform: {position: {x: 0, y: 0, z: 0}}};
  var wrist = {transform: {orientation: {x: 0, y: 0, z: 0, w: 1}}};
  var indexPosition = new THREE.Vector3();
  var thumbPosition = new THREE.Vector3();
  var wristOrientation = new THREE.Quaternion();

  setup(function (done) {
    standingMatrix.identity();
    el = entityFactory();
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function () {
        window.XRHand = {
          INDEX_PHALANX_TIP: 0,
          THUMB_PHALANX_TIP: 1,
          WRIST: 2
        };
        el.sceneEl.hasWebXR = true;
        el.sceneEl.frame = {
          getJointPose: function (fingerPose) {
            return fingerPose;
          }
        };
        system = el.sceneEl.systems['tracked-controls-webxr'];
        controller = {
          handedness: 'left',
          profiles: ['oculus-hand'],
          hand: [index, thumb, wrist]
        };
        system.controllers = [controller];
        el.setAttribute('hand-tracking-controls', {hand: 'left'});
        done();
      });
    });
  });

  suite('checkIfControllerPresent', function () {
    test('matches controller with same hand', function () {
      el.setAttribute('hand-tracking-controls', {hand: 'left'});
      el.components['hand-tracking-controls'].checkIfControllerPresent();
      var component = el.components['tracked-controls-webxr'];
      assert.equal(component.controller, controller);
    });
  });

  suite('emit events', function () {
    test('pinchstarted', function () {
      const emitSpy = sinon.spy(el, 'emit');
      el.setAttribute('hand-tracking-controls', {hand: 'left'});
      el.components['hand-tracking-controls'].checkIfControllerPresent();
      el.components['hand-tracking-controls'].detectPinch();
      assert.equal(emitSpy.getCalls()[0].args[0], 'stateadded');
      assert.equal(emitSpy.getCalls()[1].args[0], 'pinchstarted');
      indexPosition.copy(index.transform.position);
      indexPosition.y += 1.5;
      thumbPosition.copy(thumb.transform.position);
      thumbPosition.y += 1.5;
      const indexThumbDistance = indexPosition.distanceTo(thumbPosition);
      assert.isAtMost(emitSpy.getCalls()[1].args[1].position.distanceTo(indexPosition), indexThumbDistance);
      assert.isAtMost(emitSpy.getCalls()[1].args[1].position.distanceTo(thumbPosition), indexThumbDistance);
      wristOrientation.copy(wrist.transform.orientation);
      assert.isTrue(emitSpy.getCalls()[1].args[1].orientation.equals(wristOrientation));
      assert.isTrue(el.is('pinched'));
    });

    test('pinchended', function () {
      el.setAttribute('hand-tracking-controls', {hand: 'left'});
      el.components['hand-tracking-controls'].checkIfControllerPresent();
      el.addState('pinched');
      const emitSpy = sinon.spy(el, 'emit');
      thumb.transform.position.z = 10;
      thumbPosition.copy(thumb.transform.position);
      el.components['hand-tracking-controls'].detectPinch();
      assert.equal(emitSpy.getCalls()[0].args[0], 'stateremoved');
      assert.equal(emitSpy.getCalls()[1].args[0], 'pinchended');
      indexPosition.copy(index.transform.position);
      indexPosition.y += 1.5;
      thumbPosition.copy(thumb.transform.position);
      thumbPosition.y += 1.5;
      const indexThumbDistance = indexPosition.distanceTo(thumbPosition);
      assert.isAtMost(emitSpy.getCalls()[1].args[1].position.distanceTo(indexPosition), indexThumbDistance);
      assert.isAtMost(emitSpy.getCalls()[1].args[1].position.distanceTo(thumbPosition), indexThumbDistance);
      wristOrientation.copy(wrist.transform.orientation);
      assert.isTrue(emitSpy.getCalls()[1].args[1].orientation.equals(wristOrientation));
      assert.isFalse(el.is('pinched'));
    });
  });

  suite('pinched state', function () {
    test('stays set while pinching', function () {
      el.setAttribute('hand-tracking-controls', { hand: 'left' });
      el.components['hand-tracking-controls'].checkIfControllerPresent();
      thumb.transform.position.z = 0.0;
      assert.isFalse(el.is('pinched'));
      el.components['hand-tracking-controls'].detectPinch();
      assert.isTrue(el.is('pinched'));
      thumb.transform.position.z = 0.01;
      el.components['hand-tracking-controls'].detectPinch();
      assert.isTrue(el.is('pinched'));
      thumb.transform.position.z = 0.1;
      el.components['hand-tracking-controls'].detectPinch();
      assert.isFalse(el.is('pinched'));
    });
  });
});

