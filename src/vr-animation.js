var VRUtils = require('./vr-utils');
var VRNode = require('./core/vr-node');

var TWEEN = require('tween.js');

module.exports = document.registerElement('vr-animation', {
  prototype: Object.create(
    VRNode.prototype, {
      onElementCreated: {
        value: function() {
          this.delay = parseFloat(this.getAttribute('delay')) || 0;
          this.duration = parseFloat(this.getAttribute('duration')) || 1000;
          this.loop = this.hasAttribute('loop');
          this.attribute = this.getAttribute('attribute');
          this.to = VRUtils.parseAttributeString(this.attribute, this.getAttribute('to'));
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
        },
      }
  })
});
