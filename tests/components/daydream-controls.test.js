/* global assert, process, setup, suite, test */
let entityFactory = require('../helpers').entityFactory;

suite('daydream-controls', function () {
  setup(function (done) {
    let el = this.el = entityFactory();
    el.setAttribute('daydream-controls', 'hand: right'); // to ensure index = 0
    el.addEventListener('loaded', function () {
      let component = el.components['daydream-controls'];
      component.controllersWhenPresent = [{
        id: 'Daydream Controller',
        index: 0,
        hand: 'right',
        axes: [0, 0],
        buttons: [{value: 0, pressed: false, touched: false}],
        pose: {orientation: [1, 0, 0, 0], position: null}
      }];
      el.parentEl.renderer.xr.getStandingMatrix = function () {};
      done();
    });
  });

  suite('checkIfControllerPresent', function () {
    test('returns not present if no controllers on the first call', function () {
      let el = this.el;
      let component = el.components['daydream-controls'];
      let addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      let injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = [];

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.ok(component.controllerPresent === false);
    });

    test('does not remove event listeners if no controllers', function () {
      let el = this.el;
      let component = el.components['daydream-controls'];
      let addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      let injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      let removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = [];

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent === false); // not undefined
    });

    test('attaches events if controller is newly present', function () {
      let el = this.el;
      let component = el.components['daydream-controls'];
      let addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      let injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      let removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.ok(injectTrackedControlsSpy.called);
      assert.ok(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent);
    });

    test('does not inject/attach events again if controller already present', function () {
      let el = this.el;
      let component = el.components['daydream-controls'];
      let addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      let injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      let removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent);
    });

    test('removes event listeners if controller disappears', function () {
      let el = this.el;
      let component = el.components['daydream-controls'];
      let addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      let injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      let removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      el.sceneEl.systems['tracked-controls-webvr'].controllers = [];

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
      let el = this.el;
      let component = el.components['daydream-controls'];

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;
      component.checkIfControllerPresent();

      // Install event handler listening for thumbstickmoved.
      el.addEventListener('trackpadmoved', function (evt) {
        assert.equal(evt.detail.x, 0.1);
        assert.equal(evt.detail.y, 0.2);
        done();
      });

      // Emit axismove.
      el.emit('axismove', {axis: [0.1, 0.2], changed: [true, false]});
    });

    test('does not emit trackpadmove on axismove with no changes', function (done) {
      let el = this.el;
      let component = el.components['daydream-controls'];

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      component.checkIfControllerPresent();

      // Purposely fail.
      el.addEventListener('trackpadmoved', function (evt) {
        assert.fail('trackpadmoved should not fire if axes have not changed.');
      });

      // Emit axismove.
      el.emit('axismove', {axis: [0.1, 0.2], changed: [false, false]});

      setTimeout(() => { done(); });
    });
  });

  suite('buttonchanged', function () {
    test('emits trackpadchanged on buttonchanged for button 0', function (done) {
      let el = this.el;
      let component = el.components['daydream-controls'];

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      component.checkIfControllerPresent();

      const eventState = {value: 0.5, pressed: true, touched: true};

      // Install event handler listening for triggerchanged.
      el.addEventListener('trackpadchanged', function (evt) {
        assert.deepEqual(evt.detail, eventState);
        done();
      });

      // Emit buttonchanged for the trackpad button.
      el.emit('buttonchanged', {id: 0, state: eventState});
    });

    test('emits menuchanged on buttonchanged for button 1', function (done) {
      let el = this.el;
      let component = el.components['daydream-controls'];

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      component.checkIfControllerPresent();

      const eventState = {value: 0.5, pressed: true, touched: true};

      // Install event handler listening for triggerchanged.
      el.addEventListener('menuchanged', function (evt) {
        assert.deepEqual(evt.detail, eventState);
        done();
      });

      // Emit buttonchanged for the menu button.
      el.emit('buttonchanged', {id: 1, state: eventState});
    });

    test('emits systemanged on buttonchanged for button 2', function (done) {
      let el = this.el;
      let component = el.components['daydream-controls'];

      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;

      component.checkIfControllerPresent();

      const eventState = {value: 0.5, pressed: true, touched: true};

      // Install event handler listening for triggerchanged.
      el.addEventListener('systemchanged', function (evt) {
        assert.deepEqual(evt.detail, eventState);
        done();
      });

      // Emit buttonchanged for the system button.
      el.emit('buttonchanged', {id: 2, state: eventState});
    });
  });

  suite('armModel', function () {
    function makePresent (el) {
      let component = el.components['daydream-controls'];
      el.sceneEl.systems['tracked-controls-webvr'].controllers = component.controllersWhenPresent;
      component.checkIfControllerPresent();
    }

    test('does not apply if armModel disabled', function () {
      let el = this.el;
      el.setAttribute('daydream-controls', 'armModel', false);
      makePresent(el);
      let trackedControls = el.components['tracked-controls-webvr'];
      let applyArmModelSpy = this.sinon.spy(trackedControls, 'applyArmModel');
      trackedControls.tick();
      assert.notOk(applyArmModelSpy.called);
    });

    test('applies armModel if armModel enabled', function () {
      let el = this.el;
      el.setAttribute('daydream-controls', 'armModel', true);
      makePresent(el);
      let trackedControls = el.components['tracked-controls-webvr'];
      let applyArmModelSpy = this.sinon.spy(trackedControls, 'applyArmModel');
      trackedControls.tick();
      assert.ok(applyArmModelSpy.called);
    });
  });
});
