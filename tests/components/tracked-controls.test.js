/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('tracked-controls', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('position', '');
    el.setAttribute('tracked-controls', '');
    el.addEventListener('loaded', function () {
      var trackedControls = el.components['tracked-controls'];
      trackedControls.system.controllers = [
        { id: 'OpenVR Gamepad', pose: { position: [0, 0, 0] }, buttons: [], axes: [] }
      ];
      done();
    });
  });

  suite('id', function () {
    test('do not match controller by default', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];
      assert.notOk(trackedControls.controller);
    });

    test('do not match controller with different id', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];
      assert.notEqual(trackedControls.data.id, trackedControls.system.controllers[0].id);
      assert.notOk(trackedControls.controller);
    });

    test('match controller with same id', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];
      assert.notOk(trackedControls.controller);
      el.setAttribute('tracked-controls', 'id', trackedControls.system.controllers[0].id);
      assert.equal(trackedControls.controller, trackedControls.system.controllers[0]);
    });
  });

  suite('tick', function () {
    setup(function (done) {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];
      el.setAttribute('tracked-controls', 'id', trackedControls.system.controllers[0].id);
      assert.equal(trackedControls.controller, trackedControls.system.controllers[0]);
      done();
    });

    test('pose and buttons update if mesh is not defined', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];
      var updateButtonsSpy = this.sinon.spy(trackedControls, 'updateButtons');
      var updatePoseSpy = this.sinon.spy(trackedControls, 'updatePose');
      assert.equal(el.getObject3D('mesh'), undefined);
      trackedControls.tick();
      assert.ok(updatePoseSpy.called);
      assert.ok(updateButtonsSpy.called);
    });
  });

  suite('position', function () {
    setup(function (done) {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];
      el.setAttribute('tracked-controls', 'id', trackedControls.system.controllers[0].id);
      assert.equal(trackedControls.controller, trackedControls.system.controllers[0]);
      done();
    });

    test('defaults position and pose to [0 0 0]', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];

      trackedControls.system.controllers[0].pose.position = [0, 0, 0];
      el.setAttribute('position', '0 0 0');
      trackedControls.tick();

      var previousControllerPos = trackedControls.previousControllerPosition;
      assert.equal(previousControllerPos.x, 0);
      assert.equal(previousControllerPos.y, 0);
      assert.equal(previousControllerPos.z, 0);
      assert.deepEqual(el.getAttribute('position'), {x: 0, y: 0, z: 0});
    });

    test('position: [0 0 0] and pose: [1 2 3]', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];
      var previousControllerPos = trackedControls.previousControllerPosition;

      trackedControls.system.controllers[0].pose.position = [1, 2, 3];
      trackedControls.tick();

      assert.equal(previousControllerPos.x, 1);
      assert.equal(previousControllerPos.y, 2);
      assert.equal(previousControllerPos.z, 3);
      assert.deepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
    });

    test('position: [-1 2 -3] and pose: [0 0 0]', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];

      trackedControls.system.controllers[0].pose.position = [0, 0, 0];
      el.setAttribute('position', '-1 2 -3');
      trackedControls.tick();
      assert.deepEqual(el.getAttribute('position'), {x: -1, y: 2, z: -3});
    });

    test('position: [-1 2 -3] and pose: [4 5 -6]', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];

      trackedControls.system.controllers[0].pose.position = [4, 5, -6];
      el.setAttribute('position', '-1 2 -3');
      trackedControls.tick();
      assert.deepEqual(el.getAttribute('position'), {x: 3, y: 7, z: -9});
    });

    test('position: [-1 2 -3] and current and previous pose: [4 5 -6]', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];

      trackedControls.system.controllers[0].pose.position = [4, 5, -6];
      trackedControls.tick();
      // Previous pose = [4 5 -6] diff with current pose = 0

      el.setAttribute('position', '-1 2 -3');
      trackedControls.tick();

      assert.deepEqual(el.getAttribute('position'), {x: -1, y: 2, z: -3});
    });

    test('position: [-1 2 -3] and current [7 -8 9] and previous pose: [4 5 -6]', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];

      trackedControls.system.controllers[0].pose.position = [4, 5, -6];
      console.log('tick1');
      trackedControls.tick();

      var previousControllerPos = trackedControls.previousControllerPosition;
      assert.equal(previousControllerPos.x, 4);
      assert.equal(previousControllerPos.y, 5);
      assert.equal(previousControllerPos.z, -6);

      trackedControls.system.controllers[0].pose.position = [7, -8, 9];
      // diff prev & current pos = [3 -13 15]
      el.setAttribute('position', '-1 2 -3');
      trackedControls.tick();

      assert.equal(previousControllerPos.x, 7);
      assert.equal(previousControllerPos.y, -8);
      assert.equal(previousControllerPos.z, 9);
      assert.deepEqual(el.getAttribute('position'), {x: 2, y: -11, z: 12});
    });
  });
});
