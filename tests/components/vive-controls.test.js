/* global assert, process, setup, suite, test, THREE */
var entityFactory = require('../helpers').entityFactory;

suite('vive-controls', function () {
  var component;
  var controlsSystem;
  var el;

  setup(function (done) {
    el = entityFactory();
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'vive-controls') { return; }
      component = el.components['vive-controls'];
      component.controllersWhenPresent = [
        {id: 'OpenVR Gamepad', index: 0, hand: 'right', pose: {}}
      ];
      controlsSystem = el.sceneEl.systems['tracked-controls-webvr'];
      done();
    });
    el.setAttribute('vive-controls', 'hand: right; model: true');  // To ensure index = 0.
  });

  suite('checkIfControllerPresent', function () {
    test('remember not present if no controllers on first call', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      controlsSystem.controllers = [];

      // Mock not looked before.
      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.strictEqual(component.controllerPresent, false);  // Not undefined.
    });

    test('does not remove event listeners if no controllers again', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');
      controlsSystem.controllers = [];

      // Mock not looked before.
      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.strictEqual(component.controllerPresent, false);  // Not undefined.
    });

    test('attaches events if controller is newly present', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');
      controlsSystem.controllers = component.controllersWhenPresent;

      // Mock not looked before.
      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.ok(injectTrackedControlsSpy.called);
      assert.ok(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent);
    });

    test('does not inject/attach events again if controller is already present', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');
      controlsSystem.controllers = component.controllersWhenPresent;

      // Mock looked before.
      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent);
    });

    test('remove event listeners if controller disappears', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');
      controlsSystem.controllers = [];

      // Mock looked before.
      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called);
      assert.notOk(addEventListenersSpy.called);
      assert.ok(removeEventListenersSpy.called);
      assert.notOk(component.controllerPresent);
    });
  });

  suite('axismove', function () {
    test('emits trackpadmoved on axismove', function (done) {
      controlsSystem.controllers = component.controllersWhenPresent;

      component.checkIfControllerPresent();

      // Install event handler listening for trackpad.
      el.addEventListener('trackpadmoved', function (evt) {
        assert.equal(evt.detail.x, 0.1);
        assert.equal(evt.detail.y, 0.2);
        assert.ok(evt.detail);
        done();
      });

      // Emit axismove.
      el.emit('axismove', {axis: [0.1, 0.2], changed: [true, false]});
    });

    test('does not emit trackpadmoved on axismove with no changes', function (done) {
      controlsSystem.controllers = component.controllersWhenPresent;
      component.checkIfControllerPresent();

      // Install event handler listening for trackpadmoved.
      el.addEventListener('trackpadmoved', function (evt) {
        assert.notOk(evt.detail);
      });

      // Emit axismove.
      el.emit('axismove', {axis: [0.1, 0.2], changed: [false, false]});

      setTimeout(function () { done(); });
    });
  });

  suite('buttonchanged', function () {
    // Generate 3 tests for each button. Verify that it fires up/down/changed for all remapped buttons.
    [{ button: 'trackpad', id: 0 },
      { button: 'trigger', id: 1 },
      { button: 'grip', id: 2 },
      { button: 'menu', id: 3 },
      { button: 'system', id: 4 }
    ].forEach(function (buttonDescription) {
      test('emits ' + buttonDescription.button + 'changed on buttonchanged', function (done) {
        controlsSystem.controllers = component.controllersWhenPresent;
        component.checkIfControllerPresent();
        el.addEventListener(buttonDescription.button + 'changed', function (evt) {
          assert.ok(evt.detail);
          done();
        });
        el.emit('buttonchanged', {id: buttonDescription.id, state: {value: 0.5, pressed: true, touched: true}});
      });

      test('emits ' + buttonDescription.button + 'down on buttondown', function (done) {
        controlsSystem.controllers = component.controllersWhenPresent;
        component.checkIfControllerPresent();
        el.addEventListener(buttonDescription.button + 'down', function (evt) {
          done();
        });
        el.emit('buttondown', {id: buttonDescription.id});
      });

      test('emits ' + buttonDescription.button + 'up on buttonup', function (done) {
        controlsSystem.controllers = component.controllersWhenPresent;
        component.checkIfControllerPresent();
        el.addEventListener(buttonDescription.button + 'up', function (evt) {
          done();
        });
        el.emit('buttonup', {id: buttonDescription.id});
      });
    });
  });

  suite('model', function () {
    test('loads', function (done) {
      component.addEventListeners();
      el.addEventListener('model-loaded', function (evt) {
        assert.ok(component.buttonMeshes);
        assert.ok(component.buttonMeshes.trigger);
        assert.ok(el.getObject3D('mesh'));
        done();
      });
      component.data.model = true;
      component.injectTrackedControls();
    });
  });

  suite('button colors', function () {
    test('has trigger at default color', function (done) {
      component.addEventListeners();
      el.addEventListener('model-loaded', function (evt) {
        var color = component.buttonMeshes.trigger.material.color;
        assert.equal(new THREE.Color(color).getHexString(), 'fafafa');
        done();
      });
      component.data.model = true;
      component.injectTrackedControls();
    });

    test('has trackpad at default color', function (done) {
      component.addEventListeners();
      el.addEventListener('model-loaded', function (evt) {
        var color = component.buttonMeshes.trackpad.material.color;
        assert.equal(new THREE.Color(color).getHexString(), 'fafafa');
        done();
      });
      component.data.model = true;
      component.injectTrackedControls();
    });

    test('has grips at default colors', function (done) {
      component.addEventListeners();
      el.addEventListener('model-loaded', function (evt) {
        var color = component.buttonMeshes.grip.left.material.color;
        assert.equal(new THREE.Color(color).getHexString(), 'fafafa');
        color = component.buttonMeshes.grip.right.material.color;
        assert.equal(new THREE.Color(color).getHexString(), 'fafafa');
        done();
      });
      component.data.model = true;
      component.injectTrackedControls();
    });

    test('sets trigger to highlight color when down', function (done) {
      component.addEventListeners();
      el.addEventListener('model-loaded', function (evt) {
        el.emit('buttondown', {id: 1, state: {}});
        setTimeout(() => {
          var color = component.buttonMeshes.trigger.material.color;
          assert.equal(new THREE.Color(color).getHexString(), '22d1ee');
          done();
        });
      });
      component.data.model = true;
      component.injectTrackedControls();
    });

    test('sets trigger back to default color when up', function (done) {
      component.addEventListeners();
      el.addEventListener('model-loaded', function (evt) {
        component.buttonMeshes.trigger.material.color.set('#22d1ee');
        el.emit('buttonup', {id: 1, state: {}});
        setTimeout(() => {
          var color = component.buttonMeshes.trigger.material.color;
          assert.equal(new THREE.Color(color).getHexString(), 'fafafa');
          done();
        });
      });
      component.data.model = true;
      component.injectTrackedControls();
    });

    test('sets trackpad to highlight color when down', function (done) {
      component.addEventListeners();
      el.addEventListener('model-loaded', function (evt) {
        el.emit('buttondown', {id: 0, state: {}});
        setTimeout(() => {
          var color = component.buttonMeshes.trackpad.material.color;
          assert.equal(new THREE.Color(color).getHexString(), '22d1ee');
          done();
        });
      });
      component.data.model = true;
      component.injectTrackedControls();
    });

    test('does not change color for trigger touch', function (done) {
      component.addEventListeners();
      el.addEventListener('model-loaded', function (evt) {
        el.emit('touchstart', {id: 1, state: {}});
        setTimeout(() => {
          var color = component.buttonMeshes.trigger.material.color;
          assert.equal(new THREE.Color(color).getHexString(), 'fafafa');
          done();
        });
      });
      component.data.model = true;
      component.injectTrackedControls();
    });

    test('does not change color for trackpad touch', function (done) {
      component.addEventListeners();
      el.addEventListener('model-loaded', function (evt) {
        el.emit('touchstart', {id: 0, state: {}});
        setTimeout(() => {
          var color = component.buttonMeshes.trackpad.material.color;
          assert.equal(new THREE.Color(color).getHexString(), 'fafafa');
          done();
        });
      });
      component.data.model = true;
      component.injectTrackedControls();
    });
  });

  suite('event listener', function () {
    test('toggles controllerEventsActive', function () {
      component.controllerEventsActive = false;
      component.addEventListeners();
      assert.ok(component.controllerEventsActive);
      component.removeEventListeners();
      assert.notOk(component.controllerEventsActive);
    });
  });
});
