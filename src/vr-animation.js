/* globals VRTags, VRNode, TWEEN */
/* exported VRAnimation */

VRTags['VR-ANIMATION'] = true;

var VRAnimation = document.registerElement('vr-animation', {
  prototype: Object.create(VRNode.prototype, {
    createdCallback: {
      value: function() {
        this.delay = parseFloat(this.getAttribute('delay')) || 0;
        this.duration = parseFloat(this.getAttribute('duration')) || 1000;
        this.loop = this.hasAttribute('loop');
        this.prop = this.getAttribute('prop');
        this.to = this.parseAttributeString(this.getAttribute('to'));
        this.init();
      }
    },

    add: {
      value: function (obj) {
        var from = obj.getAttribute(this.prop);
        var self = this;
        new TWEEN.Tween(from)
          .to(this.to, this.duration)
          .delay(this.delay)
          .onUpdate(function () {
            obj.setAttribute(self.prop, this);
          })
          .start();
      },
    },

    // TODO: duplicated from vr-object, maybe move from vr-object to
    // vr-node or VR.utils?
    parseAttributeString: {
      value: function(str) {
        var attrs = str.split(' ');
        if (attrs.length !== 3) {
          throw new Error('attr string should be len 3, ex:  (0 1 2)');
        }
        return {
          x: parseFloat(attrs[0]),
          y: parseFloat(attrs[1]),
          z: parseFloat(attrs[2]),
        };
      },
    },
  })
});
