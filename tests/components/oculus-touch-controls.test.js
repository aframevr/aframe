/* global assert, process, setup, sinon, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('oculus-touch-controls', function () {
  var el;
  var component;

  setup(function (done) {
    el = this.el = entityFactory();
    el.setAttribute('oculus-touch-controls', '');
    el.addEventListener('loaded', function () {
      component = el.components['oculus-touch-controls'];
      component.controllersWhenPresent = [
        {id: 'Oculus Touch', index: 0, hand: 'left', pose: {}}
      ];
      done();
    });
  });

  suite('checkIfControllerPresent', function () {
    test('removes event listeners if controllers not present', function () {
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      // Mock has not been checked previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      sinon.assert.calledOnce(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, false);
    });

    test('does not call removeEventListeners multiple times', function () {
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      // Mock that it's been checked previously.
      component.controllerPresent = false;

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      sinon.assert.notCalled(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, false);
    });

    test('attach events if controller is newly present', function () {
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      // Mock that it's never been checked previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      sinon.assert.calledOnce(injectTrackedControlsSpy);
      sinon.assert.calledOnce(addEventListenersSpy);
      sinon.assert.notCalled(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, true);
    });

    test('does not add/remove event listeners if presence does not change', function () {
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      // Mock that it's was currently present.
      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      sinon.assert.notCalled(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, true);
    });

    test('removes event listeners if controller disappears', function () {
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');

      // Mock that it's was currently present.
      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      assert.strictEqual(component.controllerPresent, false);
    });
  });

  suite('axismove', function () {
    test('emits thumbstick moved', function (done) {
      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;
      // Do the check.
      component.checkIfControllerPresent();
      // Set up the event details.
      const eventDetails = {axis: [0.1, 0.2], changed: [true, false]};
      // Install event handler listening for thumbstickmoved.
      this.el.addEventListener('thumbstickmoved', function (evt) {
        assert.equal(evt.detail.x, eventDetails.axis[0]);
        assert.equal(evt.detail.y, eventDetails.axis[1]);
        done();
      });
      // Emit axismove.
      this.el.emit('axismove', eventDetails);
    });

    test('does not emit thumbstickmoved if axismove has no changes', function (done) {
      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;
      // Do the check.
      component.checkIfControllerPresent();
      // Fail purposely.
      this.el.addEventListener('thumbstickmoved', function (evt) {
        assert.fail('thumbstickmoved should not be called');
      });
      // Emit axismove with no changes.
      this.el.emit('axismove', {axis: [0.1, 0.2], changed: [false, false]});
      setTimeout(() => { done(); });
    });
  });

  suite('buttonchanged', function () {
    test('can emit triggerchanged', function (done) {
      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;
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
      el.emit('buttonchanged', {id: 1, state: eventState});
    });
  });
});
