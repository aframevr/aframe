/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('laser-controls', function () {
  var el;

  setup(function (done) {
    el = entityFactory();
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'laser-controls') { return; }
      done();
    });
    el.setAttribute('laser-controls', '');
  });

  suite('init', function () {
    test('injects controllers', function () {
      assert.ok(el.components['daydream-controls']);
      assert.ok(el.components['gearvr-controls']);
      assert.ok(el.components['oculus-touch-controls']);
      assert.ok(el.components['vive-controls']);
      assert.ok(el.components['windows-motion-controls']);
    });

    test('does not inject cursor yet', function () {
      assert.notOk(el.components.cursor);
    });

    test('injects cursor when controller connected', function (done) {
      el.emit('controllerconnected', {name: 'vive-controls'});
      setTimeout(() => {
        var cursor = el.getAttribute('cursor');
        var raycaster = el.getAttribute('raycaster');
        assert.notOk(cursor.fuse);
        assert.ok(raycaster.showLine);
        assert.ok(cursor.downEvents.length);
        assert.ok(cursor.upEvents.length);
        done();
      });
    });

    test('configures raycaster for oculus-touch-controls', function (done) {
      el.emit('controllerconnected', {name: 'oculus-touch-controls'});
      setTimeout(() => {
        var raycaster = el.getAttribute('raycaster');
        assert.notEqual(raycaster.origin.z, 0);
        assert.notEqual(raycaster.direction.y, 0);
        done();
      });
    });

    test('creates line', function (done) {
      el.emit('controllerconnected', {name: 'daydream-controls'});
      setTimeout(() => {
        assert.ok(el.getAttribute('line').color);
        done();
      });
    });

    test('respects set line color', function (done) {
      el.setAttribute('line', 'color', 'red');
      el.emit('controllerconnected', {name: 'daydream-controls'});
      setTimeout(() => {
        assert.equal(el.getAttribute('line').color, 'red');
        done();
      });
    });
  });
});
