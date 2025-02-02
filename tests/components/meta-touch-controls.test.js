/* global assert, setup, sinon, suite, test */
import { entityFactory } from '../helpers.js';

suite('meta-touch-controls', function () {
  var el;
  var component;

  setup(function (done) {
    el = this.el = entityFactory();
    el.setAttribute('meta-touch-controls', '');
    var callback = function () {
      component = el.components['meta-touch-controls'];
      // Initially no controllers are present
      component.controllers = [];
      // Our Mock data for enabling the controllers.
      component.controllersWhenPresent = [{
        profiles: ['oculus-touch'],
        handedness: 'left'
      }];
      done();
    };
    if (el.hasLoaded) { callback(); }
    el.addEventListener('loaded', callback);
  });

  suite('checkIfControllerPresent', function () {
    var component;
    var controllerSystem;
    var addEventListenersSpy;
    var injectTrackedControlsSpy;
    var removeEventListenersSpy;

    setup(function (done) {
      component = this.el.components['meta-touch-controls'];
      controllerSystem = this.el.sceneEl.systems['tracked-controls'];
      controllerSystem.vrDisplay = true;
      addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');
      done();
    });

    /**
     * Verifies that the method spy's are in the right state for a controller
     * that has been injected.
     *
     * @param {object} component - The oculus-go-controls component to verify fields.
     */
    function verifyControllerSetup (component) {
      sinon.assert.calledOnce(injectTrackedControlsSpy);
      sinon.assert.calledOnce(addEventListenersSpy);
      sinon.assert.notCalled(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, true);
    }

    test('returns not present if no controllers on first call', function () {
      // Our current setup state is that no controllers are present. Check for presence
      // and verify that we do not find controllers or call any spy methods.
      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      sinon.assert.notCalled(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, false);
    });

    test('attaches events if controller is newly present', function () {
      // Setup our mock controller with an initial state of no controllers present and verify
      // that we detect the controller and inject our tracked-controls component.
      controllerSystem.controllers = component.controllersWhenPresent;
      component.checkIfControllerPresent();

      verifyControllerSetup(component);
    });

    test('does not inject/attach events again if controller already present', function () {
      // Controllers are both present and already attached. No events or attachment should happen.
      controllerSystem.controllers = component.controllersWhenPresent;

      // First set up a real controller so the internal state is consistent with an already
      // present controller.
      component.checkIfControllerPresent();
      verifyControllerSetup(component);

      // Check again to verify that the already attached controller doesn't cause any side effects.
      // The counts on the spies should be exactly the same as they were prior.
      component.checkIfControllerPresent();
      verifyControllerSetup(component);
    });

    test('removes event listeners if controller disappears', function () {
      controllerSystem.controllers = component.controllersWhenPresent;

      // First set up a real controller so the internal state is consistent with an already
      // present controller.
      component.checkIfControllerPresent();
      verifyControllerSetup(component);

      // Remove the controllers and verify that everything is cleaned up correctly. We do this
      // by resetting the spy methods so we are certain only the remove is called.
      controllerSystem.controllers = [];
      injectTrackedControlsSpy.resetHistory();
      addEventListenersSpy.resetHistory();
      removeEventListenersSpy.resetHistory();

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      sinon.assert.calledOnce(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, false);
    });
  });

  suite('axismove', function () {
    var controllerSystem;

    setup(function (done) {
      controllerSystem = this.el.sceneEl.systems['tracked-controls'];
      controllerSystem.controllers = component.controllersWhenPresent;
      controllerSystem.vrDisplay = true;
      done();
    });

    test('emits thumbstick moved', function (done) {
      // Do the check.
      component.checkIfControllerPresent();
      // Set up the event details.
      const eventDetails = {axis: [0.1, 0.2, 0.3, 0.4], changed: [false, false, true, false]};
      // Install event handler listening for thumbstickmoved.
      this.el.addEventListener('thumbstickmoved', function (evt) {
        assert.equal(evt.detail.x, eventDetails.axis[2]);
        assert.equal(evt.detail.y, eventDetails.axis[3]);
        done();
      });
      // Emit axismove.
      this.el.emit('axismove', eventDetails);
    });

    test('does not emit thumbstickmoved if axismove has no changes', function (done) {
      // Do the check.
      component.checkIfControllerPresent();
      // Fail purposely.
      this.el.addEventListener('thumbstickmoved', function (evt) {
        assert.fail('thumbstickmoved should not be called');
      });
      // Emit axismove with no changes.
      this.el.emit('axismove', {axis: [0.1, 0.2, 0.3, 0.4], changed: [false, false, false, false]});
      setTimeout(() => { done(); });
    });
  });

  suite('buttonchanged', function () {
    test('can emit triggerchanged', function (done) {
      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;
      // Do the check.
      component.checkIfControllerPresent();
      // Prepare the event details
      const eventState = {value: 0.5, pressed: true, touched: true};
      // Install event handler listening for triggerchanged.
      el.addEventListener('triggerchanged', function (evt) {
        assert.deepEqual(evt.detail, eventState);
        done();
      });
      // Emit buttonchanged.
      el.emit('buttonchanged', {id: 0, state: eventState});
    });
  });
});
