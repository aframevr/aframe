require('../vr-register-element');

var VRNode = require('./vr-node');
var TWEEN = require('tween.js');

var defaults = {
  delay: 0,
  duration: 1000,
  loop: false
};

module.exports = document.registerElement(
  'vr-animation', {
    prototype: Object.create(
      VRNode.prototype, {
        createdCallback: {
          value: function () {
            this.delay = this.getAttribute('delay', defaults.delay);
            this.duration = this.getAttribute('duration', defaults.duration);
            this.loop = this.getAttribute('loop', defaults.loop);
            this.attribute = this.getAttribute('attribute');
            this.to = this.getAttribute('to', {x: 0, y: 0, z: 0});
            this.load();
          }
        },

        attachedCallback: {
          value: function () {
            var el = this.el = this.parentNode;
            var attribute = this.attribute;
            var from = el.getAttribute(attribute);
            new TWEEN.Tween(from)
              .to(this.to, this.duration)
              .delay(this.delay)
              .onUpdate(function () {
                el.setAttribute(attribute, this);
              })
              .start();
          }
        }
      })
  });
