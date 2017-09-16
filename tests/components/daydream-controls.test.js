/* global assert, process, setup, suite, test, Event */
var entityFactory = require('../helpers').entityFactory;

suite('daydream-controls', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('daydream-controls', 'hand: right'); // to ensure index = 0
    el.addEventListener('loaded', function () {
      var component = el.components['daydream-controls'];
      component.controllersWhenPresent = [{
        id: 'Daydream Controller',
        index: 0,
        hand: 'right',
        axes: [0, 0],
        buttons: [{value: 0, pressed: false, touched: false}],
        pose: {orientation: [1, 0, 0, 0], position: null}
      }];
      done();
    });
  });

  suite('checkIfControllerPresent', function () {
    test('returns not present if no controllers on the first call', function () {
      var el = this.el;
      var component = el.components['daydream-controls'];
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');

      el.sceneEl.systems['tracked-controls'].controllers = [];

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.ok(component.controllerPresent === false);
    });

    test('does not remove event listeners if no controllers', function () {
      var el = this.el;
      var component = el.components['daydream-controls'];
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls'].controllers = [];

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent === false); // not undefined
    });

    test('attaches events if controller is newly present', function () {
      var el = this.el;
      var component = el.components['daydream-controls'];
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.ok(injectTrackedControlsSpy.called);
      assert.ok(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent);
    });

    test('does not inject/attach events again if controller already present', function () {
      var el = this.el;
      var component = el.components['daydream-controls'];
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;

      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent);
    });

    test('removes event listeners if controller disappears', function () {
      var el = this.el;
      var component = el.components['daydream-controls'];
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls'].controllers = [];

      component.controllerPresent = true;
      component.controllerEventsActive = true;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.ok(removeEventListenersSpy.called);
      assert.notOk(component.controllerPresent);
    });
  });

  suite('axismove', function () {
    test('emits trackpadmoved on axismove', function (done) {
      var el = this.el;
      var component = el.components['daydream-controls'];

      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;
      component.checkIfControllerPresent();

      // Install event handler listening for thumbstickmoved.
      this.el.addEventListener('trackpadmoved', function (evt) {
        assert.equal(evt.detail.x, 0.1);
        assert.equal(evt.detail.y, 0.2);
        assert.ok(evt.detail);
        done();
      });

      // Emit axismove.
      this.el.emit('axismove', {axis: [0.1, 0.2], changed: [true, false]});
    });

    test(' does not emit trackpadmove on axismove with no changes', function (done) {
      var el = this.el;
      var component = el.components['daydream-controls'];

      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;

      component.checkIfControllerPresent();

      // Purposely fail.
      this.el.addEventListener('trackpadmoved', function (evt) {
        assert.ok(false);
      });

      // Emit axismove.
      this.el.emit('axismove', {axis: [0.1, 0.2], changed: [false, false]});

      setTimeout(() => { done(); });
    });
  });

  suite('buttonchanged', function () {
    test('emits trackpadchanged on buttonchanged', function (done) {
      var el = this.el;
      var component = el.components['daydream-controls'];

      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;

      component.checkIfControllerPresent();

      // Install event handler listening for triggerchanged.
      this.el.addEventListener('trackpadchanged', function (evt) {
        assert.ok(evt.detail);
        done();
      });

      // Emit buttonchanged.
      this.el.emit('buttonchanged',
                   {id: 0, state: {value: 0.5, pressed: true, touched: true}});
    });
  });

  suite('gamepaddisconnected', function () {
    /**
     * Due to an apparent bug in FF Nightly
     * where only one gamepadconnected / disconnected event is fired,
     * which makes it difficult to handle in individual controller entities,
     * we no longer remove the controllersupdate listener as a result.
     */
    test('checks present on gamepaddisconnected', function () {
      var el = this.el;
      var component = el.components['daydream-controls'];
      var checkIfControllerPresentSpy = this.sinon.spy(component, 'checkIfControllerPresent');
      // Because checkIfControllerPresent may be used in bound form, bind and reinstall.
      component.checkIfControllerPresent = component.checkIfControllerPresent.bind(component);
      component.pause();
      component.play();

      el.sceneEl.systems['tracked-controls'].controllers = [];

      // Reset everGotGamepadEvent so we don't think we've looked before.
      delete component.everGotGamepadEvent;

      // Fire emulated gamepaddisconnected event.
      window.dispatchEvent(new Event('gamepaddisconnected'));

      assert.ok(checkIfControllerPresentSpy.called);
    });
  });

  suite('armModel', function () {
    function makePresent (el) {
      var component = el.components['daydream-controls'];
      el.sceneEl.systems['tracked-controls'].controllers = component.controllersWhenPresent;
      component.checkIfControllerPresent();
    }

    test('does not apply if armModel disabled', function () {
      var el = this.el;
      el.setAttribute('daydream-controls', 'armModel', false);
      makePresent(el);
      var trackedControls = el.components['tracked-controls'];
      var applyArmModelSpy = this.sinon.spy(trackedControls, 'applyArmModel');
      trackedControls.tick();
      assert.notOk(applyArmModelSpy.called);
    });

    test('applies armModel if armModel enabled', function () {
      var el = this.el;
      el.setAttribute('daydream-controls', 'armModel', true);
      makePresent(el);
      var trackedControls = el.components['tracked-controls'];
      var applyArmModelSpy = this.sinon.spy(trackedControls, 'applyArmModel');
      trackedControls.tick();
      assert.ok(applyArmModelSpy.called);
    });
  });
});
