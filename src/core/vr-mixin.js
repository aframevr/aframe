var registerElement = require('../vr-register-element');

var VRNode = require('./vr-node');

module.exports = registerElement(
  'vr-mixin',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        attachedCallback: {
          value: function () {
            this.load();
          }
        }
      }
    )
  }
);
