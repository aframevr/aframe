/* global assert, setup, suite, sinon, test */
'use strict';
var helpers = require('../helpers.js');
var AAnimation = require('core/a-animation').AAnimation;
var getAnimationValues = require('core/a-animation').getAnimationValues;

/**
 * Helpers to start initialize an animation.
 * Attaches <a-scene><a-entity elAttrs><a-animation animatonAttrs/></a-entity></a-scene>
 *
 * @param {function} cb - Callback function after animation has loaded and started.
 * @param {object} animationAttrs - Attributes to set on created animation entity.
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
      cb(el, animationEl, window.performance.now());
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
 * t is the absolute time. To advance the animation to the point
 * you want to test you need to do: animationStartTime + timeElapsed.
 * Make sure to register `animationend` addEventListenerers *before* doing tween.update.
 */
suite('a-animation', function () {
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

  suite('component attribute animation', function () {
    setup(function (done) {
      var self = this;
      setupAnimation({
        attribute: 'light.intensity',
        dur: 1000,
        fill: 'both',
        from: 0,
        to: 1,
        easing: 'linear'
      }, function (el, animationEl, startTime) {
        self.el = el;
        self.animationEl = animationEl;
        self.startTime = startTime;
        done();
      }, { light: '' });
    });

    test('start value', function () {
      assert.equal(this.el.getComputedAttribute('light').intensity, 0);
    });

    test('between value', function () {
      var intensity;
      this.animationEl.tween.update(this.startTime + 500);
      intensity = this.el.getComputedAttribute('light').intensity;
      assert.isAbove(intensity, 0);
      assert.isBelow(intensity, 1);
    });

    test('finish value', function () {
      this.animationEl.tween.update(this.startTime + 1000);
      assert.equal(this.el.getComputedAttribute('light').intensity, 1);
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
      }, function (el, animationEl, startTime) {
        animationEl.tween = animationEl.tween;
        assert.shallowDeepEqual(el.getAttribute('rotation'), { x: 10, y: 10, z: 10 });
        animationEl.addEventListener('animationend', function () {
          assert.shallowDeepEqual(el.getAttribute('rotation'), { x: 0, y: 0, z: 0 });
          done();
        });
        animationEl.tween.update(startTime + 1000);
      });
    });
  });

  suite('fill mode: backwards', function () {
    setup(function (done) {
      var self = this;
      setupAnimation({
        attribute: 'scale',
        dur: 1000,
        fill: 'backwards',
        from: '5 10 5',
        to: '10 10 10'
      }, function (el, animationEl, startTime) {
        self.el = el;
        self.animationEl = animationEl;
        self.startTime = startTime;
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
      animationEl.tween.update(this.startTime + 1000);
    });
  });

  test('fill mode: backwards when `from` is not defined', function (done) {
    setupAnimation({
      attribute: 'scale',
      dur: 100,
      fill: 'backwards',
      to: '10 10 10'
    }, function (el, animationEl) {
      assert.shallowDeepEqual(el.getAttribute('scale'), { x: 1, y: 1, z: 1 });
      done();
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
      }, function (el, animationEl, startTime) {
        self.animationEl = animationEl;
        self.el = el;
        self.startTime = startTime;
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
      animationEl.tween.update(this.startTime + 1000);
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
      }, function (el, animationEl, startTime) {
        self.el = el;
        self.animationEl = animationEl;
        self.startTime = startTime;
        done();
      }, { rotation: '10 10 10' });
    });

    test('starts at initial value', function () {
      assert.shallowDeepEqual(this.el.getAttribute('rotation'), { x: 10, y: 10, z: 10 });
    });

    test('stays at `to`', function () {
      var animationEl = this.animationEl;
      var el = this.el;
      animationEl.tween.update(this.startTime + 1000);
      assert.shallowDeepEqual(el.getAttribute('rotation'), { x: 360, y: 0, z: 360 });
    });
  });

  suite('generic attribute animation', function () {
    setup(function (done) {
      var self = this;
      setupAnimation({
        attribute: 'opacity',
        dur: 1000,
        fill: 'both',
        from: 0,
        to: 1
      }, function (el, animationEl, startTime) {
        self.el = el;
        self.animationEl = animationEl;
        self.startTime = startTime;
        done();
      }, { opacity: '' });
    });

    test('start value', function () {
      assert.equal(parseFloat(this.el.getAttribute('opacity')), 0);
    });

    test('between value', function () {
      var opacity;
      this.animationEl.tween.update(this.startTime + 500);
      opacity = parseFloat(this.el.getAttribute('opacity'));
      assert.isAbove(opacity, 0);
      assert.isBelow(opacity, 1);
    });

    test('finish value', function () {
      this.animationEl.tween.update(this.startTime + 1000);
      assert.equal(this.el.getAttribute('opacity'), 1);
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

  suite('getAnimationValues', function () {
    setup(function (done) {
      var el = this.el = helpers.entityFactory();
      el.addEventListener('loaded', function () {
        done();
      });
    });

    test('gets correct values for multiple-attribute component', function () {
      var values = getAnimationValues(this.el, 'light.intensity', 0, 1);
      assert.shallowDeepEqual(values.from, { 'light.intensity': 0 });
      assert.shallowDeepEqual(values.to, { 'light.intensity': 1 });
    });

    test('gets correct values multiple-attribute component with no `from`', function () {
      var el = this.el;
      var values;
      el.setAttribute('light', 'intensity: 0.5');
      values = getAnimationValues(el, 'light.intensity', undefined, '1');
      assert.shallowDeepEqual(values.from, { 'light.intensity': 0.5 });
      assert.shallowDeepEqual(values.to, { 'light.intensity': 1 });
    });

    test('gets correct values coordinate component', function () {
      var values = getAnimationValues(this.el, 'position', '1 2 3', '4 5 6');
      assert.shallowDeepEqual(values.from, { x: 1, y: 2, z: 3 });
      assert.shallowDeepEqual(values.to, { x: 4, y: 5, z: 6 });
    });

    test('gets correct values coordinate component with no `from`', function () {
      var values = getAnimationValues(this.el, 'position', undefined, '4 5 6',
                                      { x: 0, y: 0, z: 0 });
      assert.shallowDeepEqual(values.from, { x: 0, y: 0, z: 0 });
      assert.shallowDeepEqual(values.to, { x: 4, y: 5, z: 6 });
    });

    test('gets correct values for bool component', function () {
      var values = getAnimationValues(this.el, 'visible', 'false', 'true');
      assert.shallowDeepEqual(values.from, { visible: 0 });
      assert.shallowDeepEqual(values.to, { visible: 1 });
    });

    test('gets correct values coordinate component with no `from`', function () {
      var values = getAnimationValues(this.el, 'transparent', undefined, 'true');
      assert.shallowDeepEqual(values.from, { transparent: 0 });
      assert.shallowDeepEqual(values.to, { transparent: 1 });
    });

    test('gets correct partialSetAttribute for bool component', function () {
      var el = this.el;
      var values = getAnimationValues(el, 'visible', 'false', 'true');
      values.partialSetAttribute({ visible: 0 });
      assert.equal(el.getAttribute('visible'), false);
      values.partialSetAttribute({ visible: 1 });
      assert.equal(el.getAttribute('visible'), true);
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

  suite('tween', function () {
    test('sets values in between `from` and `to` during animation', function (done) {
      var position;
      setupAnimation({
        attribute: 'position',
        dur: 1000,
        to: '10 10 10'
      }, function (el, animationEl, startTime) {
        animationEl.tween.update(startTime + 500);
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
});
