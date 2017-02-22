/* global assert, process, setup, suite, test, CustomEvent, Event */
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

  suite('emulated', function () {
    test('when emulated, if no controllers, add event listeners but do not inject tracked-controls', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var addEventListenersSpy = this.sinon.spy(controllerComponent, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(controllerComponent, 'injectTrackedControls');
      // mock isControllerPresent to return false
      controllerComponent.isControllerPresentMockValue = false;
      // pretend we haven't looked before
      delete controllerComponent.controllerPresent;
      // set the emulated flag directly, to avoid having to wait for DOM update
      controllerComponent.data.emulated = true;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.ok(controllerComponent.data.emulated);
      assert.notOk(injectTrackedControlsSpy.called);
      assert.ok(controllerComponent.controllerPresent === false); // not undefined
      assert.ok(addEventListenersSpy.called);
    });

    test('when not emulated by default, if no controllers, do not add event listeners or inject tracked-controls', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var addEventListenersSpy = this.sinon.spy(controllerComponent, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(controllerComponent, 'injectTrackedControls');
      // mock isControllerPresent to return false
      controllerComponent.isControllerPresentMockValue = false;
      // pretend we haven't looked before
      delete controllerComponent.controllerPresent;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // check assertions
      assert.notOk(controllerComponent.data.emulated);
      assert.notOk(injectTrackedControlsSpy.called);
      assert.ok(controllerComponent.controllerPresent === false); // not undefined
      assert.notOk(addEventListenersSpy.called);
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

  suite('axismove', function () {
    var name = 'trackpad';
    test('if we get axismove, emit ' + name + 'moved', function (done) {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var evt;
      // mock isControllerPresent to return true
      controllerComponent.isControllerPresentMockValue = true;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // install event handler listening for thumbstickmoved
      this.el.addEventListener(name + 'moved', function (evt) {
        assert.equal(evt.detail.x, 0.1);
        assert.equal(evt.detail.y, 0.2);
        assert.ok(evt.detail);
        done();
      });
      // emit axismove
      evt = new CustomEvent('axismove', {'detail': {axis: [0.1, 0.2]}});
      this.el.dispatchEvent(evt);
    });
  });

  suite('buttonchanged', function () {
    var name = 'trigger';
    var id = 1;
    test('if we get buttonchanged, emit ' + name + 'changed', function (done) {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var evt;
      // mock isControllerPresent to return true
      controllerComponent.isControllerPresentMockValue = true;
      // do the check
      controllerComponent.checkIfControllerPresent();
      // install event handler listening for thumbstickmoved
      this.el.addEventListener(name + 'changed', function (evt) {
        assert.ok(evt.detail);
        done();
      });
      // emit axismove
      evt = new CustomEvent('buttonchanged', {'detail': {id: id, state: {value: 0.5, pressed: true, touched: true}}});
      this.el.dispatchEvent(evt);
    });
  });

  suite('gamepadconnected / disconnected', function () {
    // Due to an apparent bug in FF Nightly
    // where only one gamepadconnected / disconnected event is fired,
    // which makes it difficult to handle in individual controller entities,
    // we no longer remove the controllersupdate listener as a result.
    test('if we get gamepadconnected or gamepaddisconnected, check if present', function () {
      var el = this.el;
      var controllerComponent = el.components[controllerComponentName];
      var checkIfControllerPresentSpy = this.sinon.spy(controllerComponent, 'checkIfControllerPresent');
      // Because checkIfControllerPresent may be used in bound form, bind and reinstall.
      controllerComponent.checkIfControllerPresent = controllerComponent.checkIfControllerPresent.bind(controllerComponent);
      controllerComponent.pause();
      controllerComponent.play();
      // mock isControllerPresent to return true
      controllerComponent.isControllerPresentMockValue = true;
      // reset everGotGamepadEvent so we don't think we've looked before
      delete controllerComponent.everGotGamepadEvent;
      // fire emulated gamepadconnected event
      window.dispatchEvent(new Event('gamepadconnected'));
      // check assertions
      assert.ok(checkIfControllerPresentSpy.called);
      assert.ok(controllerComponent.everGotGamepadEvent);
      // mock isControllerPresent to return false
      controllerComponent.isControllerPresentMockValue = false;
      // reset everGotGamepadEvent so we don't think we've looked before
      delete controllerComponent.everGotGamepadEvent;
      // fire emulated gamepaddisconnected event
      window.dispatchEvent(new Event('gamepaddisconnected'));
      // check assertions
      assert.ok(checkIfControllerPresentSpy.called);
      assert.ok(controllerComponent.everGotGamepadEvent);
    });
  });
});
