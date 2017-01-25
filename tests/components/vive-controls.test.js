/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var controllerComponentName = 'vive-controls';

suite(controllerComponentName, function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute(controllerComponentName, '');
    el.addEventListener('loaded', function () {
      var controllerComponent = el.components[controllerComponentName];
      controllerComponent.isControllerPresent = function () { return controllerComponent.isControllerPresentMockValue; };
      done();
    });
  });

  suite('checkIfControllerPresent', function () {
    test('first-time, if no controllers, remove event listeners and remember not present', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var injectTrackedControlsSpy = this.sinon.spy(controllerComponent, 'injectTrackedControls');
      // mock isControllerPresent to return false
      controllerComponent.isControllerPresentMockValue = false;
      // reset so we don't think we've looked before
      delete controllerComponent.controllerPresent;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.notOk(injectTrackedControlsSpy.called);
      assert.ok(controllerComponent.controllerPresent === false); // not undefined
    });

    test('if no controllers again, do not remove event listeners', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var addEventListenersSpy = this.sinon.spy(controllerComponent, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(controllerComponent, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(controllerComponent, 'removeEventListeners');
      // mock isControllerPresent to return false
      controllerComponent.isControllerPresentMockValue = false;
      // pretend we've looked before
      controllerComponent.controllerPresent = false;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(controllerComponent.controllerPresent === false); // not undefined
    });

    test('attach events if controller is newly present', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var injectTrackedControlsSpy = this.sinon.spy(controllerComponent, 'injectTrackedControls');
      // mock isControllerPresent to return true
      controllerComponent.isControllerPresentMockValue = true;
      // reset so we don't think we've looked before
      delete controllerComponent.controllerPresent;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.ok(injectTrackedControlsSpy.called);
      assert.ok(controllerComponent.controllerPresent);
    });

    test('do not inject or attach events again if controller is already present', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var addEventListenersSpy = this.sinon.spy(controllerComponent, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(controllerComponent, 'injectTrackedControls');
      // mock isControllerPresent to return true
      controllerComponent.isControllerPresentMockValue = true;
      // pretend we've looked before
      controllerComponent.controllerPresent = true;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.ok(controllerComponent.controllerPresent);
    });

    test('if controller disappears, remove event listeners', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var injectTrackedControlsSpy = this.sinon.spy(controllerComponent, 'injectTrackedControls');
      // mock isControllerPresent to return true
      controllerComponent.isControllerPresentMockValue = false;
      // pretend we've looked before
      controllerComponent.controllerPresent = true;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(controllerComponent.controllerPresent);
    });
  });

  suite.skip('onGamepadConnected / Disconnected', function () {
    test('if we get onGamepadConnected or onGamepadDisconnected, remove periodic change listener and check if present', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var removeControllersUpdateListenerSpy = this.sinon.spy(controllerComponent, 'removeControllersUpdateListener');
      var checkIfControllerPresentSpy = this.sinon.spy(controllerComponent, 'checkIfControllerPresent');
      // reset everGotGamepadEvent so we don't think we've looked before
      delete controllerComponent.everGotGamepadEvent;
      // do the call
      controllerComponent.onGamepadConnected();
      // check assertions
      assert.ok(removeControllersUpdateListenerSpy.called);
      assert.ok(checkIfControllerPresentSpy.called);
      assert.ok(controllerComponent.everGotGamepadEvent);
      // reset everGotGamepadEvent so we don't think we've looked before
      delete controllerComponent.everGotGamepadEvent;
      // do the call
      controllerComponent.onGamepadDisconnected();
      // check assertions
      assert.ok(removeControllersUpdateListenerSpy.called);
      assert.ok(checkIfControllerPresentSpy.called);
      assert.ok(controllerComponent.everGotGamepadEvent);
    });
  });
});
