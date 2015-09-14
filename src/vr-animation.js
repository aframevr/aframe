require('./vr-register-element');

var VRNode = require('./core/vr-node');

var TWEEN = require('tween.js');

module.exports = document.registerElement(
  'vr-animation', {
    prototype: Object.create(
      VRNode.prototype, {
        createdCallback: {
          value: function () {
            this.delay = this.getAttribute('delay', 0);
            this.duration = this.getAttribute('duration', 1000);
            this.loop = this.getAttribute('loop', false);
            this.attribute = this.getAttribute('attribute');
            this.to = this.getAttribute('to', {x: 0, y: 0, z: 0});
            this.load();
          }
        },

        add: {
          value: function (obj) {
            var attribute = this.attribute;
            var from = obj.getAttribute(attribute);
            new TWEEN.Tween(from)
              .to(this.to, this.duration)
              .delay(this.delay)
              .onUpdate(function () {
                obj.setAttribute(attribute, this);
              })
              .start();
          }
        }
      })
  });
