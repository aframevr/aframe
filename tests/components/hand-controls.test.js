/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var controllerComponentName = 'hand-controls';

suite(controllerComponentName, function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute(controllerComponentName, '');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('oculus-touch-controls, vive-controls and oculus-touch-controls injected', function () {
      var el = this.el;
      assert.ok(el.components['blend-character-model']);
      assert.ok(el.components['oculus-touch-controls']);
      assert.ok(el.components['vive-controls']);
    });
  });

  suite('determineGesture', function () {
    test('if nothing touched or triggered, no gesture', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      // mock button / touch flags
      controllerComponent.pressedButtons['grip'] = false;
      controllerComponent.pressedButtons['trigger'] = false;
      controllerComponent.pressedButtons['touchpad'] = false;
      controllerComponent.pressedButtons['thumbstick'] = false;
      controllerComponent.pressedButtons['menu'] = false;
      controllerComponent.pressedButtons['AorX'] = false;
      controllerComponent.pressedButtons['BorY'] = false;
      controllerComponent.pressedButtons['surface'] = false;
      // do the check
      assert.notOk(controllerComponent.determineGesture());
    });

    test('if non-Oculus Touch and only trackpad. Point gesture', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var trackedControls;
      el.setAttribute('tracked-controls', '');
      trackedControls = el.components['tracked-controls'];
      // mock controller
      trackedControls.controller = {id: 'Foobar', connected: true};
      // mock button / touch flags
      controllerComponent.pressedButtons['grip'] = false;
      controllerComponent.pressedButtons['trigger'] = false;
      controllerComponent.pressedButtons['trackpad'] = true;
      controllerComponent.pressedButtons['thumbstick'] = false;
      controllerComponent.pressedButtons['menu'] = false;
      controllerComponent.pressedButtons['AorX'] = false;
      controllerComponent.pressedButtons['BorY'] = false;
      controllerComponent.pressedButtons['surface'] = false;
      // do the check
      assert.equal(controllerComponent.determineGesture(), 'Point');
    });

    test('if non-Oculus Touch and grip or trigger, gesture = Fist', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var trackedControls;
      el.setAttribute('tracked-controls', '');
      trackedControls = el.components['tracked-controls'];
      // mock controller
      trackedControls.controller = {id: 'Foobar', connected: true};
      // mock button / touch flags
      controllerComponent.pressedButtons['grip'] = true;
      controllerComponent.pressedButtons['trigger'] = false;
      controllerComponent.pressedButtons['trackpad'] = false;
      controllerComponent.pressedButtons['thumbstick'] = false;
      controllerComponent.pressedButtons['menu'] = false;
      controllerComponent.pressedButtons['AorX'] = false;
      controllerComponent.pressedButtons['BorY'] = false;
      controllerComponent.pressedButtons['surface'] = false;
      // do the check
      assert.equal(controllerComponent.determineGesture(), 'Fist');
      // mock button / touch flags
      controllerComponent.pressedButtons['grip'] = false;
      controllerComponent.pressedButtons['trigger'] = true;
      // do the check
      assert.equal(controllerComponent.determineGesture(), 'Fist');
      // mock button / touch flags
      controllerComponent.pressedButtons['grip'] = true;
      controllerComponent.pressedButtons['trigger'] = true;
      // do the check
      assert.equal(controllerComponent.determineGesture(), 'Fist');
      // mock button / touch flags
      controllerComponent.pressedButtons['trackpad'] = true;
      // do the check
      assert.equal(controllerComponent.determineGesture(), 'Fist');
      // mock button / touch flags
      controllerComponent.pressedButtons['menu'] = true;
      // do the check
      assert.equal(controllerComponent.determineGesture(), 'Fist');
    });
  });
});
