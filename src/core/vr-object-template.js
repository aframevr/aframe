/* global Event, HTMLElement */

require('../vr-register-element');

var VRNode = require('./vr-node');

module.exports = document.registerElement(
  'vr-object-template',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        createdCallback: {
          value: function () {
            this.objs = [];
            this.load();
          },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function (attrName, oldVal, newVal) {
            this.objs.forEach(function(obj) { obj.updateComponent(attrName); } );
          },
          writable: window.debug
        },

        add: {
          value: function (obj) {
            this.objs.push(obj);
          },
          writable: window.debug
        }
      }
    )
  }
);
