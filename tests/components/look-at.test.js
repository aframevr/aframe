/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

/**
 * Creates a sibling element to `el`.
 */
function squirrelFactory (el) {
  var anotherEl = document.createElement('a-entity');
  anotherEl.setAttribute('id', 'squirrel');
  anotherEl.setAttribute('position', '1 2 3');
  el.parentNode.appendChild(anotherEl);
  return anotherEl;
}

suite('look-at', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    this.spy = this.sinon.spy(el.object3D, 'lookAt');

    el.setAttribute('look-at', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('does nothing if look-at is empty', function () {
      assert.ok(this.spy.notCalled);
    });

    test('can look at a position', function (done) {
      var el = this.el;
      var spy = this.spy;
      el.setAttribute('look-at', '10 20 30');
      setTimeout(function () {
        assert.ok(spy.calledWith({x: 10, y: 20, z: 30}));
        el.setAttribute('look-at', '30 15 0');
        setTimeout(function () {
          assert.ok(spy.calledWith({x: 30, y: 15, z: 0}));
          done();
        });
      });
    });

    test('can look at an object', function (done) {
      var el = this.el;
      var spy = this.spy;
      var anotherEl = squirrelFactory(el);
      anotherEl.addEventListener('loaded', function () {
        el.setAttribute('look-at', '#squirrel');
        el.parentNode.object3D.updateMatrixWorld();
        setTimeout(function () {
          el.components['look-at'].update();
          assert.ok(spy.calledWith({x: 1, y: 2, z: 3}));
          done();
        });
      });
    });

    test('can look at a nested entity', function (done) {
      var el = this.el;
      var spy = this.spy;
      var anotherEl = squirrelFactory(el);
      var nestedEl = document.createElement('a-entity');
      nestedEl.setAttribute('position', '1 2 3');
      nestedEl.setAttribute('id', 'squirrel-nest');
      anotherEl.appendChild(nestedEl);
      nestedEl.addEventListener('loaded', function () {
        el.setAttribute('look-at', '#squirrel-nest');
        el.parentNode.object3D.updateMatrixWorld();
        setTimeout(function () {
          el.components['look-at'].update();
          assert.ok(spy.calledWith({x: 2, y: 4, z: 6}));
          done();
        });
      });
    });

    test('can track an entity', function (done) {
      var el = this.el;
      var spy = this.spy;
      var anotherEl = squirrelFactory(el);
      anotherEl.addEventListener('loaded', function () {
        el.setAttribute('look-at', '#squirrel');
        el.parentNode.object3D.updateMatrixWorld();
        setTimeout(function () {
          assert.notOk(spy.calledWith({x: 10, y: 10, z: 10}));
          anotherEl.setAttribute('position', '10, 10, 10');
          setTimeout(function () {
            el.parentNode.object3D.updateMatrixWorld();
            el.components['look-at'].update();
            assert.ok(spy.calledWith({x: 10, y: 10, z: 10}));
            done();
          });
        });
      });
    });

    test('adds scene behavior if tracking an object', function (done) {
      var el = this.el;
      var anotherEl = squirrelFactory(el);
      var behaviorCount;
      anotherEl.addEventListener('loaded', function () {
        behaviorCount = el.sceneEl.behaviors.length;
        el.setAttribute('look-at', '#squirrel');
        setTimeout(function () {
          assert.equal(el.sceneEl.behaviors.length, behaviorCount + 1);
          done();
        });
      });
    });

    test('stores tracked object', function (done) {
      var el = this.el;
      var anotherEl = squirrelFactory(el);
      anotherEl.addEventListener('loaded', function () {
        el.setAttribute('look-at', '#squirrel');
        setTimeout(function () {
          assert.equal(el.components['look-at'].target3D, anotherEl.object3D);
          done();
        });
      });
    });
  });

  suite('remove', function () {
    test('removes behavior', function (done) {
      var el = this.el;
      var anotherEl = squirrelFactory(el);
      var behaviorCount;
      anotherEl.addEventListener('loaded', function () {
        el.setAttribute('look-at', '#squirrel');
        setTimeout(function () {
          behaviorCount = el.sceneEl.behaviors.length;
          el.removeAttribute('look-at');
          setTimeout(function () {
            assert.equal(el.sceneEl.behaviors.length, behaviorCount - 1);
            done();
          });
        });
      });
    });
  });

  suite('parse', function () {
    test('parses position vector', function (done) {
      var el = this.el;
      el.setAttribute('look-at', '1 2 3');
      setTimeout(function () {
        assert.shallowDeepEqual(el.components['look-at'].data.position, { x: 1, y: 2, z: 3 });
        assert.notOk(el.components['look-at'].data.targetSelector);
        done();
      });
    });

    test('parses position vector with whitespaces', function (done) {
      var el = this.el;
      el.setAttribute('look-at', ' 4   5 2   ');
      setTimeout(function () {
        assert.shallowDeepEqual(el.components['look-at'].data.position, { x: 4, y: 5, z: 2 });
        done();
      });
    });

    test('parses target selector', function (done) {
      var el = this.el;
      el.setAttribute('look-at', '#the-sky');
      setTimeout(function () {
        assert.notOk(el.components['look-at'].data.position);
        assert.equal(el.components['look-at'].data.targetSelector, '#the-sky');
        done();
      });
    });

    test('parses target selector with whitespaces', function (done) {
      var el = this.el;
      el.setAttribute('look-at', '#the-sky .its-a-bird [its-a-plane]');
      setTimeout(function () {
        assert.equal(el.components['look-at'].data.targetSelector,
                     '#the-sky .its-a-bird [its-a-plane]');
        done();
      });
    });
  });
});
