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
            this.objs = {};
            this.load();
          },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function (attrName, oldVal, newVal) {
            var objs = this.objs;
            for (var id in objs) { objs[id].updateComponent(attrName); }
          },
          writable: window.debug
        },

        add: {
          value: function (obj) {
            this.objs[obj.object3D.id] = obj;
            obj.updateComponents();
          },
          writable: window.debug
        },

        remove: {
          value: function (obj) {
            delete this.objs[obj.object3D.id];
            obj.updateComponents();
          },
          writable: window.debug
        }
      }
    )
  }
);
