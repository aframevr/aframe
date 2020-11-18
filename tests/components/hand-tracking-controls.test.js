/* global assert, process, setup, sinon, suite, test, THREE */
const entityFactory = require('../helpers').entityFactory;

suite('tracked-controls-webxr', function () {
  var controller;
  var el;
  var system;
  var standingMatrix = new THREE.Matrix4();
  var index = {transform: {position: {x: 0, y: 0, z: 0}}};
  var thumb = {transform: {position: {x: 0, y: 0, z: 0}}};
  var indexPosition = new THREE.Vector3();
  var thumbPosition = new THREE.Vector3();

  setup(function (done) {
    standingMatrix.identity();
    el = entityFactory();
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function () {
        window.XRHand = {
          INDEX_PHALANX_TIP: 0,
          THUMB_PHALANX_TIP: 1
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
          hand: [index, thumb]
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
      assert.equal(emitSpy.getCalls()[0].args[0], 'pinchstarted');
      indexPosition.copy(index.transform.position);
      indexPosition.y += 1.5;
      thumbPosition.copy(thumb.transform.position);
      thumbPosition.y += 1.5;
      const indexThumbDistance = indexPosition.distanceTo(thumbPosition);
      assert.isAtMost(emitSpy.getCalls()[0].args[1].position.distanceTo(indexPosition), indexThumbDistance);
      assert.isAtMost(emitSpy.getCalls()[0].args[1].position.distanceTo(thumbPosition), indexThumbDistance);
    });

    test('pinchended', function () {
      const emitSpy = sinon.spy(el, 'emit');
      el.setAttribute('hand-tracking-controls', {hand: 'left'});
      el.components['hand-tracking-controls'].checkIfControllerPresent();
      el.components['hand-tracking-controls'].isPinched = true;
      thumb.transform.position.z = 10;
      thumbPosition.copy(thumb.transform.position);
      el.components['hand-tracking-controls'].detectPinch();
      assert.equal(emitSpy.getCalls()[0].args[0], 'pinchended');
      indexPosition.copy(index.transform.position);
      indexPosition.y += 1.5;
      thumbPosition.copy(thumb.transform.position);
      thumbPosition.y += 1.5;
      const indexThumbDistance = indexPosition.distanceTo(thumbPosition);
      assert.isAtMost(emitSpy.getCalls()[0].args[1].position.distanceTo(indexPosition), indexThumbDistance);
      assert.isAtMost(emitSpy.getCalls()[0].args[1].position.distanceTo(thumbPosition), indexThumbDistance);
    });
  });
});

