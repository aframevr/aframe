/* global VRNode */
/* exported VRBehavior */

var VRBehavior = document.registerElement(
  'vr-behavior',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        onElementCreated: {
          value: function() {
            this.sceneEl.addBehavior(this);
          }
        },

        // Tags that inherit from VRBehavior should define their own update
        // function.
        update: {
          value: function() { /* no op */}
        },
      }
    )
  }
);
