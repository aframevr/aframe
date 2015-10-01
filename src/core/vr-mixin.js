require('../vr-register-element');

var VRNode = require('./vr-node');

module.exports = document.registerElement(
  'vr-mixin',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        createdCallback: {
          value: function () {
            this.els = [];
            this.load();
          },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function (attrName, oldVal, newVal) {
            // var els = this.els;
            // els.forEach(updateComponent);
            // function updateComponent (el) {
            //   var isVRObject = VRObject.prototype.isPrototypeOf(el);
            //   if (!isVRObject) {
            //     el.updateComponent(attrName);
            //   }
            //   el.updateComponent(attrName);
            // }
          },
          writable: window.debug
        },

        add: {
          value: function (el) {
            // this.els.push(el);
            // el.updateComponents();
          },
          writable: window.debug
        },

        remove: {
          value: function (el) {
            // el.mixin = null;
            // el.updateComponents();
          },
          writable: window.debug
        }
      }
    )
  }
);
