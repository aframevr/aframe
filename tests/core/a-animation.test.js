/* global assert, setup, suite, test */
var helpers = require('../helpers.js');
var AAnimation = require('core/a-animation').AAnimation;
var getAnimationValues = require('core/a-animation').getAnimationValues;
var utils = require('utils/');

var getComponentProperty = utils.entity.getComponentProperty;

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
  var done = false;

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
  el.isPlaying = true;
  el.appendChild(animationEl);
}

/**
 * This will generate a color animation test using passed format
 *   of to and from in order to test rgb, hsl, and nouns.
 *  @param {description} description of the test
 *  @param {from} expects a color format of white
 *  @param {to} expects a color format of black
 */
function generateColorAnimationTest (description, from, to, attribute) {
  suite('component color animation:' + description, function () {
    setup(function (done) {
      var self = this;
      var elAttrs;
      var attributeSplit;
      if (attribute) {
        attributeSplit = attribute.split('.');
        elAttrs = {};
        elAttrs[attribute] = '';
        elAttrs[attributeSplit[0]] = {shader: 'flat'};
        elAttrs[attributeSplit[0]][attributeSplit[1]] = '#FFF';
      }
      setupAnimation({
        attribute: attribute || 'color',
        dur: 1000,
        fill: 'both',
        from: from,
        to: to,
        easing: 'linear'
      }, function (el, animationEl, startTime) {
        self.el = el;
        self.animationEl = animationEl;
        self.startTime = startTime;
        done();
      }, elAttrs || {color: ''});
    });

    test('start value', function () {
      assert.equal(getComponentProperty(this.el, attribute || 'color'), '#ffffff');
    });

    test('between value', function () {
      var color;
      this.animationEl.tween.update(this.startTime + 500);
      color = getComponentProperty(this.el, attribute || 'color');
      assert.isAbove(color, '#000000');
      assert.isBelow(color, '#ffffff');
    });

    test('finish value', function () {
      this.animationEl.tween.update(this.startTime + 1000);
      assert.equal(getComponentProperty(this.el, attribute || 'color'), '#000000');
    });
  });
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
      helpers.entityFactory();
      helpers.mixinFactory('walt', {repeat: 'indefinite'});
      setupAnimation({
        mixin: 'walt'
      }, function (el, animationEl) {
        assert.equal(animationEl.data.repeat, 'indefinite');
        done();
      });
    });
  });

  suite('detachedCallback', function () {
    test('stops animation', function (done) {
      setupAnimation({}, function (el, animationEl) {
        assert.ok(animationEl.isRunning);
        animationEl.addEventListener('animationstop', function () {
          assert.notOk(animationEl.isRunning);
          done();
        });
        animationEl.parentNode.removeChild(animationEl);
      });
    });
  });

  suite('update', function () {
    test('called on initialization', function (done) {
      var spy = this.sinon.spy(AAnimation.prototype, 'update');
      setupAnimation({}, function (el, animationEl) {
        assert.ok(spy.called);
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
      }, {light: ''});
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
        assert.shallowDeepEqual(el.getAttribute('rotation'), {x: 10, y: 10, z: 10});
        animationEl.addEventListener('animationend', function () {
          assert.shallowDeepEqual(el.getAttribute('rotation'), {x: 0, y: 0, z: 0});
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
      }, {scale: '1 1 1'});
    });

    test('starts at `from`', function () {
      assert.shallowDeepEqual(this.el.getAttribute('scale'), {x: 5, y: 10, z: 5});
    });

    test('goes back to initial value after animation', function (done) {
      var el = this.el;
      var animationEl = this.animationEl;
      animationEl.addEventListener('animationend', function () {
        assert.shallowDeepEqual(el.getAttribute('scale'), {x: 1, y: 1, z: 1});
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
      assert.shallowDeepEqual(el.getAttribute('scale'), {x: 1, y: 1, z: 1});
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
      }, {scale: '1 1 1'});
    });

    test('starts at `from`', function () {
      assert.shallowDeepEqual(this.el.getAttribute('scale'), {x: 5, y: 10, z: 5});
    });

    test('stays at `to`', function (done) {
      var el = this.el;
      var animationEl = this.animationEl;
      animationEl.addEventListener('animationend', function () {
        assert.shallowDeepEqual(el.getAttribute('scale'), {x: 10, y: 10, z: 10});
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
      }, {rotation: '10 10 10'});
    });

    test('starts at initial value', function () {
      assert.shallowDeepEqual(this.el.getAttribute('rotation'), {x: 10, y: 10, z: 10});
    });

    test('stays at `to`', function () {
      var animationEl = this.animationEl;
      var el = this.el;
      animationEl.tween.update(this.startTime + 1000);
      assert.shallowDeepEqual(el.getAttribute('rotation'), {x: 360, y: 0, z: 360});
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
      }, {opacity: ''});
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
      var el = helpers.entityFactory();
      animationEl.setAttribute('begin', 'click');
      el.isPlaying = true;
      el.appendChild(animationEl);
      el.addEventListener('loaded', function () {
        el.emit('click');
        assert.ok(animationEl.isRunning);
        done();
      });
    });

    test('is not run when entity plays and begin is set to event name', function (done) {
      var animationEl = document.createElement('a-animation');
      var el = helpers.entityFactory();
      animationEl.setAttribute('begin', 'click');
      el.appendChild(animationEl);
      el.play();
      process.nextTick(function () {
        assert.notOk(animationEl.isRunning);
        done();
      });
    });

    test('is run when entity plays and begin is set to a delay', function (done) {
      var animationEl = document.createElement('a-animation');
      var el = helpers.entityFactory();
      animationEl.setAttribute('begin', '1');
      el.appendChild(animationEl);
      el.addEventListener('loaded', function () {
        el.play();
        assert.ok(animationEl.isRunning);
        done();
      });
    });

    test('is run when entity plays and delay is set', function (done) {
      var animationEl = document.createElement('a-animation');
      var el = helpers.entityFactory();
      animationEl.setAttribute('delay', '1');
      el.appendChild(animationEl);
      el.addEventListener('loaded', function () {
        el.play();
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
      assert.shallowDeepEqual(values.from, {'light.intensity': 0});
      assert.shallowDeepEqual(values.to, {'light.intensity': 1});
    });

    test('gets correct values multiple-attribute component with no `from`', function () {
      var el = this.el;
      var values;
      el.setAttribute('light', 'intensity: 0.5');
      values = getAnimationValues(el, 'light.intensity', undefined, '1');
      assert.shallowDeepEqual(values.from, {'light.intensity': 0.5});
      assert.shallowDeepEqual(values.to, {'light.intensity': 1});
    });

    test('gets correct values coordinate component', function () {
      var values = getAnimationValues(this.el, 'position', '1 2 3', '4 5 6');
      assert.shallowDeepEqual(values.from, {x: 1, y: 2, z: 3});
      assert.shallowDeepEqual(values.to, {x: 4, y: 5, z: 6});
    });

    test('gets correct values coordinate component with no `from`', function () {
      var values = getAnimationValues(this.el, 'position', undefined, '4 5 6', {x: 0, y: 0, z: 0});
      assert.shallowDeepEqual(values.from, {x: 0, y: 0, z: 0});
      assert.shallowDeepEqual(values.to, {x: 4, y: 5, z: 6});
    });

    test('gets correct values for bool component', function () {
      var values = getAnimationValues(this.el, 'visible', 'false', 'true');
      assert.shallowDeepEqual(values.from, {visible: 0});
      assert.shallowDeepEqual(values.to, {visible: 1});
    });

    test('gets correct values coordinate component with no `from`', function () {
      var values = getAnimationValues(this.el, 'transparent', undefined, 'true');
      assert.shallowDeepEqual(values.from, {transparent: 0});
      assert.shallowDeepEqual(values.to, {transparent: 1});
    });

    test('gets correct partialSetAttribute for bool component', function () {
      var el = this.el;
      var values = getAnimationValues(el, 'visible', 'false', 'true');
      values.partialSetAttribute({visible: 0});
      assert.equal(el.getAttribute('visible'), false);
      values.partialSetAttribute({visible: 1});
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

    suite('considers fill value', function () {
      test('default', function (done) {
        setupAnimation({
          attribute: 'position',
          dur: 5000,
          from: '0 0 0',
          to: '10 10 10'
        }, function (el, animationEl, startTime) {
          animationEl.tween.update(startTime + 500);
          animationEl.stop();
          var position = el.getAttribute('position');
          ['x', 'y', 'z'].forEach(function (axis) {
            assert.isAbove(position[axis], 0);
            assert.isBelow(position[axis], 10);
          });
          done();
        });
      });

      test('backwards', function (done) {
        setupAnimation({
          attribute: 'position',
          dur: 5000,
          from: '0 0 0',
          to: '10 10 10',
          fill: 'backwards'
        }, function (el, animationEl, startTime) {
          animationEl.tween.update(startTime + 500);
          animationEl.stop();
          var position = el.getAttribute('position');
          ['x', 'y', 'z'].forEach(function (axis) {
            assert.equal(position[axis], 0);
          });
          done();
        });
      });

      test('both', function (done) {
        setupAnimation({
          attribute: 'position',
          dur: 5000,
          from: '0 0 0',
          to: '10 10 10',
          fill: 'both'
        }, function (el, animationEl, startTime) {
          animationEl.tween.update(startTime + 500);
          animationEl.stop();
          var position = el.getAttribute('position');
          ['x', 'y', 'z'].forEach(function (axis) {
            assert.isAbove(position[axis], 0);
            assert.isBelow(position[axis], 10);
          });
          done();
        });
      });

      test('forwards', function (done) {
        setupAnimation({
          attribute: 'position',
          dur: 5000,
          from: '0 0 0',
          to: '10 10 10',
          fill: 'forwards'
        }, function (el, animationEl, startTime) {
          animationEl.tween.update(startTime + 500);
          animationEl.stop();
          var position = el.getAttribute('position');
          ['x', 'y', 'z'].forEach(function (axis) {
            assert.isAbove(position[axis], 0);
            assert.isBelow(position[axis], 10);
          });
          done();
        });
      });

      test('none', function (done) {
        setupAnimation({
          attribute: 'position',
          dur: 5000,
          from: '0 0 0',
          to: '10 10 10',
          fill: 'none'
        }, function (el, animationEl, startTime) {
          animationEl.tween.update(startTime + 500);
          animationEl.stop();
          var position = el.getAttribute('position');
          ['x', 'y', 'z'].forEach(function (axis) {
            assert.equal(position[axis], 0);
          });
          done();
        });
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

  suite('direction: alternate', function () {
    test('`from` is defined', function (done) {
      setupAnimation({
        attribute: 'position',
        direction: 'alternate',
        repeat: 1,
        dur: 1000,
        from: '5 5 5',
        to: '10 10 10'
      }, function (el, animationEl, startTime) {
        animationEl.tween.update(startTime + 1000);
        animationEl.addEventListener('animationend', function () {
          var position = el.getAttribute('position');
          assert.shallowDeepEqual(position, {x: 5, y: 5, z: 5});
        });
        done();
      });
    });

    test('`from` is not defined', function (done) {
      setupAnimation({
        attribute: 'position',
        direction: 'alternate',
        repeat: 1,
        dur: 1000,
        to: '10 10 10'
      }, function (el, animationEl, startTime) {
        animationEl.tween.update(startTime + 1000);
        animationEl.addEventListener('animationend', function () {
          var position = el.getAttribute('position');
          assert.shallowDeepEqual(position, {x: 0, y: 0, z: 0});
        });
        done();
      });
    });
  });

  generateColorAnimationTest('default test', '#ffffff', '#000000');
  generateColorAnimationTest('accepts hex shorthand', '#fff', '#000');
  generateColorAnimationTest('accepts nouns and rgb', 'rgb(255, 255, 255)', 'black');
  generateColorAnimationTest('accepts hsl', 'hsl(1, 100%, 100%)', 'hsl(0, 0%, 0%)');
  generateColorAnimationTest('accepts dot notation', 'white', 'black', 'material.color');

  suite('component color animation: accepts dot notation', function () {
    var attribute = 'material.color';
    setup(function (done) {
      var self = this;
      var elAttrs = {color: '', material: {shader: 'flat', color: '#FF0000'}};

      setupAnimation({
        attribute: 'material.color',
        dur: 1000,
        fill: 'both',
        from: 'red',
        to: 'blue',
        easing: 'linear'
      }, function (el, animationEl, startTime) {
        self.el = el;
        self.animationEl = animationEl;
        self.startTime = startTime;
        done();
      }, elAttrs);
    });

    test('start value', function () {
      assert.equal(this.el.getComputedAttribute(attribute), '#ff0000');
    });

    test('between value', function () {
      var color;
      this.animationEl.tween.update(this.startTime + 500);
      color = this.el.getComputedAttribute(attribute);
      assert.isAbove(color, '#0000ff');
      assert.isBelow(color, '#ff0000');
    });

    test('finish value', function () {
      this.animationEl.tween.update(this.startTime + 1000);
      assert.equal(this.el.getComputedAttribute(attribute), '#0000ff');
    });
  });

  suite('end', function () {
    test('stops animation when event is triggered', function (done) {
      var animationEl = document.createElement('a-animation');
      var el = helpers.entityFactory();
      animationEl.setAttribute('begin', 'begin-event');
      animationEl.setAttribute('end', 'end-event');
      el.isPlaying = true;
      el.appendChild(animationEl);
      el.addEventListener('loaded', function () {
        el.emit('begin-event');
        assert.ok(animationEl.isRunning);
        el.emit('end-event');
        assert.ok(!animationEl.isRunning);
        done();
      });
    });
  });

  suite('dynamic animations', function () {
    test('animation plays when both entity and animation are dynamically created', function (done) {
      var sceneEl = document.createElement('a-scene');
      sceneEl.addEventListener('loaded', createAnimation);
      document.body.appendChild(sceneEl);
      function createAnimation () {
        var entityEl = document.createElement('a-entity');
        var animationEl = document.createElement('a-animation');
        animationEl.setAttribute('attribute', 'rotation');
        animationEl.setAttribute('repeat', 'indefinite');
        animationEl.setAttribute('to', '0 360 0');
        entityEl.appendChild(animationEl);
        sceneEl.appendChild(entityEl);
        entityEl.addEventListener('loaded', function () {
          assert.ok(animationEl.isRunning);
          done();
        });
      }
    });

    test('animation does not play if entity has not loaded when both entity and animation are dynamically created', function (done) {
      var sceneEl = document.createElement('a-scene');
      sceneEl.addEventListener('loaded', createAnimation);
      document.body.appendChild(sceneEl);
      function createAnimation () {
        var entityEl = document.createElement('a-entity');
        var animationEl = document.createElement('a-animation');
        animationEl.setAttribute('attribute', 'rotation');
        animationEl.setAttribute('repeat', 'indefinite');
        animationEl.setAttribute('to', '0 360 0');
        entityEl.appendChild(animationEl);
        sceneEl.appendChild(entityEl);
        assert.notOk(animationEl.isRunning);
        done();
      }
    });
  });
});
