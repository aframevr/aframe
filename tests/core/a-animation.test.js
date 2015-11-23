/* global assert, setup, suite, sinon, test */
var helpers = require('../helpers.js');
var AAnimation = require('core/a-animation');

/**
 * Helpers to start initialize an animation.
 * Attaches <a-scene><a-object elAttrs><a-animation animatonAttrs/></a-object></a-scene>
 *
 * @param {function} cb - Callback function after animation has loaded and started.
 * @param {object} animationAttrs - Attributes to set on created animation object.
 * @param {object} elAttrs - Attributes to set on the entity.
 * @returns {Element} entityEl and {Element} animationEl in callback.
 */
function setupAnimation (animationAttrs, cb, elAttrs) {
  var animationEl = document.createElement('a-animation');
  var el = helpers.entityFactory();
  var done;

  // TODO: have <a-animation> setAttribute support this.
  Object.keys(animationAttrs).forEach(function (key) {
    animationEl.setAttribute(key, animationAttrs[key]);
  });
  Object.keys(elAttrs || {}).forEach(function (key) {
    el.setAttribute(key, elAttrs[key]);
  });

  animationEl.addEventListener('animationstart', function () {
    if (!done) {
      cb(el, animationEl);
      done = true;
    }
  });
  animationEl.addEventListener('loaded', function () {
    animationEl.start();
  });
  el.appendChild(animationEl);
}

/**
 * Uses tween.update(t) to simulate animations.
 * Make sure to register `animationend` listeners *before* doing tween.update.
 * Flaky tests? Play with the durations and `tween.update(t)`s. Try to increase the values.
 */
suite('a-animation', function () {
  'use strict';

  suite('attachedCallback', function () {
    test('applies mixin', function (done) {
      helpers.mixinFactory('walt', { repeat: 'indefinite' });
      setupAnimation({
        mixin: 'walt'
      }, function (el, animationEl) {
        assert.equal(animationEl.data.repeat, 'indefinite');
        done();
      });
    });
  });

  suite('update', function () {
    test('it is called on initialization', function (done) {
      this.sinon.stub(AAnimation.prototype, 'update');
      setupAnimation({}, function (el, animationEl) {
        sinon.assert.called(AAnimation.prototype.update);
        done();
      });
    });
  });

  suite('tween', function () {
    test('sets values in between `from` and `to` during animation', function (done) {
      var position;
      setupAnimation({
        attribute: 'position',
        dur: 10000,
        to: '10 10 10'
      }, function (el, animationEl) {
        animationEl.tween.update(5000);
        // Partially done with animation.
        position = el.getAttribute('position');
        ['x', 'y', 'z'].forEach(function (axis) {
          assert.isAbove(position[axis], 0);
          assert.isBelow(position[axis], 10);
        });
        done();
      });
    });
  });

  suite('direction', function () {
    test('if set to reverse, starts from `to` and goes to `from`', function (done) {
      setupAnimation({
        attribute: 'rotation',
        direction: 'reverse',
        dur: 1000,
        fill: 'backwards',
        from: '0 0 0',
        to: '10 10 10'
      }, function (el, animationEl) {
        animationEl.tween = animationEl.tween;
        assert.shallowDeepEqual(el.getAttribute('rotation'), { x: 10, y: 10, z: 10 });
        animationEl.addEventListener('animationend', function () {
          assert.shallowDeepEqual(el.getAttribute('rotation'), { x: 0, y: 0, z: 0 });
          done();
        });
        animationEl.tween.update(5000);
      });
    });
  });

  suite('fill mode: backwards', function () {
    setup(function (done) {
      var self = this;
      setupAnimation({
        attribute: 'scale',
        dur: 100,
        fill: 'backwards',
        from: '5 10 5',
        to: '10 10 10'
      }, function (el, animationEl) {
        self.el = el;
        self.animationEl = animationEl;
        done();
      }, { scale: '1 1 1' });
    });

    test('starts at `from`', function () {
      assert.shallowDeepEqual(this.el.getAttribute('scale'), { x: 5, y: 10, z: 5 });
    });

    test('goes back to initial value after animation', function (done) {
      var el = this.el;
      var animationEl = this.animationEl;
      animationEl.addEventListener('animationend', function () {
        assert.shallowDeepEqual(el.getAttribute('scale'), { x: 1, y: 1, z: 1 });
        done();
      });
      animationEl.tween.update(9999);
    });
  });

  suite('fill mode: both', function () {
    setup(function (done) {
      var self = this;
      setupAnimation({
        attribute: 'scale',
        dur: 1000,
        fill: 'both',
        from: '5 10 5',
        to: '10 10 10'
      }, function (el, animationEl) {
        self.animationEl = animationEl;
        self.el = el;
        done();
      }, { scale: '1 1 1' });
    });

    test('starts at `from`', function () {
      assert.shallowDeepEqual(this.el.getAttribute('scale'), { x: 5, y: 10, z: 5 });
    });

    test('stays at `to`', function (done) {
      var el = this.el;
      var animationEl = this.animationEl;
      animationEl.addEventListener('animationend', function () {
        assert.shallowDeepEqual(el.getAttribute('scale'), { x: 10, y: 10, z: 10 });
        done();
      });
      animationEl.tween.update(5000);
    });
  });

  suite('fill mode: forwards', function () {
    setup(function (done) {
      var self = this;
      setupAnimation({
        attribute: 'rotation',
        dur: 1000,
        fill: 'forwards',
        from: '45 0 45',
        to: '360 0 360'
      }, function (el, animationEl) {
        self.el = el;
        self.animationEl = animationEl;
        done();
      }, { rotation: '10 10 10' });
    });

    test('starts at initial value', function () {
      assert.shallowDeepEqual(this.el.getAttribute('rotation'), { x: 10, y: 10, z: 10 });
    });

    test('stays at `to`', function () {
      var animationEl = this.animationEl;
      var el = this.el;
      animationEl.tween.update(10000);
      assert.shallowDeepEqual(el.getAttribute('rotation'), { x: 360, y: 0, z: 360 });
    });
  });

  suite('start', function () {
    test('creates a Tween', function (done) {
      setupAnimation({}, function (el, animationEl) {
        assert.ok(animationEl.tween);
        done();
      });
    });

    test('sets isRunning', function (done) {
      setupAnimation({}, function (el, animationEl) {
        assert.ok(animationEl.isRunning);
        done();
      });
    });

    test('sets isRunning when begin event is triggered', function (done) {
      var animationEl = document.createElement('a-animation');
      animationEl.setAttribute('begin', 'click');
      var el = helpers.entityFactory();
      el.appendChild(animationEl);
      animationEl.addEventListener('loaded', function () {
        el.emit('click');
        assert.ok(animationEl.isRunning);
        done();
      });
    });
  });

  suite('stop', function () {
    test('unsets isRunning', function (done) {
      setupAnimation({}, function (el, animationEl) {
        assert.ok(animationEl.isRunning);
        animationEl.stop();
        assert.notOk(animationEl.isRunning);
        done();
      });
    });
  });
});
