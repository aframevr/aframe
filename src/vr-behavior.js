require('./vr-register-element');

var VRNode = require('./core/vr-node');

module.exports = document.registerElement(
  'vr-behavior',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        createdCallback: {
          value: function () {
            this.sceneEl.addBehavior(this);
          }
        },

        // Tags that inherit from VRBehavior should define their own update
        // function.
        update: {
          value: function () { /* no op */ }
        }
      })
  }
);
