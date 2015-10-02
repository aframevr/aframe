require('../vr-register-element');

var TWEEN = require('tween.js');
var VRNode = require('./vr-node');
var utils = require('../vr-utils');

var defaults = {
  delay: 0,
  dur: 1000,
  loop: false,
  from: {x: 0, y: 0, z: 0},
  to: {x: 0, y: 0, z: 0},
  attribute: 'rotation'
};

var initValue;

module.exports = document.registerElement(
  'vr-animation', {
    prototype: Object.create(
      VRNode.prototype, {
        attachedCallback: {
          value: function () {
            this.el = this.parentNode;
            this.data = {};
            this.applyMixin();
            this.load();
          }
        },

        attributeChangedCallback: {
          value: function () {
            this.applyMixin();
          },
          writable: window.debug
        },

        update: {
          value: function () {
            // Stop previous tween
            var data = this.data;
            var repeat = data.loop ? Infinity : 1;
            var el = this.el;
            var tween = this.tween;
            var from = data.from || el.getAttribute(data.attribute);
            // If there's an existing tween we stop it and restore
            // the initial value
            if (tween) {
              tween.stop();
              el.setAttribute(data.attribute, initValue);
              utils.mixin(from, initValue);
            } else { // We store the initial value
              initValue = utils.mixin({}, from);
            }
            this.tween = new TWEEN.Tween(from)
              .to(data.to, data.dur)
              .delay(data.delay)
              .repeat(repeat)
              .onUpdate(function () {
                el.setAttribute(data.attribute, this);
              })
              .start();
          }
        },

        applyMixin: {
          value: function () {
            var data = {};
            var mixinData = this.getMixinData();
            var elData = this.getElData(this);
            utils.mixin(data, defaults);
            utils.mixin(data, mixinData);
            utils.mixin(data, elData);
            this.data = data;
            this.update();
          },
          writable: window.debug
        },

        getMixinData: {
          value: function () {
            var mixinId = this.getAttribute('mixin');
            var mixinEl = document.querySelector('#' + mixinId);
            if (!mixinEl) { return {}; }
            return this.getElData(mixinEl);
          },
          writable: window.debug
        },

        getElData: {
          value: function (el) {
            var data = {};
            Object.keys(defaults).forEach(copyAttribute);
            function copyAttribute (key) {
              if (el.hasAttribute(key)) {
                data[key] = el.getAttribute(key, defaults[key]);
              }
            }
            return data;
          },
          writable: window.debug
        }
      })
  }
);
