/* global assert, process, setup, sinon, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('gearvr-controls', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('gearvr-controls', 'hand: right');  // To ensure index is 0.
    el.addEventListener('loaded', function () {
      var component = el.components['gearvr-controls'];
      component.controllersWhenPresent = [{
        id: 'Gear VR Controller',
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
    });
  });

  suite('checkIfControllerPresent', function () {
    test('returns not present if no controllers on first on first call', function () {
      var el = this.el;
      var component = el.components['gearvr-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = [];

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      sinon.assert.notCalled(injectTrackedControlsSpy);
      sinon.assert.notCalled(addEventListenersSpy);
      assert.strictEqual(component.controllerPresent, false);
    });

    test('does not remove event listeners if no controllers', function () {
      var el = this.el;
      var component = el.components['gearvr-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = [];

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
      var component = el.components['gearvr-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      sinon.assert.calledOnce(injectTrackedControlsSpy);
      sinon.assert.calledOnce(addEventListenersSpy);
      sinon.assert.notCalled(removeEventListenersSpy);
      assert.strictEqual(component.controllerPresent, true);
    });

    test('does not inject/attach events again if controller already present', function () {
      var el = this.el;
      var component = el.components['gearvr-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

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
      var component = el.components['gearvr-controls'];
      var addEventListenersSpy = sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = [];

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
    test('emits trackpadmoved on axismove', function (done) {
      var el = this.el;
      var component = el.components['gearvr-controls'];

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      component.checkIfControllerPresent();

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
      var component = el.components['gearvr-controls'];

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      component.checkIfControllerPresent();

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
        var component = el.components['gearvr-controls'];

        el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

        component.checkIfControllerPresent();

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
        var component = el.components['gearvr-controls'];

        el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

        component.checkIfControllerPresent();

        el.addEventListener(buttonDescription.button + 'down', function (evt) {
          done();
        });

        el.emit('buttondown', {id: buttonDescription.id});
      });

      test('if we get buttonup for button ' + buttonDescription.id + ', emit ' + buttonDescription.button + 'up', function (done) {
        var el = this.el;
        var component = el.components['gearvr-controls'];

        el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

        component.checkIfControllerPresent();

        el.addEventListener(buttonDescription.button + 'up', function (evt) {
          done();
        });

        el.emit('buttonup', {id: buttonDescription.id});
      });
    });
  });

  suite('armModel', function () {
    function makePresent (el) {
      var component = el.components['gearvr-controls'];
      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;
      component.checkIfControllerPresent();
    }

    test('does not apply armModel if armModel disabled', function () {
      var el = this.el;
      el.setAttribute('gearvr-controls', 'armModel', false);
      makePresent(el);
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
      el.setAttribute('gearvr-controls', 'armModel', true);
      makePresent(el);
      var trackedControls = el.components['tracked-controls-webvr'];
      var applyArmModelSpy = sinon.spy(trackedControls, 'applyArmModel');
      trackedControls.tick();

      // Verify that the function which applies arm model is called.
      sinon.assert.calledOnce(applyArmModelSpy);
    });

    test('verifies armModel position is applied for the right hand', function () {
      var el = this.el;
      el.setAttribute('gearvr-controls', 'armModel', true);
      makePresent(el);
      var trackedControls = el.components['tracked-controls-webvr'];
      trackedControls.tick();
      assert.ok(el.object3D.position.x > 0);
    });

    test('verifies armModel position is applied for the left hand', function () {
      var el = this.el;
      el.setAttribute('gearvr-controls', 'armModel', true);
      el.setAttribute('gearvr-controls', 'hand', 'left');
      el.components['gearvr-controls'].controllersWhenPresent[0].hand = 'left';
      makePresent(el);
      var trackedControls = el.components['tracked-controls-webvr'];
      trackedControls.tick();
      assert.ok(el.object3D.position.x < 0);
    });
  });
});
