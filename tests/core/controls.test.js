/* global Event, assert, process, setup, suite, test */
var helpers = require('../helpers');
var PI = Math.PI;

suite('position controls on camera with WASD controls (integration unit test)', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var self = this;

    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function () {
        self.el = el.sceneEl.querySelector('[camera]');  // Default camera.
        done();
      });
    });
  });

  test('w moves forward', function (done) {
    var el = this.el;
    var keydownEvent;
    var position;

    position = el.getAttribute('position').clone();
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

    position = el.getAttribute('position').clone();
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

    position = el.getAttribute('position').clone();
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

    position = el.getAttribute('position').clone();
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
    position = el.getAttribute('position').clone();
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

suite('rotation controls on camera in VR mode', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    var sceneEl = el.parentNode;
    var self = this;
    this.position = [0, 0, 0];
    this.orientation = [0, 0, 0];
    sceneEl.addEventListener('cameraready', function () {
      sceneEl.renderer.xr.getCamera = function (obj) {
        if (!this.enabled) { return; }
        obj.position.fromArray(self.position);
        obj.rotation.fromArray(self.orientation);
        obj.updateMatrixWorld();
      };
      sceneEl.querySelector('[camera]').addEventListener('loaded', function () {
        sceneEl.addState('vr-mode');
        el.sceneEl.renderer.xr.enabled = true;
        sceneEl.render = function () {
          sceneEl.renderer.xr.getCamera(sceneEl.camera.el.object3D);
        };
        done();
      });
    });
  });

  test('rotates camera around Y', function () {
    var el = this.el;
    var rotation;
    var cameraEl = el.sceneEl.querySelector('[camera]');
    this.orientation = [0, Math.PI, 0];
    el.sceneEl.render();
    rotation = cameraEl.getAttribute('rotation');
    assert.equal(Math.round(rotation.x), 0);
    assert.equal(Math.round(rotation.y), 180);
    assert.equal(Math.round(rotation.z), 0);
  });

  test('rotates camera composing X and Y', function () {
    var el = this.el;
    var cameraEl = el.sceneEl.querySelector('[camera]');
    this.orientation = [PI / 4, PI, 0];
    el.sceneEl.render();
    var rotation = cameraEl.getAttribute('rotation');
    assert.equal(Math.round(rotation.x), 45);
    assert.equal(Math.round(rotation.y), 180);
    assert.equal(Math.round(rotation.z), 0);
  });

  test('rotates camera composing X and Y and Z', function () {
    var el = this.el;
    var cameraEl = el.sceneEl.querySelector('[camera]');
    this.orientation = [PI / 4, PI / 6, PI / 2];
    el.sceneEl.render();
    var rotation = cameraEl.getAttribute('rotation');
    assert.equal(Math.round(rotation.x), 45);
    assert.equal(Math.round(rotation.y), 30);
    assert.equal(Math.round(rotation.z), 90);
  });

  test('replaces previous rotation', function () {
    var el = this.el;
    var cameraEl = el.sceneEl.querySelector('[camera]');
    this.orientation = [PI / 4, PI / 6, PI / 2];
    cameraEl.setAttribute('rotation', {x: -10000, y: -10000, z: -10000});
    el.sceneEl.render();
    var rotation = cameraEl.getAttribute('rotation');
    assert.equal(Math.round(rotation.x), 45);
    assert.equal(Math.round(rotation.y), 30);
    assert.equal(Math.round(rotation.z), 90);
  });

  test('does not rotate camera if not in VR', function () {
    var el = this.el;
    var cameraEl = el.sceneEl.querySelector('[camera]');
    this.orientation = [PI / 4, PI / 6, PI / 2];
    cameraEl.setAttribute('rotation', {x: 0, y: 0, z: 0});
    el.sceneEl.renderer.xr.enabled = false;
    el.sceneEl.render();
    var rotation = cameraEl.getAttribute('rotation');
    assert.equal(Math.round(rotation.x), 0);
    assert.equal(Math.round(rotation.y), 0);
    assert.equal(Math.round(rotation.z), 0);
  });
});

suite('rotation controls on camera with mouse drag (integration unit test)', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    var self = this;
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function () {
        self.cameraEl = el.sceneEl.camera.el;
        done();
      });
    });
  });

  test('rotates camera on dragging mouse around X', function (done) {
    var el = this.el;
    var self = this;
    var mousedownEvent = new Event('mousedown');
    mousedownEvent.screenX = 1000;
    mousedownEvent.screenY = 1000;
    mousedownEvent.button = 0;
    el.sceneEl.canvas.dispatchEvent(mousedownEvent);
    process.nextTick(function afterMousedown () {
      var mouseMoveEvent = new Event('mousemove');
      mouseMoveEvent.screenX = 1500;
      mouseMoveEvent.screenY = 1000.1;
      window.dispatchEvent(mouseMoveEvent);
      process.nextTick(function afterMousemove () {
        var cameraEl = self.cameraEl;
        var rotation;
        cameraEl.components['look-controls'].updateOrientation();
        rotation = cameraEl.getAttribute('rotation');
        assert.equal(Math.floor(Math.abs(rotation.x)), 0);
        assert.notEqual(Math.floor(Math.abs(rotation.y)), 0);
        done();
      });
    });
  });

  test('rotates camera on dragging mouse along Y', function (done) {
    var el = this.el;
    var self = this;
    var mousedownEvent = new Event('mousedown');
    mousedownEvent.screenX = 1000;
    mousedownEvent.screenY = 1000;
    mousedownEvent.button = 0;
    el.sceneEl.canvas.dispatchEvent(mousedownEvent);
    process.nextTick(function afterMousedown () {
      var mouseMoveEvent = new Event('mousemove');
      mouseMoveEvent.screenX = 1000.1;
      mouseMoveEvent.screenY = 1500;
      window.dispatchEvent(mouseMoveEvent);
      process.nextTick(function afterMousemove () {
        var cameraEl = self.cameraEl;
        var rotation;
        cameraEl.components['look-controls'].updateOrientation();
        rotation = cameraEl.getAttribute('rotation');
        assert.equal(Math.floor(Math.abs(rotation.y)), 0);
        assert.notEqual(Math.floor(Math.abs(rotation.x)), 0);
        done();
      });
    });
  });

  test('rotates camera on moving pointerlocked mouse along X', function (done) {
    var el = this.el;
    var self = this;
    var cameraEl = self.cameraEl;
    var mousedownEvent = new Event('mousedown');
    mousedownEvent.screenX = 1000;
    mousedownEvent.screenY = 1000;
    mousedownEvent.button = 0;
    el.sceneEl.canvas.dispatchEvent(mousedownEvent);
    process.nextTick(function afterMousedown () {
      cameraEl.components['look-controls'].pointerLocked = true;
      var mouseMoveEvent = new Event('mousemove');
      mouseMoveEvent.movementX = 1000;
      mouseMoveEvent.movementY = 0.1;
      // screen coordinates should be ignored with pointer lock
      mouseMoveEvent.screenX = 9000;
      mouseMoveEvent.screenY = 9000;
      window.dispatchEvent(mouseMoveEvent);
      process.nextTick(function afterMousemove () {
        var rotation;
        cameraEl.components['look-controls'].updateOrientation();
        rotation = cameraEl.getAttribute('rotation');
        assert.equal(Math.floor(Math.abs(rotation.x)), 0);
        assert.notEqual(Math.floor(Math.abs(rotation.y)), 0);
        done();
      });
    });
  });

  test('rotates camera on moving pointerlocked mouse along Y', function (done) {
    var el = this.el;
    var self = this;
    var cameraEl = self.cameraEl;
    var mousedownEvent = new Event('mousedown');
    mousedownEvent.screenX = 1000;
    mousedownEvent.screenY = 1000;
    mousedownEvent.button = 0;
    el.sceneEl.canvas.dispatchEvent(mousedownEvent);
    process.nextTick(function afterMousedown () {
      cameraEl.components['look-controls'].pointerLocked = true;
      var mouseMoveEvent = new Event('mousemove');
      mouseMoveEvent.movementX = 0.1;
      mouseMoveEvent.movementY = 1000;
      // screen coordinates should be ignored with pointer lock
      mouseMoveEvent.screenX = 9000;
      mouseMoveEvent.screenY = 9000;
      window.dispatchEvent(mouseMoveEvent);
      process.nextTick(function afterMousemove () {
        var rotation;
        cameraEl.components['look-controls'].updateOrientation();
        rotation = cameraEl.getAttribute('rotation');
        assert.equal(Math.floor(Math.abs(rotation.y)), 0);
        assert.notEqual(Math.floor(Math.abs(rotation.x)), 0);
        done();
      });
    });
  });

  test('rotates camera dragging mouse on already rotated camera', function (done) {
    var el = this.el;
    var self = this;
    this.cameraEl.setAttribute('rotation', '45 45 0');
    var mousedownEvent = new Event('mousedown');
    mousedownEvent.screenX = 1000;
    mousedownEvent.screenY = 1000;
    mousedownEvent.button = 0;
    el.sceneEl.canvas.dispatchEvent(mousedownEvent);
    process.nextTick(function afterMousedown () {
      var mouseMoveEvent = new Event('mousemove');
      mouseMoveEvent.screenX = 0;
      mouseMoveEvent.screenY = 0;
      window.dispatchEvent(mouseMoveEvent);
      process.nextTick(function afterMousemove () {
        var cameraEl = self.cameraEl;
        var rotation;
        cameraEl.components['look-controls'].updateOrientation();
        rotation = cameraEl.getAttribute('rotation');
        assert.ok(rotation.x > 45);
        assert.ok(rotation.y > 45);
        done();
      });
    });
  });

  test('does not rotate camera when dragging in VR with headset', function (done) {
    var el = this.el;
    var cameraEl = this.cameraEl;
    cameraEl.setAttribute('rotation', '30 45 60');
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
        var rotation = cameraEl.getAttribute('rotation');
        cameraEl.components['look-controls'].updateOrientation();
        assert.equal(Math.ceil(rotation.x), 30);
        assert.equal(Math.ceil(rotation.y), 45);
        assert.equal(Math.ceil(rotation.z), 60);
        done();
      });
    });
  });
});

suite('rotation controls on camera with touch drag (integration unit test)', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    var self = this;
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', () => {
        self.cameraEl = el.sceneEl.camera.el;
        done();
      });
    });
  });

  test('rotates camera on touch dragging around X', function (done) {
    var canvas;
    var el = this.el;
    var sceneEl = el.sceneEl;
    var cameraEl = this.cameraEl;
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
        var rotation;
        cameraEl.components['look-controls'].updateOrientation();
        rotation = cameraEl.getAttribute('rotation');
        assert.ok(Math.abs(Math.round(rotation.y)) > 0);
        done();
      });
    });
  });

  test('does not rotate camera on touch dragging along Y', function (done) {
    var canvas;
    var el = this.el;
    var sceneEl = el.sceneEl;
    var cameraEl = this.cameraEl;
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
        var rotation;
        cameraEl.components['look-controls'].updateOrientation();
        rotation = cameraEl.getAttribute('rotation');
        assert.equal(Math.round(rotation.x), 0);
        assert.equal(Math.round(rotation.y), 0);
        done();
      });
    });
  });
});

suite('position controls on camera with VRControls (integration unit test)', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    var sceneEl = el.parentNode;
    var self = this;
    this.position = [0, 0, 0];
    this.orientation = [0, 0, 0];
    sceneEl.addEventListener('cameraready', function () {
      var cameraEl = self.cameraEl = sceneEl.querySelector('[camera]');
      sceneEl.renderer.xr.getCamera = function (obj) {
        if (!this.enabled) { return; }
        obj.position.fromArray(self.position);
        obj.rotation.fromArray(self.orientation);
        obj.updateMatrixWorld();
      };
      cameraEl.addEventListener('loaded', function () {
        sceneEl.addState('vr-mode');
        el.sceneEl.renderer.xr.enabled = true;
        sceneEl.render = function () {
          sceneEl.renderer.xr.getCamera(cameraEl.object3D);
        };
        done();
      });
    });
  });

  test('copies matrix to camera in VR mode', function () {
    var el = this.el;
    var sceneEl = el.parentNode;
    var cameraEl = this.cameraEl;

    sceneEl.addState('vr-mode');
    cameraEl.components['look-controls'].hasPositionalTracking = true;
    this.position = [-1, 2, 3];
    el.sceneEl.render();
    var position = cameraEl.getAttribute('position');
    assert.equal(position.x, -1);
    assert.equal(position.y, 2);
    assert.equal(position.z, 3);
  });
});
