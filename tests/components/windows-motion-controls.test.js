/* global assert, process, setup, suite, test, THREE */
var entityFactory = require('../helpers').entityFactory;

suite('windows-motion-controls', function () {
  var el;
  var component;

  var MOCKS = {
    AXIS_VALUES_VALID: [0.1, 0.2, 0.3, 0.4],
    AXIS_THUMBSTICK_X: 0,
    AXIS_THUMBSTICK_Y: 1,
    AXIS_TRACKPAD_X: 2,
    AXIS_TRACKPAD_Y: 3,
    HAND_LEFT: 'left',
    HAND_RIGHT: 'right',
    HAND_DEFAULT: 'right',
    HAND_UNHANDED: ''
  };

  setup(function (done) {
    el = this.el = entityFactory();
    el.setAttribute('windows-motion-controls', '');
    el.addEventListener('loaded', function () {
      component = el.components['windows-motion-controls'];
      // Stub so we don't actually make calls to load the meshes from the remote CDN in every test.
      component.loadModel = function () { };
      done();
    });
  });

  suite('checkIfControllerPresent', function () {
    // Test that we don't listen to a-frame emitted events if the component doesn't have
    // a controller present.
    test('removes event listeners if controllers not present', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called, 'injectTrackedControls not called');
      assert.notOk(addEventListenersSpy.called, 'addEventListeners not called');
      assert.ok(removeEventListenersSpy.called, 'removeEventListeners called');
      assert.strictEqual(component.controllerPresent, false, 'contollers not present');
    });

    test('does not call removeEventListeners multiple times', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      component.controllerPresent = false;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called, 'injectTrackedControls not called');
      assert.notOk(addEventListenersSpy.called, 'addEventListeners not called');
      assert.notOk(removeEventListenersSpy.called, 'removeEventListeners not called');
      assert.strictEqual(component.controllerPresent, false, 'contollers not present');
    });

    test('attach events if controller is newly present', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.ok(injectTrackedControlsSpy.called, 'Inject');
      assert.ok(addEventListenersSpy.called, 'Add');
      assert.notOk(removeEventListenersSpy.called, 'Remove');
      assert.ok(component.controllerPresent, 'controllers present');
    });

    test('does not detect presence of controller with missing id suffix', function () {
      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = [
        {id: 'Spatial Controller (Spatial Interaction Source)', index: 0, hand: MOCKS.HAND_LEFT, pose: {}}
      ];

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.notOk(component.controllerPresent, 'controllers present');
    });

    test('does not detect presence of controller with unknown device ID', function () {
      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = [
        {id: 'unknown', index: 0, hand: MOCKS.HAND_LEFT, pose: {}}
      ];

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.notOk(component.controllerPresent, 'controllers present');
    });

    test('does not detect presence of controller with wrong hand', function () {
      // Mock isControllerPresent to return false.
      component.data.hand = MOCKS.HAND_RIGHT;
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_LEFT);

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.notOk(component.controllerPresent, 'controllers present');
    });

    test('detects presence of controller in third pair', function () {
      // Mock isControllerPresent to return true.
      component.data.pair = 2;
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_LEFT, MOCKS.HAND_RIGHT, MOCKS.HAND_LEFT, MOCKS.HAND_RIGHT, MOCKS.HAND_LEFT, MOCKS.HAND_RIGHT);

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.ok(component.controllerPresent, 'controllers present');
    });

    test('detects presence of controller in second pair', function () {
      // Mock isControllerPresent to return true.
      component.data.pair = 1;

      detect('right');
      detect('left');

      function detect (hand) {
        component.data.hand = hand;
        el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(hand, hand);

        // delete our previously created mock, so component behaves as if it's never
        // checked for controller presence previously.
        delete component.controllerPresent;

        component.checkIfControllerPresent();

        assert.ok(component.controllerPresent, hand + ' controllers present');
      }
    });

    test('detects presence of controller in second pair of unhanded', function () {
      // Mock isControllerPresent to return true.
      component.data.pair = 1;

      detect('right');
      detect('left');

      function detect (hand) {
        component.data.hand = hand;
        el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList('', '', '', '');

        // delete our previously created mock, so component behaves as if it's never
        // checked for controller presence previously.
        delete component.controllerPresent;

        component.checkIfControllerPresent();

        assert.ok(component.controllerPresent, hand + ' controllers present');
      }
    });

    test('does not detect presence of controller in second pair of unhanded with too few connected', function () {
      // Mock isControllerPresent to return true.
      component.data.pair = 1;

      detect('right');
      detect('left');

      function detect (hand) {
        component.data.hand = hand;
        el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList('', '');

        // delete our previously created mock, so component behaves as if it's never
        // checked for controller presence previously.
        delete component.controllerPresent;

        component.checkIfControllerPresent();

        assert.notOk(component.controllerPresent, hand + ' controllers present');
      }
    });

    test('detects presence of controller with right hand', function () {
      component.data.hand = MOCKS.HAND_RIGHT;

      // Mock isControllerPresent to return false.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.ok(component.controllerPresent, 'controllers present');
    });

    test('detects presence of right controller with single unhanded', function () {
      component.data.hand = MOCKS.HAND_RIGHT;

      // Mock isControllerPresent to return false.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_UNHANDED);

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.ok(component.controllerPresent, 'controllers present');
    });

    test('does not detect presence of left controller with single unhanded', function () {
      component.data.hand = MOCKS.HAND_LEFT;

      // Mock isControllerPresent to return false.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_UNHANDED);

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.notOk(component.controllerPresent, 'controllers present');
    });

    test('detects presence of left controller with two unhanded', function () {
      component.data.hand = MOCKS.HAND_LEFT;

      // Mock isControllerPresent to return false.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_UNHANDED, MOCKS.HAND_UNHANDED);

      // delete our previously created mock, so component behaves as if it's never
      // checked for controller presence previously.
      delete component.controllerPresent;

      component.checkIfControllerPresent();

      assert.ok(component.controllerPresent, 'controllers present');
    });

    test('does not add/remove event listeners if presence does not change', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');
      var removeEventListenersSpy = this.sinon.spy(component, 'removeEventListeners');

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);

      // Mock to the state that a gamepad is present.
      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called, 'injectTrackedControls not called');
      assert.notOk(addEventListenersSpy.called, 'addEventListeners not called');
      assert.notOk(removeEventListenersSpy.called);
      assert.ok(component.controllerPresent, 'controllers present');
    });

    test('removes event listeners if controller disappears', function () {
      var addEventListenersSpy = this.sinon.spy(component, 'addEventListeners');
      var injectTrackedControlsSpy = this.sinon.spy(component, 'injectTrackedControls');

      // Mock to the state that a gamepad is present.
      component.controllerEventsActive = true;
      component.controllerPresent = true;

      component.checkIfControllerPresent();

      assert.notOk(injectTrackedControlsSpy.called, 'injectTrackedControls not called');
      assert.notOk(addEventListenersSpy.called, 'addEventListeners not called');
      assert.notOk(component.controllerPresent, 'controllers not present');
    });
  });

  suite('axismove', function () {
    test('emits thumbstick moved on X', function (done) {
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);
      // Do the check.
      component.checkIfControllerPresent();
      // Install event handler listening for thumbstickmoved.
      this.el.addEventListener('thumbstickmoved', function (evt) {
        assert.equal(evt.detail.x, MOCKS.AXIS_VALUES_VALID[MOCKS.AXIS_THUMBSTICK_X], 'thumbstick axis X value');
        assert.equal(evt.detail.y, MOCKS.AXIS_VALUES_VALID[MOCKS.AXIS_THUMBSTICK_Y], 'thumbstick axis Y value');
        assert.ok(evt.detail);
        done();
      });
      // Emit axismove.
      this.el.emit('axismove', createAxisMovedFromChanged(MOCKS.AXIS_THUMBSTICK_X));
    });

    test('emits thumbstick moved on Y', function (done) {
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);
      // Do the check.
      component.checkIfControllerPresent();
      // Install event handler listening for thumbstickmoved.
      this.el.addEventListener('thumbstickmoved', function (evt) {
        assert.equal(evt.detail.x, MOCKS.AXIS_VALUES_VALID[MOCKS.AXIS_THUMBSTICK_X], 'thumbstick axis X value');
        assert.equal(evt.detail.y, MOCKS.AXIS_VALUES_VALID[MOCKS.AXIS_THUMBSTICK_Y], 'thumbstick axis Y value');
        assert.ok(evt.detail);
        done();
      });
      // Emit axismove.
      this.el.emit('axismove', createAxisMovedFromChanged(MOCKS.AXIS_THUMBSTICK_Y));
    });

    test('emits trackpad moved on X', function (done) {
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);
      // Do the check.
      component.checkIfControllerPresent();
      // Install event handler listening for trackpadmoved.
      this.el.addEventListener('trackpadmoved', function (evt) {
        assert.ok(evt.detail, 'event.detail not null');
        assert.equal(evt.detail.x, MOCKS.AXIS_VALUES_VALID[MOCKS.AXIS_TRACKPAD_X], 'trackpad axis X value');
        assert.equal(evt.detail.y, MOCKS.AXIS_VALUES_VALID[MOCKS.AXIS_TRACKPAD_Y], 'trackpad axis Y value');
        done();
      });
      // Emit axismove.
      this.el.emit('axismove', createAxisMovedFromChanged(MOCKS.AXIS_TRACKPAD_X));
    });

    test('emits trackpad moved on Y', function (done) {
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);
      // Do the check.
      component.checkIfControllerPresent();
      // Install event handler listening for trackpadmoved.
      this.el.addEventListener('trackpadmoved', function (evt) {
        assert.ok(evt.detail, 'event.detail not null');
        assert.equal(evt.detail.x, MOCKS.AXIS_VALUES_VALID[MOCKS.AXIS_TRACKPAD_X], 'trackpad axis X value');
        assert.equal(evt.detail.y, MOCKS.AXIS_VALUES_VALID[MOCKS.AXIS_TRACKPAD_Y], 'trackpad axis Y value');
        done();
      });
      // Emit axismove.
      this.el.emit('axismove', createAxisMovedFromChanged(MOCKS.AXIS_TRACKPAD_Y));
    });

    test('does not emit thumbstickmoved if axismove has no changes', function (done) {
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);
      // Do the check.
      component.checkIfControllerPresent();
      // Fail purposely.
      this.el.addEventListener('thumbstickmoved', function (evt) {
        assert.notOk(evt.detail, 'event detail null');
      });
      // Emit axismove with no changes.
      this.el.emit('axismove', createAxisMovedFromChanged());
      setTimeout(() => { done(); });
    });
  });

  suite('mesh', function () {
    var TEST_URL_MODEL = 'test-url.glb';
    var TEST_URL_DEFAULT = 'default.glb';

    test('added when controller updated', function () {
      var loadModelSpy = this.sinon.spy(component, 'loadModel');

      // Mock URL
      component.createControllerModelUrl = function () { return TEST_URL_MODEL; };

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);

      // Perform the test
      component.checkIfControllerPresent();

      assert.strictEqual(loadModelSpy.getCalls().length, 1, 'loadMesh called once');
      assert.strictEqual(TEST_URL_MODEL, loadModelSpy.getCall(0).args[0], 'loadMesh src argument equals expected URL');
    });

    test('uses correct mesh for left hand', function () {
      var loadModelSpy = this.sinon.spy(component, 'loadModel');

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_DEFAULT);

      // Perform the test
      component.checkIfControllerPresent();

      assert.strictEqual(loadModelSpy.getCalls().length, 1, 'loadModel called once');

      var arg0 = loadModelSpy.getCall(0).args[0] || '';
      assert.ok(arg0.indexOf('left.glb' !== -1), 'expected left hand GLB file');
    });

    test('uses correct mesh for right hand', function () {
      var loadModelSpy = this.sinon.spy(component, 'loadModel');

      component.data.hand = MOCKS.HAND_RIGHT;

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_RIGHT);

      // Perform the test
      component.checkIfControllerPresent();

      assert.strictEqual(loadModelSpy.getCalls().length, 1, 'loadModel called once');

      var arg0 = loadModelSpy.getCall(0).args[0] || '';
      assert.ok(arg0.indexOf('right.glb' !== -1), 'expected right hand GLB file');
    });

    test('uses correct mesh for unhanded', function () {
      var loadModelSpy = this.sinon.spy(component, 'loadModel');

      component.data.hand = MOCKS.HAND_RIGHT;

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_UNHANDED);

      // Perform the test
      component.checkIfControllerPresent();

      assert.strictEqual(loadModelSpy.getCalls().length, 1, 'loadModel called once');

      var arg0 = loadModelSpy.getCall(0).args[0] || '';
      assert.ok(arg0.indexOf('universal.glb' !== -1), 'expected universal GLB file');
    });

    test('retries with default model when 404', function () {
      var loadModelSpy = this.sinon.spy(component, 'loadModel');

      // Mock URL to return MODEL first time, DEFAULT thereafter
      var url = TEST_URL_MODEL;
      component.createControllerModelUrl = function () {
        // Update the mocked value so that the next call to this method will return the default URL.
        var returnValue = url;
        url = TEST_URL_DEFAULT;
        return returnValue;
      };

      // Mock isControllerPresent to return true.
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_RIGHT);

      // Perform the test
      component.checkIfControllerPresent();
      el.emit('model-error', {detail: {src: TEST_URL_MODEL}});

      assert.ok(loadModelSpy.called, 'loadModel called');
      assert.strictEqual(loadModelSpy.getCalls().length, 2, 'loadMesh called twice');
      assert.strictEqual(TEST_URL_MODEL, loadModelSpy.getCall(0).args[0], 'loadMesh src argument equals expected ID based URL');
      assert.strictEqual(TEST_URL_DEFAULT, loadModelSpy.getCall(1).args[0], 'loadMesh src argument equals expected default URL');
    });
  });

  suite('buttonchanged', function () {
    test('can emit thumbstickchanged event', function (done) {
      buttonTestHelper(done, 0, 'thumbstick');
    });
    test('can emit triggerchanged event', function (done) {
      buttonTestHelper(done, 1, 'trigger');
    });
    test('can emit gripchanged event', function (done) {
      buttonTestHelper(done, 2, 'grip');
    });
    test('can emit menuchanged event', function (done) {
      buttonTestHelper(done, 3, 'menu');
    });
    test('can emit trackpadchanged event', function (done) {
      buttonTestHelper(done, 4, 'trackpad');
    });

    function buttonTestHelper (done, buttonIndex, buttonName) {
      var state = {value: 0.5, pressed: true, touched: true};
      el.sceneEl.systems['tracked-controls-webvr'].controllers = createMotionControllersList(MOCKS.HAND_RIGHT);
      // Do the check.
      component.checkIfControllerPresent();
      // Install event handler listening for changed event.
      el.addEventListener(buttonName + 'changed', function (evt) {
        assert.ok(evt.detail, 'event.detail not null');
        assert.strictEqual(evt.detail.value, state.value, 'event detail.value');
        assert.strictEqual(evt.detail.pressed, state.pressed, 'event detail.pressed');
        assert.strictEqual(evt.detail.touched, state.touched, 'event detail.touched');
        done();
      });
      // Emit buttonchanged.
      el.emit('buttonchanged', {id: buttonIndex, state: state});
    }
  });

  suite('setModelVisibility', function () {
    test('shows model', function () {
      var component = el.components['windows-motion-controls'];
      var model = new THREE.Object3D();
      model.visible = false;
      el.setObject3D('mesh', model);
      component.setModelVisibility(true);
      assert.ok(model.visible);
    });

    test('hides model', function () {
      var component = el.components['windows-motion-controls'];
      var model = new THREE.Object3D();
      model.visible = true;
      el.setObject3D('mesh', model);
      component.setModelVisibility(false);
      assert.notOk(model.visible);
    });
  });

  // Helper to create an event argument object for the axismove event
  function createAxisMovedFromChanged () {
    var changed = [];
    var i;

    for (i = 0; i < MOCKS.AXIS_VALUES_VALID.length; i++) {
      changed.push(false);
    }
    for (i = 0; i < arguments.length; i++) {
      changed[arguments[i]] = true;
    }
    return {
      // Axis values
      axis: MOCKS.AXIS_VALUES_VALID,
      // Which values changed since the last 'tick'
      changed: changed
    };
  }

  function createMotionControllersList () {
    var controllersList = [];

    for (var i = 0; i < arguments.length; i++) {
      controllersList.push(
        {id: 'Spatial Controller (Spatial Interaction Source) 045E-065A', index: i, hand: arguments[i], pose: {}}
      );
    }

    return controllersList;
  }
});
