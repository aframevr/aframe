/* global assert, process, setup, suite, test, CustomEvent, Event */
var entityFactory = require('../helpers').entityFactory;

suite('oculus-touch-controls', function () {
  var el;
  var component;

  setup(function (done) {
    el = this.el = entityFactory();
    el.setAttribute('oculus-touch-controls', '');
    el.addEventListener('loaded', function () {
      component = el.components['oculus-touch-controls'];
      component.controllersWhenPresent = [{id: 'Oculus Touch', index: 0, hand: 'left', pose: {}}];
      done();
    });
  });

  suite('checkIfControllerPresent', function () {
    test('removes event listeners if controllers not present', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      // Mock has not been checked previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.ok(removeEventListenersSpy.called);
      assert.strictEqual(component.controllerPresent, false);
    });

    test('does not call removeEventListeners multiple times', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      // Mock that it's been checked previously.
      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.strictEqual(component.controllerPresent, false);
    });

    test('attach events if controller is newly present', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;

      // Mock that it's never been checked previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.ok(injectTrackedControlsSpy.called, 'Inject');
      assert.ok(addEventListenersSpy.called, 'Add');
      assert.notOk(removeEventListenersSpy.called, 'Remove');
      assert.ok(component.controllerPresent);
    });

    test('does not add or remove event listeners if presence doe not change', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;

      // Mock that it's was currently present.
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent);
    });

    test('removes event listeners if controller disappears', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');

      // Mock isControllerPresent to return true.

      // Mock that it's was currently present.
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(component.controllerPresent);
    });
  });

  suite('axismove', function () {
    test('can emit thumbstick moved', function (done) {
      var evt;
      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;
      // Do the check.
      component.checkIfControllerPresent();
      // Install event handler listening for thumbstickmoved.
      this.el.addEventListener('thumbstickmoved', function (evt) {
        assert.equal(evt.detail.x, 0.1);
        assert.equal(evt.detail.y, 0.2);
        assert.ok(evt.detail);
        done();
      });
      // Emit axismove.
      evt = new CustomEvent('axismove', {detail: {axis: [0.1, 0.2], changed: [true, false]}});
      this.el.dispatchEvent(evt);
    });

    test('does not emit thumbstickmoved if axismove has no changes', function (done) {
      var evt;
      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;
      // Do the check.
      component.checkIfControllerPresent();
      // Install event handler listening for thumbstickmoved.
      this.el.addEventListener('thumbstickmoved', function (evt) {
        assert.notOk(evt.detail);
      });
      // Emit axismove with no changes.
      evt = new CustomEvent('axismove', {detail: {axis: [0.1, 0.2], changed: [false, false]}});
      this.el.dispatchEvent(evt);
      setTimeout(function () { done(); });
    });
  });

  suite('buttonchanged', function () {
    test('can emit triggerchanged', function (done) {
      var evt;
      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;
      // Do the check.
      component.checkIfControllerPresent();
      // Install event handler listening for triggerchanged.
      this.el.addEventListener('triggerchanged', function (evt) {
        assert.ok(evt.detail);
        done();
      });
      // Emit buttonchanged.
      evt = new CustomEvent('buttonchanged', {
        detail: {id: 1, state: {value: 0.5, pressed: true, touched: true}}
      });
      this.el.dispatchEvent(evt);
    });
  });

  suite('gamepaddisconnected', function () {
    /**
     * In FF Nightly, only one gamepadconnected/disconnected event is fired,
     * which makes it difficult to handle in individual controller entities.
     * We no longer remove the controllersupdate listener as a result.
     */
    test('if we get gamepaddisconnected, check if present', function () {
      var checkIfControllerPresentSpy = this.sinon.spy(component, 'checkIfControllerPresent');
      // Because checkIfControllerPresent may be used in bound form, bind and reinstall.
      component.checkIfControllerPresent = component.checkIfControllerPresent.bind(component);
      component.pause();
      component.play();
      // Mock isControllerPresent to return false.
      // Reset everGotGamepadEvent so we don't think we've looked before.
      delete component.everGotGamepadEvent;
      // Fire emulated gamepaddisconnected event.
      window.dispatchEvent(new Event('gamepaddisconnected'));

      assert.ok(checkIfControllerPresentSpy.called);
    });
  });
});
