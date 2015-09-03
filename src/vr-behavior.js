/* global VRTags, VRNode */
/* exported VRBehavior */

VRTags["VR-BEHAVIOR"] = true;

var VRBehavior = document.registerElement(
  'vr-behavior',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        createdCallback: {
          value: function() {
            var sceneEl = document.querySelector('vr-scene');
            this.sceneEl = sceneEl;
            this.sceneEl.addBehavior(this);
            this.init();
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
