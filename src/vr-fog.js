/* global VRTags, VRNode */
/* exported VRFog */

VRTags["VR-FOG"] = true;

var VRFog = document.registerElement(
  'vr-fog',
  {
    prototype: Object.create(
      VRNode.prototype, {
        init: {
          value: function() {
            var color = this.getAttribute('color') || 0xFFFFFF;
            var near = parseFloat(this.getAttribute('near')) || 1;
            var far = parseFloat(this.getAttribute('far')) || 1000;
            this.fog = this.sceneEl.object3D.fog = new THREE.Fog( color, near, far );
            this.load();
          }
        }
      })
  }
);

