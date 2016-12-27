/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var controllerComponentName = 'gearvr-controls';

suite(controllerComponentName, function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute(controllerComponentName, '');
    el.addEventListener('loaded', function () {
      var controllerComponent = el.components[controllerComponentName];
      controllerComponent.getGamepadsByPrefix = function () { return controllerComponent.getGamepadsByPrefixMockValue; };
      done();
    });
  });

  suite('checkIfControllerPresent', function () {
    test('first-time, if no controllers, remove component attributes and remember not present', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var addControllerAttributesSpy = this.sinon.spy(controllerComponent, 'addControllerAttributes');
      var removeControllerAttributesSpy = this.sinon.spy(controllerComponent, 'removeControllerAttributes');
      // mock isControllerPresent to return false
      controllerComponent.getGamepadsByPrefixMockValue = false;
      // reset so we don't think we've looked before
      delete controllerComponent.controllerPresent;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.notOk(addControllerAttributesSpy.called);
      assert.ok(removeControllerAttributesSpy.called);
      assert.ok(controllerComponent.controllerPresent === false); // not undefined
    });

    test('if no controllers again, do not remove component attributes', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var addControllerAttributesSpy = this.sinon.spy(controllerComponent, 'addControllerAttributes');
      var removeControllerAttributesSpy = this.sinon.spy(controllerComponent, 'removeControllerAttributes');
      // mock isControllerPresent to return false
      controllerComponent.getGamepadsByPrefixMockValue = false;
      // pretend we've looked before
      controllerComponent.controllerPresent = false;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.notOk(addControllerAttributesSpy.called);
      assert.notOk(removeControllerAttributesSpy.called);
      assert.ok(controllerComponent.controllerPresent === false); // not undefined
    });

    test('add controller attributes if controller is newly present', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var addControllerAttributesSpy;
      var removeControllerAttributesSpy = this.sinon.spy(controllerComponent, 'removeControllerAttributes');
      // mock the actual functionality to addControllerAttributes, just make sure it's called
      controllerComponent.addControllerAttributes = function () { };
      addControllerAttributesSpy = this.sinon.spy(controllerComponent, 'addControllerAttributes');
      // mock isControllerPresent to return Gear VR Touchpad
      controllerComponent.getGamepadsByPrefixMockValue = [true];
      // reset so we don't think we've looked before
      delete controllerComponent.controllerPresent;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.ok(addControllerAttributesSpy.called);
      assert.notOk(removeControllerAttributesSpy.called);
      assert.ok(controllerComponent.controllerPresent);
    });

    test('do not add controller attributes again if controller is already present', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var addControllerAttributesSpy = this.sinon.spy(controllerComponent, 'addControllerAttributes');
      var removeControllerAttributesSpy = this.sinon.spy(controllerComponent, 'removeControllerAttributes');
      // mock isControllerPresent to return Gear VR Touchpad
      controllerComponent.getGamepadsByPrefixMockValue = [{id: 'Gear VR Touchpad', buttons: [{pressed: false}], axes: [0, 0]}];
      // pretend we've looked before
      controllerComponent.controllerPresent = true;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.notOk(addControllerAttributesSpy.called);
      assert.notOk(removeControllerAttributesSpy.called);
      assert.ok(controllerComponent.controllerPresent);
    });

    test('if controller disappears, remove event listeners', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var addControllerAttributesSpy = this.sinon.spy(controllerComponent, 'addControllerAttributes');
      var removeControllerAttributesSpy = this.sinon.spy(controllerComponent, 'removeControllerAttributes');
      // mock isControllerPresent to return false
      controllerComponent.getGamepadsByPrefixMockValue = false;
      // pretend we've looked before
      controllerComponent.controllerPresent = true;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.notOk(addControllerAttributesSpy.called);
      assert.ok(removeControllerAttributesSpy.called);
      assert.notOk(controllerComponent.controllerPresent);
    });
  });

  suite('onGamepadConnected / Disconnected', function () {
    test('if we get onGamepadConnected or onGamepadDisconnected, check if present', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var removeControllerAttributesSpy = this.sinon.spy(controllerComponent, 'removeControllerAttributes');
      var checkIfControllerPresentSpy = this.sinon.spy(controllerComponent, 'checkIfControllerPresent');
      // reset so we don't think we've looked before
      delete controllerComponent.controllerPresent;
      // do the call
      controllerComponent.onGamepadConnected();
      // check assertions
      assert.ok(removeControllerAttributesSpy.called);
      assert.ok(checkIfControllerPresentSpy.called);
      // reset everGotGamepadEvent so we don't think we've looked before
      delete controllerComponent.everGotGamepadEvent;
      // do the call
      controllerComponent.onGamepadDisconnected();
      // check assertions
      assert.ok(removeControllerAttributesSpy.called);
      assert.ok(checkIfControllerPresentSpy.called);
    });
  });
});
