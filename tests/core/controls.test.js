/* global Event, assert, process, setup, suite, test */
var helpers = require('../helpers');

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
