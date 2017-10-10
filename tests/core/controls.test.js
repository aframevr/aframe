/* global Event, assert, process, setup, suite, test */
var helpers = require('../helpers');
var THREE = require('lib/three');

var PI = Math.PI;

suite('position controls on camera with WASD controls (integration unit test)', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var self = this;

    el.addEventListener('loaded', function () {
      el.sceneEl.addEventListener('camera-set-active', function () {
        self.el = el.sceneEl.querySelector('[camera]');  // Default camera.
        process.nextTick(function () { done(); });
      });
    });
  });

  test('w moves forward', function (done) {
    var el = this.el;
    var keydownEvent;
    var position;

    position = el.getAttribute('position');
    keydownEvent = new Event('keydown');
    keydownEvent.code = 'KeyW';
    window.dispatchEvent(keydownEvent);

    process.nextTick(function () {
      el.sceneEl.tick(20, 20);
      process.nextTick(function () {
        var newPos = el.getAttribute('position');
        assert.equal(newPos.x, position.x);
        assert.equal(newPos.y, position.y);
        assert.ok(newPos.z < position.z, 'Translated forward');
        done();
      });
    });
  });

  test('a strafes left', function (done) {
    var el = this.el;
    var keydownEvent;
    var position;

    position = el.getAttribute('position');
    keydownEvent = new Event('keydown');
    keydownEvent.code = 'KeyA';
    window.dispatchEvent(keydownEvent);

    process.nextTick(function () {
      el.sceneEl.tick(20, 20);
      process.nextTick(function () {
        var newPos = el.getAttribute('position');
        assert.ok(newPos.x < position.x, 'Strafed left');
        assert.equal(newPos.y, position.y);
        assert.equal(newPos.z, position.z);
        done();
      });
    });
  });

  test('s moves backwards', function (done) {
    var el = this.el;
    var keydownEvent;
    var position;

    position = el.getAttribute('position');
    keydownEvent = new Event('keydown');
    keydownEvent.code = 'KeyS';
    window.dispatchEvent(keydownEvent);

    process.nextTick(function () {
      el.sceneEl.tick(20, 20);
      process.nextTick(function () {
        var newPos = el.getAttribute('position');
        assert.equal(newPos.x, position.x);
        assert.equal(newPos.y, position.y);
        assert.ok(newPos.z > position.z, 'Translated backwards');
        done();
      });
    });
  });

  test('d strafes right', function (done) {
    var el = this.el;
    var keydownEvent;
    var position;

    position = el.getAttribute('position');
    keydownEvent = new Event('keydown');
    keydownEvent.code = 'KeyD';
    window.dispatchEvent(keydownEvent);

    process.nextTick(function () {
      el.sceneEl.tick(20, 20);
      process.nextTick(function () {
        var newPos = el.getAttribute('position');
        assert.ok(newPos.x > position.x, 'Strafed right');
        assert.equal(newPos.y, position.y);
        assert.equal(newPos.z, position.z);
        done();
      });
    });
  });

  test('moves relative to heading', function (done) {
    var el = this.el;
    var keydownEvent;
    var position;

    el.setAttribute('rotation', '0 90 0');
    position = el.getAttribute('position');
    keydownEvent = new Event('keydown');
    keydownEvent.code = 'KeyW';
    window.dispatchEvent(keydownEvent);

    process.nextTick(function () {
      el.sceneEl.tick(20, 20);
      process.nextTick(function () {
        var newPos = el.getAttribute('position');
        assert.ok(newPos.x < position.x, 'Turned left and moved forward');
        assert.equal(newPos.y, position.y);
        assert.equal(Math.round(newPos.z), position.z);
        done();
      });
    });
  });
});

suite('rotation controls on camera with VRControls (integration unit test)', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var self = this;

    function StubVRControls (dolly) {
      var sceneEl = el.sceneEl;
      self.dolly = dolly;
      self.el = sceneEl.querySelector('[camera]');
      self.el.addEventListener('componentinitialized', function (evt) {
        if (evt.detail.name !== 'look-controls') { return; }
        done();
      });
    }

    el.addEventListener('loaded', function () {
      StubVRControls.prototype.update = function () { /* no-op */ };
      self.sinon.stub(THREE, 'VRControls', StubVRControls);
    });
  });

  test('rotates camera around Y', function (done) {
    var el = this.el;
    el.sceneEl.addState('vr-mode');
    this.dolly.quaternion.setFromEuler(new THREE.Euler(0, PI, 0));
    el.sceneEl.tick();
    process.nextTick(function () {
      var rotation = el.getAttribute('rotation');
      assert.equal(Math.round(rotation.x), 0);
      assert.equal(Math.round(rotation.y), 180);
      assert.equal(Math.round(rotation.z), 0);
      done();
    });
  });

  test('rotates camera composing X and Y', function (done) {
    var el = this.el;
    el.sceneEl.addState('vr-mode');
    this.dolly.quaternion.setFromEuler(new THREE.Euler(PI / 4, PI, 0));
    el.sceneEl.tick();
    process.nextTick(function () {
      var rotation = el.getAttribute('rotation');
      assert.equal(Math.round(rotation.x), -45);
      assert.equal(Math.round(rotation.y), 180);
      assert.equal(Math.round(rotation.z), 0);
      done();
    });
  });

  test('rotates camera composing X and Y and Z', function (done) {
    var el = this.el;
    el.sceneEl.addState('vr-mode');
    this.dolly.quaternion.setFromEuler(new THREE.Euler(PI / 2, PI / 6, PI / 2));
    el.sceneEl.tick();
    process.nextTick(function () {
      var rotation = el.getAttribute('rotation');
      assert.equal(Math.round(rotation.x), 60);
      assert.equal(Math.round(rotation.y), 90);
      assert.equal(Math.round(rotation.z), 180);
      done();
    });
  });

  test('replaces previous rotation', function (done) {
    var el = this.el;
    el.sceneEl.addState('vr-mode');
    el.setAttribute('rotation', {x: -10000, y: -10000, z: -10000});
    this.dolly.quaternion.setFromEuler(new THREE.Euler(PI / 2, PI / 6, PI / 2));
    el.sceneEl.tick();
    process.nextTick(function () {
      var rotation = el.getAttribute('rotation');
      assert.equal(Math.round(rotation.x), 60);
      assert.equal(Math.round(rotation.y), 90);
      assert.equal(Math.round(rotation.z), 180);
      done();
    });
  });

  test('does not rotate camera if not in VR', function (done) {
    var el = this.el;
    this.dolly.quaternion.setFromEuler(new THREE.Euler(0, PI, 0));
    el.sceneEl.tick();
    process.nextTick(function () {
      var rotation = el.getAttribute('rotation');
      assert.equal(rotation.x, 0);
      assert.equal(rotation.y, 0);
      assert.equal(rotation.z, 0);
      done();
    });
  });
});

suite('rotation controls on camera with mouse drag (integration unit test)', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var self = this;

    function StubVRControls (dolly) {
      self.dolly = dolly;
      self.el = el.sceneEl.querySelector('[camera]');  // Default camera.
      process.nextTick(function () {
        done();  // Done once we get a grip on VRControls created through the default camera.
      });
    }
    StubVRControls.prototype.update = function () { /* no-op */ };
    this.sinon.stub(THREE, 'VRControls', StubVRControls);
  });

  test('rotates camera on dragging mouse around X', function (done) {
    var el = this.el;
    var mousedownEvent = new Event('mousedown');
    mousedownEvent.button = 0;
    el.sceneEl.canvas.dispatchEvent(mousedownEvent);

    process.nextTick(function afterMousedown () {
      var mouseMoveEvent = new Event('mousemove');
      mouseMoveEvent.movementX = 1000;
      mouseMoveEvent.movementY = 1;
      mouseMoveEvent.screenX = 1000;
      mouseMoveEvent.screenY = 1000;
      window.dispatchEvent(mouseMoveEvent);
      process.nextTick(function afterMousemove () {
        el.sceneEl.tick();
        process.nextTick(function doAssert () {
          var rotation = el.getAttribute('rotation');
          assert.ok(Math.abs(Math.round(rotation.y)) > 0);
          done();
        });
      });
    });
  });

  test('rotates camera on dragging mouse along Y', function (done) {
    var el = this.el;
    var mousedownEvent = new Event('mousedown');
    mousedownEvent.button = 0;
    el.sceneEl.canvas.dispatchEvent(mousedownEvent);

    process.nextTick(function afterMousedown () {
      var mouseMoveEvent = new Event('mousemove');
      mouseMoveEvent.movementX = 1;
      mouseMoveEvent.movementY = 1000;
      mouseMoveEvent.screenX = 1000;
      mouseMoveEvent.screenY = 1000;
      window.dispatchEvent(mouseMoveEvent);
      process.nextTick(function afterMousemove () {
        el.sceneEl.tick();
        process.nextTick(function doAssert () {
          var rotation = el.getAttribute('rotation');
          assert.equal(Math.round(rotation.x), -90);
          done();
        });
      });
    });
  });

  test('rotates camera dragging mouse on already rotated camera', function (done) {
    var el = this.el;
    var mousedownEvent = new Event('mousedown');
    mousedownEvent.button = 0;
    el.sceneEl.canvas.dispatchEvent(mousedownEvent);

    el.setAttribute('rotation', {x: 0, y: -360, z: 0});

    process.nextTick(function afterMousedown () {
      var mouseMoveEvent = new Event('mousemove');
      mouseMoveEvent.movementX = 1000;
      mouseMoveEvent.movementY = 1;
      mouseMoveEvent.screenX = 1000;
      mouseMoveEvent.screenY = 1000;
      window.dispatchEvent(mouseMoveEvent);
      process.nextTick(function afterMousemove () {
        el.sceneEl.tick();
        process.nextTick(function doAssert () {
          var rotation = el.getAttribute('rotation');
          assert.ok(rotation.y < -360, 'Drag applies delta to current rotation.');
          done();
        });
      });
    });
  });

  test('does not rotate camera when dragging in VR with headset', function (done) {
    var el = this.el;
    this.dolly.quaternion.setFromEuler(new THREE.Euler(0, PI, 0));
    el.sceneEl.addState('vr-mode');
    el.sceneEl.canvas.dispatchEvent(new Event('mousedown'));

    process.nextTick(function afterMousedown () {
      var mouseMoveEvent = new Event('mousemove');
      mouseMoveEvent.movementX = 1000;
      mouseMoveEvent.movementY = 1000;
      mouseMoveEvent.screenX = 1000;
      mouseMoveEvent.screenY = 1000;
      window.dispatchEvent(mouseMoveEvent);
      process.nextTick(function afterMousemove () {
        el.sceneEl.tick();
        process.nextTick(function doAssert () {
          var rotation = el.getAttribute('rotation');
          assert.equal(Math.round(rotation.x), 0);
          assert.equal(Math.round(rotation.y), 180, 'Use VR controls rotation');
          assert.equal(Math.round(rotation.z), 0);
          done();
        });
      });
    });
  });
});

suite('rotation controls on camera with touch drag (integration unit test)', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var self = this;

    function StubVRControls (dolly) {
      self.dolly = dolly;
      self.el = el.sceneEl.querySelector('[camera]');  // Default camera.
      process.nextTick(function () {
        done();  // Done once we get a grip on VRControls created through the default camera.
      });
    }
    StubVRControls.prototype.update = function () { /* no-op */ };
    this.sinon.stub(THREE, 'VRControls', StubVRControls);
  });

  test('rotates camera on touch dragging around X', function (done) {
    var canvas;
    var el = this.el;
    var sceneEl = el.sceneEl;
    var touchStartEvent;

    canvas = sceneEl.canvas;
    sceneEl.isMobile = true;
    canvas.clientWidth = 1000;

    // Dispatch touchstart event.
    touchStartEvent = new Event('touchstart');
    touchStartEvent.touches = [{pageX: 0, pageY: 0}];
    canvas.dispatchEvent(touchStartEvent);

    process.nextTick(function afterTouchstart () {
      var touchMoveEvent = new Event('touchmove');
      touchMoveEvent.touches = [{pageX: 500, pageY: 0}];
      window.dispatchEvent(touchMoveEvent);
      process.nextTick(function afterTouchmove () {
        sceneEl.tick();
        process.nextTick(function doAssert () {
          var rotation = el.getAttribute('rotation');
          assert.ok(Math.abs(Math.round(rotation.y)) > 0);
          done();
        });
      });
    });
  });

  test('does not rotate camera on touch dragging along Y', function (done) {
    var canvas;
    var el = this.el;
    var sceneEl = el.sceneEl;
    var touchStartEvent;

    canvas = sceneEl.canvas;
    sceneEl.isMobile = true;
    canvas.clientWidth = 1000;

    // Dispatch touchstart event.
    touchStartEvent = new Event('touchstart');
    touchStartEvent.touches = [{pageX: 0, pageY: 0}];
    canvas.dispatchEvent(touchStartEvent);

    process.nextTick(function afterTouchstart () {
      var touchMoveEvent = new Event('touchmove');
      touchMoveEvent.touches = [{pageX: 0, pageY: 500}];
      window.dispatchEvent(touchMoveEvent);
      process.nextTick(function afterTouchmove () {
        sceneEl.tick();
        process.nextTick(function doAssert () {
          var rotation = el.getAttribute('rotation');
          assert.equal(Math.round(rotation.x), 0);
          assert.equal(Math.round(rotation.y), 0);
          done();
        });
      });
    });
  });
});

suite('position controls on camera with VRControls (integration unit test)', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var self = this;

    function StubVRControls (dolly) {
      self.dolly = dolly;
      self.el = el.sceneEl.querySelector('[camera]');  // Default camera.
      process.nextTick(function () {
        done();  // Done once we get a grip on VRControls created through the default camera.
      });
    }
    StubVRControls.prototype.update = function () { /* no-op */ };
    this.sinon.stub(THREE, 'VRControls', StubVRControls);
  });

  test('copies matrix to camera in VR mode', function (done) {
    var el = this.el;
    var sceneEl = el.sceneEl;
    var dolly = this.dolly;

    sceneEl.addState('vr-mode');
    el.components.camera.hasPositionalTracking = true;
    el.components.camera.removeHeightOffset();

    process.nextTick(function () {
      var position;
      dolly.position.set(-1, 2, 3);
      sceneEl.tick();

      position = el.getAttribute('position');
      assert.equal(position.x, -1);
      assert.equal(position.y, 2);
      assert.equal(position.z, 3);
      done();
    });
  });
});
