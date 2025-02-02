/* global assert, setup, sinon, suite, test, THREE */
import { entityFactory } from '../helpers.js';

suite('hand-tracking-controls', function () {
  var controller;
  var el;
  var system;
  var standingMatrix = new THREE.Matrix4();
  var indexMatrix = new THREE.Matrix4();
  var thumbMatrix = new THREE.Matrix4();
  var THUMB_TIP_INDEX = 4;
  var INDEX_TIP_INDEX = 9;
  var indexPosition = new THREE.Vector3();
  var thumbPosition = new THREE.Vector3();
  var thumbObj = {};
  var indexObj = {};

  setup(function (done) {
    standingMatrix.identity();
    el = entityFactory();
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function () {
        el.sceneEl.hasWebXR = true;
        el.sceneEl.frame = {
          fillPoses: function (joints, referenceSpace, array) {
            thumbMatrix.toArray(array, 16 * THUMB_TIP_INDEX);
            indexMatrix.toArray(array, 16 * INDEX_TIP_INDEX);
            return true;
          },
          fillJointRadii: function () {
            return true;
          }
        };
        system = el.sceneEl.systems['tracked-controls'];
        controller = {
          handedness: 'left',
          profiles: ['oculus-hand'],
          hand: {
            get: function (joint) {
              var jointObject = joint === 'thumb-tip' ? thumbObj : indexObj;
              return jointObject;
            },
            values: function () {
              return [
                { jointName: 'thumb-tip' },
                { jointName: 'index-finger-tip' }
              ];
            }
          }
        };
        system.controllers = [controller];
        el.setAttribute('hand-tracking-controls', {hand: 'left'});
        el.components['hand-tracking-controls'].referenceSpace = {};
        done();
      });
    });
  });

  suite('checkIfControllerPresent', function () {
    test('matches controller with same hand', function () {
      el.setAttribute('hand-tracking-controls', {hand: 'left'});
      el.components['hand-tracking-controls'].checkIfControllerPresent();
      var component = el.components['tracked-controls'];
      assert.equal(component.controller, controller);
    });
  });

  suite('children entities', function () {
    test('attached to the wrist joint', function (done) {
      var boxEl = document.createElement('a-box');
      el.addEventListener('child-attached', function () {
        assert.ok(el.components['hand-tracking-controls'].wristObject3D);
        assert.equal(boxEl.object3D.parent, el.components['hand-tracking-controls'].wristObject3D);
        done();
      });
      el.setAttribute('hand-tracking-controls', {hand: 'left'});
      el.components['hand-tracking-controls'].checkIfControllerPresent();
      el.appendChild(boxEl);
    });
  });

  suite('emit events', function () {
    test('pinchstarted', function () {
      const emitSpy = sinon.spy(el, 'emit');
      el.setAttribute('hand-tracking-controls', {hand: 'left'});
      el.components['hand-tracking-controls'].tick();
      el.components['hand-tracking-controls'].checkIfControllerPresent();
      el.components['hand-tracking-controls'].detectPinch();
      assert.equal(emitSpy.getCalls()[0].args[0], 'pinchstarted');
      indexPosition.setFromMatrixPosition(indexMatrix);
      thumbPosition.setFromMatrixPosition(thumbMatrix);
      const indexThumbDistance = indexPosition.distanceTo(thumbPosition);
      assert.isAtMost(emitSpy.getCalls()[0].args[1].position.distanceTo(indexPosition), indexThumbDistance);
      assert.isAtMost(emitSpy.getCalls()[0].args[1].position.distanceTo(thumbPosition), indexThumbDistance);
    });

    test('pinchended', function () {
      const emitSpy = sinon.spy(el, 'emit');
      el.setAttribute('hand-tracking-controls', {hand: 'left'});
      el.components['hand-tracking-controls'].checkIfControllerPresent();
      el.components['hand-tracking-controls'].isPinched = true;
      thumbMatrix.setPosition(0, 0, 10);
      el.components['hand-tracking-controls'].pinchDistance = 1;
      el.components['hand-tracking-controls'].tick();
      el.components['hand-tracking-controls'].detectPinch();
      assert.equal(emitSpy.getCalls()[0].args[0], 'pinchended');
      indexPosition.setFromMatrixPosition(indexMatrix);
      thumbPosition.setFromMatrixPosition(thumbMatrix);
      const indexThumbDistance = indexPosition.distanceTo(thumbPosition);
      assert.isAtMost(emitSpy.getCalls()[0].args[1].position.distanceTo(indexPosition), indexThumbDistance);
      assert.isAtMost(emitSpy.getCalls()[0].args[1].position.distanceTo(thumbPosition), indexThumbDistance);
    });
  });
});
