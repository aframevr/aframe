/* global assert, setup, sinon, suite, test */
import { entityFactory } from '../helpers.js';

suite('vive-focus-controls', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('vive-focus-controls', 'hand: right');  // To ensure index is 0.
    el.addEventListener('loaded', function () {
      var component = el.components['vive-focus-controls'];
      component.controllersWhenPresent = [{
        profiles: ['htc-vive-focus'],
        handedness: 'right'
      }];
      done();
    });
  });

  suite('checkIfControllerPresent', function () {
    test('returns not present if no controllers on first on first call', function () {
      var el = this.el;
      var component = el.components['vive-focus-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');

      el.sceneEl.systems['tracked-controls'].controllers = [];

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      assert.strictEqual(component.controllerPresent, false);
    });

    test('does not remove event listeners if no controllers', function () {
      var el = this.el;
      var component = el.components['vive-focus-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls'].controllers = [];

      component.controllerEventsActive = false;
      component.controllerPresent = false;

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      sinon.assert.notCalled(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, false);
    });

    test('attaches events if controller is newly present', function () {
      var el = this.el;
      var component = el.components['vive-focus-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      sinon.assert.calledOnce(injectTrackedControlsSpy);
      sinon.assert.calledOnce(addEventListenersSpy);
      sinon.assert.notCalled(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, true);
    });

    test('does not inject/attach events again if controller already present', function () {
      var el = this.el;
      var component = el.components['vive-focus-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;

      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      sinon.assert.notCalled(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, true);
    });

    test('removes event listeners if controller disappears', function () {
      var el = this.el;
      var component = el.components['vive-focus-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls'].controllers = [];

      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      sinon.assert.calledOnce(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, false);
    });
  });

  suite('axismove', function () {
    test('emits touchpadmoved on axismove', function (done) {
      var el = this.el;
      setupTestControllers(el);

      // Configure the event state for which we'll use the axis state for verification.
      const eventState = {axis: [0.1, 0.2], changed: [true, false]};

      el.addEventListener('touchpadmoved', function (evt) {
        assert.equal(evt.detail.x, eventState.axis[0]);
        assert.equal(evt.detail.y, eventState.axis[1]);
        done();
      });

      el.emit('axismove', eventState);
    });

    test('does not emit touchpadmoved on axismove with no changes', function (done) {
      var el = this.el;
      setupTestControllers(el);

      // Fail purposely.
      el.addEventListener('touchpadmoved', function (evt) {
        assert.fail('touchpadmoved was called when there was no change.');
      });

      el.emit('axismove', {axis: [0.1, 0.2], changed: [false, false]});
      setTimeout(() => { done(); });
    });
  });

  suite('buttonchanged', function () {
    [{ button: 'trigger', id: 0 },
      { button: 'touchpad', id: 2 },
      { button: 'menu', id: 4 }
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

  /**
   * Establishes the baseline set of controllers needed for the tests to run.
   *
   * @param {object} el - The current entity factory.
   */
  function setupTestControllers (el) {
    var component = el.components['vive-focus-controls'];
    el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;
    component.checkIfControllerPresent();
  }
});
