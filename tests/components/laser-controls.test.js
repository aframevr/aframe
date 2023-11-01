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
      assert.ok(el.components['oculus-go-controls']);
      assert.ok(el.components['oculus-touch-controls']);
      assert.ok(el.components['vive-controls']);
      assert.ok(el.components['vive-focus-controls']);
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
      el.emit('controllerconnected', {name: 'oculus-go-controls'});
      setTimeout(() => {
        var raycaster = el.getAttribute('raycaster');
        assert.equal(raycaster.origin.x, 0);
        assert.equal(raycaster.origin.y, 0.0005);
        done();
      });
    });

    test('creates line', function (done) {
      el.emit('controllerconnected', {name: 'oculus-go-controls'});
      setTimeout(() => {
        assert.ok(el.getAttribute('line').color);
        done();
      });
    });

    test('respects set line color and opacity', function (done) {
      el.setAttribute('raycaster', 'lineColor', 'red');
      el.setAttribute('raycaster', 'lineOpacity', '0.5');
      el.emit('controllerconnected', {name: 'oculus-go-controls'});
      setTimeout(() => {
        assert.equal(el.getAttribute('raycaster').lineColor, 'red');
        assert.equal(el.getAttribute('raycaster').lineOpacity, '0.5');
        done();
      });
    });
  });
});
