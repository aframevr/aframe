/* global assert, process, setup, suite, test */
'use strict';
var entityFactory = require('../../helpers').entityFactory;

// TouchEvent constructor is unusual, and throws an exception in Firefox. Use
// its parent class, UIEvent instead.
var UIEvent = window.UIEvent;

suite('touch-controls', function () {
  var touchControls, canvasEl;

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('touch-controls', '');

    this._setup = function () {
      touchControls = el.components['touch-controls'];
      canvasEl = el.sceneEl.canvas;
      done();
    };

    el.addEventListener('loaded', function () {
      if (el.sceneEl.hasLoaded) {
        this._setup();
      } else {
        el.sceneEl.addEventListener('loaded', this._setup.bind(this));
      }
    }.bind(this));
  });

  suite('isVelocityActive', function () {
    test('not active by default', function () {
      assert.isFalse(touchControls.isVelocityActive());
    });

    test('active when touched', function () {
      canvasEl.dispatchEvent(new UIEvent('touchstart'));
      assert.isTrue(touchControls.isVelocityActive());
      canvasEl.dispatchEvent(new UIEvent('touchend'));
      assert.isFalse(touchControls.isVelocityActive());
    });

    test('not active when disabled', function () {
      var el = this.el;
      el.setAttribute('touch-controls', {enabled: false});
      canvasEl.dispatchEvent(new UIEvent('touchstart'));
      assert.isFalse(touchControls.isVelocityActive());
    });
  });

  suite('getVelocityDelta', function () {
    test('updates velocity when touched', function () {
      canvasEl.dispatchEvent(new UIEvent('touchstart'));
      assert.shallowDeepEqual(touchControls.getVelocityDelta(), {x: 0, y: 0, z: -1});
      canvasEl.dispatchEvent(new UIEvent('touchend'));
      assert.shallowDeepEqual(touchControls.getVelocityDelta(), {x: 0, y: 0, z: 0});
    });
  });
});
