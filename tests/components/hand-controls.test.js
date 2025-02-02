/* global assert, setup, suite, test */
import { entityFactory } from '../helpers.js';
var CONTROLLER_TYPE_VIVE = 'OpenVR Gamepad';
var CONTROLLER_TYPE_GENERIC = 'Generic Gamepad';

suite('hand-controls', function () {
  var component;
  var el;

  function setupTrackedControls (controllerType) {
    var trackedControls;
    el.setAttribute('tracked-controls', '');
    trackedControls = el.components['tracked-controls'];
    trackedControls.controller = {id: controllerType, connected: true};
  }

  setup(function (done) {
    el = entityFactory();
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'hand-controls') { return; }
      component = el.components['hand-controls'];
      done();
    });
    el.setAttribute('hand-controls', '');
  });

  suite('determineGesture', function () {
    test('makes no gesture if nothing touched or pressed', function () {
      component.pressedButtons['grip'] = false;
      component.pressedButtons['trigger'] = false;
      component.pressedButtons['touchpad'] = false;
      component.pressedButtons['thumbstick'] = false;
      component.pressedButtons['menu'] = false;
      component.pressedButtons['AorX'] = false;
      component.pressedButtons['BorY'] = false;
      component.pressedButtons['surface'] = false;
      assert.notOk(component.determineGesture());
    });

    test('makes point gesture', function () {
      setupTrackedControls(CONTROLLER_TYPE_GENERIC);

      component.pressedButtons['grip'] = true;
      component.pressedButtons['trigger'] = false;
      component.pressedButtons['trackpad'] = true;
      component.pressedButtons['thumbstick'] = false;
      component.pressedButtons['menu'] = false;
      component.pressedButtons['AorX'] = false;
      component.pressedButtons['BorY'] = false;
      component.pressedButtons['surface'] = false;
      assert.equal(component.determineGesture(), 'Point');
    });

    test('makes point gesture on vive', function () {
      setupTrackedControls(CONTROLLER_TYPE_VIVE);

      component.pressedButtons['grip'] = false;
      component.pressedButtons['trigger'] = false;
      component.pressedButtons['trackpad'] = true;
      component.pressedButtons['thumbstick'] = false;
      component.pressedButtons['menu'] = false;
      component.pressedButtons['AorX'] = false;
      component.pressedButtons['BorY'] = false;
      component.pressedButtons['surface'] = false;
      assert.equal(component.determineGesture(), 'Point');
    });

    test('makes fist gesture', function () {
      setupTrackedControls(CONTROLLER_TYPE_GENERIC);

      component.pressedButtons['grip'] = true;
      component.pressedButtons['trigger'] = true;
      component.pressedButtons['trackpad'] = true;
      component.pressedButtons['thumbstick'] = false;
      component.pressedButtons['menu'] = false;
      component.pressedButtons['AorX'] = false;
      component.pressedButtons['BorY'] = false;
      component.pressedButtons['surface'] = false;
      assert.equal(component.determineGesture(), 'Fist');
    });

    test('makes fist gesture on vive', function () {
      setupTrackedControls(CONTROLLER_TYPE_VIVE);

      component.pressedButtons['grip'] = true;
      component.pressedButtons['trigger'] = false;
      component.pressedButtons['trackpad'] = false;
      component.pressedButtons['thumbstick'] = false;
      component.pressedButtons['menu'] = false;
      component.pressedButtons['AorX'] = false;
      component.pressedButtons['BorY'] = false;
      component.pressedButtons['surface'] = false;
      assert.equal(component.determineGesture(), 'Fist');

      component.pressedButtons['grip'] = false;
      component.pressedButtons['trigger'] = true;
      assert.equal(component.determineGesture(), 'Fist');

      component.pressedButtons['grip'] = true;
      component.pressedButtons['trigger'] = true;
      assert.equal(component.determineGesture(), 'Fist');

      component.pressedButtons['trackpad'] = true;
      assert.equal(component.determineGesture(), 'Fist');

      component.pressedButtons['menu'] = true;
      assert.equal(component.determineGesture(), 'Fist');
    });

    test('makes a hold gesture', function () {
      setupTrackedControls(CONTROLLER_TYPE_GENERIC);

      component.pressedButtons['grip'] = false;
      component.pressedButtons['trigger'] = true;
      assert.equal(component.determineGesture(), 'Hold');
    });

    test('makes a thumbs up gesture', function () {
      setupTrackedControls(CONTROLLER_TYPE_GENERIC);

      component.pressedButtons['grip'] = true;
      component.pressedButtons['trigger'] = true;
      assert.equal(component.determineGesture(), 'Thumb Up');

      // Verify that the gesture still works with touch in addition to press.
      component.pressedButtons['grip'] = true;
      component.pressedButtons['trigger'] = false;
      component.touchedButtons['trigger'] = true;
      assert.equal(component.determineGesture(), 'Thumb Up');
    });

    test('makes a point and thumb gesture', function () {
      setupTrackedControls(CONTROLLER_TYPE_GENERIC);

      component.pressedButtons['grip'] = true;
      component.pressedButtons['trigger'] = false;
      assert.equal(component.determineGesture(), 'Point + Thumb');
    });
  });
});
