/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('hand-controls', function () {
  var component;
  var el;

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
      var trackedControls;
      el.setAttribute('tracked-controls', '');
      trackedControls = el.components['tracked-controls'];
      trackedControls.controller = {id: 'Foobar', connected: true};

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
      var trackedControls;
      el.setAttribute('tracked-controls', '');
      trackedControls = el.components['tracked-controls'];
      trackedControls.controller = {id: 'OpenVR Gamepad', connected: true};

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
      var trackedControls;
      el.setAttribute('tracked-controls', '');
      trackedControls = el.components['tracked-controls'];
      trackedControls.controller = {id: 'Foobar', connected: true};

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
      var trackedControls;
      el.setAttribute('tracked-controls', '');
      trackedControls = el.components['tracked-controls'];
      trackedControls.controller = {id: 'OpenVR Gamepad', connected: true};

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
  });
});
