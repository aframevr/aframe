/* global assert, process, setup, sinon, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('oculus-go-controls', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('oculus-go-controls', 'hand: right');  // To ensure index is 0.
    var callback = function () {
      var component = el.components['oculus-go-controls'];
      // Initially no controllers are present
      component.controllers = [];
      // Our Mock data for enabling the controllers.
      component.controllersWhenPresent = [{
        id: 'Oculus Go Controller',
        index: 0,
        hand: 'right',
        axes: [0, 0],
        buttons: [
          {value: 0, pressed: false, touched: false},
          {value: 0, pressed: false, touched: false}
        ],
        pose: {orientation: [1, 0, 0, 0], position: null}
      }];
      el.parentEl.renderer.xr.getStandingMatrix = function () {};
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
      component = this.el.components['oculus-go-controls'];
      controllerSystem = this.el.sceneEl.systems['tracked-controls-webvr'];
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
    test('emits trackpadmoved on axismove', function (done) {
      var el = this.el;
      setupTestControllers(el);

      // Configure the event state for which we'll use the axis state for verification.
      const eventState = {axis: [0.1, 0.2], changed: [true, false]};

      el.addEventListener('trackpadmoved', function (evt) {
        assert.equal(evt.detail.x, eventState.axis[0]);
        assert.equal(evt.detail.y, eventState.axis[1]);
        done();
      });

      el.emit('axismove', eventState);
    });

    test('does not emit trackpadmoved on axismove with no changes', function (done) {
      var el = this.el;
      setupTestControllers(el);

      // Fail purposely.
      el.addEventListener('trackpadmoved', function (evt) {
        assert.fail('trackpadmoved was called when there was no change.');
      });

      el.emit('axismove', {axis: [0.1, 0.2], changed: [false, false]});
      setTimeout(() => { done(); });
    });
  });

  suite('buttonchanged', function () {
    [ { button: 'trackpad', id: 0 },
      { button: 'trigger', id: 1 }
    ].forEach(function (buttonDescription) {
      test('if we get buttonchanged for button ' + buttonDescription.id + ', emit ' + buttonDescription.button + 'changed', function (done) {
        var el = this.el;
        setupTestControllers(el);

        // Configure the expected event state and use it to fire the event.
        const eventState = {value: 0.5, pressed: true, touched: true};

        el.addEventListener(buttonDescription.button + 'changed', function (evt) {
          assert.deepEqual(evt.detail, eventState);
          done();
        });

        el.emit('buttonchanged', {id: buttonDescription.id, state: eventState});
      });

      test('if we get buttondown for button ' + buttonDescription.id + ', emit ' + buttonDescription.button + 'down', function (done) {
        var el = this.el;
        setupTestControllers(el);

        el.addEventListener(buttonDescription.button + 'down', function (evt) {
          done();
        });

        el.emit('buttondown', {id: buttonDescription.id});
      });

      test('if we get buttonup for button ' + buttonDescription.id + ', emit ' + buttonDescription.button + 'up', function (done) {
        var el = this.el;
        setupTestControllers(el);

        el.addEventListener(buttonDescription.button + 'up', function (evt) {
          done();
        });

        el.emit('buttonup', {id: buttonDescription.id});
      });
    });
  });

  suite('armModel', function () {
    test('does not apply armModel if armModel disabled', function () {
      var el = this.el;
      el.setAttribute('oculus-go-controls', 'armModel', false);
      setupTestControllers(el);

      var trackedControls = el.components['tracked-controls-webvr'];
      var applyArmModelSpy = sinon.spy(trackedControls, 'applyArmModel');
      trackedControls.tick();

      // Verify that the function which applies arm model is not called when disabled.
      sinon.assert.notCalled(applyArmModelSpy);

      // Additionally verify that no other offets have been applied.
      assert.strictEqual(el.object3D.position.x, 0);
      assert.strictEqual(el.object3D.position.y, 0);
      assert.strictEqual(el.object3D.position.z, 0);
    });

    test('applies armModel if armModel enabled', function () {
      var el = this.el;
      el.setAttribute('oculus-go-controls', 'armModel', true);
      setupTestControllers(el);

      var trackedControls = el.components['tracked-controls-webvr'];
      var applyArmModelSpy = sinon.spy(trackedControls, 'applyArmModel');
      trackedControls.tick();

      // Verify that the function which applies arm model is called.
      sinon.assert.calledOnce(applyArmModelSpy);
    });

    test('verifies armModel position is applied for the right hand', function () {
      var el = this.el;
      el.setAttribute('oculus-go-controls', 'armModel', true);
      setupTestControllers(el);

      var trackedControls = el.components['tracked-controls-webvr'];
      trackedControls.tick();
      assert.ok(el.object3D.position.x > 0);
    });

    test('verifies armModel position is applied for the left hand', function () {
      var el = this.el;
      el.setAttribute('oculus-go-controls', 'armModel', true);
      el.setAttribute('oculus-go-controls', 'hand', 'left');
      el.components['oculus-go-controls'].controllersWhenPresent[0].hand = 'left';
      setupTestControllers(el);

      var trackedControls = el.components['tracked-controls-webvr'];
      trackedControls.tick();
      assert.ok(el.object3D.position.x < 0);
    });
  });

  /**
   * Establishes the baseline set of controllers needed for the tests to run.
   *
   * @param {object} el - The current entity factory.
   */
  function setupTestControllers (el) {
    var component = el.components['oculus-go-controls'];
    el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;
    component.checkIfControllerPresent();
  }
});
